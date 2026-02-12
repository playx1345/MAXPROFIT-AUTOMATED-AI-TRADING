import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, X, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useBlockchainFeeCountdown } from "@/hooks/useBlockchainFeeCountdown";
const BLOCKCHAIN_FEE_AMOUNT = 0;

export const BlockchainFeeBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { timeLeft, hasPendingWithdrawal, formatTime } = useBlockchainFeeCountdown();

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
          <div className="flex items-center gap-1 font-mono font-bold bg-destructive-foreground/20 px-2 py-1 rounded">
            <Clock className="h-4 w-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>
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
