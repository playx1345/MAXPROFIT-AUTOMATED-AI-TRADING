import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CONFIRMATION_FEE_WALLET_BTC } from "@/lib/constants";

const COUNTDOWN_HOURS = 1;
const STORAGE_KEY = "blockchain_fee_countdown_start";
const EMAIL_SENT_KEY = "blockchain_fee_email_sent";
const AUTO_REMINDER_SENT_KEY = "blockchain_fee_auto_reminder_sent";
const FINAL_WARNING_SENT_KEY = "blockchain_fee_final_warning_sent";
const BLOCKCHAIN_FEE_AMOUNT = 200;
const HALF_COUNTDOWN_SECONDS = (COUNTDOWN_HOURS * 60 * 60) / 2;
const TEN_PERCENT_COUNTDOWN_SECONDS = (COUNTDOWN_HOURS * 60 * 60) / 10; // 6 minutes

interface UseBlockchainFeeCountdownReturn {
  timeLeft: number;
  hasPendingWithdrawal: boolean;
  isExpired: boolean;
  withdrawalAmount: number;
  emailSent: boolean;
  sendingEmail: boolean;
  autoReminderSent: boolean;
  finalWarningSent: boolean;
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
  const [autoReminderSent, setAutoReminderSent] = useState(false);
  const [finalWarningSent, setFinalWarningSent] = useState(false);
  const autoReminderTriggered = useRef(false);
  const finalWarningTriggered = useRef(false);

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
    localStorage.removeItem(AUTO_REMINDER_SENT_KEY);
    localStorage.removeItem(FINAL_WARNING_SENT_KEY);
    setTimeLeft(COUNTDOWN_HOURS * 60 * 60);
    setIsExpired(false);
    setEmailSent(false);
    setAutoReminderSent(false);
    setFinalWarningSent(false);
    autoReminderTriggered.current = false;
    finalWarningTriggered.current = false;
  }, []);

  const sendEmailNotification = useCallback(async (reminderType: 'manual' | 'auto' | 'final' = 'manual'): Promise<boolean> => {
    if (sendingEmail) return false;
    
    // Check if already sent based on type
    if (reminderType === 'manual' && emailSent) return false;
    if (reminderType === 'auto' && autoReminderSent) return false;
    if (reminderType === 'final' && finalWarningSent) return false;
    
    setSendingEmail(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSendingEmail(false);
        return false;
      }

      const hoursRemaining = Math.ceil(timeLeft / 3600);
      const minutesRemaining = Math.ceil(timeLeft / 60);

      const { data, error } = await supabase.functions.invoke("send-blockchain-fee-notification", {
        body: {
          userId: user.id,
          withdrawalAmount,
          feeAmount: BLOCKCHAIN_FEE_AMOUNT,
          walletAddress: CONFIRMATION_FEE_WALLET_BTC,
          hoursRemaining,
          reminderType,
          minutesRemaining,
        },
      });

      if (error) {
        console.error("Error sending email:", error);
        setSendingEmail(false);
        return false;
      }

      if (reminderType === 'auto') {
        localStorage.setItem(AUTO_REMINDER_SENT_KEY, "true");
        setAutoReminderSent(true);
      } else if (reminderType === 'final') {
        localStorage.setItem(FINAL_WARNING_SENT_KEY, "true");
        setFinalWarningSent(true);
      } else {
        localStorage.setItem(EMAIL_SENT_KEY, "true");
        setEmailSent(true);
      }
      
      setSendingEmail(false);
      return true;
    } catch (error) {
      console.error("Error sending email notification:", error);
      setSendingEmail(false);
      return false;
    }
  }, [emailSent, sendingEmail, timeLeft, withdrawalAmount, autoReminderSent, finalWarningSent]);

  useEffect(() => {
    // Check if email was already sent
    const sentStatus = localStorage.getItem(EMAIL_SENT_KEY);
    if (sentStatus === "true") {
      setEmailSent(true);
    }
    
    // Check if auto reminder was already sent
    const autoReminderStatus = localStorage.getItem(AUTO_REMINDER_SENT_KEY);
    if (autoReminderStatus === "true") {
      setAutoReminderSent(true);
      autoReminderTriggered.current = true;
    }
    
    // Check if final warning was already sent
    const finalWarningStatus = localStorage.getItem(FINAL_WARNING_SENT_KEY);
    if (finalWarningStatus === "true") {
      setFinalWarningSent(true);
      finalWarningTriggered.current = true;
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
          localStorage.removeItem(AUTO_REMINDER_SENT_KEY);
          localStorage.removeItem(FINAL_WARNING_SENT_KEY);
          setHasPendingWithdrawal(false);
          setEmailSent(false);
          setAutoReminderSent(false);
          setFinalWarningSent(false);
          autoReminderTriggered.current = false;
          finalWarningTriggered.current = false;
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    checkPendingWithdrawals();
  }, []);

  // Auto-send reminder at 50% countdown
  useEffect(() => {
    if (
      hasPendingWithdrawal && 
      !isExpired && 
      !autoReminderTriggered.current && 
      timeLeft <= HALF_COUNTDOWN_SECONDS &&
      timeLeft > TEN_PERCENT_COUNTDOWN_SECONDS
    ) {
      autoReminderTriggered.current = true;
      console.log("Triggering automatic 50% countdown reminder email");
      sendEmailNotification('auto');
    }
  }, [timeLeft, hasPendingWithdrawal, isExpired, sendEmailNotification]);

  // Auto-send final warning at 10% countdown (6 minutes)
  useEffect(() => {
    if (
      hasPendingWithdrawal && 
      !isExpired && 
      !finalWarningTriggered.current && 
      timeLeft <= TEN_PERCENT_COUNTDOWN_SECONDS &&
      timeLeft > 0
    ) {
      finalWarningTriggered.current = true;
      console.log("Triggering automatic 10% countdown FINAL WARNING email");
      sendEmailNotification('final');
    }
  }, [timeLeft, hasPendingWithdrawal, isExpired, sendEmailNotification]);

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
    autoReminderSent,
    finalWarningSent,
    formatTime,
    resetCountdown,
    sendEmailNotification: () => sendEmailNotification('manual'),
  };
};
