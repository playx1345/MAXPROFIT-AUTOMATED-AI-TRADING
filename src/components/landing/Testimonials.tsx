import { memo } from "react";
import { ScrollRevealWrapper } from "./ScrollRevealWrapper";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "James K.",
    country: "🇺🇸",
    role: "Retail Investor",
    text: "Live Win Trade completely changed how I approach crypto. The AI strategies are transparent, and I always know where my money is.",
    rating: 5,
  },
  {
    name: "Elena M.",
    country: "🇩🇪",
    role: "Day Trader",
    text: "I was skeptical at first, but the platform is genuinely professional. Fast withdrawals and the KYC process was smooth.",
    rating: 5,
  },
  {
    name: "Raj P.",
    country: "🇮🇳",
    role: "Beginner Trader",
    text: "As a complete beginner, the dashboard made everything easy to understand. Great support team too.",
    rating: 4,
  },
  {
    name: "Sofia L.",
    country: "🇧🇷",
    role: "Portfolio Manager",
    text: "The real‑time monitoring and loss‑protection features give me confidence. A step above other platforms I've used.",
    rating: 5,
  },
];

export const Testimonials = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
    {testimonials.map((t, i) => (
      <ScrollRevealWrapper key={t.name} direction="up" delay={i * 100} duration={700}>
        <div className="rounded-xl border border-border bg-card p-6 h-full flex flex-col">
          <div className="flex gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${s < t.rating ? "text-primary fill-primary" : "text-muted-foreground/30"}`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 font-body">"{t.text}"</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
              {t.country}
            </div>
            <div>
              <p className="text-sm font-heading font-semibold text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </div>
          </div>
        </div>
      </ScrollRevealWrapper>
    ))}
  </div>
));

Testimonials.displayName = "Testimonials";
