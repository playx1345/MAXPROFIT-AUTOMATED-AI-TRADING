import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Plus } from "lucide-react";
import { z } from "zod";

const investmentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
});

const Investments = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance_usdt, kyc_status")
        .eq("id", user.id)
        .single();

      setBalance(Number(profile?.balance_usdt) || 0);

      // Fetch plans
      const { data: plansData } = await supabase
        .from("investment_plans")
        .select("*")
        .eq("active", true)
        .order("min_amount");

      // Fetch investments with plan details
      const { data: investmentsData } = await supabase
        .from("investments")
        .select(`
          *,
          investment_plans (name, risk_level)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setPlans(plansData || []);
      setInvestments(investmentsData || []);
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvestment = async () => {
    if (!selectedPlan) return;

    try {
      setSubmitting(true);

      const parsedAmount = parseFloat(amount);
      investmentSchema.parse({ amount: parsedAmount });

      if (parsedAmount < Number(selectedPlan.min_amount) || parsedAmount > Number(selectedPlan.max_amount)) {
        throw new Error(`Amount must be between $${selectedPlan.min_amount} and $${selectedPlan.max_amount}`);
      }

      if (parsedAmount > balance) {
        throw new Error("Insufficient balance. Please deposit funds first.");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("investments").insert({
        user_id: user.id,
        plan_id: selectedPlan.id,
        amount_usdt: parsedAmount,
        current_value: parsedAmount,
        status: "active",
        started_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + selectedPlan.duration_days * 24 * 60 * 60 * 1000).toISOString(),
      });

      if (error) throw error;

      // Deduct from balance
      await supabase
        .from("profiles")
        .update({ balance_usdt: balance - parsedAmount })
        .eq("id", user.id);

      toast({
        title: "Investment created successfully!",
        description: `$${parsedAmount} invested in ${selectedPlan.name}`,
      });

      setDialogOpen(false);
      setAmount("");
      fetchData();
    } catch (error: any) {
      toast({
        title: "Investment failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Investments</h1>
          <p className="text-muted-foreground">Manage your investment portfolio</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Available Balance</div>
          <div className="text-2xl font-bold">${balance.toFixed(2)}</div>
        </div>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Cryptocurrency investments carry risk. Past performance does not guarantee future results. Only invest what you can afford to lose.
        </AlertDescription>
      </Alert>

      {/* Investment Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                  <Badge variant={
                    plan.risk_level === "low" ? "secondary" :
                    plan.risk_level === "medium" ? "default" : "destructive"
                  }>
                    {plan.risk_level} risk
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Investment Range</div>
                  <div className="font-semibold">${Number(plan.min_amount).toFixed(0)} - ${Number(plan.max_amount).toFixed(0)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Expected ROI</div>
                  <div className="font-semibold">{plan.expected_roi_min}% - {plan.expected_roi_max}%</div>
                  <div className="text-xs text-muted-foreground">Per {plan.duration_days} days</div>
                </div>
                <Dialog open={dialogOpen && selectedPlan?.id === plan.id} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (open) setSelectedPlan(plan);
                }}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Invest Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Investment</DialogTitle>
                      <DialogDescription>
                        Invest in {plan.name}. Min: ${Number(plan.min_amount).toFixed(0)}, Max: ${Number(plan.max_amount).toFixed(0)}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Investment Amount (USDT)</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="Enter amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          min={plan.min_amount}
                          max={Math.min(plan.max_amount, balance)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Available balance: ${balance.toFixed(2)}
                        </p>
                      </div>
                      <Alert>
                        <AlertDescription className="text-xs">
                          By investing, you acknowledge that cryptocurrency investments carry risk and returns are not guaranteed.
                        </AlertDescription>
                      </Alert>
                      <Button onClick={handleCreateInvestment} disabled={submitting} className="w-full">
                        {submitting ? "Creating..." : "Confirm Investment"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* My Investments */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Investments</h2>
        {investments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">You haven't made any investments yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {investments.map((investment) => (
              <Card key={investment.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="font-semibold text-lg">{investment.investment_plans.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Started {new Date(investment.started_at || investment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-xs text-muted-foreground">Invested</div>
                        <div className="font-semibold">${Number(investment.amount_usdt).toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Current Value</div>
                        <div className="font-semibold">${Number(investment.current_value).toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">ROI</div>
                        <div className={`font-semibold ${Number(investment.roi_percentage) >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {Number(investment.roi_percentage).toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Status</div>
                        <Badge>{investment.status}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Investments;