import { memo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface InvestmentPlanCardProps {
  title: string;
  risk: string;
  minInvestment: string;
  maxInvestment: string;
  expectedROI: string;
  features: string[];
  popular?: boolean;
  glowColor?: string;
}

export const InvestmentPlanCard = memo(({
  title,
  risk,
  minInvestment,
  maxInvestment,
  expectedROI,
  features,
  popular = false,
}: InvestmentPlanCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const getRiskColor = (riskLevel: string) => {
    if (riskLevel.toLowerCase().includes('low')) return 'text-success';
    if (riskLevel.toLowerCase().includes('medium')) return 'text-primary';
    return 'text-destructive';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <article
      ref={cardRef}
      className={cn(
        "relative group h-full",
        popular && "scale-[1.02] z-10"
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Popular highlight border */}
      {popular && (
        <div 
          className="absolute -inset-px bg-gradient-to-b from-primary to-primary/50 rounded-2xl"
          aria-hidden="true"
        />
      )}
      
      {/* Shine effect overlay */}
      {isHovered && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden z-20"
          aria-hidden="true"
        >
          <div
            className="absolute w-64 h-64 rounded-full bg-gradient-radial from-primary/20 to-transparent blur-xl transition-opacity duration-300"
            style={{
              left: mousePosition.x - 128,
              top: mousePosition.y - 128,
              opacity: isHovered ? 1 : 0,
            }}
          />
        </div>
      )}
      
      <div 
        className={cn(
          "relative h-full flex flex-col p-5 sm:p-6 lg:p-8 rounded-2xl bg-card border",
          "transition-all duration-300",
          popular ? "border-transparent" : "border-border hover:border-primary/30",
          "hover:shadow-xl"
        )}
      >
        {/* Popular badge */}
        {popular && (
          <Badge 
            className={cn(
              "absolute -top-3 left-1/2 -translate-x-1/2",
              "bg-primary text-primary-foreground border-0 px-4",
              "animate-pulse-soft"
            )}
          >
            MOST POPULAR
          </Badge>
        )}

        {/* Header */}
        <header className="mb-4 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-bold mb-2">{title}</h3>
          <p className="text-sm">
            <span className="text-muted-foreground">Risk Level: </span>
            <span className={cn("font-semibold", getRiskColor(risk))}>{risk}</span>
          </p>
        </header>

        {/* ROI */}
        <div 
          className={cn(
            "mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-muted/50 border border-border",
            "transition-all duration-300",
            "group-hover:border-primary/30 group-hover:bg-muted/70"
          )}
        >
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Expected ROI</p>
          <p className="text-2xl sm:text-3xl font-bold text-primary">{expectedROI}</p>
        </div>

        {/* Investment range - stacked on mobile */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-2 sm:p-3 rounded-lg bg-muted/30 border border-border/50 transition-colors group-hover:border-border">
            <p className="text-xs text-muted-foreground mb-0.5 sm:mb-1">Min</p>
            <p className="text-base sm:text-lg font-bold">{minInvestment}</p>
          </div>
          <div className="p-2 sm:p-3 rounded-lg bg-muted/30 border border-border/50 transition-colors group-hover:border-border">
            <p className="text-xs text-muted-foreground mb-0.5 sm:mb-1">Max</p>
            <p className="text-base sm:text-lg font-bold">{maxInvestment}</p>
          </div>
        </div>

        {/* Features */}
        <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 flex-grow" role="list">
          {features.map((feature, index) => (
            <li 
              key={index} 
              className="flex items-start gap-2 sm:gap-3"
            >
              <div 
                className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5",
                  "transition-all duration-300",
                  "group-hover:bg-primary/20"
                )}
              >
                <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" aria-hidden="true" />
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link to="/auth" className="block mt-auto">
          <Button 
            className={cn(
              "w-full min-h-[48px] sm:h-12 font-semibold transition-all duration-300",
              popular 
                ? "bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25" 
                : "bg-muted hover:bg-muted/80 text-foreground hover:text-primary"
            )}
          >
            Start Investing
          </Button>
        </Link>
      </div>
    </article>
  );
});

InvestmentPlanCard.displayName = "InvestmentPlanCard";
