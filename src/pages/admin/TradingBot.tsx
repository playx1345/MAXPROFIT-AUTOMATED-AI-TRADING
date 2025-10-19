import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Bot, TrendingUp, TrendingDown, Activity } from "lucide-react";

interface BotPerformance {
  id: string;
  investment_id: string;
  action: string;
  profit_loss: number;
  price: number;
  amount: number;
  notes: string | null;
  timestamp: string;
  investments: {
    profiles: {
      email: string;
      full_name: string | null;
    };
  };
}

interface Stats {
  totalTrades: number;
  totalProfit: number;
  winRate: number;
  avgProfit: number;
}

const AdminTradingBot = () => {
  const [performances, setPerformances] = useState<BotPerformance[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalTrades: 0,
    totalProfit: 0,
    winRate: 0,
    avgProfit: 0,
  });
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [selectedInvestment, setSelectedInvestment] = useState("");
  const [action, setAction] = useState("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [profitLoss, setProfitLoss] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch bot performances
      const { data: perfData, error: perfError } = await supabase
        .from("trading_bot_performance")
        .select(`
          *,
          investments!trading_bot_performance_investment_id_fkey(
            profiles!investments_user_id_fkey(email, full_name)
          )
        `)
        .order("timestamp", { ascending: false })
        .limit(50);

      if (perfError) throw perfError;
      setPerformances(perfData || []);

      // Calculate stats
      const totalTrades = perfData?.length || 0;
      const totalProfit = perfData?.reduce((sum, p) => sum + p.profit_loss, 0) || 0;
      const winningTrades = perfData?.filter((p) => p.profit_loss > 0).length || 0;
      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
      const avgProfit = totalTrades > 0 ? totalProfit / totalTrades : 0;

      setStats({
        totalTrades,
        totalProfit,
        winRate,
        avgProfit,
      });

      // Fetch active investments
      const { data: invData, error: invError } = await supabase
        .from("investments")
        .select(`
          id,
          amount_usdt,
          profiles!investments_user_id_fkey(email, full_name),
          investment_plans(name)
        `)
        .eq("status", "active");

      if (invError) throw invError;
      setInvestments(invData || []);
    } catch (error: any) {
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!selectedInvestment || !amount || !price || !profitLoss) {
        throw new Error("Please fill in all required fields");
      }

      const { error } = await supabase.from("trading_bot_performance").insert({
        investment_id: selectedInvestment,
        action,
        amount: parseFloat(amount),
        price: parseFloat(price),
        profit_loss: parseFloat(profitLoss),
        notes: notes || null,
      });

      if (error) throw error;

      // Update investment current value
      const investment = investments.find((inv) => inv.id === selectedInvestment);
      if (investment) {
        const newValue = investment.amount_usdt + parseFloat(profitLoss);
        await supabase
          .from("investments")
          .update({ current_value: newValue })
          .eq("id", selectedInvestment);
      }

      toast({
        title: "Performance recorded",
        description: "Trading bot performance has been logged",
      });

      // Reset form
      setSelectedInvestment("");
      setAmount("");
      setPrice("");
      setProfitLoss("");
      setNotes("");

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error recording performance",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading bot data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trading Bot Control</h1>
        <p className="text-muted-foreground">Monitor and manage AI trading bot performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTrades}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.totalProfit >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${stats.totalProfit.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Bot className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Profit</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgProfit.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle>Log Trading Activity</CardTitle>
          <CardDescription>Manually record trading bot performance</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="investment">Investment</Label>
                <Select value={selectedInvestment} onValueChange={setSelectedInvestment}>
                  <SelectTrigger id="investment">
                    <SelectValue placeholder="Select investment" />
                  </SelectTrigger>
                  <SelectContent>
                    {investments.map((inv) => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.profiles?.full_name || inv.profiles?.email} - $
                        {inv.amount_usdt.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="action">Action</Label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger id="action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profitLoss">Profit/Loss (USD)</Label>
                <Input
                  id="profitLoss"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={profitLoss}
                  onChange={(e) => setProfitLoss(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional trade information..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Recording..." : "Record Performance"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Performance History */}
      <Card>
        <CardHeader>
          <CardTitle>Trading History</CardTitle>
          <CardDescription>Recent bot trading activities</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Investor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Profit/Loss</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No trading activity recorded
                  </TableCell>
                </TableRow>
              ) : (
                performances.map((perf) => (
                  <TableRow key={perf.id}>
                    <TableCell className="font-medium">
                      {format(new Date(perf.timestamp), "MMM dd HH:mm")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {perf.investments?.profiles?.full_name ||
                        perf.investments?.profiles?.email ||
                        "N/A"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`uppercase font-semibold ${
                          perf.action === "buy" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {perf.action}
                      </span>
                    </TableCell>
                    <TableCell>{perf.amount}</TableCell>
                    <TableCell>${perf.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={`font-semibold ${
                          perf.profit_loss >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {perf.profit_loss >= 0 ? "+" : ""}${perf.profit_loss.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {perf.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTradingBot;
