import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpDown,
  Percent,
  Activity,
  Loader2,
} from "lucide-react";
import {
  type TimeRange,
  type Transaction,
  groupTransactionsByDate,
  calculateStatusBreakdown,
  calculateCurrencyBreakdown,
  calculateKPIs,
  getDateRange,
} from "@/lib/analytics-utils";

const chartConfig = {
  deposits: {
    label: "Deposits",
    color: "hsl(var(--chart-2))",
  },
  withdrawals: {
    label: "Withdrawals",
    color: "hsl(var(--chart-5))",
  },
  net: {
    label: "Net Flow",
    color: "hsl(var(--chart-1))",
  },
};

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  
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
  
  const chartData = useMemo(() => 
    groupTransactionsByDate(transactions, timeRange),
    [transactions, timeRange]
  );
  
  const statusData = useMemo(() => 
    calculateStatusBreakdown(transactions),
    [transactions]
  );
  
  const currencyData = useMemo(() => 
    calculateCurrencyBreakdown(transactions),
    [transactions]
  );
  
  const kpis = useMemo(() => 
    calculateKPIs(transactions),
    [transactions]
  );

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
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Transaction trends and platform metrics
          </p>
        </div>
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
          <TabsList>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
            <TabsTrigger value="1y">1 Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${kpis.totalVolume.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {kpis.totalTransactions} transactions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
            {kpis.netFlow >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpis.netFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {kpis.netFlow >= 0 ? '+' : ''}{kpis.netFlow.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Deposits - Withdrawals
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${kpis.avgTransactionSize.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Per approved transaction
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis.approvalRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {kpis.approvedTransactions} of {kpis.totalTransactions} approved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Transaction Volume Over Time
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
              <XAxis 
                dataKey="date" 
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="deposits"
                stroke="hsl(var(--chart-2))"
                fillOpacity={1}
                fill="url(#colorDeposits)"
              />
              <Area
                type="monotone"
                dataKey="withdrawals"
                stroke="hsl(var(--chart-5))"
                fillOpacity={1}
                fill="url(#colorWithdrawals)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No transaction data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Currency Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Currency Distribution</CardTitle>
          </CardHeader>
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
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No currency data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deposits vs Withdrawals Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              ${kpis.totalDeposits.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              ${kpis.totalWithdrawals.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
