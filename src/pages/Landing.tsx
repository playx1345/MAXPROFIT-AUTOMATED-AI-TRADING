import { lazy, Suspense, memo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, Shield, Bot, Users } from "lucide-react";
import { AnimatedHero } from "@/components/landing/AnimatedHero";
import { CryptoTicker } from "@/components/landing/CryptoTicker";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { InvestmentPlanCard } from "@/components/landing/InvestmentPlanCard";
import { Section } from "@/components/landing/Section";
import { Header } from "@/components/landing/Header";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Lazy load below-the-fold components for better performance
const StatsCounter = lazy(() => import("@/components/landing/StatsCounter").then(m => ({ default: m.StatsCounter })));
const MarketStats = lazy(() => import("@/components/landing/MarketStats").then(m => ({ default: m.MarketStats })));
const LiveTradingFeed = lazy(() => import("@/components/landing/LiveTradingFeed").then(m => ({ default: m.LiveTradingFeed })));
const TrustedPartners = lazy(() => import("@/components/landing/TrustedPartners").then(m => ({ default: m.TrustedPartners })));
const FAQ = lazy(() => import("@/components/landing/FAQ").then(m => ({ default: m.FAQ })));

// Loading skeleton component
const SectionSkeleton = memo(() => (
  <div className="py-20 animate-pulse">
    <div className="container mx-auto px-4 sm:px-6">
      <div className="h-10 bg-muted rounded w-1/3 mx-auto mb-4" />
      <div className="h-6 bg-muted rounded w-1/2 mx-auto mb-16" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-muted rounded-2xl" />
        ))}
      </div>
    </div>
  </div>
));

SectionSkeleton.displayName = "SectionSkeleton";

// How it works step component
const HowItWorksStep = memo(({ step, index }: { step: { num: string; title: string; desc: string }; index: number }) => (
  <div 
    className="text-center group"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div 
      className={cn(
        "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary text-primary-foreground",
        "flex items-center justify-center text-2xl sm:text-3xl font-bold mx-auto mb-4",
        "transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/25"
      )}
    >
      {step.num}
    </div>
    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
    <p className="text-sm text-muted-foreground">{step.desc}</p>
  </div>
));

HowItWorksStep.displayName = "HowItWorksStep";

const howItWorksSteps = [
  { num: "1", title: "Sign Up", desc: "Create account & complete KYC" },
  { num: "2", title: "Deposit", desc: "Add USDT securely" },
  { num: "3", title: "Choose Plan", desc: "Select your strategy" },
  { num: "4", title: "Earn", desc: "Track & withdraw profits" }
];

const Landing = () => {
  return (
    <div className="min-h-[100dvh] bg-background overflow-x-hidden">
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <Header />
      
      <main id="main-content">
        <AnimatedHero />
        <CryptoTicker />
        
        <Suspense fallback={<SectionSkeleton />}>
          <MarketStats />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <LiveTradingFeed />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <StatsCounter />
        </Suspense>

        {/* Features Section */}
        <Section 
          id="features" 
          title="Why Choose Live Win Trade?"
          subtitle="Advanced technology meets professional trading expertise"
          variant="muted"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <FeatureCard 
              icon={Bot} 
              title="AI Trading Bot" 
              description="Advanced algorithms analyze market trends and execute trades automatically with precision"
              index={0}
            />
            <FeatureCard 
              icon={Shield} 
              title="Secure Platform" 
              description="Bank-level security with KYC verification and encrypted transactions"
              index={1}
            />
            <FeatureCard 
              icon={TrendingUp} 
              title="Performance Tracking" 
              description="Real-time portfolio monitoring with detailed profit/loss analytics"
              index={2}
            />
            <FeatureCard 
              icon={Users} 
              title="Referral Program" 
              description="Earn generous bonuses when your referrals make their first deposit"
              index={3}
            />
          </div>
        </Section>

        <Suspense fallback={<SectionSkeleton />}>
          <TrustedPartners />
        </Suspense>

        {/* Investment Plans Section */}
        <Section
          id="plans"
          title="Investment Plans"
          subtitle="Choose a plan that matches your investment goals"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <InvestmentPlanCard 
              title="Starter Plan" 
              risk="Low Risk" 
              minInvestment="$100" 
              maxInvestment="$999" 
              expectedROI="5% - 15%" 
              features={[
                "Conservative trading strategies", 
                "Lower volatility exposure", 
                "Ideal for beginners", 
                "24/7 customer support", 
                "Monthly performance reports"
              ]} 
            />
            <InvestmentPlanCard 
              title="Growth Plan" 
              risk="Medium Risk" 
              minInvestment="$1,000" 
              maxInvestment="$4,999" 
              expectedROI="10% - 25%" 
              features={[
                "Balanced risk/reward ratio", 
                "Multiple trading strategies", 
                "Advanced market analysis", 
                "Priority customer support", 
                "Weekly performance reports"
              ]} 
              popular={true} 
            />
            <InvestmentPlanCard 
              title="Professional" 
              risk="High Risk" 
              minInvestment="$5,000" 
              maxInvestment="$50,000" 
              expectedROI="15% - 40%" 
              features={[
                "Aggressive trading strategies", 
                "Maximum potential returns", 
                "Dedicated account manager", 
                "VIP support 24/7", 
                "Daily performance reports"
              ]} 
            />
          </div>

          <p className="text-center text-sm text-muted-foreground mt-10 max-w-3xl mx-auto">
            * Expected ROI ranges are estimates based on historical market conditions and are not guaranteed.
          </p>
        </Section>

        {/* How It Works Section */}
        <Section
          id="how-it-works"
          title="How It Works"
          subtitle="Get started in four simple steps"
          variant="muted"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {howItWorksSteps.map((step, index) => (
              <HowItWorksStep key={index} step={step} index={index} />
            ))}
          </div>
        </Section>

        {/* FAQ Section */}
        <Section
          id="faq"
          title="Frequently Asked Questions"
          subtitle="Find answers to common questions"
        >
          <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
            <FAQ />
          </Suspense>
        </Section>
      </main>

      {/* Footer */}
      <footer 
        className="border-t border-border py-12 sm:py-16 bg-muted/30"
        role="contentinfo"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="font-bold text-xl mb-4">Live Win Trade</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Professional cryptocurrency investment platform with AI-powered automated trading.
              </p>
            </div>
            <nav aria-label="Platform links">
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Sign Up</Link></li>
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Sign In</Link></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              </ul>
            </nav>
            <nav aria-label="Legal links">
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#terms" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#privacy" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#risk" className="hover:text-foreground transition-colors">Risk Disclosure</a></li>
              </ul>
            </nav>
            <nav aria-label="Support links">
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
                <li><a href="#contact" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><Link to="/admin/login" className="hover:text-foreground transition-colors text-xs opacity-50 hover:opacity-100">Admin Portal</Link></li>
              </ul>
            </nav>
          </div>
          
          <div className="border-t border-border pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Live Win Trade Investment. All rights reserved.
            </p>
          </div>

          <Alert className="mt-8 bg-destructive/10 border-destructive/30" role="alert">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription className="text-sm">
              <strong>Risk Warning:</strong> Cryptocurrency investments carry significant risk. Past performance does not guarantee future results.
            </AlertDescription>
          </Alert>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
