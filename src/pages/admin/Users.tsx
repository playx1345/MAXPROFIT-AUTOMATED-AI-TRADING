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
import { Search, Eye, CheckCircle, XCircle, Mail, KeyRound, UserPlus, Edit, Trash2, Ban, CheckCheck } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  balance_usdt: number;
  kyc_status: string;
  kyc_submitted_at: string | null;
  kyc_id_card_url: string | null;
  created_at: string;
  is_suspended?: boolean;
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
        title: "Error fetching users",
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
          title: "KYC verified",
          description: `User KYC has been verified and $${result.fee_amount.toFixed(2)} fee has been deducted. New balance: $${result.new_balance.toFixed(2)}`,
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
          title: `KYC ${action}`,
          description: `User KYC has been ${action}`,
        });
      }

      fetchUsers();
      setDetailsOpen(false);
      setKycReason("");
    } catch (error: any) {
      toast({
        title: "Error updating KYC",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleViewIdCard = async (idCardUrl: string) => {
    try {
      // Extract the file path from the stored value
      const pathMatch = idCardUrl.match(/kyc-documents\/(.+)$/);
      if (!pathMatch) {
        toast({
          title: "Error",
          description: "Invalid file path",
          variant: "destructive",
        });
        return;
      }
      
      const filePath = pathMatch[1];
      
      // Generate a signed URL that expires in 1 hour
      const { data, error } = await supabase.storage
        .from('kyc-documents')
        .createSignedUrl(filePath, 3600);
      
      if (error) throw error;
      
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Error viewing document",
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
        title: "Password reset email sent",
        description: `A password reset link has been sent to ${email}`,
      });
    } catch (error: any) {
      toast({
        title: "Error sending reset email",
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
        title: "Invalid password",
        description: "Password must be at least 6 characters",
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
        title: "Password set successfully",
        description: `Password has been set for ${email}`,
      });
      setNewPassword("");
    } catch (error: any) {
      toast({
        title: "Error setting password",
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
        title: "Invalid input",
        description: "Email and password (min 6 chars) are required",
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
        title: "User created successfully",
        description: `New user ${formData.email} has been created`,
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
        title: "Error creating user",
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
        title: "User updated successfully",
        description: `Changes to ${selectedUser.email} have been saved`,
      });

      setEditDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error updating user",
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
        title: suspend ? "User suspended" : "User activated",
        description: `${email} has been ${suspend ? "suspended" : "activated"}`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error updating user status",
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
        title: "User deleted",
        description: `${email} has been permanently deleted`,
      });

      setDetailsOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error deleting user",
        description: error.message,
        variant: "destructive",
      });
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
        <div className="animate-pulse text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage users and KYC verification</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-lg">
            {users.length} Total Users
          </Badge>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Create User
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Search and manage platform users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
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
                          View
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
                          Edit
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
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View and manage user information
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{selectedUser.full_name || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedUser.phone || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Balance</Label>
                  <p className="font-medium text-primary">
                    ${selectedUser.balance_usdt.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">KYC Status</Label>
                  <Badge className={getKycBadgeColor(selectedUser.kyc_status)}>
                    {selectedUser.kyc_status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Joined</Label>
                  <p className="font-medium">
                    {format(new Date(selectedUser.created_at), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>

              {/* ID Card Section - Show for all KYC statuses */}
              {selectedUser.kyc_id_card_url && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">ID Card Document</h3>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleViewIdCard(selectedUser.kyc_id_card_url!)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Uploaded ID Card
                  </Button>
                </div>
              )}

              {/* Password Reset Section */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  Password Management
                </h3>
                <div className="space-y-4">
                  {/* Set Password Directly */}
                  <div className="space-y-2">
                    <Label>Set New Password</Label>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="Enter new password (min 6 chars)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => handleSetPassword(selectedUser.email)}
                        disabled={setPasswordLoading || !newPassword}
                      >
                        {setPasswordLoading ? "Setting..." : "Set Password"}
                      </Button>
                    </div>
                  </div>

                  {/* Or Send Reset Email */}
                  <div className="text-center text-sm text-muted-foreground">or</div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full" disabled={resetLoading}>
                        <Mail className="h-4 w-4 mr-2" />
                        {resetLoading ? "Sending..." : "Send Password Reset Email"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Send Password Reset Email</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will send a password reset link to <strong>{selectedUser.email}</strong>. 
                          The user will be able to set a new password using that link.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handlePasswordReset(selectedUser.email)}>
                          Send Reset Email
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {selectedUser.kyc_status === "pending" && selectedUser.kyc_submitted_at && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">KYC Verification</h3>
                  <div className="space-y-3">
                    {selectedUser.kyc_id_card_url && (
                      <div>
                        <Label>Uploaded ID Card</Label>
                        <Button
                          variant="outline"
                          className="w-full mt-2"
                          onClick={() => handleViewIdCard(selectedUser.kyc_id_card_url!)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View ID Card Document
                        </Button>
                      </div>
                    )}
                    {!selectedUser.kyc_id_card_url && (
                      <div className="text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                        ⚠️ No ID card uploaded by user
                      </div>
                    )}
                    <div>
                      <Label>Admin Notes (Optional)</Label>
                      <Textarea
                        placeholder="Add notes about verification..."
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
                        Approve KYC
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleKycAction(selectedUser.id, "rejected")}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject KYC
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Management Actions */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Account Management</h3>
                <div className="flex gap-2">
                  {selectedUser.is_suspended === true ? (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleSuspendUser(selectedUser.id, selectedUser.email, false)}
                    >
                      <CheckCheck className="h-4 w-4 mr-2" />
                      Activate Account
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleSuspendUser(selectedUser.id, selectedUser.email, true)}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Suspend Account
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="flex-1">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete User
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the user account
                          for <strong>{selectedUser.email}</strong> and remove all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleDeleteUser(selectedUser.id, selectedUser.email)}
                        >
                          Delete Permanently
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
            <DialogTitle>Create New User</DialogTitle>
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
                    <SelectItem value="unverified">Unverified</SelectItem>
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
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
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
                      <SelectItem value="unverified">Unverified</SelectItem>
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
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
