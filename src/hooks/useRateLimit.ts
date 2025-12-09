import { useState, useCallback } from "react";

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  storageKey: string;
}

interface RateLimitState {
  attempts: number;
  firstAttemptTime: number;
}

export const useRateLimit = (config: RateLimitConfig) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const getState = useCallback((): RateLimitState => {
    try {
      const stored = localStorage.getItem(config.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parsing errors
    }
    return { attempts: 0, firstAttemptTime: 0 };
  }, [config.storageKey]);

  const setState = useCallback((state: RateLimitState) => {
    localStorage.setItem(config.storageKey, JSON.stringify(state));
  }, [config.storageKey]);

  const clearState = useCallback(() => {
    localStorage.removeItem(config.storageKey);
    setIsBlocked(false);
    setRemainingTime(0);
  }, [config.storageKey]);

  const checkRateLimit = useCallback((): { allowed: boolean; waitTime: number } => {
    const now = Date.now();
    const state = getState();

    // Check if window has expired
    if (state.firstAttemptTime && now - state.firstAttemptTime > config.windowMs) {
      clearState();
      return { allowed: true, waitTime: 0 };
    }

    // Check if max attempts reached
    if (state.attempts >= config.maxAttempts) {
      const waitTime = Math.ceil((config.windowMs - (now - state.firstAttemptTime)) / 1000);
      setIsBlocked(true);
      setRemainingTime(waitTime);
      return { allowed: false, waitTime };
    }

    return { allowed: true, waitTime: 0 };
  }, [getState, clearState, config.maxAttempts, config.windowMs]);

  const recordAttempt = useCallback(() => {
    const now = Date.now();
    const state = getState();

    // Reset if window expired
    if (state.firstAttemptTime && now - state.firstAttemptTime > config.windowMs) {
      setState({ attempts: 1, firstAttemptTime: now });
      return;
    }

    // First attempt in window
    if (state.attempts === 0) {
      setState({ attempts: 1, firstAttemptTime: now });
      return;
    }

    // Increment attempts
    const newAttempts = state.attempts + 1;
    setState({ ...state, attempts: newAttempts });

    // Check if now blocked
    if (newAttempts >= config.maxAttempts) {
      const waitTime = Math.ceil((config.windowMs - (now - state.firstAttemptTime)) / 1000);
      setIsBlocked(true);
      setRemainingTime(waitTime);
    }
  }, [getState, setState, config.maxAttempts, config.windowMs]);

  const formatRemainingTime = useCallback((seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? "s" : ""}`;
    }
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }, []);

  return {
    isBlocked,
    remainingTime,
    checkRateLimit,
    recordAttempt,
    clearState,
    formatRemainingTime,
  };
};
