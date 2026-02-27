import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { useDynamicMeta } from "@/hooks/useDynamicMeta";

const PrivacyPolicy = () => {
  useDynamicMeta({ page: "privacy", ogImageUrl: "/og-default.png" });

  return (
    <div className="min-h-[100dvh] bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 py-24 max-w-4xl">
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: February 27, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground font-body">
          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p>We collect personal information you provide during registration (name, email, phone), identity verification documents for KYC compliance, transaction data, and technical data such as IP addresses and browser information.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <p>Your information is used to provide and improve our services, verify your identity, process transactions, comply with legal obligations, prevent fraud, and communicate with you about your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">3. Data Security</h2>
            <p>We implement industry‑standard security measures including AES‑256 encryption for data at rest, TLS 1.3 for data in transit, and secure access controls. We regularly audit our security practices.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">4. Data Sharing</h2>
            <p>We do not sell your personal data. We may share information with regulatory authorities when required by law, trusted service providers who assist our operations, and law enforcement when legally compelled.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">5. Data Retention</h2>
            <p>We retain your personal data for as long as your account is active and for a reasonable period thereafter as required by law. KYC documents are retained per regulatory requirements.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data, restrict processing, data portability, and to withdraw consent where applicable. Contact us to exercise these rights.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">7. Cookies</h2>
            <p>We use essential cookies for platform functionality and analytics cookies to improve our services. See our Cookie Policy for more details.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">8. Contact</h2>
            <p>For privacy inquiries, contact our Data Protection Officer at <span className="text-primary">privacy@livewintrade.com</span>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
