import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  wallet_address: string | null;
  transaction_hash: string | null;
  created_at: string;
  profiles: {
    email: string;
    full_name: string | null;
    balance_usdt: number;
  };
}

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [txHash, setTxHash] = useState("");
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          profiles!transactions_user_id_fkey(email, full_name, balance_usdt)
        `)
        .eq("type", "withdrawal")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching withdrawals",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedWithdrawal) return;

    // Check if user has sufficient balance
    if (selectedWithdrawal.profiles.balance_usdt < selectedWithdrawal.amount) {
      toast({
        title: "Insufficient balance",
        description: "User doesn't have enough balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      // Get admin user info
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      if (!adminUser) throw new Error("Not authenticated as admin");

      // Use atomic function to approve withdrawal and debit balance
      const { data, error } = await supabase.rpc("approve_withdrawal_atomic", {
        p_transaction_id: selectedWithdrawal.id,
        p_admin_id: adminUser.id,
        p_admin_email: adminUser.email || "",
        p_transaction_hash: txHash || null,
        p_admin_notes: adminNotes || null,
      });

      if (error) throw error;

      toast({
        title: "Withdrawal approved",
        description: "Balance has been deducted and transaction marked complete",
      });

      fetchWithdrawals();
      setDetailsOpen(false);
      setAdminNotes("");
      setTxHash("");
    } catch (error: any) {
      toast({
        title: "Error approving withdrawal",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal) return;
    setProcessing(true);

    try {
      // Get admin user info
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      if (!adminUser) throw new Error("Not authenticated as admin");

      // Use atomic function to reject withdrawal
      const { data, error } = await supabase.rpc("reject_withdrawal_atomic", {
        p_transaction_id: selectedWithdrawal.id,
        p_admin_id: adminUser.id,
        p_admin_email: adminUser.email || "",
        p_admin_notes: adminNotes || null,
      });

      if (error) throw error;

      toast({
        title: "Withdrawal rejected",
        description: "User has been notified",
      });

      fetchWithdrawals();
      setDetailsOpen(false);
      setAdminNotes("");
    } catch (error: any) {
      toast({
        title: "Error rejecting withdrawal",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending");
  const completedWithdrawals = withdrawals.filter((w) => w.status === "completed");
  const rejectedWithdrawals = withdrawals.filter((w) => w.status === "rejected");

  const WithdrawalTable = ({ data }: { data: Withdrawal[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Currency</TableHead>
          <TableHead>Wallet</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground">
              No withdrawals found
            </TableCell>
          </TableRow>
        ) : (
          data.map((withdrawal) => (
            <TableRow key={withdrawal.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{withdrawal.profiles?.full_name || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">{withdrawal.profiles?.email}</p>
                </div>
              </TableCell>
              <TableCell className="font-semibold">
                ${withdrawal.amount.toLocaleString()}
              </TableCell>
              <TableCell className="uppercase">{withdrawal.currency}</TableCell>
              <TableCell className="font-mono text-xs max-w-[150px] truncate">
                {withdrawal.wallet_address}
              </TableCell>
              <TableCell>
                {format(new Date(withdrawal.created_at), "MMM dd, yyyy HH:mm")}
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    withdrawal.status === "completed"
                      ? "bg-green-500"
                      : withdrawal.status === "pending"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }
                >
                  {withdrawal.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedWithdrawal(withdrawal);
                    setDetailsOpen(true);
                  }}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading withdrawals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Withdrawal Management</h1>
          <p className="text-muted-foreground">Review and process withdrawal requests</p>
        </div>
        <Badge variant="destructive" className="text-lg">
          {pendingWithdrawals.length} Pending
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Withdrawals</CardTitle>
          <CardDescription>Manage platform withdrawals</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                Pending ({pendingWithdrawals.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedWithdrawals.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedWithdrawals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4">
              <WithdrawalTable data={pendingWithdrawals} />
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              <WithdrawalTable data={completedWithdrawals} />
            </TabsContent>

            <TabsContent value="rejected" className="mt-4">
              <WithdrawalTable data={rejectedWithdrawals} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Withdrawal Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Withdrawal Details</DialogTitle>
            <DialogDescription>Review and process withdrawal request</DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">User</Label>
                  <p className="font-medium">{selectedWithdrawal.profiles?.full_name || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedWithdrawal.profiles?.email}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">User Balance</Label>
                  <p className="font-semibold text-lg">
                    ${selectedWithdrawal.profiles?.balance_usdt.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Withdrawal Amount</Label>
                  <p className="font-bold text-2xl">
                    ${selectedWithdrawal.amount.toLocaleString()} {selectedWithdrawal.currency.toUpperCase()}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Destination Wallet</Label>
                  <p className="font-mono text-xs break-all">
                    {selectedWithdrawal.wallet_address}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Requested</Label>
                  <p className="font-medium">
                    {format(new Date(selectedWithdrawal.created_at), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge
                    className={
                      selectedWithdrawal.status === "completed"
                        ? "bg-green-500"
                        : selectedWithdrawal.status === "pending"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }
                  >
                    {selectedWithdrawal.status}
                  </Badge>
                </div>
              </div>

              {selectedWithdrawal.profiles?.balance_usdt < selectedWithdrawal.amount && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <p className="text-sm text-destructive font-medium">
                    Warning: User has insufficient balance for this withdrawal!
                  </p>
                </div>
              )}

              {selectedWithdrawal.status === "pending" && (
                <div className="border-t pt-4 space-y-3">
                  <div>
                    <Label>Transaction Hash (After sending)</Label>
                    <Input
                      placeholder="Enter blockchain transaction hash..."
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Admin Notes</Label>
                    <Textarea
                      placeholder="Add notes about this withdrawal..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={handleApprove}
                      disabled={processing || selectedWithdrawal.profiles?.balance_usdt < selectedWithdrawal.amount}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve & Process
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={handleReject}
                      disabled={processing}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWithdrawals;
