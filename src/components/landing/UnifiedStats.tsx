import { memo } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useCountUp } from "@/hooks/useCountUp";
import { Users, TrendingUp, Shield, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { icon: Users, label: "Active Investors", value: 1250, suffix: "+", color: "text-primary" },
  { icon: TrendingUp, label: "Monthly Trades", value: 8500, suffix: "+", color: "text-success" },
  { icon: Shield, label: "Secured Assets", value: 5, prefix: "$", suffix: "M+", color: "text-accent" },
  { icon: Clock, label: "Uptime", value: 99, suffix: ".9%", color: "text-primary" },
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
        "bg-card/60 border border-border/50",
        "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      )}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <div className="p-3 rounded-xl bg-primary/10 mb-3">
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
