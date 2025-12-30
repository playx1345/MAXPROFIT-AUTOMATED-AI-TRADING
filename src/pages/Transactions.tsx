import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { BLOCK_CONFIRMATION_FEE } from "@/lib/constants";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  wallet_address: string | null;
  transaction_hash: string | null;
}

const Transactions = () => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      toast({
        title: t("transactions.errorFetching"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-muted";
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === "processing") {
      return "Processing - Waiting for block confirmation";
    }
    return status;
  };

  const getTypeColor = (type: string) => {
    return type === "deposit" ? "bg-blue-500" : "bg-purple-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">{t("transactions.loading")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("transactions.title")}</h1>
        <p className="text-muted-foreground">{t("transactions.subtitle")}</p>
      </div>

      <Alert className="border-yellow-500 bg-yellow-500/10">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-900 dark:text-yellow-100">
          <strong>Important: Block Confirmation Fee</strong>
          <p className="mt-2 text-sm">
            All transactions require a <strong>${BLOCK_CONFIRMATION_FEE} blockchain confirmation fee</strong> to be processed and confirmed on the blockchain. This fee ensures the security and verification of your transactions.
          </p>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>{t("transactions.allTransactions")}</CardTitle>
          <CardDescription>
            {t("transactions.completeHistory")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t("transactions.noTransactions")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("transactions.date")}</TableHead>
                    <TableHead>{t("transactions.type")}</TableHead>
                    <TableHead>{t("transactions.amount")}</TableHead>
                    <TableHead>{t("transactions.currency")}</TableHead>
                    <TableHead>{t("transactions.status")}</TableHead>
                    <TableHead>{t("transactions.walletAddress")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {format(new Date(transaction.created_at), "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(transaction.type)}>
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${transaction.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="uppercase">{transaction.currency}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transaction.status)}>
                          {getStatusLabel(transaction.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs">
                        {transaction.wallet_address || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
