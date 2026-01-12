import { memo, useMemo } from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Sparkline } from "@/components/ui/sparkline";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  description?: string;
  icon: LucideIcon;
  trend?: number;
  sparklineData?: number[];
  colorClass?: string;
  iconBgClass?: string;
  borderClass?: string;
  isInteger?: boolean;
  className?: string;
  mounted?: boolean;
  delay?: number;
}

export const StatCard = memo(({
  title,
  value,
  prefix = "$",
  suffix = "",
  description,
  icon: Icon,
  trend,
  sparklineData,
  colorClass = "text-primary",
  iconBgClass = "bg-primary/10",
  borderClass = "border-primary/30",
  isInteger = false,
  className,
  mounted = true,
  delay = 0,
}: StatCardProps) => {
  const trendColor = useMemo(() => {
    if (trend === undefined) return "";
    return trend >= 0 ? "text-success" : "text-destructive";
  }, [trend]);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-500",
        "glass-card-enhanced hover:border-primary/40",
        borderClass,
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
      
      {/* Hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn(
          "p-2.5 rounded-xl transition-all duration-300",
          "group-hover:scale-110 group-hover:rotate-3",
          iconBgClass
        )}>
          <Icon className={cn("h-4 w-4", colorClass)} />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-end justify-between gap-2">
          <div className="flex-1">
            <div className={cn("text-2xl font-bold font-display", colorClass)}>
              {isInteger ? (
                <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={0} />
              ) : (
                <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
              )}
            </div>
            
            {/* Trend indicator */}
            {trend !== undefined && (
              <div className={cn("text-xs font-medium mt-1 flex items-center gap-1", trendColor)}>
                <span>{trend >= 0 ? "↑" : "↓"}</span>
                <span>{Math.abs(trend).toFixed(1)}%</span>
              </div>
            )}
            
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          
          {/* Sparkline */}
          {sparklineData && sparklineData.length > 0 && (
            <div className="w-20 h-10">
              <Sparkline data={sparklineData} height={40} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

StatCard.displayName = "StatCard";
