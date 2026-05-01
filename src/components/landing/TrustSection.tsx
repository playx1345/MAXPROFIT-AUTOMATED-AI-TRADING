import { memo } from "react";
import { Shield, Lock, Eye, FileCheck, Server, AlertTriangle } from "lucide-react";
import { ScrollRevealWrapper } from "./ScrollRevealWrapper";
import { Link } from "react-router-dom";

const trustItems = [
  {
    icon: Lock,
    title: "AES‑256 Encryption",
    desc: "All data encrypted at rest and in transit using bank‑grade encryption standards.",
  },
  {
    icon: Shield,
    title: "KYC / AML Compliant",
    desc: "Full identity verification to prevent fraud and ensure regulatory compliance.",
  },
  {
    icon: Eye,
    title: "Transparent Operations",
    desc: "Real‑time tracking of all transactions with complete audit trails.",
  },
  {
    icon: Server,
    title: "Secure Infrastructure",
    desc: "Enterprise‑grade servers with DDoS protection and 99.9% uptime guarantee.",
  },
  {
    icon: FileCheck,
    title: "Regulatory Compliance",
    desc: "Operating within international financial regulations and data protection laws.",
  },
  {
    icon: AlertTriangle,
    title: "Risk Disclosure",
    desc: "Full transparency about trading risks so you can make informed decisions.",
  },
];

export const TrustSection = memo(() => (
  <div className="space-y-10">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
      {trustItems.map((item, i) => (
        <ScrollRevealWrapper key={item.title} direction="up" delay={i * 80} duration={700}>
          <div className="rounded-xl border border-border bg-card p-5 h-full">
            <item.icon className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-heading font-semibold text-foreground mb-1.5">{item.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-body">{item.desc}</p>
          </div>
        </ScrollRevealWrapper>
      ))}
    </div>

    <ScrollRevealWrapper direction="fade" delay={300} duration={800}>
      <div className="text-center">
        <Link
          to="/legal/terms"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-body"
        >
          <FileCheck className="w-4 h-4" />
          View our full Legal Center →
        </Link>
      </div>
    </ScrollRevealWrapper>
  </div>
));

TrustSection.displayName = "TrustSection";
