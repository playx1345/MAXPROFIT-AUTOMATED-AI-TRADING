import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const COUNTDOWN_HOURS = 1;
const STORAGE_KEY = "blockchain_fee_countdown_start";

interface UseBlockchainFeeCountdownReturn {
  timeLeft: number;
  hasPendingWithdrawal: boolean;
  isExpired: boolean;
  formatTime: (seconds: number) => string;
  resetCountdown: () => void;
}

export const useBlockchainFeeCountdown = (): UseBlockchainFeeCountdownReturn => {
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_HOURS * 60 * 60);
  const [hasPendingWithdrawal, setHasPendingWithdrawal] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

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
    setTimeLeft(COUNTDOWN_HOURS * 60 * 60);
    setIsExpired(false);
  }, []);

  useEffect(() => {
    const checkPendingWithdrawals = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: pendingWithdrawals, error } = await supabase
          .from("transactions")
          .select("id, created_at")
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
          setHasPendingWithdrawal(false);
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
    formatTime,
    resetCountdown,
  };
};
