import { useEffect, useState } from "react";
import { DollarSign, TrendingUp } from "lucide-react";

export const ProfitCounter = () => {
  const [displayValue, setDisplayValue] = useState(12345678);
  
  useEffect(() => {
    // Simulate live profit counter increasing
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
    <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full neon-card border-success/30">
      <div className="p-2 rounded-full bg-success/20">
        <DollarSign className="w-5 h-5 text-success" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
          Total Profits Generated
        </span>
        <div className="flex items-center gap-2">
          <span className="text-lg sm:text-xl font-bold shimmer-text">
            {formattedValue}
          </span>
          <TrendingUp className="w-4 h-4 text-success animate-bounce-subtle" />
        </div>
      </div>
    </div>
  );
};
