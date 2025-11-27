import { useEffect, useState, useRef } from "react";

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  steps?: number;
}

const ANIMATION_DURATION_MS = 1000;
const ANIMATION_STEPS = 30;

const AnimatedNumber = ({ 
  value, 
  prefix = "", 
  suffix = "", 
  decimals = 2,
  duration = ANIMATION_DURATION_MS,
  steps = ANIMATION_STEPS,
}: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const stepValue = value / steps;
    let current = 0;
    
    timerRef.current = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [value, duration, steps]);
  
  return (
    <span className="animate-count-up">
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  );
};

export { AnimatedNumber };
