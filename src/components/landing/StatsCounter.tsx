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
    <section ref={ref} className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const displayValue = stat.value >= 1000000 ? stat.value / 1000000 : stat.value;
            const count = useCountUp(displayValue, 2500, 0, isVisible);
            
            return (
              <Card
                key={index}
                className="group relative overflow-hidden glass-card hover:border-primary/40 transition-all duration-300 hover:scale-[1.02] p-6"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-4xl font-bold text-gradient mb-2">
                    {stat.prefix}{count.toLocaleString()}{stat.suffix}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
