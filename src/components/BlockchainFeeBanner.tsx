import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const BLOCKCHAIN_FEE_AMOUNT = 200;

export const BlockchainFeeBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasPendingWithdrawal, setHasPendingWithdrawal] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const checkPendingWithdrawals = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: pendingWithdrawals, error } = await supabase
          .from("transactions")
          .select("id")
          .eq("user_id", user.id)
          .eq("type", "withdrawal")
          .eq("status", "pending")
          .limit(1);

        if (error) {
          console.error("Error checking withdrawals:", error);
          return;
        }

        if (pendingWithdrawals && pendingWithdrawals.length > 0) {
          setHasPendingWithdrawal(true);
          setIsVisible(true);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    checkPendingWithdrawals();
  }, []);

  const handleClick = () => {
    navigate("/dashboard/deposit");
  };

  if (!hasPendingWithdrawal || !isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-2 shadow-lg animate-fade-in">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div 
          className="flex items-center gap-3 flex-1 cursor-pointer"
          onClick={handleClick}
        >
          <AlertTriangle className="h-5 w-5 animate-pulse shrink-0" />
          <p className="text-sm font-medium">
            {t("blockchainFee.bannerText", "⚠️ Complete payment of ${{amount}} USDT for blockchain confirmation fee to process your withdrawal", { amount: BLOCKCHAIN_FEE_AMOUNT })}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
          className="p-1 hover:bg-destructive-foreground/20 rounded transition-colors shrink-0"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
