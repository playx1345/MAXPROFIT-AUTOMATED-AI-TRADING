import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Search, Eye, CheckCircle, XCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  balance_usdt: number;
  kyc_status: string;
  kyc_submitted_at: string | null;
  created_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [kycReason, setKycReason] = useState("");
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
      const { error } = await supabase
        .from("profiles")
        .update({
          kyc_status: action,
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: `KYC ${action}`,
        description: `User KYC has been ${action}`,
      });

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
        <Badge variant="secondary" className="text-lg">
          {users.length} Total Users
        </Badge>
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

              {selectedUser.kyc_status === "pending" && selectedUser.kyc_submitted_at && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">KYC Verification</h3>
                  <div className="space-y-3">
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
