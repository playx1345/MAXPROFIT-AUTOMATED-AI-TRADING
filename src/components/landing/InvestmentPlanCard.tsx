import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Bitcoin } from "lucide-react";
import { Link } from "react-router-dom";

interface InvestmentPlanCardProps {
  title: string;
  risk: string;
  minInvestment: string;
  maxInvestment: string;
  expectedROI: string;
  features: string[];
  popular?: boolean;
  delay?: number;
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
  delay = 0,
  glowColor = "from-blue-400 to-blue-600"
}: InvestmentPlanCardProps) => {
  return (
    <div 
      className="relative group animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Glow effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${glowColor} rounded-2xl opacity-0 group-hover:opacity-75 blur-xl transition-all duration-500 animate-glow`} />
      
      <Card className="relative transform group-hover:-translate-y-2 transition-all duration-300 backdrop-blur-md bg-card/80 border-primary/30 overflow-hidden">
        {/* Bitcoin watermark */}
        <div className="absolute top-0 right-0 opacity-5">
          <Bitcoin className="w-48 h-48 text-primary" />
        </div>

        {popular && (
          <div className="absolute top-4 right-4 z-20">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-background animate-pulse">
              POPULAR
            </Badge>
          </div>
        )}

        <CardHeader className="relative z-10">
          <CardTitle className="text-3xl mb-2">{title}</CardTitle>
          <CardDescription className="text-lg">
            <span className="font-semibold text-foreground">Risk Level:</span> {risk}
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-10 space-y-6">
          {/* Investment range */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Min Investment</span>
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {minInvestment}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Max Investment</span>
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {maxInvestment}
              </span>
            </div>
          </div>

          {/* Expected ROI */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Expected ROI</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
              {expectedROI}
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <Link to="/auth" className="block">
            <Button className="w-full group/btn relative overflow-hidden bg-primary hover:bg-primary/90 shadow-elegant hover:shadow-glow transition-all duration-300">
              <span className="relative z-10">Start Investing</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-glow to-accent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
