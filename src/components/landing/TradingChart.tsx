import { memo, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ChartPoint {
  x: number;
  y: number;
}

export const TradingChart = memo(({ className }: { className?: string }) => {
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Generate realistic-looking trading chart data
    const generatePoints = () => {
      const numPoints = 50;
      const newPoints: ChartPoint[] = [];
      let y = 50;
      
      for (let i = 0; i < numPoints; i++) {
        const change = (Math.random() - 0.45) * 15; // Slight upward bias
        y = Math.max(20, Math.min(80, y + change));
        newPoints.push({
          x: (i / (numPoints - 1)) * 100,
          y: y,
        });
      }
      
      return newPoints;
    };

    setPoints(generatePoints());
    setTimeout(() => setIsLoaded(true), 100);

    // Animate the chart periodically
    const interval = setInterval(() => {
      setPoints(prev => {
        const newPoints = [...prev.slice(1)];
        const lastY = newPoints[newPoints.length - 1]?.y || 50;
        const change = (Math.random() - 0.45) * 10;
        const newY = Math.max(20, Math.min(80, lastY + change));
        
        return [
          ...newPoints.map((p, i) => ({ ...p, x: (i / (newPoints.length)) * 100 })),
          { x: 100, y: newY },
        ];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const pathD = points.length > 1
    ? points.reduce((acc, point, i) => {
        if (i === 0) return `M ${point.x} ${point.y}`;
        const prev = points[i - 1];
        const cpX = (prev.x + point.x) / 2;
        return `${acc} Q ${cpX} ${prev.y}, ${point.x} ${point.y}`;
      }, "")
    : "";

  const areaD = pathD && points.length > 0
    ? `${pathD} L 100 100 L 0 100 Z`
    : "";

  return (
    <div className={cn(
      "relative w-full h-full overflow-hidden rounded-xl",
      "bg-gradient-to-br from-card/50 to-card/30",
      "border border-primary/10",
      className
    )}>
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        {[20, 40, 60, 80].map(y => (
          <line
            key={`h-${y}`}
            x1="0%"
            y1={`${y}%`}
            x2="100%"
            y2={`${y}%`}
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="4 4"
            className="text-muted-foreground"
          />
        ))}
        {[20, 40, 60, 80].map(x => (
          <line
            key={`v-${x}`}
            x1={`${x}%`}
            y1="0%"
            x2={`${x}%`}
            y2="100%"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="4 4"
            className="text-muted-foreground"
          />
        ))}
      </svg>

      {/* Chart */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className={cn(
          "absolute inset-0 w-full h-full transition-opacity duration-700",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="50%" stopColor="hsl(var(--success))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path
          d={areaD}
          fill="url(#chartGradient)"
          className="transition-all duration-500"
        />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-500"
        />

        {/* Animated dot at the end */}
        {points.length > 0 && (
          <>
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="2"
              fill="hsl(var(--success))"
              className="animate-pulse-soft"
            />
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="4"
              fill="hsl(var(--success))"
              opacity="0.3"
              className="animate-ping"
            />
          </>
        )}
      </svg>

      {/* Price indicator */}
      <div className="absolute top-2 right-2 px-2 py-1 bg-success/20 rounded-md border border-success/30">
        <span className="text-xs font-mono text-success">+12.5%</span>
      </div>
    </div>
  );
});

TradingChart.displayName = "TradingChart";
