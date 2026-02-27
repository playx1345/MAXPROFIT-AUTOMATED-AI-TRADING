import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { useDynamicMeta } from "@/hooks/useDynamicMeta";
import { Shield, FileCheck, Clock, Lock } from "lucide-react";

const AMLKYCPolicy = () => {
  useDynamicMeta({ page: "aml-kyc", ogImageUrl: "/og-default.png" });

  return (
    <div className="min-h-[100dvh] bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 py-24 max-w-4xl">
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground mb-2">AML/KYC Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: February 27, 2026</p>

        {/* KYC Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Shield, title: "Why KYC?", desc: "Required by law to prevent fraud, money laundering, and terrorist financing." },
            { icon: FileCheck, title: "Documents", desc: "Government‑issued ID (passport, driver's license, or national ID card)." },
            { icon: Clock, title: "Processing", desc: "Verification typically completes within 24–48 hours of submission." },
            { icon: Lock, title: "Data Security", desc: "Documents are encrypted and stored securely with restricted access." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-card p-5">
              <item.icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-heading font-semibold text-foreground mb-1.5">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground font-body">
          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">1. Purpose</h2>
            <p>Live Win Trade is committed to preventing money laundering, terrorist financing, and other financial crimes. This policy outlines our procedures for verifying user identities and monitoring transactions.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">2. KYC Verification Process</h2>
            <p>All users must complete identity verification before accessing trading features. This includes providing a government‑issued photo ID, proof of address (utility bill or bank statement dated within 3 months), and a selfie for facial verification.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">3. Accepted Documents</h2>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Valid passport</li>
              <li>National identity card</li>
              <li>Driver's license</li>
              <li>Utility bill or bank statement (for address verification)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">4. Transaction Monitoring</h2>
            <p>We continuously monitor transactions for suspicious activity. Unusual patterns, large transactions, and rapid movement of funds are flagged for review.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">5. Reporting</h2>
            <p>Suspicious activities are reported to relevant financial authorities in accordance with applicable laws and regulations.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">6. Data Handling</h2>
            <p>KYC documents are encrypted using AES‑256 encryption and stored in compliance with data protection regulations. Access is strictly limited to authorized compliance personnel.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">7. KYC Status Levels</h2>
            <div className="space-y-3 mt-3">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-destructive shrink-0" />
                <span><strong className="text-foreground">Not Verified</strong> — Limited access. Must complete KYC to trade.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-primary shrink-0" />
                <span><strong className="text-foreground">Pending</strong> — Documents submitted, under review (24–48 hours).</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-accent shrink-0" />
                <span><strong className="text-foreground">Verified</strong> — Full access to all platform features.</span>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AMLKYCPolicy;
