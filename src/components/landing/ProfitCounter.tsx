import { useEffect, useState, memo } from "react";
import { DollarSign, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const ProfitCounter = memo(() => {
  const [displayValue, setDisplayValue] = useState(12345678);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayValue(prev => prev + Math.floor(Math.random() * 100) + 10);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const formattedValue = displayValue.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <div className={cn(
      "inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl",
      "bg-card/60 border border-success/20 backdrop-blur-sm",
      "shadow-md shadow-success/5"
    )}>
      <div className="p-2 rounded-xl bg-success/15">
        <DollarSign className="w-5 h-5 text-success" aria-hidden="true" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
          Total Profits Generated
        </span>
        <div className="flex items-center gap-2">
          <span className="text-lg sm:text-xl font-bold text-gradient">
            {formattedValue}
          </span>
          <TrendingUp className="w-4 h-4 text-success" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
});

ProfitCounter.displayName = "ProfitCounter";
