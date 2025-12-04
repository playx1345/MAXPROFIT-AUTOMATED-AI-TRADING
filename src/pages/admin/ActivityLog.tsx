import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Activity, KeyRound, UserCheck, UserX, DollarSign, Ban } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface ActivityLog {
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

const actionConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  password_reset: { label: "Password Reset", icon: <KeyRound className="h-4 w-4" />, color: "bg-blue-500" },
  kyc_verified: { label: "KYC Approved", icon: <UserCheck className="h-4 w-4" />, color: "bg-green-500" },
  kyc_rejected: { label: "KYC Rejected", icon: <UserX className="h-4 w-4" />, color: "bg-red-500" },
  deposit_approved: { label: "Deposit Approved", icon: <DollarSign className="h-4 w-4" />, color: "bg-green-500" },
  deposit_rejected: { label: "Deposit Rejected", icon: <Ban className="h-4 w-4" />, color: "bg-red-500" },
  withdrawal_approved: { label: "Withdrawal Approved", icon: <DollarSign className="h-4 w-4" />, color: "bg-green-500" },
  withdrawal_rejected: { label: "Withdrawal Rejected", icon: <Ban className="h-4 w-4" />, color: "bg-red-500" },
  balance_update: { label: "Balance Updated", icon: <DollarSign className="h-4 w-4" />, color: "bg-yellow-500" },
};

const AdminActivityLog = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching activity logs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionDisplay = (action: string) => {
    const config = actionConfig[action] || { 
      label: action.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()), 
      icon: <Activity className="h-4 w-4" />, 
      color: "bg-muted" 
    };
    return config;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading activity logs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activity Log</h1>
          <p className="text-muted-foreground">Track all admin actions on the platform</p>
        </div>
        <Badge variant="secondary" className="text-lg">
          {logs.length} Actions
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>All administrative actions are logged here for audit purposes</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activity logs yet. Admin actions will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const actionDisplay = getActionDisplay(log.action);
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge className={`${actionDisplay.color} flex items-center gap-1 w-fit`}>
                            {actionDisplay.icon}
                            {actionDisplay.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {log.admin_email}
                        </TableCell>
                        <TableCell>
                          {log.target_email || log.target_id || "-"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground">
                          {log.details ? JSON.stringify(log.details) : "-"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(log.created_at), "MMM dd, yyyy HH:mm")}
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

export default AdminActivityLog;
