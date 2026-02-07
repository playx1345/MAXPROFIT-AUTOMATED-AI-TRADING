import { memo } from "react";
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
  const getRiskColor = (riskLevel: string) => {
    if (riskLevel.toLowerCase().includes('low')) return 'text-success';
    if (riskLevel.toLowerCase().includes('medium')) return 'text-primary';
    return 'text-destructive';
  };

  return (
    <article
      className={cn(
        "relative group h-full",
        popular && "scale-[1.02] z-10"
      )}
    >
      {/* Popular gradient border */}
      {popular && (
        <div 
          className="absolute -inset-px bg-gradient-to-b from-primary via-primary/70 to-primary/40 rounded-2xl"
          aria-hidden="true"
        />
      )}
      
      <div 
        className={cn(
          "relative h-full flex flex-col p-6 sm:p-8 rounded-2xl bg-card border",
          "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          popular ? "border-transparent" : "border-border/60 hover:border-primary/30",
          "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
        )}
      >
        {/* Popular badge - gradient ribbon */}
        {popular && (
          <Badge 
            className={cn(
              "absolute -top-3.5 left-1/2 -translate-x-1/2",
              "bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 px-5 py-1 text-sm font-bold",
              "shadow-lg shadow-primary/30"
            )}
          >
            MOST POPULAR
          </Badge>
        )}

        {/* Header */}
        <header className="mb-5 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-bold mb-2">{title}</h3>
          <p className="text-sm">
            <span className="text-muted-foreground">Risk Level: </span>
            <span className={cn("font-semibold", getRiskColor(risk))}>{risk}</span>
          </p>
        </header>

        {/* ROI */}
        <div 
          className={cn(
            "mb-5 sm:mb-6 p-4 sm:p-5 rounded-xl",
            "bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10",
            "transition-all duration-300",
            "group-hover:from-primary/15 group-hover:to-primary/8"
          )}
        >
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Expected ROI</p>
          <p className="text-2xl sm:text-3xl font-bold text-primary">{expectedROI}</p>
        </div>

        {/* Investment range */}
        <div className="grid grid-cols-2 gap-3 mb-5 sm:mb-6">
          <div className="p-3 sm:p-4 rounded-xl bg-muted/30 border border-border/40">
            <p className="text-xs text-muted-foreground mb-1">Min</p>
            <p className="text-base sm:text-lg font-bold">{minInvestment}</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-muted/30 border border-border/40">
            <p className="text-xs text-muted-foreground mb-1">Max</p>
            <p className="text-base sm:text-lg font-bold">{maxInvestment}</p>
          </div>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8 flex-grow" role="list">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors duration-300 group-hover:bg-primary/20">
                <Check className="w-3 h-3 text-primary" aria-hidden="true" />
              </div>
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA - 56px on mobile */}
        <Link to="/auth" className="block mt-auto">
          <Button 
            className={cn(
              "w-full min-h-[56px] text-base font-semibold transition-all duration-300",
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
