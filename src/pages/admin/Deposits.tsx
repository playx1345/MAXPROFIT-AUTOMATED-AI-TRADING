import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CheckCircle, XCircle, ExternalLink, Shield, AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBlockchainVerification } from "@/hooks/useBlockchainVerification";
import { BlockchainVerificationBadge } from "@/components/BlockchainVerificationBadge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Deposit {
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
  };
}

const AdminDeposits = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { verifying, result, verifyTransaction, clearResult } = useBlockchainVerification();

  useEffect(() => {
    fetchDeposits();
  }, []);

  // Verify transaction when dialog opens with a transaction hash
  useEffect(() => {
    if (detailsOpen && selectedDeposit?.transaction_hash) {
      verifyTransaction(
        selectedDeposit.transaction_hash,
        selectedDeposit.currency as "usdt" | "btc"
      );
    } else {
      clearResult();
    }
  }, [detailsOpen, selectedDeposit]);

  const fetchDeposits = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          profiles!transactions_user_id_fkey(email, full_name)
        `)
        .eq("type", "deposit")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDeposits(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching deposits",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedDeposit) return;
    setProcessing(true);

    try {
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      if (!adminUser) throw new Error("Not authenticated as admin");

      const { data, error } = await supabase.rpc("approve_deposit_atomic" as any, {
        p_transaction_id: selectedDeposit.id,
        p_admin_id: adminUser.id,
        p_admin_email: adminUser.email || "",
        p_admin_notes: adminNotes || null,
      });

      if (error) throw error;

      toast({
        title: "Deposit approved",
        description: "User balance has been updated",
      });

      fetchDeposits();
      setDetailsOpen(false);
      setAdminNotes("");
    } catch (error: any) {
      toast({
        title: "Error approving deposit",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDeposit) return;
    setProcessing(true);

    try {
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      if (!adminUser) throw new Error("Not authenticated as admin");

      const { data, error } = await supabase.rpc("reject_deposit_atomic" as any, {
        p_transaction_id: selectedDeposit.id,
        p_admin_id: adminUser.id,
        p_admin_email: adminUser.email || "",
        p_admin_notes: adminNotes || null,
      });

      if (error) throw error;

      toast({
        title: "Deposit rejected",
        description: "User has been notified",
      });

      fetchDeposits();
      setDetailsOpen(false);
      setAdminNotes("");
    } catch (error: any) {
      toast({
        title: "Error rejecting deposit",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyBlockchain = () => {
    if (selectedDeposit?.transaction_hash) {
      verifyTransaction(
        selectedDeposit.transaction_hash,
        selectedDeposit.currency as "usdt" | "btc"
      );
    }
  };

  const getBlockchainExplorerUrl = (deposit: Deposit) => {
    if (!deposit.transaction_hash) return null;
    if (deposit.currency === "usdt") {
      return `https://tronscan.org/#/transaction/${deposit.transaction_hash}`;
    }
    return `https://blockchair.com/bitcoin/transaction/${deposit.transaction_hash}`;
  };

  const getStatusColor = (status: string) => {
    if (status === "approved") return "bg-green-500";
    if (status === "pending") return "bg-yellow-500";
    if (status === "processing") return "bg-blue-500";
    return "bg-red-500";
  };

  const getStatusLabel = (status: string) => {
    if (status === "processing") {
      return "Processing - Waiting for block confirmation";
    }
    return status;
  };

  const isEditableStatus = (status: string) => {
    return ["pending", "processing"].includes(status);
  };

  const pendingDeposits = deposits.filter((d) => isEditableStatus(d.status));
  const completedDeposits = deposits.filter((d) => d.status === "approved");
  const rejectedDeposits = deposits.filter((d) => d.status === "rejected");

  const DepositTable = ({ data }: { data: Deposit[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Currency</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              No deposits found
            </TableCell>
          </TableRow>
        ) : (
          data.map((deposit) => (
            <TableRow key={deposit.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{deposit.profiles?.full_name || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">{deposit.profiles?.email}</p>
                </div>
              </TableCell>
              <TableCell className="font-semibold">
                ${deposit.amount.toLocaleString()}
              </TableCell>
              <TableCell className="uppercase">{deposit.currency}</TableCell>
              <TableCell>
                {format(new Date(deposit.created_at), "MMM dd, yyyy HH:mm")}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(deposit.status)}>
                  {getStatusLabel(deposit.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedDeposit(deposit);
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
        <div className="animate-pulse text-muted-foreground">Loading deposits...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deposit Management</h1>
          <p className="text-muted-foreground">Review and approve deposit requests</p>
        </div>
        <Badge variant="destructive" className="text-lg">
          {pendingDeposits.length} Pending
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Deposits</CardTitle>
          <CardDescription>Manage platform deposits</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                Pending ({pendingDeposits.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Approved ({completedDeposits.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedDeposits.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4">
              <DepositTable data={pendingDeposits} />
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              <DepositTable data={completedDeposits} />
            </TabsContent>

            <TabsContent value="rejected" className="mt-4">
              <DepositTable data={rejectedDeposits} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Deposit Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Deposit Details</DialogTitle>
            <DialogDescription>Review and process deposit request</DialogDescription>
          </DialogHeader>

          {selectedDeposit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">User</Label>
                  <p className="font-medium">{selectedDeposit.profiles?.full_name || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedDeposit.profiles?.email}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="font-bold text-2xl">
                    ${selectedDeposit.amount.toLocaleString()} {selectedDeposit.currency.toUpperCase()}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Wallet Address</Label>
                  <p className="font-mono text-xs break-all">
                    {selectedDeposit.wallet_address || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Transaction Hash</Label>
                  {selectedDeposit.transaction_hash ? (
                    <div className="space-y-1">
                      <p className="font-mono text-xs break-all">
                        {selectedDeposit.transaction_hash}
                      </p>
                      <a
                        href={getBlockchainExplorerUrl(selectedDeposit) || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-xs flex items-center gap-1"
                      >
                        View on blockchain <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not provided</p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Submitted</Label>
                  <p className="font-medium">
                    {format(new Date(selectedDeposit.created_at), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(selectedDeposit.status)}>
                    {getStatusLabel(selectedDeposit.status)}
                  </Badge>
                </div>
              </div>

              {/* Blockchain Verification Section */}
              {selectedDeposit.transaction_hash && (
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <Label className="font-semibold">Blockchain Verification</Label>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleVerifyBlockchain}
                      disabled={verifying}
                    >
                      {verifying ? "Verifying..." : "Refresh"}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <BlockchainVerificationBadge verifying={verifying} result={result} showDetails />
                  </div>

                  {result && result.verified && (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <Label className="text-xs text-muted-foreground">Blockchain Amount</Label>
                        <p className="font-medium">
                          {result.amount !== null ? result.amount.toLocaleString() : "N/A"} {selectedDeposit.currency.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Confirmations</Label>
                        <p className="font-medium">{result.confirmations}</p>
                      </div>
                      {result.from_address && (
                        <div className="col-span-2">
                          <Label className="text-xs text-muted-foreground">From Address</Label>
                          <p className="font-mono text-xs break-all">{result.from_address}</p>
                        </div>
                      )}
                      {result.timestamp && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Transaction Time</Label>
                          <p className="font-medium">
                            {format(new Date(result.timestamp), "MMM dd, yyyy HH:mm")}
                          </p>
                        </div>
                      )}
                      {result.block_number && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Block Number</Label>
                          <p className="font-medium">{result.block_number.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Amount mismatch warning */}
                  {result && result.verified && result.amount !== null && 
                   Math.abs(result.amount - selectedDeposit.amount) > 0.01 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Amount Mismatch!</strong> User claimed ${selectedDeposit.amount.toLocaleString()} 
                        but blockchain shows {result.amount.toLocaleString()} {selectedDeposit.currency.toUpperCase()}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {!selectedDeposit.transaction_hash && selectedDeposit.status === "pending" && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No transaction hash provided. Consider requesting this from the user before approval.
                  </AlertDescription>
                </Alert>
              )}

              {isEditableStatus(selectedDeposit.status) && (
                <div className="border-t pt-4 space-y-3">
                  <div>
                    <Label>Admin Notes</Label>
                    <Textarea
                      placeholder="Add notes about this deposit..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={handleApprove}
                      disabled={processing}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve & Credit Balance
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

export default AdminDeposits;
