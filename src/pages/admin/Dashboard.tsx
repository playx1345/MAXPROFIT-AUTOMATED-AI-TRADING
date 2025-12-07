import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
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
          user_id
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      // Fetch user emails separately to avoid relationship ambiguity
      const userIds = [...new Set(recentTransactions?.map(tx => tx.user_id) || [])];
      const { data: userProfiles } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      const emailMap = new Map(userProfiles?.map(p => [p.id, p.email]) || []);

      if (transactionsError) throw transactionsError;

      const formattedActivities = recentTransactions?.map((tx: any) => ({
        id: tx.id,
        type: tx.type,
        description: `${tx.type === "deposit" ? "Deposit" : "Withdrawal"} of $${tx.amount} by ${emailMap.get(tx.user_id) || "Unknown"} - ${tx.status}`,
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
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin relative z-10" />
        </div>
        <div className="animate-pulse text-muted-foreground font-medium">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">Overview of platform statistics and activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="glass-card-enhanced border-primary/20 group hover:border-primary/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 group-hover:scale-110 transition-transform duration-300">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-primary">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="glass-card-enhanced border-accent/20 group hover:border-accent/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Platform Value</CardTitle>
            <div className="p-2 rounded-lg bg-accent/10 group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-accent">
              ${stats.totalPlatformValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total AUM</p>
          </CardContent>
        </Card>

        <Card className="glass-card-enhanced border-warning/20 group hover:border-warning/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Deposits</CardTitle>
            <div className="p-2 rounded-lg bg-warning/10 group-hover:scale-110 transition-transform duration-300">
              <AlertCircle className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-warning">
              {stats.pendingDeposits}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="glass-card-enhanced border-destructive/20 group hover:border-destructive/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Withdrawals</CardTitle>
            <div className="p-2 rounded-lg bg-destructive/10 group-hover:scale-110 transition-transform duration-300">
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-destructive">
              {stats.pendingWithdrawals}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card className="glass-card-enhanced border-success/20 group hover:border-success/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Investments</CardTitle>
            <div className="p-2 rounded-lg bg-success/10 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-success">
              {stats.activeInvestments}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="glass-card-enhanced border-border/50">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <span className="relative">
              Recent Activity
              <span className="absolute -right-3 -top-1 h-2 w-2 bg-primary rounded-full animate-pulse" />
            </span>
          </CardTitle>
          <CardDescription>Latest platform transactions and events</CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent activity
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between p-3 border border-border/30 rounded-lg hover:bg-muted/20 hover:border-primary/20 transition-all duration-300 group"
                >
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(activity.timestamp), "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>
                  <Badge 
                    variant={activity.type === "deposit" ? "default" : "secondary"}
                    className={activity.type === "deposit" ? "bg-primary/20 text-primary border border-primary/30" : "bg-accent/20 text-accent border border-accent/30"}
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
