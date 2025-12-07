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
import { TrendingUp, DollarSign, AlertTriangle } from "lucide-react";

const UPGRADE_FEE_THRESHOLD = 40000;
const UPGRADE_FEE_AMOUNT = 1000;
const SESSION_KEY = "upgrade_fee_notification_shown";

export const UpgradeFeeNotification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [totalProfit, setTotalProfit] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUpgradeFeeConditions = async () => {
      // Check if already shown this session
      if (sessionStorage.getItem(SESSION_KEY)) {
        return;
      }

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

        // Calculate total profit from investments
        const { data: investments } = await supabase
          .from("investments")
          .select("amount_usdt, current_value, status")
          .eq("user_id", user.id);

        if (!investments || investments.length === 0) return;

        const calculatedProfit = investments.reduce((total, inv) => {
          const profit = inv.current_value - inv.amount_usdt;
          return total + (profit > 0 ? profit : 0);
        }, 0);

        setTotalProfit(calculatedProfit);

        // Show dialog if profit exceeds threshold
        if (calculatedProfit > UPGRADE_FEE_THRESHOLD) {
          setIsOpen(true);
          sessionStorage.setItem(SESSION_KEY, "true");
        }
      } catch (error) {
        console.error("Error checking upgrade fee conditions:", error);
      }
    };

    checkUpgradeFeeConditions();
  }, []);

  const handleDepositNow = () => {
    setIsOpen(false);
    navigate("/dashboard/deposit");
  };

  const handleRemindLater = () => {
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Account Upgrade Required
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground mb-2">
                Your Total Profit
              </p>
              <p className="text-2xl font-bold text-foreground">
                ${totalProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-left">
                Congratulations! Your profits have exceeded <strong>${UPGRADE_FEE_THRESHOLD.toLocaleString()}</strong>. 
                To continue trading and withdraw your earnings, an upgrade fee of{" "}
                <strong>${UPGRADE_FEE_AMOUNT.toLocaleString()}</strong> is required.
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              This one-time fee unlocks premium account features and ensures 
              seamless withdrawals of your profits.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <Button 
            onClick={handleDepositNow} 
            className="w-full gap-2"
            size="lg"
          >
            <DollarSign className="h-4 w-4" />
            Deposit ${UPGRADE_FEE_AMOUNT.toLocaleString()} Now
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleRemindLater}
            className="w-full text-muted-foreground"
          >
            Remind Me Later
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
