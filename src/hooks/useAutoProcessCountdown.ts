import { useState, useEffect } from "react";

const AUTO_PROCESS_HOURS = 24;

export function useAutoProcessCountdown(createdAt: string) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isEligible, setIsEligible] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const created = new Date(createdAt).getTime();
      const autoProcessTime = created + AUTO_PROCESS_HOURS * 60 * 60 * 1000;
      const now = Date.now();
      const remaining = autoProcessTime - now;

      if (remaining <= 0) {
        setTimeRemaining("Processing soon...");
        setIsEligible(true);
        return;
      }

      setIsEligible(false);

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [createdAt]);

  return { timeRemaining, isEligible };
}

export function getAutoProcessTime(createdAt: string): Date {
  return new Date(new Date(createdAt).getTime() + AUTO_PROCESS_HOURS * 60 * 60 * 1000);
}
