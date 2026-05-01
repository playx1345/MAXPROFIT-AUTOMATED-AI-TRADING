import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { useDynamicMeta } from "@/hooks/useDynamicMeta";

const TermsAndConditions = () => {
  useDynamicMeta({ page: "terms", ogImageUrl: "/og-default.png" });

  return (
    <div className="min-h-[100dvh] bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 py-24 max-w-4xl">
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground mb-2">Terms &amp; Conditions</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: February 27, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground font-body">
          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the Live Win Trade platform ("Platform"), you agree to be bound by these Terms &amp; Conditions. If you do not agree, you must not use the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">2. Eligibility</h2>
            <p>You must be at least 18 years old and legally capable of entering into binding contracts. By using our services, you represent and warrant that you meet these requirements.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">3. Account Registration</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during registration and to update such information as necessary.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">4. Platform Services</h2>
            <p>Live Win Trade provides AI‑powered trading tools, automated strategies, and portfolio management services. All trading involves risk, and past performance does not guarantee future results.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">5. Fees &amp; Payments</h2>
            <p>Deposits, withdrawals, and certain platform services may be subject to fees. All applicable fees are disclosed before any transaction is confirmed. You agree to pay all fees associated with your use of the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">6. Prohibited Activities</h2>
            <p>You may not use the Platform for any unlawful purpose, attempt to gain unauthorized access to the Platform, manipulate trading activity, or engage in money laundering or terrorist financing.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Live Win Trade shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">8. Modifications</h2>
            <p>We reserve the right to modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the revised Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">9. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with applicable international financial regulations and the laws of the jurisdiction in which Live Win Trade operates.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">10. Contact</h2>
            <p>For questions about these Terms, contact us at <span className="text-primary">support@livewintrade.com</span>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsAndConditions;
