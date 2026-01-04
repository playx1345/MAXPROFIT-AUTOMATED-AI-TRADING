import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, DollarSign, TrendingUp, AlertCircle, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Stats {
  totalUsers: number;
  totalPlatformValue: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  activeInvestments: number;
}

interface PendingTransaction {
  id: string;
  type: string;
  amount: number;
  user_email: string;
  created_at: string;
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
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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

      // Fetch pending transactions for quick actions
      const { data: pendingTx, error: pendingTxError } = await supabase
        .from("transactions")
        .select("id, type, amount, user_id, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);

      if (pendingTxError) throw pendingTxError;

      // Get user emails for pending transactions
      if (pendingTx && pendingTx.length > 0) {
        const userIds = [...new Set(pendingTx.map(tx => tx.user_id))];
        const { data: userProfiles } = await supabase
          .from("profiles")
          .select("id, email")
          .in("id", userIds);

        const emailMap = new Map(userProfiles?.map(p => [p.id, p.email]) || []);
        
        setPendingTransactions(pendingTx.map(tx => ({
          id: tx.id,
          type: tx.type,
          amount: tx.amount,
          user_email: emailMap.get(tx.user_id) || "Unknown",
          created_at: tx.created_at,
        })));
      }

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

      if (transactionsError) throw transactionsError;

      // Fetch user emails separately to avoid relationship ambiguity
      let emailMap = new Map<string, string>();
      if (recentTransactions && recentTransactions.length > 0) {
        const userIds = [...new Set(recentTransactions.map(tx => tx.user_id))];
        const { data: userProfiles } = await supabase
          .from("profiles")
          .select("id, email")
          .in("id", userIds);

        emailMap = new Map(userProfiles?.map(p => [p.id, p.email]) || []);
      }

      const formattedActivities = recentTransactions?.map((tx) => ({
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

  const handleQuickApprove = async (transaction: PendingTransaction) => {
    setProcessingId(transaction.id);
    try {
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      if (!adminUser) throw new Error("Not authenticated as admin");

      const rpcFunction = transaction.type === "deposit" 
        ? "approve_deposit_atomic" 
        : "approve_withdrawal_atomic";

      const params = transaction.type === "deposit" 
        ? {
            p_transaction_id: transaction.id,
            p_admin_id: adminUser.id,
            p_admin_email: adminUser.email || "",
            p_admin_notes: "Quick approved from dashboard",
          }
        : {
            p_transaction_id: transaction.id,
            p_admin_id: adminUser.id,
            p_admin_email: adminUser.email || "",
            p_transaction_hash: null,
            p_admin_notes: "Quick approved from dashboard",
          };

      const { error } = await supabase.rpc(rpcFunction as any, params);
      if (error) throw error;

      toast({
        title: `${transaction.type === "deposit" ? "Deposit" : "Withdrawal"} approved`,
        description: `$${transaction.amount} for ${transaction.user_email}`,
      });

      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error approving transaction",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleQuickReject = async (transaction: PendingTransaction) => {
    setProcessingId(transaction.id);
    try {
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      if (!adminUser) throw new Error("Not authenticated as admin");

      const rpcFunction = transaction.type === "deposit" 
        ? "reject_deposit_atomic" 
        : "reject_withdrawal_atomic";

      const { error } = await supabase.rpc(rpcFunction as any, {
        p_transaction_id: transaction.id,
        p_admin_id: adminUser.id,
        p_admin_email: adminUser.email || "",
        p_admin_notes: "Quick rejected from dashboard",
      });

      if (error) throw error;

      toast({
        title: `${transaction.type === "deposit" ? "Deposit" : "Withdrawal"} rejected`,
        description: `$${transaction.amount} for ${transaction.user_email}`,
      });

      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error rejecting transaction",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
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

        <Card 
          className="glass-card-enhanced border-warning/20 group hover:border-warning/40 transition-all duration-300 cursor-pointer"
          onClick={() => navigate("/admin/deposits")}
        >
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

        <Card 
          className="glass-card-enhanced border-destructive/20 group hover:border-destructive/40 transition-all duration-300 cursor-pointer"
          onClick={() => navigate("/admin/withdrawals")}
        >
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

      {/* Quick Actions for Pending Transactions */}
      {pendingTransactions.length > 0 && (
        <Card className="glass-card-enhanced border-warning/30">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Quick Actions
            </CardTitle>
            <CardDescription>Approve or reject pending transactions directly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 border border-border/30 rounded-lg hover:bg-muted/20 transition-all duration-300"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={tx.type === "deposit" ? "default" : "secondary"}
                        className={tx.type === "deposit" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"}
                      >
                        {tx.type}
                      </Badge>
                      <span className="font-semibold">${tx.amount.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {tx.user_email} • {format(new Date(tx.created_at), "MMM dd, HH:mm")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleQuickApprove(tx)}
                      disabled={processingId === tx.id}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleQuickReject(tx)}
                      disabled={processingId === tx.id}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => navigate("/admin/deposits")}>
                View All Transactions
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
