import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Search, Clock, Users, Shield } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WITHDRAWAL_FEE_PERCENTAGE, CONFIRMATION_FEE_WALLET_BTC } from "@/lib/constants";
import { useBlockchainVerification } from "@/hooks/useBlockchainVerification";
import { BlockchainVerificationBadge } from "@/components/BlockchainVerificationBadge";
import { useWithdrawalApprovals } from "@/hooks/useWithdrawalApprovals";
import { WithdrawalApprovalBadge } from "@/components/admin/WithdrawalApprovalBadge";

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  wallet_address: string | null;
  transaction_hash: string | null;
  admin_notes: string | null;
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
  const [confirmationFeeTxHash, setConfirmationFeeTxHash] = useState("");
  const [processing, setProcessing] = useState(false);
  const [verifyingFee, setVerifyingFee] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [reverseReason, setReverseReason] = useState("");
  const [showReverseConfirm, setShowReverseConfirm] = useState(false);
  const [showReopenConfirm, setShowReopenConfirm] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState<string>("");
  const [currentAdminEmail, setCurrentAdminEmail] = useState<string>("");
  const { toast } = useToast();
  
  const {
    approvals,
    settings,
    fetchApprovals,
    addApproval,
    removeApproval,
    clearApprovals,
    getApprovalStatus,
  } = useWithdrawalApprovals();

  useEffect(() => {
    fetchWithdrawals();
    fetchCurrentAdmin();
  }, []);

  useEffect(() => {
    // Fetch approvals when withdrawals change
    const pendingIds = withdrawals
      .filter((w) => w.status === "pending")
      .map((w) => w.id);
    fetchApprovals(pendingIds);
  }, [withdrawals, fetchApprovals]);

  const fetchCurrentAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentAdminId(user.id);
      setCurrentAdminEmail(user.email || "");
    }
  };

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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error fetching withdrawals",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter withdrawals based on search term
  const filterWithdrawals = (items: Withdrawal[]) => {
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(w => 
      w.profiles?.email?.toLowerCase().includes(term) ||
      w.profiles?.full_name?.toLowerCase().includes(term) ||
      w.wallet_address?.toLowerCase().includes(term) ||
      w.amount.toString().includes(term)
    );
  };

  // Toggle selection for bulk actions
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = (items: Withdrawal[]) => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(w => w.id));
    }
  };

  // Bulk approve selected withdrawals
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setBulkProcessing(true);

    try {
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      if (!adminUser) throw new Error("Not authenticated as admin");

      let successCount = 0;
      let failCount = 0;

      for (const id of selectedIds) {
        try {
          const { error } = await supabase.rpc("approve_withdrawal_atomic", {
            p_transaction_id: id,
            p_admin_id: adminUser.id,
            p_admin_email: adminUser.email || "",
            p_transaction_hash: null,
            p_admin_notes: "Bulk approved by admin",
          });
          if (error) throw error;
          successCount++;
        } catch {
          failCount++;
        }
      }

      toast({
        title: "Bulk approval complete",
        description: `${successCount} approved, ${failCount} failed`,
      });

      setSelectedIds([]);
      fetchWithdrawals();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Bulk approval failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setBulkProcessing(false);
    }
  };

  // Bulk reject selected withdrawals
  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return;
    setBulkProcessing(true);

    try {
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      if (!adminUser) throw new Error("Not authenticated as admin");

      let successCount = 0;
      let failCount = 0;

      for (const id of selectedIds) {
        try {
          const { error } = await supabase.rpc("reject_withdrawal_atomic", {
            p_transaction_id: id,
            p_admin_id: adminUser.id,
            p_admin_email: adminUser.email || "",
            p_admin_notes: "Bulk rejected by admin",
          });
          if (error) throw error;
          successCount++;
        } catch {
          failCount++;
        }
      }

      toast({
        title: "Bulk rejection complete",
        description: `${successCount} rejected, ${failCount} failed`,
      });

      setSelectedIds([]);
      fetchWithdrawals();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Bulk rejection failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setBulkProcessing(false);
    }
  };

  // Handle adding approval for large withdrawals
  const handleAddApproval = async () => {
    if (!selectedWithdrawal || !currentAdminId) return;
    setProcessing(true);

    try {
      const success = await addApproval(
        selectedWithdrawal.id,
        currentAdminId,
        currentAdminEmail,
        adminNotes || undefined
      );

      if (success) {
        // Refresh approvals
        const pendingIds = withdrawals
          .filter((w) => w.status === "pending")
          .map((w) => w.id);
        await fetchApprovals(pendingIds);
      }
    } finally {
      setProcessing(false);
    }
  };

  // Handle removing own approval
  const handleRemoveApproval = async () => {
    if (!selectedWithdrawal || !currentAdminId) return;
    setProcessing(true);

    try {
      const success = await removeApproval(selectedWithdrawal.id, currentAdminId);

      if (success) {
        const pendingIds = withdrawals
          .filter((w) => w.status === "pending")
          .map((w) => w.id);
        await fetchApprovals(pendingIds);
      }
    } finally {
      setProcessing(false);
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

    // Check multi-admin approval requirement
    const approvalStatus = getApprovalStatus(selectedWithdrawal.id, selectedWithdrawal.amount);
    if (!approvalStatus.canFinalize) {
      toast({
        title: "More Approvals Required",
        description: `Large withdrawals (>${settings.threshold.toLocaleString()}) need ${approvalStatus.requiredCount} admin approvals. Currently has ${approvalStatus.currentCount}.`,
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

      // Clear approvals for this transaction (cleanup)
      await clearApprovals(selectedWithdrawal.id);

      toast({
        title: "Withdrawal approved",
        description: "Balance has been deducted and transaction marked complete",
      });

      fetchWithdrawals();
      setDetailsOpen(false);
      setAdminNotes("");
      setTxHash("");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error approving withdrawal",
        description: errorMessage,
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error rejecting withdrawal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyConfirmationFee = async () => {
    if (!selectedWithdrawal || !confirmationFeeTxHash.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter the confirmation fee transaction hash",
        variant: "destructive",
      });
      return;
    }

    setVerifyingFee(true);
    try {
      // Call the edge function to verify confirmation fee
      const { data, error } = await supabase.functions.invoke('verify-withdrawal-confirmation-fee', {
        body: {
          transaction_id: selectedWithdrawal.id,
          confirmation_fee_tx_hash: confirmationFeeTxHash.trim(),
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to verify confirmation fee');
      }

      toast({
        title: "Confirmation Fee Verified",
        description: `${data.verification_details.amount_btc} BTC verified with ${data.verification_details.confirmations} confirmations`,
      });

      // Refresh withdrawals to show updated status
      fetchWithdrawals();
      setConfirmationFeeTxHash("");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setVerifyingFee(false);
    }
  };

  const handleReverseWithdrawal = async () => {
    if (!selectedWithdrawal) return;
    setProcessing(true);

    try {
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      if (!adminUser) throw new Error("Not authenticated as admin");

      const { error } = await supabase.rpc("reverse_approved_withdrawal" as any, {
        p_transaction_id: selectedWithdrawal.id,
        p_admin_id: adminUser.id,
        p_admin_email: adminUser.email || "",
        p_reason: reverseReason || null,
      });

      if (error) throw error;

      toast({
        title: "Withdrawal reversed",
        description: "Amount refunded to user balance and withdrawal marked as rejected",
      });

      fetchWithdrawals();
      setDetailsOpen(false);
      setReverseReason("");
      setShowReverseConfirm(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error reversing withdrawal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReopenWithdrawal = async () => {
    if (!selectedWithdrawal) return;
    setProcessing(true);

    try {
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      if (!adminUser) throw new Error("Not authenticated as admin");

      const { error } = await supabase.rpc("reopen_rejected_withdrawal" as any, {
        p_transaction_id: selectedWithdrawal.id,
        p_admin_id: adminUser.id,
        p_admin_email: adminUser.email || "",
        p_reason: reverseReason || null,
      });

      if (error) throw error;

      toast({
        title: "Withdrawal re-approved",
        description: "Amount deducted from user balance and withdrawal marked as approved",
      });

      fetchWithdrawals();
      setDetailsOpen(false);
      setReverseReason("");
      setShowReopenConfirm(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error re-approving withdrawal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const pendingWithdrawals = filterWithdrawals(withdrawals.filter((w) => w.status === "pending"));
  const completedWithdrawals = filterWithdrawals(withdrawals.filter((w) => w.status === "completed" || w.status === "approved"));
  const rejectedWithdrawals = filterWithdrawals(withdrawals.filter((w) => w.status === "rejected"));

  const WithdrawalTableRow = ({ withdrawal }: { withdrawal: Withdrawal }) => {
    // Check if fee has been submitted (stored in admin_notes)
    const hasFeeSubmitted = withdrawal.admin_notes?.toLowerCase().includes('fee hash:') || 
                            withdrawal.admin_notes?.toLowerCase().includes('fee payment hash:');

    // Determine display status - show "Processing" for fee-paid pending withdrawals
    const displayStatus = withdrawal.status === 'pending' && hasFeeSubmitted 
      ? 'processing' 
      : withdrawal.status;

    // Get approval status for this withdrawal
    const approvalStatus = getApprovalStatus(withdrawal.id, withdrawal.amount);
    const txApprovals = approvals[withdrawal.id] || [];
    
    return (
      <TableRow>
        <TableCell>
          <div>
            <p className="font-medium">{withdrawal.profiles?.full_name || "N/A"}</p>
            <p className="text-xs text-muted-foreground">{withdrawal.profiles?.email}</p>
          </div>
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <span className="font-semibold">${withdrawal.amount.toLocaleString()}</span>
            {approvalStatus.isLarge && withdrawal.status === "pending" && (
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                  <Shield className="h-3 w-3 mr-1" />
                  Large
                </Badge>
              </div>
            )}
          </div>
        </TableCell>
        <TableCell className="uppercase">{withdrawal.currency}</TableCell>
        <TableCell className="font-mono text-xs max-w-[150px] truncate">
          {withdrawal.wallet_address}
        </TableCell>
        <TableCell>
          {format(new Date(withdrawal.created_at), "MMM dd, yyyy HH:mm")}
        </TableCell>
        <TableCell>
          <div className="flex flex-col gap-1">
            <Badge
              className={
                withdrawal.status === "completed" || withdrawal.status === "approved"
                  ? "bg-green-500"
                  : displayStatus === "processing"
                  ? "bg-blue-500"
                  : withdrawal.status === "pending"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }
            >
              {displayStatus}
            </Badge>
            {withdrawal.status === "pending" && hasFeeSubmitted && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Fee paid</span>
              </div>
            )}
            {withdrawal.status === "pending" && approvalStatus.isLarge && (
              <div className="flex items-center gap-1 text-xs">
                <Users className="h-3 w-3" />
                <span className={approvalStatus.canFinalize ? "text-green-600" : "text-orange-600"}>
                  {approvalStatus.currentCount}/{approvalStatus.requiredCount} approvals
                </span>
              </div>
            )}
          </div>
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
    );
  };

  const WithdrawalTable = ({ data, showCheckbox = false }: { data: Withdrawal[]; showCheckbox?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          {showCheckbox && (
            <TableHead className="w-12">
              <Checkbox
                checked={selectedIds.length === data.length && data.length > 0}
                onCheckedChange={() => selectAll(data)}
              />
            </TableHead>
          )}
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
            <TableCell colSpan={showCheckbox ? 8 : 7} className="text-center text-muted-foreground">
              No withdrawals found
            </TableCell>
          </TableRow>
        ) : (
          data.map((withdrawal) => (
            <TableRow key={withdrawal.id}>
              {showCheckbox && (
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(withdrawal.id)}
                    onCheckedChange={() => toggleSelection(withdrawal.id)}
                  />
                </TableCell>
              )}
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
                    withdrawal.status === "completed" || withdrawal.status === "approved"
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
        <CardContent className="space-y-4">
          {/* Search and Bulk Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, wallet, or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            {selectedIds.length > 0 && (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleBulkApprove}
                  disabled={bulkProcessing}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve ({selectedIds.length})
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={handleBulkReject}
                  disabled={bulkProcessing}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject ({selectedIds.length})
                </Button>
              </div>
            )}
          </div>

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
              <WithdrawalTable data={pendingWithdrawals} showCheckbox />
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
                  <Label className="text-muted-foreground">Confirmation Fee ({(WITHDRAWAL_FEE_PERCENTAGE * 100)}%)</Label>
                  <p className="font-semibold text-lg text-yellow-600">
                    ${(selectedWithdrawal.amount * WITHDRAWAL_FEE_PERCENTAGE).toFixed(2)} (paid separately by user)
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount to Send</Label>
                  <p className="font-bold text-xl text-green-600">
                    ${selectedWithdrawal.amount.toFixed(2)} {selectedWithdrawal.currency.toUpperCase()}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Destination Wallet</Label>
                  <p className="font-mono text-xs break-all">
                    {selectedWithdrawal.wallet_address}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Admin Notes</Label>
                  {selectedWithdrawal.admin_notes ? (
                    <p className="font-mono text-xs break-all text-muted-foreground">
                      {selectedWithdrawal.admin_notes}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">No notes</p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Requested</Label>
                  <p className="font-medium">
                    {format(new Date(selectedWithdrawal.created_at), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  {(() => {
                    const hasFeeSubmitted = selectedWithdrawal.admin_notes?.toLowerCase().includes('fee hash:') || 
                                            selectedWithdrawal.admin_notes?.toLowerCase().includes('fee payment hash:');
                    const displayStatus = selectedWithdrawal.status === 'pending' && hasFeeSubmitted 
                      ? 'processing' 
                      : selectedWithdrawal.status;
                    return (
                      <Badge
                        className={
                          selectedWithdrawal.status === "completed"
                            ? "bg-green-500"
                            : displayStatus === "processing"
                            ? "bg-blue-500"
                            : selectedWithdrawal.status === "pending"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }
                      >
                        {displayStatus}
                      </Badge>
                    );
                  })()}
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

              {/* Confirmation Fee Info Section */}
              {selectedWithdrawal.status === "pending" && (
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">10% Confirmation Fee Required</Label>
                    <Badge variant="outline">
                      ${(selectedWithdrawal.amount * WITHDRAWAL_FEE_PERCENTAGE).toFixed(2)}
                    </Badge>
                  </div>

                  <div className="p-3 bg-yellow-500/10 border border-yellow-500 rounded-lg">
                    <p className="text-sm font-medium mb-2">Required BTC Address:</p>
                    <p className="text-xs font-mono bg-background p-2 rounded break-all">
                      {CONFIRMATION_FEE_WALLET_BTC}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      User must send 10% confirmation fee to this address before withdrawal can be approved.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Verify Fee Transaction Hash</Label>
                    <Input
                      placeholder="Enter the BTC transaction hash proving fee payment..."
                      value={confirmationFeeTxHash}
                      onChange={(e) => setConfirmationFeeTxHash(e.target.value)}
                    />
                    <Button
                      onClick={handleVerifyConfirmationFee}
                      disabled={verifyingFee || !confirmationFeeTxHash.trim()}
                      className="w-full"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      {verifyingFee ? "Verifying on Blockchain..." : "Verify Fee Payment"}
                    </Button>
                  </div>
                </div>
              )}


              {/* Blockchain Verification Section for completed withdrawals */}
              {selectedWithdrawal.transaction_hash && (
                <BlockchainVerificationSection 
                  withdrawal={selectedWithdrawal} 
                />
              )}

              {selectedWithdrawal.status === "pending" && (
                <div className="border-t pt-4 space-y-3">
                  {/* Multi-Admin Approval Section for Large Withdrawals */}
                  {(() => {
                    const approvalStatus = getApprovalStatus(selectedWithdrawal.id, selectedWithdrawal.amount);
                    const txApprovals = approvals[selectedWithdrawal.id] || [];
                    const hasApproved = txApprovals.some((a) => a.admin_id === currentAdminId);

                    if (approvalStatus.isLarge) {
                      return (
                        <div className="p-4 border border-orange-500 rounded-lg space-y-3 bg-orange-500/5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Shield className="h-5 w-5 text-orange-500" />
                              <span className="font-semibold text-orange-600">
                                Large Withdrawal - Multi-Admin Review Required
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className={approvalStatus.canFinalize ? "border-green-500 text-green-600" : "border-orange-500 text-orange-600"}
                            >
                              {approvalStatus.currentCount}/{approvalStatus.requiredCount} Approvals
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            Withdrawals over ${settings.threshold.toLocaleString()} require {settings.requiredApprovals} admin approvals before final processing.
                          </p>

                          {txApprovals.length > 0 && (
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Current Approvals:</Label>
                              {txApprovals.map((approval) => (
                                <div key={approval.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>{approval.admin_email}</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(approval.approved_at), "MMM dd, HH:mm")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2">
                            {!hasApproved ? (
                              <Button
                                className="flex-1 bg-orange-600 hover:bg-orange-700"
                                onClick={handleAddApproval}
                                disabled={processing}
                              >
                                <Users className="h-4 w-4 mr-2" />
                                Add My Approval
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handleRemoveApproval}
                                disabled={processing}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Remove My Approval
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

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
                    {(() => {
                      const approvalStatus = getApprovalStatus(selectedWithdrawal.id, selectedWithdrawal.amount);
                      const canProcess = approvalStatus.canFinalize && selectedWithdrawal.profiles?.balance_usdt >= selectedWithdrawal.amount;
                      
                      return (
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={handleApprove}
                          disabled={processing || !canProcess}
                          title={!approvalStatus.canFinalize ? `Requires ${approvalStatus.requiredCount} approvals (has ${approvalStatus.currentCount})` : undefined}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {approvalStatus.isLarge && !approvalStatus.canFinalize 
                            ? `Need ${approvalStatus.requiredCount - approvalStatus.currentCount} More Approval(s)`
                            : "Approve & Process"
                          }
                        </Button>
                      );
                    })()}
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

              {/* Reverse approved/completed withdrawal */}
              {(selectedWithdrawal.status === "approved" || selectedWithdrawal.status === "completed") && (
                <div className="border-t pt-4 space-y-3">
                  {!showReverseConfirm ? (
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => setShowReverseConfirm(true)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reverse This Withdrawal
                    </Button>
                  ) : (
                    <div className="p-4 border border-destructive rounded-lg space-y-3">
                      <p className="text-sm font-medium text-destructive">
                        ⚠️ This will refund ${selectedWithdrawal.amount.toLocaleString()} to the user's balance
                      </p>
                      <div>
                        <Label>Reason for reversal</Label>
                        <Textarea
                          placeholder="Why are you reversing this withdrawal?"
                          value={reverseReason}
                          onChange={(e) => setReverseReason(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowReverseConfirm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={handleReverseWithdrawal}
                          disabled={processing}
                        >
                          {processing ? "Reversing..." : "Confirm Reversal"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Re-approve rejected withdrawal */}
              {selectedWithdrawal.status === "rejected" && (
                <div className="border-t pt-4 space-y-3">
                  {!showReopenConfirm ? (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => setShowReopenConfirm(true)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Re-approve This Withdrawal
                    </Button>
                  ) : (
                    <div className="p-4 border border-green-500 rounded-lg space-y-3">
                      <p className="text-sm font-medium text-green-600">
                        ✓ This will deduct ${selectedWithdrawal.amount.toLocaleString()} from the user's balance
                      </p>
                      <div>
                        <Label>Reason for re-approval</Label>
                        <Textarea
                          placeholder="Why are you re-approving this withdrawal?"
                          value={reverseReason}
                          onChange={(e) => setReverseReason(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowReopenConfirm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={handleReopenWithdrawal}
                          disabled={processing}
                        >
                          {processing ? "Re-approving..." : "Confirm Re-approval"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Blockchain verification section component
const BlockchainVerificationSection = ({ withdrawal }: { withdrawal: Withdrawal }) => {
  const { verifying, result, verifyTransaction } = useBlockchainVerification();

  const handleVerify = () => {
    if (withdrawal.transaction_hash) {
      verifyTransaction(withdrawal.transaction_hash, withdrawal.currency as "usdt" | "btc");
    }
  };

  const getExplorerUrl = () => {
    if (!withdrawal.transaction_hash) return null;
    if (withdrawal.currency === "usdt") {
      return `https://tronscan.org/#/transaction/${withdrawal.transaction_hash}`;
    }
    return `https://blockchair.com/bitcoin/transaction/${withdrawal.transaction_hash}`;
  };

  return (
    <div className="border-t pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-muted-foreground">Blockchain Verification</Label>
        <a
          href={getExplorerUrl() || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View on Explorer <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="p-3 bg-muted rounded-lg">
        <p className="text-xs font-mono break-all">{withdrawal.transaction_hash}</p>
      </div>

      <Button
        variant="outline"
        onClick={handleVerify}
        disabled={verifying}
        className="w-full"
      >
        <Search className="h-4 w-4 mr-2" />
        {verifying ? "Verifying on Blockchain..." : "Verify Transaction"}
      </Button>

      {result && (
        <div className="space-y-2">
          <BlockchainVerificationBadge verifying={false} result={result} showDetails />
          {result.verified && (
            <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confirmations:</span>
                <span className="font-medium">{result.confirmations}</span>
              </div>
              {result.amount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">{result.amount}</span>
                </div>
              )}
              {result.to_address && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To:</span>
                  <span className="font-mono text-xs">{result.to_address.slice(0, 20)}...</span>
                </div>
              )}
              {result.timestamp && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Block Time:</span>
                  <span className="font-medium">{new Date(result.timestamp).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Amount mismatch warning */}
          {result.verified && result.amount && Math.abs(result.amount - withdrawal.amount) > 0.01 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <p className="text-sm text-yellow-600 font-medium">
                Amount mismatch: Blockchain shows {result.amount}, withdrawal is ${withdrawal.amount}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


export default AdminWithdrawals;
