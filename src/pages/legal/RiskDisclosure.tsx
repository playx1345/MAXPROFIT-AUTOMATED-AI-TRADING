import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { useDynamicMeta } from "@/hooks/useDynamicMeta";
import { AlertTriangle } from "lucide-react";

const RiskDisclosure = () => {
  useDynamicMeta({ page: "risk", ogImageUrl: "/og-default.png" });

  return (
    <div className="min-h-[100dvh] bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 py-24 max-w-4xl">
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground mb-2">Risk Disclosure</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: February 27, 2026</p>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 mb-10 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-foreground font-body">
            <strong>Important:</strong> Trading cryptocurrencies and digital assets involves significant risk. You should carefully consider whether trading is appropriate for you in light of your financial condition.
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground font-body">
          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">1. Market Risk</h2>
            <p>Cryptocurrency markets are highly volatile. Prices can fluctuate significantly in short periods. Past performance is not indicative of future results, and you may lose some or all of your invested capital.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">2. Technology Risk</h2>
            <p>Automated trading systems, including AI‑powered strategies, are subject to technical failures, connectivity issues, and software bugs. No system is infallible.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">3. Regulatory Risk</h2>
            <p>Cryptocurrency regulations vary by jurisdiction and are subject to change. Regulatory actions could adversely affect the value of assets and the availability of services.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">4. Liquidity Risk</h2>
            <p>Some markets may have limited liquidity, which could affect your ability to execute trades at desired prices or withdraw funds in a timely manner.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">5. No Guarantees</h2>
            <p>Live Win Trade does not guarantee any specific returns. Expected ROI ranges are estimates based on historical data and are not promises of future performance.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">6. Responsible Investing</h2>
            <p>Only invest funds that you can afford to lose. Diversify your portfolio. Seek independent financial advice if you are unsure about any aspect of trading.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RiskDisclosure;
