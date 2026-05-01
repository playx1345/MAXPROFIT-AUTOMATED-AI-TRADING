import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BlockchainConfirmationProgressProps {
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  initialConfirmations?: number;
  initialRequired?: number;
}

export const BlockchainConfirmationProgress = ({
  transactionId,
  amount,
  currency,
  status,
  initialConfirmations = 0,
  initialRequired = 35,
}: BlockchainConfirmationProgressProps) => {
  const [confirmations, setConfirmations] = useState(initialConfirmations);
  const [requiredConfirmations, setRequiredConfirmations] = useState(initialRequired);

  useEffect(() => {
    setConfirmations(initialConfirmations);
    setRequiredConfirmations(initialRequired);
  }, [initialConfirmations, initialRequired]);

  // Subscribe to realtime updates for this transaction
  useEffect(() => {
    const channel = supabase
      .channel(`tx-confirmations-${transactionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
          filter: `id=eq.${transactionId}`,
        },
        (payload) => {
          const updated = payload.new as any;
          if (updated.blockchain_confirmations !== undefined) {
            setConfirmations(updated.blockchain_confirmations);
          }
          if (updated.required_confirmations !== undefined) {
            setRequiredConfirmations(updated.required_confirmations);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [transactionId]);

  const progress = requiredConfirmations > 0
    ? Math.min((confirmations / requiredConfirmations) * 100, 100)
    : 0;
  const isComplete = confirmations >= requiredConfirmations && requiredConfirmations > 0;
  const isConfirming = !isComplete && confirmations > 0;

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Blockchain Confirmation</p>
              <p className="text-xs text-muted-foreground">
                ${amount.toLocaleString()} {currency.toUpperCase()} Withdrawal
              </p>
            </div>
          </div>
          <Badge
            variant={isComplete ? "default" : "secondary"}
            className={isComplete ? "bg-green-600 hover:bg-green-700 gap-1" : "gap-1"}
          >
            {isComplete ? (
              <><CheckCircle2 className="h-3 w-3" /> Confirmed</>
            ) : isConfirming ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Confirming</>
            ) : (
              <><Clock className="h-3 w-3" /> Pending</>
            )}
          </Badge>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Confirmation Progress</span>
            <span className="font-mono font-semibold text-foreground">
              {confirmations} / {requiredConfirmations}
            </span>
          </div>
          <Progress value={progress} className="h-2.5" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Network: TRON (TRC-20)</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {!isComplete && (
          <p className="text-xs text-muted-foreground/80 italic">
            Waiting for {requiredConfirmations - confirmations} more confirmations before funds are released...
          </p>
        )}
      </CardContent>
    </Card>
  );
};
