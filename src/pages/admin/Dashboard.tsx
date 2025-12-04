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
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of platform statistics and activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Platform Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalPlatformValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total AUM</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Deposits</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingDeposits}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingWithdrawals}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.activeInvestments}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
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
                  className="flex items-start justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(activity.timestamp), "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>
                  <Badge variant={activity.type === "deposit" ? "default" : "secondary"}>
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
