import { memo } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useCountUp } from "@/hooks/useCountUp";
import { DollarSign, Users, TrendingUp, Zap, BarChart3, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { icon: BarChart3, label: "Market Cap", value: 2.4, prefix: "$", suffix: "T", color: "text-primary" },
  { icon: Activity, label: "24h Volume", value: 89, prefix: "$", suffix: "B", color: "text-accent" },
  { icon: DollarSign, label: "Assets Managed", value: 5, prefix: "$", suffix: "M+", color: "text-success" },
  { icon: Users, label: "Active Investors", value: 1250, suffix: "+", color: "text-primary" },
  { icon: TrendingUp, label: "Avg Monthly ROI", value: 15, suffix: "%", color: "text-success" },
  { icon: Zap, label: "Trades Executed", value: 10000, suffix: "+", color: "text-accent" },
];

const StatItem = memo(({ stat, isVisible, index }: { 
  stat: typeof stats[0]; 
  isVisible: boolean; 
  index: number;
}) => {
  const Icon = stat.icon;
  const count = useCountUp(stat.value, 2000, 0, isVisible);
  
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl",
        "bg-card/50 border border-border/50 backdrop-blur-sm",
        "transition-all duration-500",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6 mb-2", stat.color)} aria-hidden="true" />
      <div className={cn("text-xl sm:text-2xl lg:text-3xl font-bold", stat.color)}>
        {stat.prefix}{count.toLocaleString()}{stat.suffix}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground mt-1 text-center">{stat.label}</div>
    </div>
  );
});

StatItem.displayName = "StatItem";

export const UnifiedStats = memo(() => {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section ref={ref} className="py-8 sm:py-12 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <StatItem key={stat.label} stat={stat} isVisible={isVisible} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
});

UnifiedStats.displayName = "UnifiedStats";
