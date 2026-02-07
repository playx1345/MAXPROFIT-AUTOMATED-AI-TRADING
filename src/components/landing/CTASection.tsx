import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Lock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const CTASection = memo(() => {
  const { ref, style } = useScrollReveal({
    direction: 'scale',
    duration: 900,
    threshold: 0.15,
  });

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="container mx-auto">
        <div 
          ref={ref as React.RefObject<HTMLDivElement>}
          style={style}
          className={cn(
            "relative max-w-4xl mx-auto rounded-3xl overflow-hidden",
            "bg-gradient-to-br from-primary/10 via-card to-accent/10",
            "border border-primary/20",
            "p-8 sm:p-12 lg:p-16"
          )}
        >
          {/* Decorative glow */}
          <div 
            className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"
            aria-hidden="true"
          />
          <div 
            className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-accent/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4"
            aria-hidden="true"
          />
          
          <div className="relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Ready to Start Your{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Trading Journey?
              </span>
            </h2>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto">
              Join thousands of investors already earning with our AI-powered trading platform. 
              Start with as little as $100.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className={cn(
                    "group w-full sm:w-auto min-h-[56px] px-10 text-base font-semibold",
                    "bg-primary hover:bg-primary/90",
                    "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40",
                    "transition-all duration-300 hover:-translate-y-0.5"
                  )}
                >
                  Create Free Account
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/auth" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  variant="outline"
                  className={cn(
                    "w-full sm:w-auto min-h-[56px] px-10 text-base font-semibold",
                    "border-border/80 hover:bg-muted/50",
                    "transition-all duration-300 hover:-translate-y-0.5"
                  )}
                >
                  View Investment Plans
                </Button>
              </Link>
            </div>
            
            {/* Trust badges - simplified */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-success" aria-hidden="true" />
                <span>Secure Platform</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-success" aria-hidden="true" />
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" aria-hidden="true" />
                <span>KYC Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

CTASection.displayName = "CTASection";
