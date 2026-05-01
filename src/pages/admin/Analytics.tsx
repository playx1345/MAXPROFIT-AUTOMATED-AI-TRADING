import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent,
} from "@/components/ui/chart";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, ArrowUpDown, Percent, Activity, Loader2,
} from "lucide-react";
import {
  type TimeRange, type Transaction, groupTransactionsByDate, calculateStatusBreakdown,
  calculateCurrencyBreakdown, calculateKPIs, getDateRange,
} from "@/lib/analytics-utils";

const chartConfig = {
  deposits: { label: "Deposits", color: "hsl(var(--chart-2))" },
  withdrawals: { label: "Withdrawals", color: "hsl(var(--chart-5))" },
  net: { label: "Net Flow", color: "hsl(var(--chart-1))" },
};

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const { t } = useTranslation();
  
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["analytics-transactions", timeRange],
    queryFn: async () => {
      const { start } = getDateRange(timeRange);
      const { data, error } = await supabase
        .from("transactions")
        .select("id, type, amount, status, currency, created_at")
        .gte("created_at", start.toISOString())
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as Transaction[];
    },
  });
  
  const chartData = useMemo(() => groupTransactionsByDate(transactions, timeRange), [transactions, timeRange]);
  const statusData = useMemo(() => calculateStatusBreakdown(transactions), [transactions]);
  const currencyData = useMemo(() => calculateCurrencyBreakdown(transactions), [transactions]);
  const kpis = useMemo(() => calculateKPIs(transactions), [transactions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.analytics.title')}</h1>
          <p className="text-muted-foreground">{t('admin.analytics.subtitle')}</p>
        </div>
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
          <TabsList>
            <TabsTrigger value="7d">{t('admin.analytics.7d')}</TabsTrigger>
            <TabsTrigger value="30d">{t('admin.analytics.30d')}</TabsTrigger>
            <TabsTrigger value="90d">{t('admin.analytics.90d')}</TabsTrigger>
            <TabsTrigger value="1y">{t('admin.analytics.1y')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.analytics.totalVolume')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpis.totalVolume.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{t('admin.analytics.transactionsCount', { count: kpis.totalTransactions })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.analytics.netFlow')}</CardTitle>
            {kpis.netFlow >= 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpis.netFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {kpis.netFlow >= 0 ? '+' : ''}{kpis.netFlow.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{t('admin.analytics.depositsMinusWithdrawals')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.analytics.avgTransaction')}</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpis.avgTransactionSize.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{t('admin.analytics.perApproved')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.analytics.approvalRate')}</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.approvalRate}%</div>
            <p className="text-xs text-muted-foreground">{t('admin.analytics.ofTotal', { approved: kpis.approvedTransactions, total: kpis.totalTransactions })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t('admin.analytics.volumeOverTime')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
              <YAxis className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area type="monotone" dataKey="deposits" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorDeposits)" />
              <Area type="monotone" dataKey="withdrawals" stroke="hsl(var(--chart-5))" fillOpacity={1} fill="url(#colorWithdrawals)" />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{t('admin.analytics.transactionStatus')}</CardTitle></CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">{t('admin.analytics.noTransactionData')}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t('admin.analytics.currencyDistribution')}</CardTitle></CardHeader>
          <CardContent>
            {currencyData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={currencyData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                  <YAxis dataKey="currency" type="category" width={60} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="deposits" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="withdrawals" fill="hsl(var(--chart-5))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">{t('admin.analytics.noCurrencyData')}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2"><CardTitle className="text-lg">{t('admin.analytics.totalDeposits')}</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-green-500">${kpis.totalDeposits.toLocaleString()}</div></CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2"><CardTitle className="text-lg">{t('admin.analytics.totalWithdrawals')}</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-red-500">${kpis.totalWithdrawals.toLocaleString()}</div></CardContent>
        </Card>
      </div>
    </div>
  );
}
