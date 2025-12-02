import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, DollarSign, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Stats {
  totalUsers: number;
  totalPlatformValue: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  activeInvestments: number;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPlatformValue: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    activeInvestments: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total users
      const { count: usersCount, error: usersError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (usersError) throw usersError;

      // Fetch total platform value (sum of all balances)
      const { data: balances, error: balancesError } = await supabase
        .from("profiles")
        .select("balance_usdt");

      if (balancesError) throw balancesError;

      const totalValue = balances?.reduce((sum, profile) => sum + (profile.balance_usdt || 0), 0) || 0;

      // Fetch pending deposits
      const { count: depositsCount, error: depositsError } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("type", "deposit")
        .eq("status", "pending");

      if (depositsError) throw depositsError;

      // Fetch pending withdrawals
      const { count: withdrawalsCount, error: withdrawalsError } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("type", "withdrawal")
        .eq("status", "pending");

      if (withdrawalsError) throw withdrawalsError;

      // Fetch active investments
      const { count: investmentsCount, error: investmentsError } = await supabase
        .from("investments")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      if (investmentsError) throw investmentsError;

      setStats({
        totalUsers: usersCount || 0,
        totalPlatformValue: totalValue,
        pendingDeposits: depositsCount || 0,
        pendingWithdrawals: withdrawalsCount || 0,
        activeInvestments: investmentsCount || 0,
      });

      // Fetch recent activity (latest transactions)
      const { data: recentTransactions, error: transactionsError } = await supabase
        .from("transactions")
        .select(`
          id,
          type,
          amount,
          status,
          created_at,
          profiles(email)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (transactionsError) throw transactionsError;

      const formattedActivities = recentTransactions?.map((tx: any) => ({
        id: tx.id,
        type: tx.type,
        description: `${tx.type === "deposit" ? "Deposit" : "Withdrawal"} of $${tx.amount} by ${tx.profiles?.email || "Unknown"} - ${tx.status}`,
        timestamp: tx.created_at,
      })) || [];

      setActivities(formattedActivities);
    } catch (error: any) {
      toast({
        title: "Error fetching dashboard data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMounted(true), 100);
    }
  };

  const statsCards = useMemo(() => [
    {
      title: "Total Users",
      icon: Users,
      value: stats.totalUsers,
      prefix: "",
      suffix: "",
      description: "Platform users",
      colorClass: "text-primary",
      iconBgClass: "bg-primary/10",
      borderClass: "border-primary/30",
      isInteger: true,
    },
    {
      title: "Platform Value",
      icon: DollarSign,
      value: stats.totalPlatformValue,
      prefix: "$",
      suffix: "",
      description: "Total AUM",
      colorClass: "text-success",
      iconBgClass: "bg-success/10",
      borderClass: "border-success/30",
    },
    {
      title: "Pending Deposits",
      icon: AlertCircle,
      value: stats.pendingDeposits,
      prefix: "",
      suffix: "",
      description: "Awaiting approval",
      colorClass: "text-warning",
      iconBgClass: "bg-warning/10",
      borderClass: "border-warning/30",
      isInteger: true,
    },
    {
      title: "Pending Withdrawals",
      icon: AlertCircle,
      value: stats.pendingWithdrawals,
      prefix: "",
      suffix: "",
      description: "Awaiting processing",
      colorClass: "text-accent",
      iconBgClass: "bg-accent/10",
      borderClass: "border-accent/30",
      isInteger: true,
    },
    {
      title: "Active Investments",
      icon: TrendingUp,
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
        <div className="animate-pulse text-muted-foreground font-medium">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with fade-in animation */}
      <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h1 className="text-3xl font-bold mb-2 font-display bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">Overview of platform statistics and activity</p>
      </div>

      {/* Stats Cards with staggered animations */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
              
              <CardHeader className="flex flex-row items-center justify-between pb-2">
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

      {/* Recent Activity with slide-in animation */}
      <Card className={`glass-card-enhanced border-border/50 transition-all duration-500 delay-500 hover:shadow-none hover:scale-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-display">
            <span className="relative">
              Recent Activity
              <span className="absolute -right-3 -top-1 h-2 w-2 bg-primary rounded-full animate-pulse" />
            </span>
          </CardTitle>
          <CardDescription>Latest platform transactions and events</CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 animate-bounce">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No recent activity</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Platform activity will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={`flex items-start justify-between p-3 border rounded-lg border-border/30 group hover:bg-muted/20 transition-all duration-300 hover:border-primary/30 ${
                    mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}
                  style={{ transitionDelay: `${600 + index * 100}ms` }}
                >
                  <div className="flex-1">
                    <p className="text-sm group-hover:text-foreground transition-colors">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(activity.timestamp), "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>
                  <Badge 
                    variant={activity.type === "deposit" ? "default" : "secondary"}
                    className="transition-transform duration-300 group-hover:scale-110"
                  >
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
