import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  className?: string;
  color?: "primary" | "success" | "destructive" | "accent";
  height?: number;
  showDots?: boolean;
  animated?: boolean;
}

const colorClasses = {
  primary: {
    line: "stroke-primary",
    fill: "fill-primary/20",
    dot: "fill-primary",
  },
  success: {
    line: "stroke-success",
    fill: "fill-success/20",
    dot: "fill-success",
  },
  destructive: {
    line: "stroke-destructive",
    fill: "fill-destructive/20",
    dot: "fill-destructive",
  },
  accent: {
    line: "stroke-accent",
    fill: "fill-accent/20",
    dot: "fill-accent",
  },
};

export const Sparkline = memo(({
  data,
  className,
  color = "primary",
  height = 40,
  showDots = false,
  animated = true,
}: SparklineProps) => {
  const { linePath, areaPath, points, trend } = useMemo(() => {
    if (data.length < 2) return { linePath: "", areaPath: "", points: [], trend: 0 };
    
    const width = 100;
    const padding = 4;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const normalizedPoints = data.map((value, index) => ({
      x: padding + (index / (data.length - 1)) * (width - padding * 2),
      y: padding + (1 - (value - min) / range) * (height - padding * 2),
    }));
    
    // Create smooth curve using bezier
    let linePath = `M ${normalizedPoints[0].x} ${normalizedPoints[0].y}`;
    
    for (let i = 0; i < normalizedPoints.length - 1; i++) {
      const p0 = normalizedPoints[i];
      const p1 = normalizedPoints[i + 1];
      const midX = (p0.x + p1.x) / 2;
      linePath += ` Q ${p0.x + (midX - p0.x) / 2} ${p0.y} ${midX} ${(p0.y + p1.y) / 2}`;
      linePath += ` Q ${midX + (p1.x - midX) / 2} ${p1.y} ${p1.x} ${p1.y}`;
    }
    
    // Area path
    const lastPoint = normalizedPoints[normalizedPoints.length - 1];
    const firstPoint = normalizedPoints[0];
    const areaPath = `${linePath} L ${lastPoint.x} ${height} L ${firstPoint.x} ${height} Z`;
    
    const trend = data[data.length - 1] - data[0];
    
    return { linePath, areaPath, points: normalizedPoints, trend };
  }, [data, height]);

  const colors = colorClasses[trend >= 0 ? "success" : "destructive"] || colorClasses[color];

  return (
    <svg 
      viewBox={`0 0 100 ${height}`} 
      className={cn("w-full", className)}
      preserveAspectRatio="none"
    >
      {/* Gradient fill */}
      <defs>
        <linearGradient id={`sparkline-gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" className={colors.fill} stopOpacity="0.6" />
          <stop offset="100%" className={colors.fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Area fill */}
      <path
        d={areaPath}
        fill={`url(#sparkline-gradient-${color})`}
        className={cn(animated && "animate-fade-in")}
      />
      
      {/* Line */}
      <path
        d={linePath}
        fill="none"
        className={cn(colors.line, "stroke-[2]", animated && "animate-fade-in")}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Dots */}
      {showDots && points.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="2"
          className={cn(colors.dot, animated && "animate-scale-in")}
          style={{ animationDelay: `${i * 50}ms` }}
        />
      ))}
      
      {/* End dot (last value) */}
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="3"
          className={cn(colors.dot)}
        />
      )}
    </svg>
  );
});

Sparkline.displayName = "Sparkline";

// Mini sparkline bars for quick stats
export const SparklineBars = memo(({
  data,
  className,
  color = "primary",
}: Omit<SparklineProps, "height" | "showDots">) => {
  const max = Math.max(...data, 1);
  const colors = colorClasses[color];
  
  return (
    <div className={cn("flex items-end gap-0.5 h-5", className)}>
      {data.slice(-10).map((value, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-t-sm transition-all duration-300",
            colors.fill,
            "bg-current"
          )}
          style={{
            height: `${(value / max) * 100}%`,
            animationDelay: `${i * 30}ms`,
          }}
        />
      ))}
    </div>
  );
});

SparklineBars.displayName = "SparklineBars";
