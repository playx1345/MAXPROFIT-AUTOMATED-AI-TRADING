import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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

// Define interfaces for type safety
interface Investment {
  id: string;
  amount_usdt: number;
  profiles: {
    email: string;
    full_name: string | null;
  };
  investment_plans: {
    name: string;
  };
}

interface BotPerformance {
  id: string; investment_id: string; action: string; profit_loss: number; price: number; amount: number; notes: string | null; timestamp: string;
  investments: { profiles: { email: string; full_name: string | null } };
}
interface Stats { totalTrades: number; totalProfit: number; winRate: number; avgProfit: number; }

const AdminTradingBot = () => {
  const [performances, setPerformances] = useState<BotPerformance[]>([]);
  const [stats, setStats] = useState<Stats>({ totalTrades: 0, totalProfit: 0, winRate: 0, avgProfit: 0 });
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const [selectedInvestment, setSelectedInvestment] = useState("");
  const [action, setAction] = useState("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [profitLoss, setProfitLoss] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data: perfData, error: perfError } = await supabase
        .from("trading_bot_performance")
        .select(`*, investments!trading_bot_performance_investment_id_fkey(profiles!investments_user_id_fkey(email, full_name))`)
        .order("timestamp", { ascending: false }).limit(50);
      if (perfError) throw perfError;
      setPerformances(perfData || []);
      const totalTrades = perfData?.length || 0;
      const totalProfit = perfData?.reduce((sum, p) => sum + p.profit_loss, 0) || 0;
      const winningTrades = perfData?.filter((p) => p.profit_loss > 0).length || 0;
      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
      const avgProfit = totalTrades > 0 ? totalProfit / totalTrades : 0;
      setStats({ totalTrades, totalProfit, winRate, avgProfit });
      const { data: invData, error: invError } = await supabase
        .from("investments").select(`id, amount_usdt, profiles!investments_user_id_fkey(email, full_name), investment_plans(name)`).eq("status", "active");
      if (invError) throw invError;
      setInvestments(invData || []);
    } catch (error: any) {
      toast({ title: t('admin.tradingBot.errorFetching'), description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!selectedInvestment || !amount || !price || !profitLoss) throw new Error(t('admin.tradingBot.fillRequired'));
      const { error } = await supabase.from("trading_bot_performance").insert({ investment_id: selectedInvestment, action, amount: parseFloat(amount), price: parseFloat(price), profit_loss: parseFloat(profitLoss), notes: notes || null });
      if (error) throw error;
      const investment = investments.find((inv) => inv.id === selectedInvestment);
      if (investment) {
        const newValue = investment.amount_usdt + parseFloat(profitLoss);
        await supabase.from("investments").update({ current_value: newValue }).eq("id", selectedInvestment);
      }
      toast({ title: t('admin.tradingBot.performanceRecorded'), description: t('admin.tradingBot.performanceRecordedDesc') });
      setSelectedInvestment(""); setAmount(""); setPrice(""); setProfitLoss(""); setNotes("");
      fetchData();
    } catch (error: any) {
      toast({ title: t('admin.tradingBot.errorRecording'), description: error.message, variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-pulse text-muted-foreground">{t('admin.tradingBot.loading')}</div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('admin.tradingBot.title')}</h1>
        <p className="text-muted-foreground">{t('admin.tradingBot.subtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">{t('admin.tradingBot.totalTrades')}</CardTitle><Activity className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalTrades}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">{t('admin.tradingBot.totalProfit')}</CardTitle><TrendingUp className="h-4 w-4 text-green-500" /></CardHeader>
          <CardContent><div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>${stats.totalProfit.toFixed(2)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">{t('admin.tradingBot.winRate')}</CardTitle><Bot className="h-4 w-4 text-primary" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">{t('admin.tradingBot.avgProfit')}</CardTitle><TrendingDown className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">${stats.avgProfit.toFixed(2)}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>{t('admin.tradingBot.logActivity')}</CardTitle><CardDescription>{t('admin.tradingBot.logActivityDesc')}</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="investment">{t('admin.tradingBot.investment')}</Label>
                <Select value={selectedInvestment} onValueChange={setSelectedInvestment}>
                  <SelectTrigger id="investment"><SelectValue placeholder={t('admin.tradingBot.selectInvestment')} /></SelectTrigger>
                  <SelectContent>{investments.map((inv) => (<SelectItem key={inv.id} value={inv.id}>{inv.profiles?.full_name || inv.profiles?.email} - ${inv.amount_usdt.toLocaleString()}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="action">{t('admin.tradingBot.action')}</Label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger id="action"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="buy">{t('admin.tradingBot.buy')}</SelectItem><SelectItem value="sell">{t('admin.tradingBot.sell')}</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="amount">{t('admin.common.amount')}</Label><Input id="amount" type="number" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required /></div>
              <div className="space-y-2"><Label htmlFor="price">{t('admin.tradingBot.price')}</Label><Input id="price" type="number" step="0.01" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} required /></div>
              <div className="space-y-2"><Label htmlFor="profitLoss">{t('admin.tradingBot.profitLossLabel')}</Label><Input id="profitLoss" type="number" step="0.01" placeholder="0.00" value={profitLoss} onChange={(e) => setProfitLoss(e.target.value)} required /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="notes">{t('admin.tradingBot.notesOptional')}</Label><Textarea id="notes" placeholder={t('admin.tradingBot.additionalInfo')} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            <Button type="submit" disabled={submitting} className="w-full">{submitting ? t('admin.tradingBot.recording') : t('admin.tradingBot.recordPerformance')}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t('admin.tradingBot.tradingHistory')}</CardTitle><CardDescription>{t('admin.tradingBot.tradingHistoryDesc')}</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.tradingBot.time')}</TableHead>
                <TableHead>{t('admin.tradingBot.investor')}</TableHead>
                <TableHead>{t('admin.tradingBot.action')}</TableHead>
                <TableHead>{t('admin.common.amount')}</TableHead>
                <TableHead>{t('admin.tradingBot.price')}</TableHead>
                <TableHead>{t('admin.tradingBot.profitLossLabel')}</TableHead>
                <TableHead>{t('admin.tradingBot.notes')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performances.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">{t('admin.tradingBot.noActivity')}</TableCell></TableRow>
              ) : (
                performances.map((perf) => (
                  <TableRow key={perf.id}>
                    <TableCell className="font-medium">{format(new Date(perf.timestamp), "MMM dd HH:mm")}</TableCell>
                    <TableCell className="text-sm">{perf.investments?.profiles?.full_name || perf.investments?.profiles?.email || "N/A"}</TableCell>
                    <TableCell><span className={`uppercase font-semibold ${perf.action === "buy" ? "text-green-600" : "text-red-600"}`}>{perf.action}</span></TableCell>
                    <TableCell>{perf.amount}</TableCell>
                    <TableCell>${perf.price.toLocaleString()}</TableCell>
                    <TableCell><span className={`font-semibold ${perf.profit_loss >= 0 ? "text-green-600" : "text-red-600"}`}>{perf.profit_loss >= 0 ? "+" : ""}${perf.profit_loss.toFixed(2)}</span></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{perf.notes || "-"}</TableCell>
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
