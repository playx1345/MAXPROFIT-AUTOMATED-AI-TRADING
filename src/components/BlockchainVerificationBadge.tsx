import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import type { BlockchainVerificationResult } from "@/hooks/useBlockchainVerification";

interface BlockchainVerificationBadgeProps {
  verifying: boolean;
  result: BlockchainVerificationResult | null;
  showDetails?: boolean;
}

export const BlockchainVerificationBadge = ({
  verifying,
  result,
  showDetails = false,
}: BlockchainVerificationBadgeProps) => {
  if (verifying) {
    return (
      <Badge variant="outline" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Verifying...
      </Badge>
    );
  }

  if (!result) {
    return null;
  }

  if (result.error) {
    return (
      <div className="space-y-1">
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Verification Failed
        </Badge>
        {showDetails && (
          <p className="text-xs text-destructive">{result.error}</p>
        )}
      </div>
    );
  }

  if (!result.verified) {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        Not Found
      </Badge>
    );
  }

  if (result.confirmed) {
    return (
      <div className="space-y-1">
        <Badge className="gap-1 bg-green-600 hover:bg-green-700">
          <CheckCircle className="h-3 w-3" />
          Confirmed ({result.confirmations} confirmations)
        </Badge>
        {showDetails && result.amount !== null && (
          <p className="text-xs text-muted-foreground">
            Amount: {result.amount.toLocaleString()}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600">
        <Clock className="h-3 w-3" />
        Pending ({result.confirmations} confirmations)
      </Badge>
      {showDetails && (
        <p className="text-xs text-muted-foreground">
          Waiting for more confirmations
        </p>
      )}
    </div>
  );
};
