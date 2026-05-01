import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const WARNING_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const LOGOUT_TIMEOUT = 12 * 60 * 1000; // 12 minutes
const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"] as const;
const THROTTLE_MS = 30_000; // Only reset timers every 30s max

export const useSessionTimeout = () => {
  const [showWarning, setShowWarning] = useState(false);
  const warningTimer = useRef<ReturnType<typeof setTimeout>>();
  const logoutTimer = useRef<ReturnType<typeof setTimeout>>();
  const lastActivity = useRef(Date.now());
  const navigate = useNavigate();
  const { toast } = useToast();

  const clearTimers = useCallback(() => {
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
  }, []);

  const handleLogout = useCallback(async () => {
    clearTimers();
    setShowWarning(false);
    await supabase.auth.signOut();
    toast({
      title: "Session Expired",
      description: "You have been logged out due to inactivity.",
      variant: "destructive",
    });
    navigate("/auth", { replace: true });
  }, [clearTimers, navigate, toast]);

  const resetTimers = useCallback(() => {
    const now = Date.now();
    if (now - lastActivity.current < THROTTLE_MS && !showWarning) return;
    lastActivity.current = now;

    clearTimers();
    setShowWarning(false);

    warningTimer.current = setTimeout(() => {
      setShowWarning(true);
    }, WARNING_TIMEOUT);

    logoutTimer.current = setTimeout(() => {
      handleLogout();
    }, LOGOUT_TIMEOUT);
  }, [clearTimers, handleLogout, showWarning]);

  const dismissWarning = useCallback(() => {
    setShowWarning(false);
    lastActivity.current = 0; // Force timer reset
    resetTimers();
  }, [resetTimers]);

  useEffect(() => {
    // Initial timer setup
    lastActivity.current = 0;
    resetTimers();

    const handler = () => resetTimers();
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, handler, { passive: true }));

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, handler));
    };
  }, [resetTimers, clearTimers]);

  return { showWarning, dismissWarning };
};
