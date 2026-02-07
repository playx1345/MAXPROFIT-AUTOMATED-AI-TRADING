import { memo } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useCountUp } from "@/hooks/useCountUp";
import { DollarSign, Users, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { icon: DollarSign, label: "Assets Managed", value: 5, prefix: "$", suffix: "M+", color: "text-primary" },
  { icon: Users, label: "Active Investors", value: 1250, suffix: "+", color: "text-accent" },
  { icon: TrendingUp, label: "Avg Monthly ROI", value: 15, suffix: "%", color: "text-success" },
  { icon: Zap, label: "Trades Executed", value: 10000, suffix: "+", color: "text-primary" },
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
        "flex flex-col items-center justify-center p-5 sm:p-8 rounded-2xl",
        "bg-card/60 border border-border/50 backdrop-blur-sm",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      )}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <div className={cn(
        "p-3 rounded-xl bg-primary/10 mb-3",
        "transition-all duration-300"
      )}>
        <Icon className={cn("w-6 h-6", stat.color)} aria-hidden="true" />
      </div>
      <div className={cn("text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight", stat.color)}>
        {stat.prefix}{count.toLocaleString()}{stat.suffix}
      </div>
      <div className="text-sm text-muted-foreground mt-1.5 text-center font-medium">{stat.label}</div>
    </div>
  );
});

StatItem.displayName = "StatItem";

export const UnifiedStats = memo(() => {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section ref={ref} className="py-12 sm:py-16 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {stats.map((stat, index) => (
            <StatItem key={stat.label} stat={stat} isVisible={isVisible} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
});

UnifiedStats.displayName = "UnifiedStats";
