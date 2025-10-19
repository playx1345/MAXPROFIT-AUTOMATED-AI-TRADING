import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, ArrowDownLeft, ArrowUpRight } from "lucide-react";
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
      }
    };

    fetchData();
  }, [toast]);

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
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your investment dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.balance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">USDT</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalInvested.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Across all investments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit/Loss</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${stats.totalProfit.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalProfit >= 0 ? "+" : ""}
              {stats.totalInvested > 0 ? ((stats.totalProfit / stats.totalInvested) * 100).toFixed(2) : "0.00"}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeInvestments}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <div className="font-medium capitalize">{tx.type.replace("_", " ")}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${Number(tx.amount).toFixed(2)}</div>
                    <div className={`text-xs ${
                      tx.status === "completed" ? "text-green-600" :
                      tx.status === "pending" ? "text-yellow-600" :
                      tx.status === "rejected" ? "text-red-600" : ""
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