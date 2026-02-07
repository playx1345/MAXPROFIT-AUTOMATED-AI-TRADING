import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Search, Eye, CheckCircle, XCircle, Mail, KeyRound, UserPlus, Edit, Trash2, Ban, CheckCheck, DollarSign, Plus, Minus, Bitcoin, Shield } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getKycDocumentSignedUrl } from "@/lib/kyc-utils";
import { useTranslation } from "react-i18next";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  balance_usdt: number;
  kyc_status: string;
  kyc_submitted_at: string | null;
  created_at: string;
  is_suspended: boolean;
  wallet_btc: string | null;
  wallet_usdt: string | null;
  upgrade_fee_paid: boolean;
  fee_exempt: boolean;
}

interface UserFormData {
  email: string;
  full_name: string;
  phone: string;
  password: string;
  balance_usdt: number;
  kyc_status: string;
}

const AdminUsers = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resetLoading, setResetLoading] = useState(false);
  const [setPasswordLoading, setSetPasswordLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [kycReason, setKycReason] = useState("");
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    full_name: "",
    phone: "",
    password: "",
    balance_usdt: 0,
    kyc_status: "pending",
  });
  const [balanceAdjustmentOpen, setBalanceAdjustmentOpen] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract">("add");
  const [adjustingBalance, setAdjustingBalance] = useState(false);
  
  // Blockchain fee payment state
  const [feePaymentOpen, setFeePaymentOpen] = useState(false);
  const [feeAmount, setFeeAmount] = useState("200");
  const [feeTransactionHash, setFeeTransactionHash] = useState("");
  const [feeNotes, setFeeNotes] = useState("");
  const [recordingFee, setRecordingFee] = useState(false);
  const [setFeeExemptAfterPayment, setSetFeeExemptAfterPayment] = useState(true);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error: any) {
      toast({
        title: t('admin.users.errorFetching'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKycAction = async (userId: string, action: "verified" | "rejected") => {
    try {
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      
      if (!adminUser) {
        throw new Error("Not authenticated as admin");
      }

      // If verifying KYC, use the atomic function to deduct $400 fee
      if (action === "verified") {
        // Call the atomic function to handle KYC verification, fee deduction, and transaction creation
        const { data, error } = await supabase.rpc('verify_kyc_atomic' as any, {
          p_user_id: userId,
          p_admin_id: adminUser.id,
          p_admin_email: adminUser.email || "",
          p_reason: kycReason || null,
        });

        if (error) throw error;

        const result = data as { fee_amount: number; new_balance: number };
        toast({
          title: t('admin.users.kycVerifiedMsg'),
          description: (t as any)('admin.users.kycVerifiedDesc', { fee: result.fee_amount.toFixed(2), balance: result.new_balance.toFixed(2) }),
        });
      } else {
        // For rejection, just update the status
        const { error } = await supabase
          .from("profiles")
          .update({
            kyc_status: action,
          })
          .eq("id", userId);

        if (error) throw error;

        // Log the admin action for rejection
        await supabase.from("admin_activity_logs").insert({
          admin_id: adminUser.id,
          admin_email: adminUser.email || "",
          action: `kyc_${action}`,
          target_type: "user",
          target_id: userId,
          target_email: selectedUser?.email,
          details: { reason: kycReason || null, fee_deducted: 0 },
        });

        toast({
          title: action === "rejected" ? t('admin.users.kycRejectedMsg') : `KYC ${action}`,
          description: action === "rejected" ? t('admin.users.kycRejectedDesc') : `User KYC has been ${action}`,
        });
      }

      fetchUsers();
      setDetailsOpen(false);
      setKycReason("");
    } catch (error: any) {
      toast({
        title: t('admin.users.errorUpdatingKyc'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleViewIdCard = async (idCardUrl: string) => {
    try {
      const signedUrl = await getKycDocumentSignedUrl(idCardUrl);
      
      if (signedUrl) {
        window.open(signedUrl, '_blank');
      } else {
        toast({
          title: t('common.error'),
          description: t('admin.users.invalidFilePath'),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: t('admin.users.errorViewingDoc'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePasswordReset = async (email: string) => {
    setResetLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-reset-password", {
        body: { user_email: email },
      });

      if (error) throw error;

      if (data.error) throw new Error(data.error);

      toast({
        title: t('admin.users.passwordResetSent'),
        description: (t as any)('admin.users.passwordResetSentDesc', { email }),
      });
    } catch (error: any) {
      toast({
        title: t('admin.users.errorSendingReset'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleSetPassword = async (email: string) => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: t('admin.users.invalidPassword'),
        description: t('admin.users.passwordMinChars'),
        variant: "destructive",
      });
      return;
    }

    setSetPasswordLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-reset-password", {
        body: { user_email: email, new_password: newPassword },
      });

      if (error) throw error;

      if (data.error) throw new Error(data.error);

      toast({
        title: t('admin.users.passwordSet'),
        description: (t as any)('admin.users.passwordSetDesc', { email }),
      });
      setNewPassword("");
    } catch (error: any) {
      toast({
        title: t('admin.users.errorSettingPassword'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSetPasswordLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!formData.email || !formData.password || formData.password.length < 6) {
      toast({
        title: t('admin.users.invalidInput'),
        description: t('admin.users.emailPasswordRequired'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create user via edge function
      const { data, error } = await supabase.functions.invoke("admin-create-user", {
        body: formData,
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: t('admin.users.userCreated'),
        description: (t as any)('admin.users.userCreatedDesc', { email: formData.email }),
      });

      // Reset form
      setFormData({
        email: "",
        full_name: "",
        phone: "",
        password: "",
        balance_usdt: 0,
        kyc_status: "pending",
      });
      setCreateDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: t('admin.users.errorCreating'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      // Update profile data
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          balance_usdt: formData.balance_usdt,
          kyc_status: formData.kyc_status as "pending" | "rejected" | "verified",
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      // Log admin action
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      if (adminUser) {
        await supabase.from("admin_activity_logs").insert({
          admin_id: adminUser.id,
          admin_email: adminUser.email || "",
          action: "user_updated",
          target_type: "user",
          target_id: selectedUser.id,
          target_email: selectedUser.email,
          details: { 
            updated_fields: {
              full_name: formData.full_name,
              phone: formData.phone,
              balance_usdt: formData.balance_usdt,
              kyc_status: formData.kyc_status,
            }
          },
        });
      }

      toast({
        title: t('admin.users.userUpdated'),
        description: (t as any)('admin.users.userUpdatedDesc', { email: selectedUser.email }),
      });

      setEditDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: t('admin.users.errorUpdating'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId: string, email: string, suspend: boolean) => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-suspend-user", {
        body: { user_id: userId, suspend },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: suspend ? t('admin.users.userSuspended') : t('admin.users.userActivated'),
        description: (t as any)('admin.users.userStatusDesc', { email, status: suspend ? t('admin.users.userSuspended').toLowerCase() : t('admin.users.userActivated').toLowerCase() }),
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: t('admin.users.errorSuspending'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-delete-user", {
        body: { user_id: userId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: t('admin.users.userDeleted'),
        description: (t as any)('admin.users.userDeletedDesc', { email }),
      });

      setDetailsOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: t('admin.users.errorDeleting'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBalanceAdjustment = async () => {
    if (!selectedUser || !adjustmentAmount || !adjustmentReason.trim()) {
      toast({
        title: t('admin.users.missingInfo'),
        description: t('admin.users.enterAmountAndReason'),
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(adjustmentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: t('admin.users.invalidAmount'),
        description: t('admin.users.invalidAmountDesc'),
        variant: "destructive",
      });
      return;
    }

    const finalAmount = adjustmentType === "add" ? amount : -amount;

    setAdjustingBalance(true);
    try {
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      if (!adminUser) throw new Error("Not authenticated as admin");

      const { data, error } = await supabase.rpc("adjust_user_balance" as any, {
        p_user_id: selectedUser.id,
        p_admin_id: adminUser.id,
        p_admin_email: adminUser.email || "",
        p_amount: finalAmount,
        p_reason: adjustmentReason.trim(),
      });

      if (error) throw error;

      const result = data as { previous_balance: number; new_balance: number };
      toast({
        title: t('admin.users.balanceAdjusted'),
        description: (t as any)('admin.users.balanceAdjustedDesc', { type: adjustmentType === "add" ? t('admin.users.added') : t('admin.users.subtracted'), amount: amount.toLocaleString(), newBalance: result.new_balance.toLocaleString() }),
      });

      setBalanceAdjustmentOpen(false);
      setAdjustmentAmount("");
      setAdjustmentReason("");
      fetchUsers();
      
      // Update selected user locally
      setSelectedUser({
        ...selectedUser,
        balance_usdt: result.new_balance,
      });
    } catch (error: any) {
      toast({
        title: t('admin.users.errorAdjusting'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAdjustingBalance(false);
    }
  };

  const handleRecordBlockchainFeePayment = async () => {
    if (!selectedUser) return;

    const amount = parseFloat(feeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: t('admin.users.invalidFeeAmount'),
        description: t('admin.users.invalidFeeAmountDesc'),
        variant: "destructive",
      });
      return;
    }

    setRecordingFee(true);
    try {
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      if (!adminUser) throw new Error("Not authenticated as admin");

      // Create transaction record for the fee payment
      const { error: txError } = await supabase
        .from("transactions")
        .insert({
          user_id: selectedUser.id,
          type: "deposit",
          amount: amount,
          status: "approved",
          currency: "btc",
          transaction_hash: feeTransactionHash || null,
          admin_notes: `Blockchain confirmation fee payment${feeNotes ? `: ${feeNotes}` : ""}`,
          processed_by: adminUser.id,
          processed_at: new Date().toISOString(),
        });

      if (txError) throw txError;

      // Optionally set fee exempt
      if (setFeeExemptAfterPayment && !selectedUser.fee_exempt) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ fee_exempt: true })
          .eq("id", selectedUser.id);

        if (profileError) throw profileError;
      }

      // Log admin action
      await supabase.from("admin_activity_logs").insert({
        admin_id: adminUser.id,
        admin_email: adminUser.email || "",
        action: "record_blockchain_fee_payment",
        target_type: "user",
        target_id: selectedUser.id,
        target_email: selectedUser.email,
        details: {
          amount,
          transaction_hash: feeTransactionHash || null,
          notes: feeNotes || null,
          fee_exempt_set: setFeeExemptAfterPayment,
        },
      });

      toast({
        title: t('admin.users.feeRecorded'),
        description: (t as any)('admin.users.feeRecordedDesc', { amount, email: selectedUser.email }),
      });

      // Update local state
      if (setFeeExemptAfterPayment) {
        setSelectedUser({ ...selectedUser, fee_exempt: true });
      }

      setFeePaymentOpen(false);
      setFeeAmount("200");
      setFeeTransactionHash("");
      setFeeNotes("");
      setSetFeeExemptAfterPayment(true);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: t('admin.users.errorRecordingFee'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRecordingFee(false);
    }
  };

  const getKycBadgeColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-muted";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">{t('admin.users.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.users.title')}</h1>
          <p className="text-muted-foreground">{t('admin.users.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-lg">
            {(t as any)('admin.users.totalUsers', { count: users.length })}
          </Badge>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            {t('admin.users.createUser')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.users.allUsers')}</CardTitle>
          <CardDescription>{t('admin.users.allUsersDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('admin.users.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.users.name')}</TableHead>
                  <TableHead>{t('admin.users.email')}</TableHead>
                  <TableHead>{t('admin.users.balance')}</TableHead>
                  <TableHead>{t('admin.users.kycStatus')}</TableHead>
                  <TableHead>{t('admin.users.joined')}</TableHead>
                  <TableHead>{t('admin.common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || "N/A"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="font-semibold">
                      ${user.balance_usdt.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getKycBadgeColor(user.kyc_status)}>
                        {user.kyc_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedUser(user);
                            setDetailsOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {t('admin.common.view')}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedUser(user);
                            setFormData({
                              email: user.email,
                              full_name: user.full_name || "",
                              phone: user.phone || "",
                              password: "",
                              balance_usdt: user.balance_usdt,
                              kyc_status: user.kyc_status,
                            });
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {t('admin.common.edit')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('admin.users.userDetails')}</DialogTitle>
            <DialogDescription>
              {t('admin.users.userDetailsDesc')}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t('admin.users.fullName')}</Label>
                  <p className="font-medium">{selectedUser.full_name || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('admin.users.email')}</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('admin.users.phone')}</Label>
                  <p className="font-medium">{selectedUser.phone || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('admin.users.balance')}</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-primary text-lg">
                      ${selectedUser.balance_usdt.toLocaleString()}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2"
                      onClick={() => {
                        setAdjustmentType("add");
                        setBalanceAdjustmentOpen(true);
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2"
                      onClick={() => {
                        setAdjustmentType("subtract");
                        setBalanceAdjustmentOpen(true);
                      }}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('admin.users.kycStatus')}</Label>
                  <Badge className={getKycBadgeColor(selectedUser.kyc_status)}>
                    {selectedUser.kyc_status}
                  </Badge>
                </div>
                <div>
                   <Label className="text-muted-foreground">{t('admin.users.upgradeFee')}</Label>
                  <Badge className={selectedUser.upgrade_fee_paid ? "bg-green-500" : "bg-orange-500"}>
                    {selectedUser.upgrade_fee_paid ? t('admin.users.paid') : t('admin.users.notPaid')}
                  </Badge>
                </div>
                <div>
                   <Label className="text-muted-foreground">{t('admin.users.feeExempt')}</Label>
                  <div className="flex items-center gap-2">
                    <Badge className={selectedUser.fee_exempt ? "bg-green-500" : "bg-muted"}>
                      {selectedUser.fee_exempt ? t('admin.users.exempt') : t('admin.users.notExempt')}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={async () => {
                        try {
                          const { error } = await supabase
                            .from("profiles")
                            .update({ fee_exempt: !selectedUser.fee_exempt })
                            .eq("id", selectedUser.id);
                          if (error) throw error;
                          
                          // Log admin action
                          const { data: { user: adminUser } } = await supabase.auth.getUser();
                          if (adminUser) {
                            await supabase.from("admin_activity_logs").insert({
                              admin_id: adminUser.id,
                              admin_email: adminUser.email || "",
                              action: selectedUser.fee_exempt ? "remove_fee_exemption" : "grant_fee_exemption",
                              target_type: "user",
                              target_id: selectedUser.id,
                              target_email: selectedUser.email,
                            });
                          }

                          setSelectedUser({ ...selectedUser, fee_exempt: !selectedUser.fee_exempt });
                          fetchUsers();
                          toast({
                            title: selectedUser.fee_exempt ? t('admin.users.feeExemptionRemoved') : t('admin.users.feeExemptionGranted'),
                            description: (t as any)('admin.users.feeExemptionDesc', { email: selectedUser.email, status: !selectedUser.fee_exempt ? t('admin.users.exemptFrom') : t('admin.users.subjectTo') }),
                          });
                        } catch (error: any) {
                          toast({
                            title: t('admin.users.errorUpdatingExemption'),
                            description: error.message,
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      {selectedUser.fee_exempt ? t('admin.users.remove') : t('admin.users.grant')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs bg-orange-500/10 border-orange-500 text-orange-600 hover:bg-orange-500/20"
                      onClick={() => setFeePaymentOpen(true)}
                    >
                      <Bitcoin className="h-3 w-3 mr-1" />
                      {t('admin.users.recordFee')}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('admin.users.joined')}</Label>
                  <p className="font-medium">
                    {format(new Date(selectedUser.created_at), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>

              {/* Note: ID Card viewing functionality has been removed as kyc_id_card_url column doesn't exist */}

              {/* Password Reset Section */}
              <div className="border-t pt-4">
                 <h3 className="font-semibold mb-3 flex items-center gap-2">
                   <KeyRound className="h-4 w-4" />
                   {t('admin.users.passwordManagement')}
                </h3>
                <div className="space-y-4">
                  {/* Set Password Directly */}
                   <div className="space-y-2">
                     <Label>{t('admin.users.setNewPassword')}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder={t('admin.users.enterNewPassword')}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => handleSetPassword(selectedUser.email)}
                        disabled={setPasswordLoading || !newPassword}
                      >
                        {setPasswordLoading ? t('admin.users.settingPassword') : t('admin.users.setPassword')}
                      </Button>
                    </div>
                  </div>

                  {/* Or Send Reset Email */}
                  <div className="text-center text-sm text-muted-foreground">{t('admin.users.or')}</div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full" disabled={resetLoading}>
                         <Mail className="h-4 w-4 mr-2" />
                         {resetLoading ? t('admin.users.sendingEmail') : t('admin.users.sendResetEmail')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                         <AlertDialogTitle>{t('admin.users.resetEmailTitle')}</AlertDialogTitle>
                         <AlertDialogDescription>
                          This will send a password reset link to <strong>{selectedUser.email}</strong>. 
                          The user will be able to set a new password using that link.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                         <AlertDialogCancel>{t('admin.common.cancel')}</AlertDialogCancel>
                         <AlertDialogAction onClick={() => handlePasswordReset(selectedUser.email)}>
                           {t('admin.users.sendResetEmailBtn')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {selectedUser.kyc_status === "pending" && selectedUser.kyc_submitted_at && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">{t('admin.users.kycVerification')}</h3>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                      {(t as any)('admin.users.kycSubmittedOn', { date: format(new Date(selectedUser.kyc_submitted_at), "MMM dd, yyyy") })}
                    </div>
                    <div>
                       <Label>{t('admin.users.adminNotesOptional')}</Label>
                       <Textarea
                         placeholder={t('admin.users.addVerificationNotes')}
                        value={kycReason}
                        onChange={(e) => setKycReason(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleKycAction(selectedUser.id, "verified")}
                      >
                         <CheckCircle className="h-4 w-4 mr-2" />
                         {t('admin.users.approveKyc')}
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleKycAction(selectedUser.id, "rejected")}
                      >
                         <XCircle className="h-4 w-4 mr-2" />
                         {t('admin.users.rejectKyc')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Management Actions */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">{t('admin.users.accountManagement')}</h3>
                <div className="flex flex-col gap-3">
                  {/* Upgrade Fee Toggle */}
                  {selectedUser.kyc_status === "verified" && (
                    <Button
                      variant={selectedUser.upgrade_fee_paid ? "outline" : "default"}
                      className={`w-full ${!selectedUser.upgrade_fee_paid ? "bg-green-600 hover:bg-green-700" : ""}`}
                      onClick={async () => {
                        try {
                          const { error } = await supabase
                            .from("profiles")
                            .update({ upgrade_fee_paid: !selectedUser.upgrade_fee_paid })
                            .eq("id", selectedUser.id);

                          if (error) throw error;

                          // Log admin action
                          const { data: { user: adminUser } } = await supabase.auth.getUser();
                          if (adminUser) {
                            await supabase.from("admin_activity_logs").insert({
                              admin_id: adminUser.id,
                              admin_email: adminUser.email || "",
                              action: selectedUser.upgrade_fee_paid ? "upgrade_fee_revoked" : "upgrade_fee_marked_paid",
                              target_type: "user",
                              target_id: selectedUser.id,
                              target_email: selectedUser.email,
                              details: { upgrade_fee_paid: !selectedUser.upgrade_fee_paid },
                            });
                          }

                          toast({
                            title: "Upgrade fee status updated",
                            description: `Upgrade fee marked as ${!selectedUser.upgrade_fee_paid ? "paid" : "not paid"} for ${selectedUser.email}`,
                          });
                          fetchUsers();
                          setDetailsOpen(false);
                        } catch (error: any) {
                          toast({
                            title: "Error updating upgrade fee status",
                            description: error.message,
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      {selectedUser.upgrade_fee_paid ? t('admin.users.upgradeFee') + " ✕" : t('admin.users.upgradeFee') + " ✓"}
                    </Button>
                  )}

                  <div className="flex gap-2">
                    {selectedUser.is_suspended === true ? (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleSuspendUser(selectedUser.id, selectedUser.email, false)}
                      >
                         <CheckCheck className="h-4 w-4 mr-2" />
                         {t('admin.users.activateUser')}
                       </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleSuspendUser(selectedUser.id, selectedUser.email, true)}
                      >
                         <Ban className="h-4 w-4 mr-2" />
                         {t('admin.users.suspendUser')}
                       </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="flex-1">
                           <Trash2 className="h-4 w-4 mr-2" />
                           {t('admin.users.deleteUser')}
                         </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('admin.users.confirmDelete')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user account
                            for <strong>{selectedUser.email}</strong> and remove all associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('admin.common.cancel')}</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDeleteUser(selectedUser.id, selectedUser.email)}
                          >
                            {t('admin.common.delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('admin.users.createUser')}</DialogTitle>
            <DialogDescription>
              Add a new client account to the platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-email">Email *</Label>
                <Input
                  id="create-email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-password">Password *</Label>
                <Input
                  id="create-password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-name">Full Name</Label>
                <Input
                  id="create-name"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-phone">Phone</Label>
                <Input
                  id="create-phone"
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-balance">Initial Balance (USDT)</Label>
                <Input
                  id="create-balance"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.balance_usdt}
                  onChange={(e) => setFormData({ ...formData, balance_usdt: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-kyc">KYC Status</Label>
                <Select 
                  value={formData.kyc_status}
                  onValueChange={(value) => setFormData({ ...formData, kyc_status: value })}
                >
                  <SelectTrigger id="create-kyc">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
               {t('admin.common.cancel')}
             </Button>
             <Button onClick={handleCreateUser} disabled={loading}>
               {loading ? t('admin.common.loading') : t('admin.users.createUser')}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('admin.users.editUser')}</DialogTitle>
            <DialogDescription>
              Update user information and settings
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={selectedUser.email} disabled />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-balance">Balance (USDT)</Label>
                  <Input
                    id="edit-balance"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.balance_usdt}
                    onChange={(e) => setFormData({ ...formData, balance_usdt: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-kyc">KYC Status</Label>
                  <Select 
                    value={formData.kyc_status}
                    onValueChange={(value) => setFormData({ ...formData, kyc_status: value })}
                  >
                    <SelectTrigger id="edit-kyc">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
             <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
               {t('admin.common.cancel')}
             </Button>
             <Button onClick={handleUpdateUser} disabled={loading}>
               {loading ? t('admin.common.loading') : t('admin.common.save')}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Balance Adjustment Dialog */}
      <Dialog open={balanceAdjustmentOpen} onOpenChange={setBalanceAdjustmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {adjustmentType === "add" ? "Add to Balance" : "Subtract from Balance"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <>
                  Adjusting balance for <strong>{selectedUser.email}</strong>
                  <br />
                  Current balance: <strong>${selectedUser.balance_usdt.toLocaleString()}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Amount (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason (required)</Label>
              <Textarea
                placeholder={adjustmentType === "add" 
                  ? "e.g., Bonus credit, referral reward, correction..." 
                  : "e.g., Chargeback, fee deduction, correction..."
                }
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
              />
            </div>
            {adjustmentAmount && parseFloat(adjustmentAmount) > 0 && (
              <div className={`p-3 rounded-lg ${adjustmentType === "add" ? "bg-green-500/10 border border-green-500" : "bg-red-500/10 border border-red-500"}`}>
                <p className={`text-sm font-medium ${adjustmentType === "add" ? "text-green-600" : "text-red-600"}`}>
                  {adjustmentType === "add" ? "+" : "-"}${parseFloat(adjustmentAmount).toLocaleString()} will be {adjustmentType === "add" ? "added to" : "subtracted from"} the user's balance
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  New balance: ${(
                    selectedUser?.balance_usdt 
                      ? adjustmentType === "add" 
                        ? selectedUser.balance_usdt + parseFloat(adjustmentAmount)
                        : selectedUser.balance_usdt - parseFloat(adjustmentAmount)
                      : 0
                  ).toLocaleString()}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setBalanceAdjustmentOpen(false)}>
               {t('admin.common.cancel')}
             </Button>
            <Button 
              onClick={handleBalanceAdjustment} 
              disabled={adjustingBalance || !adjustmentAmount || !adjustmentReason.trim()}
              className={adjustmentType === "add" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {adjustingBalance ? t('admin.common.processing') : adjustmentType === "add" ? t('admin.users.addFunds') : t('admin.users.subtractFunds')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Blockchain Fee Payment Dialog */}
      <Dialog open={feePaymentOpen} onOpenChange={setFeePaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
               <Bitcoin className="h-5 w-5 text-orange-500" />
               {t('admin.users.blockchainFeePayment')}
            </DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <>
                  Recording blockchain confirmation fee payment for <strong>{selectedUser.email}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Fee Amount (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="200.00"
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(e.target.value)}
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-muted-foreground">Default: $200 (10% blockchain confirmation fee)</p>
            </div>
            <div className="space-y-2">
              <Label>Transaction Hash (optional)</Label>
              <Input
                placeholder="e.g., 0x1234..."
                value={feeTransactionHash}
                onChange={(e) => setFeeTransactionHash(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">BTC transaction hash for verification</p>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="e.g., Payment confirmed via blockchain explorer..."
                value={feeNotes}
                onChange={(e) => setFeeNotes(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
              <input
                type="checkbox"
                id="fee-exempt-checkbox"
                checked={setFeeExemptAfterPayment}
                onChange={(e) => setSetFeeExemptAfterPayment(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="fee-exempt-checkbox" className="flex items-center gap-2 cursor-pointer">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Grant fee exemption after recording payment</span>
              </Label>
            </div>
            {feeAmount && parseFloat(feeAmount) > 0 && (
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500">
                <p className="text-sm font-medium text-orange-600">
                  Recording ${parseFloat(feeAmount).toLocaleString()} blockchain confirmation fee
                </p>
                {setFeeExemptAfterPayment && (
                  <p className="text-xs text-muted-foreground mt-1">
                    User will be marked as fee exempt after recording
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeePaymentOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRecordBlockchainFeePayment}
              disabled={recordingFee || !feeAmount || parseFloat(feeAmount) <= 0}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {recordingFee ? "Recording..." : "Record Fee Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
