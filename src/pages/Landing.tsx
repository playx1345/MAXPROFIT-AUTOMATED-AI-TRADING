import { lazy, Suspense, memo } from "react";
import { TrendingUp, Shield, Bot, Users, UserPlus, Wallet, Target, BarChart3 } from "lucide-react";
import { AnimatedHero } from "@/components/landing/AnimatedHero";
import { CryptoTicker } from "@/components/landing/CryptoTicker";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { InvestmentPlanCard } from "@/components/landing/InvestmentPlanCard";
import { Section } from "@/components/landing/Section";
import { Header } from "@/components/landing/Header";
import { ScrollRevealWrapper } from "@/components/landing/ScrollRevealWrapper";
import { UnifiedStats } from "@/components/landing/UnifiedStats";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { cn } from "@/lib/utils";

// Lazy load below-the-fold components for better performance
const LiveTradingFeed = lazy(() => import("@/components/landing/LiveTradingFeed").then(m => ({ default: m.LiveTradingFeed })));
const TrustedPartners = lazy(() => import("@/components/landing/TrustedPartners").then(m => ({ default: m.TrustedPartners })));
const FAQ = lazy(() => import("@/components/landing/FAQ").then(m => ({ default: m.FAQ })));

// Loading skeleton component
const SectionSkeleton = memo(() => (
  <div className="py-16 sm:py-20 animate-pulse">
    <div className="container mx-auto px-4 sm:px-6">
      <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4" />
      <div className="h-5 bg-muted rounded w-1/2 mx-auto mb-12" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  </div>
));

SectionSkeleton.displayName = "SectionSkeleton";

// How it works step component with icons
const HowItWorksStep = memo(({ step, index }: { 
  step: { num: string; title: string; desc: string; icon: typeof UserPlus }; 
  index: number;
}) => {
  const Icon = step.icon;
  return (
    <ScrollRevealWrapper 
      direction="up" 
      delay={index * 100}
      className="text-center group"
    >
      <div className="relative">
        {/* Connector line - desktop only */}
        {index < 3 && (
          <div 
            className="hidden lg:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent"
            aria-hidden="true"
          />
        )}
        <div 
          className={cn(
            "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary text-primary-foreground",
            "flex items-center justify-center mx-auto mb-3 sm:mb-4",
            "transition-all duration-300 relative z-10",
            "group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/30"
          )}
        >
          <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
      </div>
      <div className="text-xs font-bold text-primary mb-1">Step {step.num}</div>
      <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 transition-colors duration-300 group-hover:text-primary">
        {step.title}
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-[200px] mx-auto">{step.desc}</p>
    </ScrollRevealWrapper>
  );
});

HowItWorksStep.displayName = "HowItWorksStep";

const howItWorksSteps = [
  { num: "1", title: "Sign Up", desc: "Create your account & complete KYC verification", icon: UserPlus },
  { num: "2", title: "Deposit", desc: "Add USDT securely to your wallet", icon: Wallet },
  { num: "3", title: "Choose Plan", desc: "Select a strategy that fits your goals", icon: Target },
  { num: "4", title: "Earn", desc: "Track performance & withdraw profits", icon: BarChart3 }
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
        
        {/* Unified Stats Banner */}
        <UnifiedStats />
        
        {/* Features Section - single column on mobile */}
        <Section 
          id="features" 
          title="Why Choose Live Win Trade?"
          subtitle="Advanced technology meets professional trading expertise"
          variant="muted"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
            <FeatureCard
              icon={Bot} 
              title="AI Trading Bot" 
              description="Advanced algorithms analyze market trends and execute trades automatically"
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

        {/* How It Works Section */}
        <Section
          id="how-it-works"
          title="How It Works"
          subtitle="Get started in four simple steps"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
            {howItWorksSteps.map((step, index) => (
              <HowItWorksStep key={index} step={step} index={index} />
            ))}
          </div>
        </Section>

        {/* Investment Plans Section */}
        <Section
          id="plans"
          title="Investment Plans"
          subtitle="Choose a plan that matches your investment goals"
          variant="muted"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
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
                  "24/7 customer support"
                ]} 
              />
            </ScrollRevealWrapper>
            <ScrollRevealWrapper direction="up" delay={100}>
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
                  "Priority support"
                ]} 
                popular={true} 
              />
            </ScrollRevealWrapper>
            <ScrollRevealWrapper direction="up" delay={200}>
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
                  "VIP support 24/7"
                ]} 
              />
            </ScrollRevealWrapper>
          </div>

          <ScrollRevealWrapper direction="fade" delay={300}>
            <p className="text-center text-xs sm:text-sm text-muted-foreground mt-8 sm:mt-10 max-w-2xl mx-auto">
              * Expected ROI ranges are estimates based on historical market conditions and are not guaranteed.
            </p>
          </ScrollRevealWrapper>
        </Section>

        <Suspense fallback={<SectionSkeleton />}>
          <LiveTradingFeed />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <TrustedPartners />
        </Suspense>

        {/* FAQ Section */}
        <Section
          id="faq"
          title="Frequently Asked Questions"
          subtitle="Find answers to common questions"
          variant="muted"
        >
          <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
            <FAQ />
          </Suspense>
        </Section>

        {/* CTA Section */}
        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
