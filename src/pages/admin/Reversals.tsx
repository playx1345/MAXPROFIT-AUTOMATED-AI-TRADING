import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  RotateCcw, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  DollarSign
} from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface ReversalLog {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  target_type: string;
  target_id: string | null;
  target_email: string | null;
  details: Json;
  created_at: string;
}

type ReversalType = 'all' | 'reverse_deposit' | 'reverse_withdrawal' | 'reopen_deposit' | 'reopen_withdrawal';

const reversalActions = [
  'reverse_deposit',
  'reverse_withdrawal', 
  'reopen_deposit',
  'reopen_withdrawal'
];

const actionConfig: Record<string, { label: string; icon: React.ReactNode; color: string; description: string }> = {
  reverse_deposit: { 
    label: "Deposit Reversed", 
    icon: <ArrowDownLeft className="h-4 w-4" />, 
    color: "bg-destructive",
    description: "Approved deposit was reversed (funds deducted)"
  },
  reverse_withdrawal: { 
    label: "Withdrawal Reversed", 
    icon: <ArrowUpRight className="h-4 w-4" />, 
    color: "bg-amber-500",
    description: "Approved withdrawal was reversed (funds refunded)"
  },
  reopen_deposit: { 
    label: "Deposit Reopened", 
    icon: <RefreshCw className="h-4 w-4" />, 
    color: "bg-emerald-500",
    description: "Rejected deposit was reopened and approved"
  },
  reopen_withdrawal: { 
    label: "Withdrawal Reopened", 
    icon: <RefreshCw className="h-4 w-4" />, 
    color: "bg-blue-500",
    description: "Rejected withdrawal was reopened and approved"
  },
};

const AdminReversals = () => {
  const [logs, setLogs] = useState<ReversalLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ReversalLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<ReversalType>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchReversalLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, filterType]);

  const fetchReversalLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_activity_logs")
        .select("*")
        .in("action", reversalActions)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching reversal logs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(log => log.action === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.admin_email.toLowerCase().includes(term) ||
        log.target_email?.toLowerCase().includes(term) ||
        log.target_id?.toLowerCase().includes(term) ||
        JSON.stringify(log.details).toLowerCase().includes(term)
      );
    }

    setFilteredLogs(filtered);
  };

  const getActionDisplay = (action: string) => {
    return actionConfig[action] || { 
      label: action.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()), 
      icon: <RotateCcw className="h-4 w-4" />, 
      color: "bg-muted",
      description: "Transaction status was modified"
    };
  };

  const parseDetails = (details: Json): Record<string, any> => {
    if (typeof details === 'object' && details !== null && !Array.isArray(details)) {
      return details as Record<string, any>;
    }
    return {};
  };

  const formatAmount = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return "-";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate statistics
  const stats = {
    total: logs.length,
    depositReversals: logs.filter(l => l.action === 'reverse_deposit').length,
    withdrawalReversals: logs.filter(l => l.action === 'reverse_withdrawal').length,
    depositReopens: logs.filter(l => l.action === 'reopen_deposit').length,
    withdrawalReopens: logs.filter(l => l.action === 'reopen_withdrawal').length,
    totalAmount: logs.reduce((sum, log) => {
      const details = parseDetails(log.details);
      return sum + (Number(details.amount) || 0);
    }, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading reversal history...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display flex items-center gap-2">
            <RotateCcw className="h-8 w-8 text-primary" />
            Reversal History
          </h1>
          <p className="text-muted-foreground">Track all transaction reversals and reopens</p>
        </div>
        <Badge variant="secondary" className="text-lg w-fit">
          {filteredLogs.length} Reversals
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="glass-card border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <RotateCcw className="h-4 w-4" />
              Total
            </div>
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <TrendingDown className="h-4 w-4 text-destructive" />
              Deposit Rev.
            </div>
            <p className="text-2xl font-bold text-destructive">{stats.depositReversals}</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              Withdrawal Rev.
            </div>
            <p className="text-2xl font-bold text-amber-500">{stats.withdrawalReversals}</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <RefreshCw className="h-4 w-4 text-emerald-500" />
              Deposit Reopen
            </div>
            <p className="text-2xl font-bold text-emerald-500">{stats.depositReopens}</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <RefreshCw className="h-4 w-4 text-blue-500" />
              Withdrawal Reopen
            </div>
            <p className="text-2xl font-bold text-blue-500">{stats.withdrawalReopens}</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <DollarSign className="h-4 w-4" />
              Total Amount
            </div>
            <p className="text-2xl font-bold text-gradient-premium">{formatAmount(stats.totalAmount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by admin, user, or transaction details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as ReversalType)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="reverse_deposit">Deposit Reversals</SelectItem>
                <SelectItem value="reverse_withdrawal">Withdrawal Reversals</SelectItem>
                <SelectItem value="reopen_deposit">Deposit Reopens</SelectItem>
                <SelectItem value="reopen_withdrawal">Withdrawal Reopens</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="glass-card-enhanced border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" />
            Reversal Log
          </CardTitle>
          <CardDescription>Complete history of all transaction reversals and reopens</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <RotateCcw className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No reversals found</p>
              <p className="text-sm">Transaction reversals will appear here when admins reverse or reopen transactions.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Type</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>New Balance</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date & Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const actionDisplay = getActionDisplay(log.action);
                    const details = parseDetails(log.details);
                    
                    return (
                      <TableRow key={log.id} className="group hover:bg-accent/5">
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={`${actionDisplay.color} flex items-center gap-1 w-fit`}>
                              {actionDisplay.icon}
                              {actionDisplay.label}
                            </Badge>
                            <p className="text-xs text-muted-foreground max-w-[200px]">
                              {actionDisplay.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{log.admin_email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">
                            {log.target_email || details.user_id?.slice(0, 8) + '...' || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono font-semibold text-primary">
                            {formatAmount(details.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-emerald-500">
                            {formatAmount(details.new_balance)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground max-w-[200px] truncate block">
                            {details.reason || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {log.target_id?.slice(0, 8)}...
                          </code>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {format(new Date(log.created_at), "MMM dd, yyyy HH:mm")}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReversals;