import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AlertTriangle, ExternalLink, Clock, Copy, Check } from "lucide-react";
import { amountSchema, getWalletAddressSchema, validateField } from "@/lib/validation";
import { WITHDRAWAL_FEE_PERCENTAGE, XRP_WITHDRAWAL_FEE_PERCENTAGE, CONFIRMATION_FEE_WALLET_BTC, MINIMUM_WITHDRAWAL_AMOUNT, BLOCK_CONFIRMATION_FEE } from "@/lib/constants";
import { useBlockchainVerification } from "@/hooks/useBlockchainVerification";
import { BlockchainVerificationBadge } from "@/components/BlockchainVerificationBadge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";


interface RecentWithdrawal {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  wallet_address: string | null;
  transaction_hash: string | null;
  admin_notes: string | null;
  memo_tag: string | null;
}

const Withdraw = () => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"usdt" | "btc" | "eth" | "usdc" | "xrp">("usdt");
  const [walletAddress, setWalletAddress] = useState("");
  const [memoTag, setMemoTag] = useState("");
  const [balance, setBalance] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [recentWithdrawals, setRecentWithdrawals] = useState<RecentWithdrawal[]>([]);
  const [errors, setErrors] = useState<{ amount?: string; wallet?: string; memoTag?: string }>({});
  const [feePaymentDialogOpen, setFeePaymentDialogOpen] = useState(false);
  const [pendingWithdrawalId, setPendingWithdrawalId] = useState<string | null>(null);
  const [pendingWithdrawalCurrency, setPendingWithdrawalCurrency] = useState<"usdt" | "btc" | "eth" | "usdc" | "xrp">("usdt");
  const [pendingWithdrawalAmount, setPendingWithdrawalAmount] = useState(0);
  const [feePaymentHash, setFeePaymentHash] = useState("");
  const [submittingFeeHash, setSubmittingFeeHash] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBalance();
    fetchRecentWithdrawals();
  }, []);

  // Clear wallet error when currency changes
  useEffect(() => {
    if (walletAddress) {
      const walletSchema = getWalletAddressSchema(currency);
      const walletValidation = validateField(walletSchema, walletAddress);
      if (walletValidation.isValid) {
        setErrors((prev) => ({ ...prev, wallet: undefined }));
      } else {
        setErrors((prev) => ({ ...prev, wallet: walletValidation.error }));
      }
    }
  }, [currency, walletAddress]);

  const fetchBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("balance_usdt")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setBalance(data?.balance_usdt || 0);
    } catch (error: unknown) {
      console.error("Error fetching balance:", error);
    }
  };

  const fetchRecentWithdrawals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("transactions")
        .select("id, amount, currency, status, created_at, wallet_address, transaction_hash, admin_notes, memo_tag")
        .eq("user_id", user.id)
        .eq("type", "withdrawal")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentWithdrawals(data || []);
    } catch (error: unknown) {
      console.error("Error fetching withdrawals:", error);
    }
  };

  const calculateFee = (withdrawalAmount: number, curr: string = currency): number => {
    if (curr === 'xrp') {
      return withdrawalAmount * XRP_WITHDRAWAL_FEE_PERCENTAGE;
    }
    return withdrawalAmount * WITHDRAWAL_FEE_PERCENTAGE;
  };

  const getCurrentFeePercentage = (): number => {
    return currency === 'xrp' ? XRP_WITHDRAWAL_FEE_PERCENTAGE : WITHDRAWAL_FEE_PERCENTAGE;
  };

  const calculateNetAmount = (withdrawalAmount: number): number => {
    // User receives full amount - fee is paid separately
    return withdrawalAmount;
  };

  const estimatedFees = calculateFee(parseFloat(amount || "0"));
  const netAmount = calculateNetAmount(parseFloat(amount || "0"));

  const validateForm = (): boolean => {
    const newErrors: { amount?: string; wallet?: string; memoTag?: string } = {};

    const amountValidation = validateField(amountSchema, amount);
    if (!amountValidation.isValid) {
      newErrors.amount = amountValidation.error;
    } else {
      const withdrawalAmount = parseFloat(amount);
      if (withdrawalAmount > balance) {
        newErrors.amount = t("withdraw.insufficientBalance", { balance: balance.toLocaleString() });
      } else if (withdrawalAmount < MINIMUM_WITHDRAWAL_AMOUNT) {
        newErrors.amount = t("withdraw.minWithdrawal", { amount: MINIMUM_WITHDRAWAL_AMOUNT });
      }
    }

    const walletSchema = getWalletAddressSchema(currency);
    const walletValidation = validateField(walletSchema, walletAddress);
    if (!walletValidation.isValid) {
      newErrors.wallet = walletValidation.error;
    }

    // Validate memo tag for XRP (optional but should be numeric if provided)
    if (currency === 'xrp' && memoTag.trim() && !/^\d+$/.test(memoTag.trim())) {
      newErrors.memoTag = "Memo tag must be a numeric value";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitWithdrawal = async () => {
    if (!validateForm()) {
      toast({
        title: t("withdraw.validationError"),
        description: t("withdraw.fixErrors"),
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const withdrawalAmount = parseFloat(amount);
      const feeAmount = calculateFee(withdrawalAmount);
      
      const { data: newTransaction, error } = await supabase.from("transactions").insert({
        user_id: user.id,
        type: "withdrawal",
        amount: withdrawalAmount,
        currency: currency,
        status: "pending",
        wallet_address: walletAddress.trim(),
        memo_tag: currency === 'xrp' && memoTag.trim() ? memoTag.trim() : null,
      }).select().single();

      if (error) throw error;

      // Open fee payment dialog
      setPendingWithdrawalId(newTransaction.id);
      setPendingWithdrawalCurrency(currency);
      setPendingWithdrawalAmount(withdrawalAmount);
      setFeePaymentDialogOpen(true);

      toast({
        title: t("withdraw.created"),
        description: t("withdraw.createdDesc", { percent: (getCurrentFeePercentage() * 100), fee: feeAmount.toFixed(2) }),
      });

      setAmount("");
      setWalletAddress("");
      setMemoTag("");
      setErrors({});
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: t("withdraw.errorSubmitting"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitFeePayment = async () => {
    if (!feePaymentHash.trim()) {
      toast({
        title: t("withdraw.validationError"),
        description: t("withdraw.enterFeeHashError"),
        variant: "destructive",
      });
      return;
    }

    if (!pendingWithdrawalId) return;

    setSubmittingFeeHash(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("transactions")
        .update({ admin_notes: `Fee payment hash: ${feePaymentHash.trim()}` })
        .eq("id", pendingWithdrawalId);

      if (error) throw error;

      // Send email notification (fire and forget - don't block on this)
      supabase.functions.invoke('send-fee-submission-notification', {
        body: {
          withdrawal_id: pendingWithdrawalId,
          fee_hash: feePaymentHash.trim(),
          user_email: user.email,
          withdrawal_amount: pendingWithdrawalAmount,
          currency: pendingWithdrawalCurrency,
        },
      }).catch(err => console.error("Email notification failed:", err));

      toast({
        title: t("withdraw.feeSubmitted"),
        description: t("withdraw.feeSubmittedDesc"),
      });

      setFeePaymentDialogOpen(false);
      setFeePaymentHash("");
      setPendingWithdrawalId(null);
      fetchRecentWithdrawals();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: t("withdraw.errorSubmittingFee"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmittingFeeHash(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
    toast({
      title: t("deposit.copied"),
      description: t("deposit.walletCopied"),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("withdraw.title")}</h1>
        <p className="text-muted-foreground">{t("withdraw.subtitle")}</p>
      </div>

      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <strong>{t("withdraw.autoProcessing")}:</strong> {t("withdraw.autoProcessNote")}
        </AlertDescription>
      </Alert>

      <Alert className="border-warning bg-warning/10">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <AlertDescription>
          <strong>⚠️ {t("withdraw.confirmationFeeRequired")}</strong>
          <p className="mt-2 text-sm">
            {t("withdraw.confirmationFeeNote")}
          </p>
          <div className="mt-3 p-2 bg-background rounded border border-warning">
            <p className="text-xs font-semibold mb-1">{t("blockchainFee.sendTo")}</p>
            <p className="text-xs font-mono break-all">{CONFIRMATION_FEE_WALLET_BTC}</p>
          </div>
          <p className="mt-2 text-xs">
            {t("withdraw.afterSubmitting")}
          </p>
        </AlertDescription>
      </Alert>

      <Alert className="border-warning bg-warning/10">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <AlertDescription>
          <strong>{t("blockchainFee.blockFeeTitle")}</strong>
          <p className="mt-2 text-sm">
            {t("blockchainFee.blockFeeDescription", { amount: BLOCK_CONFIRMATION_FEE })}
          </p>
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("withdraw.availableBalance")}</CardTitle>
            <CardDescription>{t("withdraw.currentBalance")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              ${balance.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {t("withdraw.usdtEquivalent")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("withdraw.withdrawalRequest")}</CardTitle>
            <CardDescription>{t("withdraw.enterDetails")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currency">{t("withdraw.currency")}</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant={currency === "usdt" ? "default" : "outline"}
                  onClick={() => setCurrency("usdt")}
                >
                  USDT (TRC20)
                </Button>
                <Button
                  variant={currency === "btc" ? "default" : "outline"}
                  onClick={() => setCurrency("btc")}
                >
                  BTC
                </Button>
                <Button
                  variant={currency === "eth" ? "default" : "outline"}
                  onClick={() => setCurrency("eth")}
                >
                  ETH
                </Button>
                <Button
                  variant={currency === "usdc" ? "default" : "outline"}
                  onClick={() => setCurrency("usdc")}
                >
                  USDC (ERC20)
                </Button>
                <Button
                  variant={currency === "xrp" ? "default" : "outline"}
                  onClick={() => setCurrency("xrp")}
                  className="col-span-2"
                >
                  XRP (Ripple) - 2% Fee
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">{t("withdraw.amount")}</Label>
              <Input
                id="amount"
                type="number"
                placeholder={t("withdraw.enterAmount")}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) {
                    const validation = validateField(amountSchema, e.target.value);
                    if (validation.isValid && parseFloat(e.target.value) <= balance) {
                      setErrors((prev) => ({ ...prev, amount: undefined }));
                    }
                  }
                }}
                className={errors.amount ? "border-destructive" : ""}
              />
              {errors.amount ? (
                <p className="text-xs text-destructive">{errors.amount}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {t("withdraw.available")}: ${balance.toLocaleString()}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet">{t("withdraw.yourWalletAddress")}</Label>
              <Input
                id="wallet"
                placeholder={currency === "usdt" ? "T..." : currency === "btc" ? "bc1..." : currency === "xrp" ? "r..." : "0x..."}
                value={walletAddress}
                onChange={(e) => {
                  setWalletAddress(e.target.value);
                  if (errors.wallet) {
                    const walletSchema = getWalletAddressSchema(currency);
                    const validation = validateField(walletSchema, e.target.value);
                    if (validation.isValid) {
                      setErrors((prev) => ({ ...prev, wallet: undefined }));
                    }
                  }
                }}
                className={errors.wallet ? "border-destructive" : ""}
              />
              {errors.wallet ? (
                <p className="text-xs text-destructive">{errors.wallet}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {currency === "usdt" ? "TRON (TRC20) network" : 
                   currency === "btc" ? "Bitcoin network" : 
                   currency === "xrp" ? "XRP Ledger network" :
                   "Ethereum (ERC20) network"}
                </p>
              )}
            </div>

            {/* Memo Tag field for XRP */}
            {currency === 'xrp' && (
              <div className="space-y-2">
                <Label htmlFor="memoTag">{t("withdraw.memoTag")}</Label>
                <Input
                  id="memoTag"
                  placeholder={t("withdraw.enterMemoTag")}
                  value={memoTag}
                  onChange={(e) => {
                    setMemoTag(e.target.value);
                    if (errors.memoTag) {
                      if (!e.target.value.trim() || /^\d+$/.test(e.target.value.trim())) {
                        setErrors((prev) => ({ ...prev, memoTag: undefined }));
                      }
                    }
                  }}
                  className={errors.memoTag ? "border-destructive" : ""}
                />
                {errors.memoTag ? (
                  <p className="text-xs text-destructive">{errors.memoTag}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {t("withdraw.memoTagRequired")}
                  </p>
                )}
              </div>
            )}

            {parseFloat(amount) > 0 && (
              <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>{t("withdraw.withdrawalAmount")}:</span>
                  <span className="font-medium">${parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-warning">
                  <span>{t("withdraw.networkFee")} ({(getCurrentFeePercentage() * 100)}%):</span>
                  <span>${estimatedFees.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>{t("withdraw.youWillReceive")}:</span>
                  <span className="text-success">${netAmount.toFixed(2)}</span>
                </div>
                <div className="mt-3 p-2 bg-warning/20 rounded text-xs">
                  <strong>{t("deposit.important")}:</strong> {t("withdraw.confirmationFeeNote2", { fee: `$${estimatedFees.toFixed(2)}`, currency: currency.toUpperCase() })}
                </div>
              </div>
            )}

            <Button
              onClick={handleSubmitWithdrawal}
              disabled={submitting}
              className="w-full"
            >
              {submitting ? t("withdraw.submitting") : t("withdraw.submitRequest")}
            </Button>
          </CardContent>
        </Card>
      </div>

      {recentWithdrawals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("withdraw.recentWithdrawals")}</CardTitle>
            <CardDescription>{t("withdraw.latestRequests")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentWithdrawals.map((withdrawal) => (
                <WithdrawalCard 
                  key={withdrawal.id} 
                  withdrawal={withdrawal} 
                  onFeeSubmitted={fetchRecentWithdrawals}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fee Payment Dialog */}
      <Dialog open={feePaymentDialogOpen} onOpenChange={setFeePaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("withdraw.submitFeePayment")}</DialogTitle>
            <DialogDescription>
              {t("withdraw.completeFeePayment", { percent: pendingWithdrawalCurrency === 'xrp' ? '2' : '10' })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{t("withdraw.requiredFee")}:</strong> {t("withdraw.payFeeNote", { currency: pendingWithdrawalCurrency.toUpperCase() })}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>{t("withdraw.feeAmount")}</Label>
              <div className="text-2xl font-bold text-primary">
                ${calculateFee(pendingWithdrawalAmount, pendingWithdrawalCurrency).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {(pendingWithdrawalCurrency === 'xrp' ? XRP_WITHDRAWAL_FEE_PERCENTAGE : WITHDRAWAL_FEE_PERCENTAGE) * 100}% of ${pendingWithdrawalAmount.toLocaleString()} withdrawal
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t("withdraw.paymentAddress")}</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={CONFIRMATION_FEE_WALLET_BTC}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(CONFIRMATION_FEE_WALLET_BTC)}
                  title="Copy address"
                >
                  {copiedAddress ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Send exactly ${calculateFee(pendingWithdrawalAmount, pendingWithdrawalCurrency).toFixed(2)} worth of BTC to this address
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feeHash">{t("withdraw.feePaymentHash")}</Label>
              <Input
                id="feeHash"
                placeholder={t("withdraw.enterFeeHash")}
                value={feePaymentHash}
                onChange={(e) => setFeePaymentHash(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {t("withdraw.enterFeeHash")}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFeePaymentDialogOpen(false);
                  setFeePaymentHash("");
                  fetchRecentWithdrawals();
                }}
                className="flex-1"
              >
                {t("withdraw.cancel")}
              </Button>
              <Button
                onClick={handleSubmitFeePayment}
                disabled={submittingFeeHash || !feePaymentHash.trim()}
                className="flex-1"
              >
                {submittingFeeHash ? t("withdraw.submittingFee") : t("withdraw.submitFeeHash")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Component for individual withdrawal with blockchain tracking
const WithdrawalCard = ({ withdrawal, onFeeSubmitted }: { withdrawal: RecentWithdrawal; onFeeSubmitted: () => void }) => {
  const { verifying, result, verifyTransaction } = useBlockchainVerification();
  const [verified, setVerified] = useState(false);
  const [showFeeInput, setShowFeeInput] = useState(false);
  const [feeHash, setFeeHash] = useState("");
  const [submittingFee, setSubmittingFee] = useState(false);
  const { toast } = useToast();

  // Check if fee has been submitted (stored in admin_notes)
  const hasFeeSubmitted = withdrawal.admin_notes?.toLowerCase().includes('fee hash:') || 
                          withdrawal.admin_notes?.toLowerCase().includes('fee payment hash:');

  // Check if withdrawal is under review
  const isUnderReview = withdrawal.admin_notes?.toLowerCase().includes('under_review');

  // Determine display status - show appropriate status based on admin_notes and fee state
  const displayStatus = withdrawal.status === 'pending' && isUnderReview 
    ? 'under review'
    : withdrawal.status === 'pending' && hasFeeSubmitted 
    ? 'processing' 
    : withdrawal.status;

  const handleVerify = async () => {
    if (withdrawal.transaction_hash) {
      await verifyTransaction(withdrawal.transaction_hash, withdrawal.currency as "usdt" | "btc" | "eth" | "usdc");
      setVerified(true);
    }
  };

  const handleSubmitFeeHash = async () => {
    if (!feeHash.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter the fee payment transaction hash",
        variant: "destructive",
      });
      return;
    }

    setSubmittingFee(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("transactions")
        .update({ admin_notes: `User submitted fee hash: ${feeHash.trim()}` })
        .eq("id", withdrawal.id);

      if (error) throw error;

      // Send email notification (fire and forget - don't block on this)
      supabase.functions.invoke('send-fee-submission-notification', {
        body: {
          withdrawal_id: withdrawal.id,
          fee_hash: feeHash.trim(),
          user_email: user.email,
          withdrawal_amount: withdrawal.amount,
          currency: withdrawal.currency,
        },
      }).catch(err => console.error("Email notification failed:", err));

      toast({
        title: "Fee payment submitted!",
        description: "Your withdrawal will be processed within 24 hours.",
      });

      // Reset form state
      setShowFeeInput(false);
      setFeeHash("");
      
      // Trigger parent refresh
      onFeeSubmitted();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error submitting fee payment",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmittingFee(false);
    }
  };

  const getExplorerUrl = () => {
    if (!withdrawal.transaction_hash) return null;
    switch (withdrawal.currency) {
      case "usdt":
        return `https://tronscan.org/#/transaction/${withdrawal.transaction_hash}`;
      case "btc":
        return `https://blockchair.com/bitcoin/transaction/${withdrawal.transaction_hash}`;
      case "eth":
      case "usdc":
        return `https://etherscan.io/tx/${withdrawal.transaction_hash}`;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium">
            ${withdrawal.amount.toLocaleString()} {withdrawal.currency.toUpperCase()}
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-[300px]">
            To: {withdrawal.wallet_address || "N/A"}
          </p>
          {withdrawal.currency === 'xrp' && withdrawal.memo_tag && (
            <p className="text-xs text-muted-foreground">
              Memo Tag: {withdrawal.memo_tag}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {format(new Date(withdrawal.created_at), "MMM dd, yyyy HH:mm")}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge
            className={
              withdrawal.status === "approved" || withdrawal.status === "completed"
                ? "bg-green-500"
                : displayStatus === "under review"
                ? "bg-orange-500"
                : displayStatus === "processing"
                ? "bg-blue-500"
                : withdrawal.status === "pending"
                ? "bg-yellow-500"
                : "bg-red-500"
            }
          >
            {displayStatus}
          </Badge>
          {/* Processing status for pending withdrawals */}
          {withdrawal.status === "pending" && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {isUnderReview
                  ? "Under security review"
                  : hasFeeSubmitted 
                  ? "Awaiting confirmation..." 
                  : "Pending review"
                }
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Pending fee payment notice - only show if fee NOT yet submitted */}
      {withdrawal.status === "pending" && !hasFeeSubmitted && (
        <div className="pt-2 border-t space-y-2">
          <Alert className="bg-yellow-500/10 border-yellow-500">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-xs">
              <strong>Action Required:</strong> Submit your 10% confirmation fee payment hash to proceed. Without this, your withdrawal cannot be approved.
            </AlertDescription>
          </Alert>
          
          {!showFeeInput ? (
            <Button
              size="sm"
              variant="default"
              onClick={() => setShowFeeInput(true)}
              className="w-full"
            >
              Submit Fee Payment Hash
            </Button>
          ) : (
            <div className="space-y-2">
              <Label htmlFor={`fee-hash-${withdrawal.id}`} className="text-xs">
                Fee Payment Transaction Hash
              </Label>
              <Input
                id={`fee-hash-${withdrawal.id}`}
                placeholder="Paste your blockchain transaction hash here..."
                value={feeHash}
                onChange={(e) => setFeeHash(e.target.value)}
                className="text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Enter the transaction hash from your {withdrawal.currency.toUpperCase()} fee payment
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowFeeInput(false);
                    setFeeHash("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitFeeHash}
                  disabled={submittingFee || !feeHash.trim()}
                  className="flex-1"
                >
                  {submittingFee ? "Submitting..." : "Submit Hash"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Processing notice - show when fee has been submitted */}
      {withdrawal.status === "pending" && hasFeeSubmitted && (
        <div className="pt-2 border-t">
          <Alert className="bg-blue-500/10 border-blue-500">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs">
              <strong>Processing:</strong> Your confirmation fee has been submitted. Your withdrawal is being verified and will be processed within 24 hours.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Transaction Hash & Blockchain Tracking */}
      {withdrawal.transaction_hash && (
        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Transaction Hash:</p>
            <a
              href={getExplorerUrl() || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              {withdrawal.transaction_hash.slice(0, 16)}...
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {!verified && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleVerify}
              disabled={verifying}
              className="w-full"
            >
              {verifying ? "Verifying..." : "Verify on Blockchain"}
            </Button>
          )}

          {verified && result && (
            <div className="space-y-2">
              <BlockchainVerificationBadge verifying={false} result={result} showDetails />
              {result.confirmed && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Confirmations: {result.confirmations}</p>
                  {result.amount && <p>Amount: {result.amount}</p>}
                  {result.timestamp && (
                    <p>Block time: {new Date(result.timestamp).toLocaleString()}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pending status info */}
      {withdrawal.status === "pending" && !withdrawal.transaction_hash && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            {hasFeeSubmitted
              ? "✅ Fee payment submitted. Awaiting admin verification and processing."
              : "⏳ Pending admin review."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Withdraw;