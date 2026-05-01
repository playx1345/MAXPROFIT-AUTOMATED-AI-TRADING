import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Activity, KeyRound, UserCheck, UserX, DollarSign, Ban, UserPlus, Edit, Trash2, CheckCheck } from "lucide-react";
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

const actionKeyMap: Record<string, string> = {
  password_reset: "admin.activityLog.actions.passwordReset",
  password_set: "admin.activityLog.actions.passwordSet",
  kyc_verified: "admin.activityLog.actions.kycApproved",
  kyc_rejected: "admin.activityLog.actions.kycRejected",
  deposit_approved: "admin.activityLog.actions.depositApproved",
  deposit_rejected: "admin.activityLog.actions.depositRejected",
  withdrawal_approved: "admin.activityLog.actions.withdrawalApproved",
  withdrawal_rejected: "admin.activityLog.actions.withdrawalRejected",
  balance_update: "admin.activityLog.actions.balanceUpdated",
  user_created: "admin.activityLog.actions.userCreated",
  user_updated: "admin.activityLog.actions.userUpdated",
  user_deleted: "admin.activityLog.actions.userDeleted",
  user_suspended: "admin.activityLog.actions.userSuspended",
  user_activated: "admin.activityLog.actions.userActivated",
};

const actionIconMap: Record<string, { icon: React.ReactNode; color: string }> = {
  password_reset: { icon: <KeyRound className="h-4 w-4" />, color: "bg-blue-500" },
  password_set: { icon: <KeyRound className="h-4 w-4" />, color: "bg-blue-500" },
  kyc_verified: { icon: <UserCheck className="h-4 w-4" />, color: "bg-green-500" },
  kyc_rejected: { icon: <UserX className="h-4 w-4" />, color: "bg-red-500" },
  deposit_approved: { icon: <DollarSign className="h-4 w-4" />, color: "bg-green-500" },
  deposit_rejected: { icon: <Ban className="h-4 w-4" />, color: "bg-red-500" },
  withdrawal_approved: { icon: <DollarSign className="h-4 w-4" />, color: "bg-green-500" },
  withdrawal_rejected: { icon: <Ban className="h-4 w-4" />, color: "bg-red-500" },
  balance_update: { icon: <DollarSign className="h-4 w-4" />, color: "bg-yellow-500" },
  user_created: { icon: <UserPlus className="h-4 w-4" />, color: "bg-green-500" },
  user_updated: { icon: <Edit className="h-4 w-4" />, color: "bg-blue-500" },
  user_deleted: { icon: <Trash2 className="h-4 w-4" />, color: "bg-red-500" },
  user_suspended: { icon: <Ban className="h-4 w-4" />, color: "bg-orange-500" },
  user_activated: { icon: <CheckCheck className="h-4 w-4" />, color: "bg-green-500" },
};

const AdminActivityLog = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();

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
        title: t('admin.activityLog.errorFetching'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionDisplay = (action: string) => {
    const key = actionKeyMap[action];
    const label = key ? t(key) : action.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    const iconConfig = actionIconMap[action] || { icon: <Activity className="h-4 w-4" />, color: "bg-muted" };
    return { label, ...iconConfig };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">{t('admin.activityLog.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.activityLog.title')}</h1>
          <p className="text-muted-foreground">{t('admin.activityLog.subtitle')}</p>
        </div>
        <Badge variant="secondary" className="text-lg">
          {t('admin.activityLog.actionsCount', { count: logs.length })}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t('admin.activityLog.recentActivity')}
          </CardTitle>
          <CardDescription>{t('admin.activityLog.recentActivityDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('admin.activityLog.noLogs')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.activityLog.action')}</TableHead>
                    <TableHead>{t('admin.activityLog.admin')}</TableHead>
                    <TableHead>{t('admin.activityLog.target')}</TableHead>
                    <TableHead>{t('admin.activityLog.details')}</TableHead>
                    <TableHead>{t('admin.activityLog.time')}</TableHead>
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
