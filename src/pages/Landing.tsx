import { lazy, Suspense, memo } from "react";
import { TrendingUp, Shield, Bot, Users } from "lucide-react";
import { AnimatedHero } from "@/components/landing/AnimatedHero";
import { CryptoTicker } from "@/components/landing/CryptoTicker";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { InvestmentPlanCard } from "@/components/landing/InvestmentPlanCard";
import { Section } from "@/components/landing/Section";
import { Header } from "@/components/landing/Header";
import { ScrollRevealWrapper } from "@/components/landing/ScrollRevealWrapper";
import { ParallaxSection } from "@/components/landing/ParallaxSection";
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

// How it works step component with enhanced animations
const HowItWorksStep = memo(({ step, index }: { step: { num: string; title: string; desc: string }; index: number }) => (
  <ScrollRevealWrapper 
    direction="up" 
    delay={index * 150}
    className="text-center group"
  >
    <div className="relative">
      {/* Connector line */}
      {index < 3 && (
        <div 
          className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/30 to-primary/10"
          aria-hidden="true"
        />
      )}
      <div 
        className={cn(
          "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary text-primary-foreground",
          "flex items-center justify-center text-2xl sm:text-3xl font-bold mx-auto mb-4",
          "transition-all duration-500 relative z-10",
          "group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/30",
          "group-hover:rotate-3"
        )}
      >
        {step.num}
        {/* Glow ring */}
        <div 
          className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
          aria-hidden="true"
        />
      </div>
    </div>
    <h3 className="text-lg font-semibold mb-2 transition-colors duration-300 group-hover:text-primary">
      {step.title}
    </h3>
    <p className="text-sm text-muted-foreground">{step.desc}</p>
  </ScrollRevealWrapper>
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

        {/* Features Section with Parallax */}
        <Section 
          id="features" 
          title="Why Choose Live Win Trade?"
          subtitle="Advanced technology meets professional trading expertise"
          variant="muted"
          parallaxBackground
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-7xl mx-auto">
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
          parallaxBackground
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 max-w-6xl mx-auto px-2 sm:px-0">
            <ScrollRevealWrapper direction="up" delay={0}>
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
            </ScrollRevealWrapper>
            <ScrollRevealWrapper direction="up" delay={150}>
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
            </ScrollRevealWrapper>
            <ScrollRevealWrapper direction="up" delay={300}>
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
            </ScrollRevealWrapper>
          </div>

          <ScrollRevealWrapper direction="fade" delay={400}>
            <p className="text-center text-sm text-muted-foreground mt-10 max-w-3xl mx-auto">
              * Expected ROI ranges are estimates based on historical market conditions and are not guaranteed.
            </p>
          </ScrollRevealWrapper>
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
          parallaxBackground
        >
          <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
            <FAQ />
          </Suspense>
        </Section>
      </main>

      {/* Footer with reveal animation */}
      <footer 
        className="border-t border-border py-8 bg-muted/30 relative overflow-hidden"
        role="contentinfo"
      >
        {/* Decorative gradient */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none"
          aria-hidden="true"
        />
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <ScrollRevealWrapper direction="up">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Live Win Trade</span>
                <span>© {new Date().getFullYear()}</span>
              </div>
              <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6" aria-label="Footer links">
                <Link 
                  to="/auth" 
                  className="hover:text-foreground transition-colors duration-300 hover:-translate-y-0.5 inline-block"
                >
                  Sign In
                </Link>
                <a 
                  href="#features" 
                  className="hover:text-foreground transition-colors duration-300 hover:-translate-y-0.5 inline-block"
                >
                  Features
                </a>
                <a 
                  href="#faq" 
                  className="hover:text-foreground transition-colors duration-300 hover:-translate-y-0.5 inline-block"
                >
                  FAQ
                </a>
                <Link 
                  to="/admin/login" 
                  className="text-xs opacity-50 hover:opacity-100 hover:text-foreground transition-all duration-300"
                >
                  Admin
                </Link>
              </nav>
            </div>
          </ScrollRevealWrapper>
          <ScrollRevealWrapper direction="fade" delay={200}>
            <p className="text-xs text-muted-foreground/70 text-center mt-6">
              ⚠️ Risk Warning: Cryptocurrency investments carry significant risk. Past performance does not guarantee future results.
            </p>
          </ScrollRevealWrapper>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
