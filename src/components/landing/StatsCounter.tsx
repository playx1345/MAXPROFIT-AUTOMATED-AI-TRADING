import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useCountUp } from "@/hooks/useCountUp";
import { DollarSign, Users, TrendingUp, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

const stats = [
  { icon: DollarSign, label: "Assets Under Management", value: 5000000, prefix: "$", suffix: "M+" },
  { icon: Users, label: "Active Investors", value: 1250, suffix: "+" },
  { icon: TrendingUp, label: "Average Monthly ROI", value: 15, suffix: "%" },
  { icon: Zap, label: "Successful Trades", value: 10000, suffix: "+" },
];

export const StatsCounter = () => {
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <section ref={ref} className="py-12 sm:py-16 md:py-20 relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const displayValue = stat.value >= 1000000 ? stat.value / 1000000 : stat.value;
            const count = useCountUp(displayValue, 2500, 0, isVisible);
            
            return (
              <Card
                key={index}
                className="group relative overflow-hidden backdrop-blur-md bg-card/50 border-primary/20 hover:border-primary/40 transition-all duration-500 hover:scale-105 hover:shadow-glow p-4 sm:p-5 md:p-6"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <Icon className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 mb-2 sm:mb-3 text-primary group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2 font-serif">
                    {stat.prefix}{count.toLocaleString()}{stat.suffix}
                  </div>
                  <div className="text-xs sm:text-sm text-foreground/80 font-serif">{stat.label}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};