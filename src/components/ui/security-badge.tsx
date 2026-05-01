import { memo } from "react";
import { Shield, Lock, CheckCircle2, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeVariant = "shield" | "lock" | "verified" | "encrypted";

interface SecurityBadgeProps {
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
  label?: string;
}

const iconMap = {
  shield: Shield,
  lock: Lock,
  verified: CheckCircle2,
  encrypted: Fingerprint,
};

const sizeClasses = {
  sm: "px-2 py-1 text-xs gap-1",
  md: "px-3 py-1.5 text-sm gap-1.5",
  lg: "px-4 py-2 text-base gap-2",
};

const iconSizes = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export const SecurityBadge = memo(({
  variant = "shield",
  size = "md",
  animated = true,
  className,
  label,
}: SecurityBadgeProps) => {
  const Icon = iconMap[variant];
  
  const defaultLabels = {
    shield: "Secured",
    lock: "Encrypted",
    verified: "Verified",
    encrypted: "256-bit SSL",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        "bg-success/10 text-success border border-success/20",
        "backdrop-blur-sm",
        animated && "group",
        sizeClasses[size],
        className
      )}
    >
      <div className={cn(
        "relative",
        animated && "group-hover:scale-110 transition-transform duration-300"
      )}>
        <Icon className={cn(iconSizes[size], "relative z-10")} />
        {animated && (
          <div className="absolute inset-0 bg-success/30 rounded-full blur-sm animate-pulse-soft" />
        )}
      </div>
      <span>{label || defaultLabels[variant]}</span>
    </div>
  );
});

SecurityBadge.displayName = "SecurityBadge";

// Animated security shield for hero sections
export const AnimatedSecurityShield = memo(({ className }: { className?: string }) => (
  <div className={cn("relative inline-flex", className)}>
    <div className="absolute inset-0 bg-success/20 rounded-full blur-xl animate-pulse-soft" />
    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-success/20 to-success/5 border border-success/30 backdrop-blur-md">
      <Shield className="w-8 h-8 text-success" />
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-ping" />
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full" />
    </div>
  </div>
));

AnimatedSecurityShield.displayName = "AnimatedSecurityShield";

// Connection secure indicator
export const SecureConnectionBadge = memo(({ className }: { className?: string }) => (
  <div
    className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
      "bg-card/80 border border-success/20 backdrop-blur-sm",
      "text-xs font-medium text-muted-foreground",
      className
    )}
  >
    <div className="relative">
      <Lock className="w-3 h-3 text-success" />
      <div className="absolute inset-0 bg-success/30 rounded-full blur-sm animate-pulse" />
    </div>
    <span>Secure Connection</span>
    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
  </div>
));

SecureConnectionBadge.displayName = "SecureConnectionBadge";
