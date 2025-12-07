import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, TrendingUp } from "lucide-react";
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
  glowColor = "from-primary to-primary-glow"
}: InvestmentPlanCardProps) => {
  return (
    <div className="relative group">
      {/* Glow effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${glowColor} rounded-2xl opacity-0 group-hover:opacity-60 blur-xl transition-all duration-500`} />
      
      <Card className="relative transform group-hover:-translate-y-2 transition-all duration-300 glass-card-enhanced border-primary/20 overflow-hidden hover:shadow-none hover:scale-100">
        {/* Gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        
        {/* Background pattern */}
        <div className="absolute top-0 right-0 opacity-5">
          <TrendingUp className="w-48 h-48 text-primary" />
        </div>

        {popular && (
          <div className="absolute top-4 right-4 z-20">
            <Badge className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground border-0 shadow-lg">
              POPULAR
            </Badge>
          </div>
        )}

        <CardHeader className="relative z-10">
          <CardTitle className="text-3xl mb-2 font-display">{title}</CardTitle>
        <CardDescription className="text-lg">
            <span className="font-semibold text-foreground">Risk Level:</span>{" "}
            <span className={`font-medium ${
              risk === "Low" || risk === "Low Risk" ? "text-success" : 
              risk === "Medium" || risk === "Medium Risk" ? "text-primary" : "text-destructive"
            }`}>
              {risk}
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-10 space-y-6">
          {/* Investment range */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border border-border/50">
              <span className="text-muted-foreground text-sm">Min Investment</span>
              <span className="text-xl font-bold text-primary">
                {minInvestment}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border border-border/50">
              <span className="text-muted-foreground text-sm">Max Investment</span>
              <span className="text-xl font-bold text-primary">
                {maxInvestment}
              </span>
            </div>
          </div>

          {/* Expected ROI */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Expected ROI</div>
            <div className="text-3xl font-bold font-display bg-gradient-to-r from-accent via-accent to-primary bg-clip-text text-transparent">
              {expectedROI}
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <Link to="/auth" className="block">
            <Button className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300">
              Start Investing
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
