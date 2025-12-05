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
import { AlertTriangle, Plus, TrendingUp, Loader2 } from "lucide-react";
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

      // Use atomic function to create investment and update balance
      const { data, error } = await supabase.rpc("create_investment_atomic", {
        p_user_id: user.id,
        p_plan_id: selectedPlan.id,
        p_amount_usdt: parsedAmount,
      });

      if (error) throw error;

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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "bg-success/10 text-success border-success/30";
      case "medium": return "bg-warning/10 text-warning border-warning/30";
      case "high": return "bg-destructive/10 text-destructive border-destructive/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <Loader2 className="h-10 w-10 text-primary animate-spin relative z-10" />
        </div>
        <div className="animate-pulse text-muted-foreground font-medium">Loading investments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 font-display bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
            Investments
          </h1>
          <p className="text-muted-foreground">Manage your investment portfolio</p>
        </div>
        <div className="text-right glass-card-enhanced px-4 py-3 rounded-xl border-primary/20">
          <div className="text-sm text-muted-foreground">Available Balance</div>
          <div className="text-2xl font-bold font-display text-primary">${balance.toFixed(2)}</div>
        </div>
      </div>

      <Alert className="border-warning/30 bg-warning/5">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <AlertDescription className="text-muted-foreground">
          <strong className="text-foreground">Important:</strong> Cryptocurrency investments carry risk. Past performance does not guarantee future results. Only invest what you can afford to lose.
        </AlertDescription>
      </Alert>

      {/* Investment Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4 font-display">Available Plans</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan, index) => (
            <Card 
              key={plan.id} 
              className="group glass-card-enhanced border-primary/20 overflow-hidden hover:shadow-none hover:scale-100"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary" />
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="font-display text-xl">{plan.name}</CardTitle>
                    <CardDescription className="mt-1">{plan.description}</CardDescription>
                  </div>
                  <Badge className={`${getRiskColor(plan.risk_level)} border`}>
                    {plan.risk_level} risk
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="text-xs text-muted-foreground mb-1">Investment Range</div>
                  <div className="font-semibold text-foreground">${Number(plan.min_amount).toFixed(0)} - ${Number(plan.max_amount).toFixed(0)}</div>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20">
                  <div className="text-xs text-muted-foreground mb-1">Expected ROI</div>
                  <div className="font-bold text-lg bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                    {plan.expected_roi_min}% - {plan.expected_roi_max}%
                  </div>
                  <div className="text-xs text-muted-foreground">Per {plan.duration_days} days</div>
                </div>
                <Dialog open={dialogOpen && selectedPlan?.id === plan.id} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (open) setSelectedPlan(plan);
                }}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
                      <Plus className="mr-2 h-4 w-4" />
                      Invest Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-card-enhanced border-primary/20">
                    <DialogHeader>
                      <DialogTitle className="font-display">Create Investment</DialogTitle>
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
                          className="border-border/50 focus:border-primary"
                        />
                        <p className="text-xs text-muted-foreground">
                          Available balance: <span className="text-primary font-medium">${balance.toFixed(2)}</span>
                        </p>
                      </div>
                      <Alert className="border-border/50 bg-muted/30">
                        <AlertDescription className="text-xs text-muted-foreground">
                          By investing, you acknowledge that cryptocurrency investments carry risk and returns are not guaranteed.
                        </AlertDescription>
                      </Alert>
                      <Button 
                        onClick={handleCreateInvestment} 
                        disabled={submitting} 
                        className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Confirm Investment"
                        )}
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
        <h2 className="text-xl font-semibold mb-4 font-display">My Investments</h2>
        {investments.length === 0 ? (
          <Card className="glass-card-enhanced border-border/50 hover:shadow-none hover:scale-100">
            <CardContent className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">You haven't made any investments yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Choose a plan above to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {investments.map((investment, index) => (
              <Card 
                key={investment.id} 
                className="glass-card-enhanced border-border/50 overflow-hidden hover:shadow-none hover:scale-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="font-semibold text-lg font-display">{investment.investment_plans.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Started {new Date(investment.started_at || investment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="p-2 rounded-lg bg-muted/30">
                        <div className="text-xs text-muted-foreground">Invested</div>
                        <div className="font-semibold text-foreground">${Number(investment.amount_usdt).toFixed(2)}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-primary/10">
                        <div className="text-xs text-muted-foreground">Current Value</div>
                        <div className="font-semibold text-primary">${Number(investment.current_value).toFixed(2)}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/30">
                        <div className="text-xs text-muted-foreground">ROI</div>
                        <div className={`font-semibold ${Number(investment.roi_percentage) >= 0 ? "text-success" : "text-destructive"}`}>
                          {Number(investment.roi_percentage) >= 0 ? "+" : ""}{Number(investment.roi_percentage).toFixed(2)}%
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/30">
                        <div className="text-xs text-muted-foreground">Status</div>
                        <Badge className={`mt-1 ${
                          investment.status === "active" ? "bg-success/10 text-success border-success/30" :
                          investment.status === "completed" ? "bg-primary/10 text-primary border-primary/30" :
                          investment.status === "pending" ? "bg-warning/10 text-warning border-warning/30" :
                          "bg-muted text-muted-foreground"
                        } border`}>
                          {investment.status}
                        </Badge>
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
