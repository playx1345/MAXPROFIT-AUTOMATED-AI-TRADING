import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, CheckCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface ApprovalInfo {
  id: string;
  admin_id: string;
  admin_email: string;
  approved_at: string;
  notes: string | null;
}

interface WithdrawalApprovalBadgeProps {
  amount: number;
  threshold: number;
  requiredApprovals: number;
  currentApprovals: ApprovalInfo[];
  currentAdminId: string;
}

export const WithdrawalApprovalBadge = ({
  amount,
  threshold,
  requiredApprovals,
  currentApprovals,
  currentAdminId,
}: WithdrawalApprovalBadgeProps) => {
  const isLargeWithdrawal = amount >= threshold;
  const approvalCount = currentApprovals.length;
  const hasApproved = currentApprovals.some((a) => a.admin_id === currentAdminId);
  const needsMoreApprovals = isLargeWithdrawal && approvalCount < requiredApprovals;

  if (!isLargeWithdrawal) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                approvalCount >= requiredApprovals
                  ? "border-green-500 text-green-600 bg-green-500/10"
                  : "border-yellow-500 text-yellow-600 bg-yellow-500/10"
              }
            >
              <Users className="h-3 w-3 mr-1" />
              {approvalCount}/{requiredApprovals} Approvals
            </Badge>
            {hasApproved && (
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                You approved
              </Badge>
            )}
            {needsMoreApprovals && !hasApproved && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Action needed
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <div className="space-y-2">
            <p className="font-semibold">
              Large withdrawal (&gt;${threshold.toLocaleString()}) requires {requiredApprovals} admin approvals
            </p>
            {currentApprovals.length > 0 ? (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Current approvals:</p>
                {currentApprovals.map((approval) => (
                  <div key={approval.id} className="text-xs">
                    • {approval.admin_email} ({format(new Date(approval.approved_at), "MMM dd, HH:mm")})
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No approvals yet</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
