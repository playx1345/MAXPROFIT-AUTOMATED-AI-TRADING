import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, AlertTriangle } from "lucide-react";

const UPGRADE_FEE_THRESHOLD = 50000;
const UPGRADE_FEE_AMOUNT = 1000;
const DEADLINE_HOURS = 3;

export const UpgradeFeeNotification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: DEADLINE_HOURS, minutes: 0, seconds: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const checkUpgradeFeeConditions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("kyc_status, upgrade_fee_paid")
          .eq("id", user.id)
          .single();

        if (!profile) return;

        // Check conditions: KYC verified AND upgrade fee not paid
        if (profile.kyc_status !== "verified" || profile.upgrade_fee_paid) {
          return;
        }

        // Calculate total investment amount
        const { data: investments } = await supabase
          .from("investments")
          .select("amount_usdt, status")
          .eq("user_id", user.id);

        if (!investments || investments.length === 0) return;

        const calculatedInvestment = investments.reduce((total, inv) => {
          return total + Number(inv.amount_usdt);
        }, 0);

        setTotalInvestment(calculatedInvestment);

        // Show dialog if investment exceeds threshold
        if (calculatedInvestment > UPGRADE_FEE_THRESHOLD) {
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Error checking upgrade fee conditions:", error);
      }
    };

    checkUpgradeFeeConditions();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const totalSeconds = prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;
        if (totalSeconds <= 0) {
          clearInterval(timer);
          return { hours: 0, minutes: 0, seconds: 0 };
        }
        return {
          hours: Math.floor(totalSeconds / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
          seconds: totalSeconds % 60
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleDepositNow = () => {
    setIsOpen(false);
    navigate("/dashboard/deposit");
  };

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-md border-destructive/50">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-destructive/20 animate-pulse">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-xl text-destructive">
            ⚠️ URGENT: Account Suspension Warning
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-4">
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <p className="text-sm text-muted-foreground mb-2">
                Time Remaining to Complete Upgrade
              </p>
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-5 w-5 text-destructive animate-pulse" />
                <p className="text-3xl font-bold text-destructive font-mono">
                  {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground mb-2">
                Your Total Investment
              </p>
              <p className="text-2xl font-bold text-foreground">
                ${totalInvestment.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-left font-medium">
                Your total investment has exceeded <strong>${UPGRADE_FEE_THRESHOLD.toLocaleString()}</strong>. 
                An upgrade fee of <strong>${UPGRADE_FEE_AMOUNT.toLocaleString()}</strong> is required within the time shown above, 
                or <span className="text-destructive font-bold">YOUR ACCOUNT WILL BE SUSPENDED</span>.
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Complete the upgrade fee payment to continue trading and withdraw your earnings.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <Button 
            onClick={handleDepositNow} 
            className="w-full gap-2 bg-destructive hover:bg-destructive/90"
            size="lg"
          >
            <DollarSign className="h-4 w-4" />
            Pay ${UPGRADE_FEE_AMOUNT.toLocaleString()} Upgrade Fee Now
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Failure to complete payment will result in account suspension
          </p>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
