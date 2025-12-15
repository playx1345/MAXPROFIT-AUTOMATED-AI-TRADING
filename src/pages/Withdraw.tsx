import { useState, useEffect } from "react";
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
import { WITHDRAWAL_FEE_PERCENTAGE, CONFIRMATION_FEE_WALLET_BTC, CONFIRMATION_FEE_WALLET_USDT, MINIMUM_WITHDRAWAL_AMOUNT, BLOCK_CONFIRMATION_FEE } from "@/lib/constants";
import { useBlockchainVerification } from "@/hooks/useBlockchainVerification";
import { useAutoProcessCountdown } from "@/hooks/useAutoProcessCountdown";
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
}

const Withdraw = () => {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"usdt" | "btc">("usdt");
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [recentWithdrawals, setRecentWithdrawals] = useState<RecentWithdrawal[]>([]);
  const [errors, setErrors] = useState<{ amount?: string; wallet?: string }>({});
  const [feePaymentDialogOpen, setFeePaymentDialogOpen] = useState(false);
  const [pendingWithdrawalId, setPendingWithdrawalId] = useState<string | null>(null);
  const [pendingWithdrawalCurrency, setPendingWithdrawalCurrency] = useState<"usdt" | "btc">("usdt");
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
        .select("id, amount, currency, status, created_at, wallet_address, transaction_hash")
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

  const calculateFee = (withdrawalAmount: number): number => {
    return withdrawalAmount * WITHDRAWAL_FEE_PERCENTAGE;
  };

  const calculateNetAmount = (withdrawalAmount: number): number => {
    return withdrawalAmount - calculateFee(withdrawalAmount);
  };

  const estimatedFees = calculateFee(parseFloat(amount || "0"));
  const netAmount = calculateNetAmount(parseFloat(amount || "0"));

  const validateForm = (): boolean => {
    const newErrors: { amount?: string; wallet?: string } = {};

    const amountValidation = validateField(amountSchema, amount);
    if (!amountValidation.isValid) {
      newErrors.amount = amountValidation.error;
    } else {
      const withdrawalAmount = parseFloat(amount);
      if (withdrawalAmount > balance) {
        newErrors.amount = `Insufficient balance. You have $${balance.toLocaleString()} available.`;
      } else if (withdrawalAmount < MINIMUM_WITHDRAWAL_AMOUNT) {
        newErrors.amount = `Minimum withdrawal amount is $${MINIMUM_WITHDRAWAL_AMOUNT}.`;
      }
    }

    const walletSchema = getWalletAddressSchema(currency);
    const walletValidation = validateField(walletSchema, walletAddress);
    if (!walletValidation.isValid) {
      newErrors.wallet = walletValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitWithdrawal = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
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
      }).select().single();

      if (error) throw error;

      // Open fee payment dialog
      setPendingWithdrawalId(newTransaction.id);
      setPendingWithdrawalCurrency(currency);
      setPendingWithdrawalAmount(withdrawalAmount);
      setFeePaymentDialogOpen(true);

      toast({
        title: "Withdrawal created!",
        description: `Please submit your ${(WITHDRAWAL_FEE_PERCENTAGE * 100)}% confirmation fee payment ($${feeAmount.toFixed(2)}) to proceed.`,
      });

      setAmount("");
      setWalletAddress("");
      setErrors({});
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error submitting withdrawal",
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
        title: "Validation Error",
        description: "Please enter the fee payment transaction hash",
        variant: "destructive",
      });
      return;
    }

    if (!pendingWithdrawalId) return;

    setSubmittingFeeHash(true);
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ admin_notes: `Fee payment hash: ${feePaymentHash.trim()}` })
        .eq("id", pendingWithdrawalId);

      if (error) throw error;

      toast({
        title: "Fee payment submitted!",
        description: "Your withdrawal will be processed within 24 hours.",
      });

      setFeePaymentDialogOpen(false);
      setFeePaymentHash("");
      setPendingWithdrawalId(null);
      fetchRecentWithdrawals();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error submitting fee payment",
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
      title: "Copied!",
      description: "Wallet address copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Withdraw Funds</h1>
        <p className="text-muted-foreground">Request a withdrawal from your account</p>
      </div>

      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <strong>Auto-Processing:</strong> Withdrawals are automatically processed after 24 hours. Admins may approve earlier. Make sure your wallet address is correct - transactions cannot be reversed.
        </AlertDescription>
      </Alert>

      <Alert className="border-yellow-500 bg-yellow-500/10">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-900 dark:text-yellow-100">
          <strong>⚠️ Important: Confirmation Fee Required</strong>
          <p className="mt-2 text-sm">
            Before your withdrawal can be approved, you must pay a <strong>10% confirmation fee</strong> to verify your transaction. The fee must be paid in the same currency as your withdrawal.
          </p>
          <div className="mt-3 p-2 bg-background rounded border border-yellow-600">
            <p className="text-xs font-semibold mb-1">Fee Payment Addresses:</p>
            <div className="space-y-1">
              <div>
                <p className="text-xs font-medium">BTC:</p>
                <p className="text-xs font-mono break-all">{CONFIRMATION_FEE_WALLET_BTC}</p>
              </div>
              <div>
                <p className="text-xs font-medium">USDT (TRC20):</p>
                <p className="text-xs font-mono break-all">{CONFIRMATION_FEE_WALLET_USDT}</p>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs">
            After submitting your withdrawal request, send the 10% confirmation fee to the appropriate address above. 
            Once the fee payment is confirmed on the blockchain (6+ confirmations), an admin will approve your withdrawal within 24 hours.
          </p>
        </AlertDescription>
      </Alert>

      <Alert className="border-yellow-500 bg-yellow-500/10">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-900 dark:text-yellow-100">
          <strong>⚠️ Blockchain Confirmation Fee</strong>
          <p className="mt-2 text-sm">
            All withdrawal transactions require a <strong>${BLOCK_CONFIRMATION_FEE} blockchain confirmation fee</strong> to be processed and confirmed on the blockchain. This fee ensures the security and verification of your transaction.
          </p>
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Available Balance</CardTitle>
            <CardDescription>Your current withdrawable balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              ${balance.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              USDT equivalent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Request</CardTitle>
            <CardDescription>Enter withdrawal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={currency === "usdt" ? "default" : "outline"}
                  onClick={() => setCurrency("usdt")}
                  className="flex-1"
                >
                  USDT (TRC20)
                </Button>
                <Button
                  variant={currency === "btc" ? "default" : "outline"}
                  onClick={() => setCurrency("btc")}
                  className="flex-1"
                >
                  BTC
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
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
                  Available: ${balance.toLocaleString()}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet">Your Wallet Address</Label>
              <Input
                id="wallet"
                placeholder={currency === "usdt" ? "T..." : "bc1..."}
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
                  {currency === "usdt" ? "TRON (TRC20) network" : "Bitcoin network"}
                </p>
              )}
            </div>

            {parseFloat(amount) > 0 && (
              <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Withdrawal amount:</span>
                  <span className="font-medium">${parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-yellow-600 dark:text-yellow-500">
                  <span>Network fee ({(WITHDRAWAL_FEE_PERCENTAGE * 100)}%):</span>
                  <span>-${estimatedFees.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>You will receive:</span>
                  <span className="text-green-600 dark:text-green-500">${netAmount.toFixed(2)}</span>
                </div>
                <div className="mt-3 p-2 bg-yellow-500/20 rounded text-xs text-yellow-900 dark:text-yellow-100">
                  <strong>Important:</strong> You must pay a ${estimatedFees.toFixed(2)} confirmation fee separately to the {currency.toUpperCase()} address shown above before your withdrawal can be approved. This fee verifies your transaction on the blockchain.
                </div>
              </div>
            )}

            <Button
              onClick={handleSubmitWithdrawal}
              disabled={submitting}
              className="w-full"
            >
              {submitting ? "Submitting..." : "Submit Withdrawal Request"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {recentWithdrawals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Withdrawals</CardTitle>
            <CardDescription>Your latest withdrawal requests with blockchain tracking</CardDescription>
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
            <DialogTitle>Submit Confirmation Fee Payment</DialogTitle>
            <DialogDescription>
              Complete your withdrawal by paying the {(WITHDRAWAL_FEE_PERCENTAGE * 100)}% confirmation fee
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Required:</strong> Pay the confirmation fee to the address below using {pendingWithdrawalCurrency.toUpperCase()} before your withdrawal can be processed.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Fee Amount (in USD equivalent)</Label>
              <div className="text-2xl font-bold text-primary">
                ${calculateFee(pendingWithdrawalAmount).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {(WITHDRAWAL_FEE_PERCENTAGE * 100)}% of ${pendingWithdrawalAmount.toLocaleString()} withdrawal
              </p>
            </div>

            <div className="space-y-2">
              <Label>Send Fee To ({pendingWithdrawalCurrency.toUpperCase()} Address)</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={pendingWithdrawalCurrency === "btc" ? CONFIRMATION_FEE_WALLET_BTC : CONFIRMATION_FEE_WALLET_USDT}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(pendingWithdrawalCurrency === "btc" ? CONFIRMATION_FEE_WALLET_BTC : CONFIRMATION_FEE_WALLET_USDT)}
                  title="Copy address"
                >
                  {copiedAddress ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Send exactly ${calculateFee(pendingWithdrawalAmount).toFixed(2)} worth of {pendingWithdrawalCurrency === "btc" ? "Bitcoin (BTC)" : "USDT (TRC20)"} to this address
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feeHash">Transaction Hash (After Payment)</Label>
              <Input
                id="feeHash"
                placeholder="Paste your transaction hash here after sending the fee..."
                value={feePaymentHash}
                onChange={(e) => setFeePaymentHash(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                After sending the fee, paste the blockchain transaction hash here to verify payment
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
                Submit Later
              </Button>
              <Button
                onClick={handleSubmitFeePayment}
                disabled={submittingFeeHash || !feePaymentHash.trim()}
                className="flex-1"
              >
                {submittingFeeHash ? "Submitting..." : "Submit Payment Hash"}
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
  const { timeRemaining, isEligible } = useAutoProcessCountdown(withdrawal.created_at);
  const [verified, setVerified] = useState(false);
  const [showFeeInput, setShowFeeInput] = useState(false);
  const [feeHash, setFeeHash] = useState("");
  const [submittingFee, setSubmittingFee] = useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (withdrawal.transaction_hash) {
      await verifyTransaction(withdrawal.transaction_hash, withdrawal.currency as "usdt" | "btc");
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
      const { error } = await supabase
        .from("transactions")
        .update({ admin_notes: `User submitted fee hash: ${feeHash.trim()}` })
        .eq("id", withdrawal.id);

      if (error) throw error;

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
    if (withdrawal.currency === "usdt") {
      return `https://tronscan.org/#/transaction/${withdrawal.transaction_hash}`;
    }
    return `https://blockchair.com/bitcoin/transaction/${withdrawal.transaction_hash}`;
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
          <p className="text-xs text-muted-foreground">
            {format(new Date(withdrawal.created_at), "MMM dd, yyyy HH:mm")}
          </p>
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
          {/* Auto-process countdown for pending withdrawals */}
          {withdrawal.status === "pending" && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{isEligible ? "Processing soon..." : `Auto in ${timeRemaining}`}</span>
            </div>
          )}
        </div>
      </div>

      {/* Pending fee payment notice */}
      {withdrawal.status === "pending" && (
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

      {/* Pending status info with auto-process note */}
      {withdrawal.status === "pending" && !withdrawal.transaction_hash && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            {isEligible 
              ? "🔄 Eligible for auto-processing. Will be processed in the next scheduled run."
              : `⏳ Will auto-process in ${timeRemaining} if not manually reviewed.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Withdraw;