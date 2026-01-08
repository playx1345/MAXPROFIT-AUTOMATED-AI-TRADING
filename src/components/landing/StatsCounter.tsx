import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useCountUp } from "@/hooks/useCountUp";
import { DollarSign, Users, TrendingUp, Zap } from "lucide-react";

const stats = [
  { icon: DollarSign, label: "Assets Under Management", value: 5000000, prefix: "$", suffix: "M+" },
  { icon: Users, label: "Active Investors", value: 1250, suffix: "+" },
  { icon: TrendingUp, label: "Average Monthly ROI", value: 15, suffix: "%" },
  { icon: Zap, label: "Successful Trades", value: 10000, suffix: "+" },
];

export const StatsCounter = () => {
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <section ref={ref} className="py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const displayValue = stat.value >= 1000000 ? stat.value / 1000000 : stat.value;
            const count = useCountUp(displayValue, 2500, 0, isVisible);
            
            return (
              <div
                key={index}
                className={`p-6 sm:p-8 rounded-2xl bg-card border border-border text-center transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">
                  {stat.prefix}{count.toLocaleString()}{stat.suffix}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
