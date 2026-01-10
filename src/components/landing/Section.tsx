import React, { memo } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  title?: string;
  subtitle?: string;
  variant?: "default" | "muted" | "gradient";
  className?: string;
  titleClassName?: string;
  children: React.ReactNode;
  animate?: boolean;
}

export const Section = memo(({
  id,
  title,
  subtitle,
  variant = "default",
  className,
  titleClassName,
  children,
  animate = true,
}: SectionProps) => {
  const { ref, isVisible } = useScrollAnimation(0.1);

  const variantClasses = {
    default: "",
    muted: "bg-muted/20",
    gradient: "bg-gradient-to-b from-background via-muted/10 to-background",
  };

  return (
    <section
      id={id}
      ref={animate ? ref : undefined}
      className={cn(
        "py-20 sm:py-24 relative overflow-hidden",
        variantClasses[variant],
        className
      )}
      aria-labelledby={title ? `${id}-title` : undefined}
    >
      <div className="container mx-auto px-4 sm:px-6">
        {(title || subtitle) && (
          <header
            className={cn(
              "text-center mb-16 transition-all duration-700",
              animate && (isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")
            )}
          >
            {title && (
              <h2
                id={`${id}-title`}
                className={cn(
                  "text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-balance",
                  titleClassName
                )}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
                {subtitle}
              </p>
            )}
          </header>
        )}
        <div
          className={cn(
            "transition-all duration-700 delay-150",
            animate && (isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
});

Section.displayName = "Section";
