import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, CheckCircle2, Loader2 } from "lucide-react";

interface BlockchainConfirmationProgressProps {
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
}

const REQUIRED_CONFIRMATIONS = 35;

export const BlockchainConfirmationProgress = ({
  transactionId,
  amount,
  currency,
  status,
}: BlockchainConfirmationProgressProps) => {
  const [confirmations, setConfirmations] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Simulate confirmations progressing over time
    const targetConfirmations = status === "approved" ? 18 : status === "completed" ? REQUIRED_CONFIRMATIONS : 12;
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current >= targetConfirmations) {
        clearInterval(interval);
        setIsAnimating(current < REQUIRED_CONFIRMATIONS);
      }
      setConfirmations(current);
    }, 200);

    return () => clearInterval(interval);
  }, [status]);

  const progress = Math.min((confirmations / REQUIRED_CONFIRMATIONS) * 100, 100);
  const isComplete = confirmations >= REQUIRED_CONFIRMATIONS;

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
            ) : isAnimating ? (
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
              {confirmations} / {REQUIRED_CONFIRMATIONS}
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
            Waiting for {REQUIRED_CONFIRMATIONS - confirmations} more confirmations before funds are released...
          </p>
        )}
      </CardContent>
    </Card>
  );
};
