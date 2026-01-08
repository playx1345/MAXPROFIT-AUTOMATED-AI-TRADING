import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

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

export const InvestmentPlanCard = ({
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
    <div className={`relative group h-full ${popular ? 'scale-[1.02]' : ''}`}>
      {/* Popular highlight */}
      {popular && (
        <div className="absolute -inset-px bg-gradient-to-b from-primary to-primary/50 rounded-2xl" />
      )}
      
      <div className={`relative h-full flex flex-col p-6 sm:p-8 rounded-2xl bg-card border ${popular ? 'border-transparent' : 'border-border'} transition-all duration-300 hover:shadow-xl`}>
        {/* Popular badge */}
        {popular && (
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground border-0 px-4">
            MOST POPULAR
          </Badge>
        )}

        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className="text-sm">
            <span className="text-muted-foreground">Risk Level: </span>
            <span className={`font-semibold ${getRiskColor(risk)}`}>{risk}</span>
          </p>
        </div>

        {/* ROI */}
        <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Expected ROI</p>
          <p className="text-3xl font-bold text-primary">{expectedROI}</p>
        </div>

        {/* Investment range */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Min</p>
            <p className="text-lg font-bold">{minInvestment}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Max</p>
            <p className="text-lg font-bold">{maxInvestment}</p>
          </div>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8 flex-grow">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link to="/auth" className="block mt-auto">
          <Button className={`w-full h-12 font-semibold ${popular ? 'bg-primary hover:bg-primary/90' : 'bg-muted hover:bg-muted/80 text-foreground'}`}>
            Start Investing
          </Button>
        </Link>
      </div>
    </div>
  );
};
