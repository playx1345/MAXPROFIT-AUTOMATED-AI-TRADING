import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, ExternalLink, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { depositAmountSchema, transactionHashSchema, validateField } from "@/lib/validation";
import { useBlockchainVerification } from "@/hooks/useBlockchainVerification";
import { BlockchainVerificationBadge } from "@/components/BlockchainVerificationBadge";

const PLATFORM_WALLETS = {
  usdt_trc20: "TDrBuPR9s7332so5FWT14ovWFXvjJH75Ur",
  btc: "bc1qyf87rz5ulfca0409zluqdkvlhyfd5qu008377h",
};

interface RecentDeposit {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  transaction_hash: string | null;
}

const Deposit = () => {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"usdt" | "btc">("usdt");
  const [transactionHash, setTransactionHash] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recentDeposits, setRecentDeposits] = useState<RecentDeposit[]>([]);
  const [errors, setErrors] = useState<{ amount?: string; txHash?: string }>({});
  const { toast } = useToast();
  const { verifying, result, verifyTransaction, clearResult } = useBlockchainVerification();

  useEffect(() => {
    fetchRecentDeposits();
  }, []);

  // Auto-verify when transaction hash changes (debounced)
  useEffect(() => {
    if (!transactionHash.trim()) {
      clearResult();
      return;
    }

    const timer = setTimeout(() => {
      if (transactionHash.trim().length >= 10) {
        verifyTransaction(transactionHash, currency);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [transactionHash, currency]);

  const fetchRecentDeposits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("transactions")
        .select("id, amount, currency, status, created_at, transaction_hash")
        .eq("user_id", user.id)
        .eq("type", "deposit")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentDeposits(data || []);
    } catch (error: unknown) {
      console.error("Error fetching deposits:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Wallet address copied to clipboard",
    });
  };

  const validateForm = (): boolean => {
    const newErrors: { amount?: string; txHash?: string } = {};

    const amountValidation = validateField(depositAmountSchema, amount);
    if (!amountValidation.isValid) {
      newErrors.amount = amountValidation.error;
    }

    if (transactionHash.trim()) {
      const txHashValidation = validateField(transactionHashSchema, transactionHash);
      if (!txHashValidation.isValid) {
        newErrors.txHash = txHashValidation.error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitDeposit = async () => {
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

      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        type: "deposit",
        amount: parseFloat(amount),
        currency: currency,
        status: "pending",
        wallet_address: currency === "usdt" ? PLATFORM_WALLETS.usdt_trc20 : PLATFORM_WALLETS.btc,
        transaction_hash: transactionHash.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "Deposit submitted!",
        description: "Your deposit request has been submitted and is pending admin approval.",
      });

      setAmount("");
      setTransactionHash("");
      setErrors({});
      clearResult();
      fetchRecentDeposits();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error submitting deposit",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyClick = () => {
    if (transactionHash.trim()) {
      verifyTransaction(transactionHash, currency);
    }
  };

  const walletAddress = currency === "usdt" ? PLATFORM_WALLETS.usdt_trc20 : PLATFORM_WALLETS.btc;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Deposit Funds</h1>
        <p className="text-muted-foreground">Add funds to your investment account</p>
      </div>

      <Alert>
        <AlertDescription>
          <strong>Important:</strong> Deposits are processed within 24 hours after blockchain confirmation.
          Make sure to send only {currency.toUpperCase()} to the address below.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform Wallet Address</CardTitle>
            <CardDescription>Send your crypto to this address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currency">Select Currency</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={currency === "usdt" ? "default" : "outline"}
                  onClick={() => {
                    setCurrency("usdt");
                    clearResult();
                  }}
                  className="flex-1"
                >
                  USDT (TRC20)
                </Button>
                <Button
                  variant={currency === "btc" ? "default" : "outline"}
                  onClick={() => {
                    setCurrency("btc");
                    clearResult();
                  }}
                  className="flex-1"
                >
                  BTC
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Wallet Address</Label>
              <div className="flex gap-2">
                <Input
                  value={walletAddress}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(walletAddress)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Network: {currency === "usdt" ? "TRON (TRC20)" : "Bitcoin"}
              </p>
            </div>

            <Alert>
              <AlertDescription className="text-xs">
                New to crypto? 
                <a 
                  href="https://bitcoin.com/buy-crypto" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 text-primary hover:underline inline-flex items-center gap-1"
                >
                  Buy crypto with fiat here <ExternalLink className="h-3 w-3" />
                </a>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submit Deposit</CardTitle>
            <CardDescription>Confirm your deposit details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                    const validation = validateField(depositAmountSchema, e.target.value);
                    if (validation.isValid) {
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
                  Minimum deposit: $250 USDT
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="txHash">Transaction Hash</Label>
                {transactionHash.trim() && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleVerifyClick}
                    disabled={verifying}
                    className="h-6 text-xs"
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    Verify
                  </Button>
                )}
              </div>
              <Input
                id="txHash"
                placeholder="Enter transaction hash for verification"
                value={transactionHash}
                onChange={(e) => {
                  setTransactionHash(e.target.value);
                  if (errors.txHash) {
                    const validation = validateField(transactionHashSchema, e.target.value);
                    if (validation.isValid) {
                      setErrors((prev) => ({ ...prev, txHash: undefined }));
                    }
                  }
                }}
                className={errors.txHash ? "border-destructive" : ""}
              />
              {errors.txHash ? (
                <p className="text-xs text-destructive">{errors.txHash}</p>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Optional but helps speed up approval
                  </p>
                  <BlockchainVerificationBadge verifying={verifying} result={result} />
                </div>
              )}
              
              {result && result.verified && result.amount !== null && (
                <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Blockchain Amount:</span>
                    <span className="font-medium">{result.amount.toLocaleString()} {currency.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Confirmations:</span>
                    <span className="font-medium">{result.confirmations}</span>
                  </div>
                  {result.timestamp && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{format(new Date(result.timestamp), "MMM dd, HH:mm")}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmitDeposit}
              disabled={submitting}
              className="w-full"
            >
              {submitting ? "Submitting..." : "Submit Deposit Request"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {recentDeposits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Deposits</CardTitle>
            <CardDescription>Your latest deposit requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentDeposits.map((deposit) => (
                <div
                  key={deposit.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      ${deposit.amount.toLocaleString()} {deposit.currency.toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(deposit.created_at), "MMM dd, yyyy HH:mm")}
                    </p>
                    {deposit.transaction_hash && (
                      <p className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                        TX: {deposit.transaction_hash.slice(0, 16)}...
                      </p>
                    )}
                  </div>
                  <Badge
                    className={
                      deposit.status === "approved"
                        ? "bg-green-500"
                        : deposit.status === "pending"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }
                  >
                    {deposit.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Deposit;
