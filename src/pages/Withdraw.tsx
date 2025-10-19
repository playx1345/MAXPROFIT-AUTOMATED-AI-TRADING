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
import { AlertTriangle } from "lucide-react";

interface RecentWithdrawal {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  wallet_address: string | null;
}

const Withdraw = () => {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"usdt" | "btc">("usdt");
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [recentWithdrawals, setRecentWithdrawals] = useState<RecentWithdrawal[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchBalance();
    fetchRecentWithdrawals();
  }, []);

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
    } catch (error: any) {
      console.error("Error fetching balance:", error);
    }
  };

  const fetchRecentWithdrawals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("transactions")
        .select("id, amount, currency, status, created_at, wallet_address")
        .eq("user_id", user.id)
        .eq("type", "withdrawal")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentWithdrawals(data || []);
    } catch (error: any) {
      console.error("Error fetching withdrawals:", error);
    }
  };

  const estimatedFees = parseFloat(amount) * 0.02; // 2% example fee + VAT
  const netAmount = parseFloat(amount || "0") - estimatedFees;

  const handleSubmitWithdrawal = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) > balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    if (!walletAddress.trim()) {
      toast({
        title: "Wallet address required",
        description: "Please enter your wallet address",
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
        type: "withdrawal",
        amount: parseFloat(amount),
        currency: currency,
        status: "pending",
        wallet_address: walletAddress,
      });

      if (error) throw error;

      toast({
        title: "Withdrawal submitted!",
        description: "Your withdrawal request is pending admin approval. Processing typically takes up to 24 hours.",
      });

      setAmount("");
      setWalletAddress("");
      fetchRecentWithdrawals();
    } catch (error: any) {
      toast({
        title: "Error submitting withdrawal",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Withdraw Funds</h1>
        <p className="text-muted-foreground">Request a withdrawal from your account</p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Withdrawals are processed within 24 hours. Make sure your wallet address is correct - transactions cannot be reversed.
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
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Available: ${balance.toLocaleString()}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet">Your Wallet Address</Label>
              <Input
                id="wallet"
                placeholder={currency === "usdt" ? "T..." : "bc1..."}
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {currency === "usdt" ? "TRON (TRC20) network" : "Bitcoin network"}
              </p>
            </div>

            {parseFloat(amount) > 0 && (
              <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Withdrawal amount:</span>
                  <span className="font-medium">${parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated fees:</span>
                  <span>-${estimatedFees.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>You will receive:</span>
                  <span>${netAmount.toFixed(2)}</span>
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
            <CardDescription>Your latest withdrawal requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentWithdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
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
                  <Badge
                    className={
                      withdrawal.status === "completed"
                        ? "bg-green-500"
                        : withdrawal.status === "pending"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }
                  >
                    {withdrawal.status}
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

export default Withdraw;
