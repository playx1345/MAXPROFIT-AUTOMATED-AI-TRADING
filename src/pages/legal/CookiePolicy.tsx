import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { useDynamicMeta } from "@/hooks/useDynamicMeta";

const CookiePolicy = () => {
  useDynamicMeta({ page: "cookies", ogImageUrl: "/og-default.png" });

  return (
    <div className="min-h-[100dvh] bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 py-24 max-w-4xl">
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground mb-2">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: February 27, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground font-body">
          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">1. What Are Cookies</h2>
            <p>Cookies are small text files stored on your device when you visit our Platform. They help us provide a better user experience and understand how our services are used.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">2. Types of Cookies We Use</h2>
            <div className="space-y-4 mt-3">
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-semibold text-foreground mb-1">Essential Cookies</h3>
                <p>Required for the Platform to function. These include authentication tokens, session management, and security features.</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-semibold text-foreground mb-1">Analytics Cookies</h3>
                <p>Help us understand how users interact with the Platform so we can improve our services. Data is aggregated and anonymous.</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-semibold text-foreground mb-1">Preference Cookies</h3>
                <p>Remember your settings, such as language and theme preferences, to provide a personalized experience.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">3. Managing Cookies</h2>
            <p>You can control and delete cookies through your browser settings. Note that disabling essential cookies may affect Platform functionality.</p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">4. Contact</h2>
            <p>For questions about our use of cookies, contact us at <span className="text-primary">support@livewintrade.com</span>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiePolicy;
