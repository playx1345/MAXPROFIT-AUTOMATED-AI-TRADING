import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Search, ArrowDownLeft, ArrowUpRight, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  profiles: { email: string; full_name: string | null };
}

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => { fetchTransactions(); }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase.from("transactions").select(`*, profiles!transactions_user_id_fkey(email, full_name)`).order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      toast({ title: t('admin.transactions.errorFetching'), description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = !searchTerm || tx.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || tx.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || tx.amount.toString().includes(searchTerm);
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    totalDeposits: transactions.filter(tx => tx.type === "deposit" && tx.status === "approved").reduce((sum, tx) => sum + tx.amount, 0),
    totalWithdrawals: transactions.filter(tx => tx.type === "withdrawal" && tx.status === "approved").reduce((sum, tx) => sum + tx.amount, 0),
    pendingCount: transactions.filter(tx => tx.status === "pending").length,
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-pulse text-muted-foreground">{t('admin.transactions.loading')}</div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('admin.transactions.title')}</h1>
        <p className="text-muted-foreground">{t('admin.transactions.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{t('admin.transactions.totalApprovedDeposits')}</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">${stats.totalDeposits.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{t('admin.transactions.totalApprovedWithdrawals')}</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-600">${stats.totalWithdrawals.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{t('admin.transactions.pendingTransactions')}</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.transactions.transactionHistory')}</CardTitle>
          <CardDescription>{t('admin.transactions.transactionHistoryDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('admin.transactions.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder={t('admin.transactions.type')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.transactions.allTypes')}</SelectItem>
                <SelectItem value="deposit">{t('admin.transactions.depositsLabel')}</SelectItem>
                <SelectItem value="withdrawal">{t('admin.transactions.withdrawalsLabel')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder={t('admin.common.status')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.transactions.allStatus')}</SelectItem>
                <SelectItem value="pending">{t('admin.common.pending')}</SelectItem>
                <SelectItem value="approved">{t('admin.common.approved')}</SelectItem>
                <SelectItem value="rejected">{t('admin.common.rejected')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.transactions.type')}</TableHead>
                <TableHead>{t('admin.common.user')}</TableHead>
                <TableHead>{t('admin.common.amount')}</TableHead>
                <TableHead>{t('admin.common.currency')}</TableHead>
                <TableHead>{t('admin.common.status')}</TableHead>
                <TableHead>{t('admin.common.date')}</TableHead>
                <TableHead>{t('admin.common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">{t('admin.transactions.noTransactions')}</TableCell></TableRow>
              ) : (
                filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {tx.type === "deposit" ? <ArrowDownLeft className="h-4 w-4 text-green-500" /> : <ArrowUpRight className="h-4 w-4 text-red-500" />}
                        <span className="capitalize">{tx.type}</span>
                      </div>
                    </TableCell>
                    <TableCell><div><p className="font-medium">{tx.profiles?.full_name || "N/A"}</p><p className="text-xs text-muted-foreground">{tx.profiles?.email}</p></div></TableCell>
                    <TableCell className="font-semibold">${tx.amount.toLocaleString()}</TableCell>
                    <TableCell className="uppercase">{tx.currency}</TableCell>
                    <TableCell><Badge className={tx.status === "approved" ? "bg-green-500" : tx.status === "pending" ? "bg-yellow-500" : "bg-red-500"}>{tx.status}</Badge></TableCell>
                    <TableCell>{format(new Date(tx.created_at), "MMM dd, yyyy HH:mm")}</TableCell>
                    <TableCell><Button size="sm" variant="ghost" onClick={() => navigate(tx.type === "deposit" ? "/admin/deposits" : "/admin/withdrawals")}>{t('admin.common.view')}</Button></TableCell>
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

export default AdminTransactions;
