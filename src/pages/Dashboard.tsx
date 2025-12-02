import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Wallet, TrendingUp, ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  balance: number;
  totalInvested: number;
  totalProfit: number;
  activeInvestments: number;
}

const Dashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    balance: 0,
    totalInvested: 0,
    totalProfit: 0,
    activeInvestments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("balance_usdt")
          .eq("id", user.id)
          .single();

        // Fetch investments
        const { data: investments } = await supabase
          .from("investments")
          .select("amount_usdt, current_value, status")
          .eq("user_id", user.id);

        // Fetch recent transactions
        const { data: transactions } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        const totalInvested = investments?.reduce((sum, inv) => sum + Number(inv.amount_usdt), 0) || 0;
        const totalValue = investments?.reduce((sum, inv) => sum + Number(inv.current_value), 0) || 0;
        const activeCount = investments?.filter(inv => inv.status === "active").length || 0;

        setStats({
          balance: Number(profile?.balance_usdt) || 0,
          totalInvested,
          totalProfit: totalValue - totalInvested,
          activeInvestments: activeCount,
        });

        setRecentTransactions(transactions || []);
      } catch (error: any) {
        toast({
          title: "Error loading dashboard",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setTimeout(() => setMounted(true), 100);
      }
    };

    fetchData();
  }, [toast]);

  const statsCards = useMemo(() => [
    {
      title: "Available Balance",
      icon: Wallet,
      value: stats.balance,
      prefix: "$",
      suffix: "",
      description: "USDT",
      colorClass: "text-primary",
      iconBgClass: "bg-primary/10",
      borderClass: "border-primary/30",
    },
    {
      title: "Total Invested",
      icon: ArrowDownLeft,
      value: stats.totalInvested,
      prefix: "$",
      suffix: "",
      description: "Across all investments",
      colorClass: "text-accent",
      iconBgClass: "bg-accent/10",
      borderClass: "border-accent/30",
    },
    {
      title: "Total Profit/Loss",
      icon: TrendingUp,
      value: stats.totalProfit,
      prefix: "$",
      suffix: "",
      description: `${stats.totalProfit >= 0 ? "+" : ""}${stats.totalInvested > 0 ? ((stats.totalProfit / stats.totalInvested) * 100).toFixed(2) : "0.00"}%`,
      colorClass: stats.totalProfit >= 0 ? "text-success" : "text-destructive",
      iconBgClass: stats.totalProfit >= 0 ? "bg-success/10" : "bg-destructive/10",
      borderClass: stats.totalProfit >= 0 ? "border-success/30" : "border-destructive/30",
    },
    {
      title: "Active Investments",
      icon: ArrowUpRight,
      value: stats.activeInvestments,
      prefix: "",
      suffix: "",
      description: "Currently running",
      colorClass: "text-primary-glow",
      iconBgClass: "bg-primary-glow/10",
      borderClass: "border-primary-glow/30",
      isInteger: true,
    },
  ], [stats]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <Loader2 className="h-10 w-10 text-primary animate-spin relative z-10" />
        </div>
        <div className="animate-pulse text-muted-foreground font-medium">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with fade-in animation */}
      <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h1 className="text-3xl font-bold mb-2 font-display bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground">Welcome to your investment dashboard</p>
      </div>

      {/* Stats Cards with staggered animations */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className={`group relative overflow-hidden transition-all duration-500 glass-card-enhanced ${card.borderClass} hover:shadow-none hover:scale-100 ${
                mounted 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Gradient accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
              
              {/* Gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <div className={`p-2.5 rounded-xl ${card.iconBgClass} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className={`h-4 w-4 ${card.colorClass}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold font-display ${card.colorClass}`}>
                  {card.isInteger ? (
                    <AnimatedNumber value={card.value} prefix={card.prefix} suffix={card.suffix} decimals={0} />
                  ) : (
                    <AnimatedNumber value={card.value} prefix={card.prefix} suffix={card.suffix} />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Transactions with slide-in animation */}
      <Card className={`glass-card-enhanced border-border/50 transition-all duration-500 delay-500 hover:shadow-none hover:scale-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-display">
            <span className="relative">
              Recent Transactions
              <span className="absolute -right-3 -top-1 h-2 w-2 bg-primary rounded-full animate-pulse" />
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 animate-bounce">
                <ArrowUpRight className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No transactions yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Your transactions will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx, index) => (
                <div 
                  key={tx.id} 
                  className={`flex items-center justify-between border-b border-border/30 pb-3 last:border-0 group hover:bg-muted/20 rounded-lg px-3 py-2 -mx-3 transition-all duration-300 ${
                    mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}
                  style={{ transitionDelay: `${600 + index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                      tx.type === 'deposit' ? 'bg-success/10' : 
                      tx.type === 'withdrawal' ? 'bg-destructive/10' : 'bg-primary/10'
                    }`}>
                      {tx.type === 'deposit' ? (
                        <ArrowDownLeft className="h-5 w-5 text-success" />
                      ) : tx.type === 'withdrawal' ? (
                        <ArrowUpRight className="h-5 w-5 text-destructive" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium capitalize">{tx.type.replace("_", " ")}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold font-display">${Number(tx.amount).toFixed(2)}</div>
                    <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block ${
                      tx.status === "completed" ? "bg-success/10 text-success" :
                      tx.status === "pending" ? "bg-warning/10 text-warning" :
                      tx.status === "rejected" ? "bg-destructive/10 text-destructive" :
                      tx.status === "approved" ? "bg-primary/10 text-primary" : ""
                    }`}>
                      {tx.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
