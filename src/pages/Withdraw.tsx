import { useState, useEffect, useCallback } from "react";
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
import { ExternalLink, Clock } from "lucide-react";
import { amountSchema, getWalletAddressSchema, validateField } from "@/lib/validation";
import { MINIMUM_WITHDRAWAL_AMOUNT } from "@/lib/constants";
import { useBlockchainVerification } from "@/hooks/useBlockchainVerification";
import { BlockchainVerificationBadge } from "@/components/BlockchainVerificationBadge";
import { PullToRefresh } from "@/components/PullToRefresh";
import TransactionReceiptDialog from "@/components/TransactionReceiptDialog";


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
  const { toast } = useToast();

  const fetchAllData = useCallback(async () => {
    await Promise.all([fetchBalance(), fetchRecentWithdrawals()]);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

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
      
      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        type: "withdrawal",
        amount: withdrawalAmount,
        currency: currency,
        status: "pending",
        wallet_address: walletAddress.trim(),
        memo_tag: currency === 'xrp' && memoTag.trim() ? memoTag.trim() : null,
      });

      if (error) throw error;

      // Send withdrawal request email notification
      supabase.functions.invoke('send-withdrawal-notification', {
        body: {
          user_name: user.user_metadata?.full_name || user.email,
          user_email: user.email,
          amount: withdrawalAmount,
          currency: currency.toUpperCase(),
          date: new Date().toISOString(),
          transaction_id: crypto.randomUUID(),
          wallet_address: walletAddress.trim(),
          status: 'pending',
        },
      }).catch(err => console.error("Withdrawal email failed:", err));

      toast({
        title: t("withdraw.created"),
        description: t("withdraw.requestSubmitted", "Your withdrawal request has been submitted and is pending review."),
      });

      setAmount("");
      setWalletAddress("");
      setMemoTag("");
      setErrors({});
      fetchRecentWithdrawals();
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

  return (
    <PullToRefresh onRefresh={fetchAllData}>
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
                  XRP (Ripple)
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
                <div className="flex justify-between font-bold">
                  <span>{t("withdraw.youWillReceive")}:</span>
                  <span className="text-success">${parseFloat(amount).toLocaleString()}</span>
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
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </PullToRefresh>
  );
};

const WithdrawalCard = ({ withdrawal }: { withdrawal: RecentWithdrawal }) => {
  const { verifying, result, verifyTransaction } = useBlockchainVerification();
  const [verified, setVerified] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const handleVerify = async () => {
    if (withdrawal.transaction_hash) {
      await verifyTransaction(withdrawal.transaction_hash, withdrawal.currency as "usdt" | "btc" | "eth" | "usdc");
      setVerified(true);
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
    <>
    <div 
      className="p-4 border rounded-lg space-y-3 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => setReceiptOpen(true)}
    >
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
          <button 
            type="button"
            className="text-xs text-primary mt-1 hover:underline cursor-pointer bg-transparent border-none p-0 text-left"
            onClick={(e) => { e.stopPropagation(); setReceiptOpen(true); }}
          >
            Click to view receipt →
          </button>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge
            className={
              withdrawal.status === "approved" || withdrawal.status === "completed"
                ? "bg-green-500"
                : withdrawal.status === "pending"
                ? "bg-yellow-500"
                : "bg-red-500"
            }
          >
            {withdrawal.status}
          </Badge>
          {withdrawal.status === "pending" && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Pending review</span>
            </div>
          )}
        </div>
      </div>

      {withdrawal.transaction_hash && (
        <div className="pt-2 border-t space-y-2" onClick={(e) => e.stopPropagation()}>
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

      {withdrawal.status === "pending" && !withdrawal.transaction_hash && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            ⏳ Pending admin review.
          </p>
        </div>
      )}
    </div>
    <TransactionReceiptDialog
      open={receiptOpen}
      onOpenChange={setReceiptOpen}
      transaction={withdrawal}
    />
    </>
  );
};

export default Withdraw;
