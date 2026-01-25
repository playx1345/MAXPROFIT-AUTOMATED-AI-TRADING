import React, { memo } from "react";
import { useScrollReveal, useStaggeredReveal } from "@/hooks/useScrollReveal";
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
  parallaxBackground?: boolean;
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
  parallaxBackground = false,
}: SectionProps) => {
  const { ref: titleRef, style: titleStyle } = useScrollReveal({
    direction: 'up',
    duration: 800,
    threshold: 0.2,
  });
  
  const { ref: subtitleRef, style: subtitleStyle } = useScrollReveal({
    direction: 'up',
    delay: 100,
    duration: 800,
    threshold: 0.2,
  });

  const { ref: contentRef, style: contentStyle } = useScrollReveal({
    direction: 'up',
    delay: 200,
    duration: 800,
    threshold: 0.1,
  });

  const variantClasses = {
    default: "",
    muted: "bg-muted/20",
    gradient: "bg-gradient-to-b from-background via-muted/10 to-background",
  };

  return (
    <section
      id={id}
      className={cn(
        "py-20 sm:py-24 relative overflow-hidden",
        variantClasses[variant],
        className
      )}
      aria-labelledby={title ? `${id}-title` : undefined}
    >
      {/* Parallax background decoration */}
      {parallaxBackground && (
        <>
          <div 
            className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2"
            aria-hidden="true"
          />
          <div 
            className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-[80px] translate-y-1/2"
            aria-hidden="true"
          />
        </>
      )}

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {(title || subtitle) && (
          <header className="text-center mb-16">
            {title && (
              <h2
                ref={animate ? titleRef as React.RefObject<HTMLHeadingElement> : undefined}
                id={`${id}-title`}
                className={cn(
                  "text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-balance",
                  titleClassName
                )}
                style={animate ? titleStyle : undefined}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p 
                ref={animate ? subtitleRef as React.RefObject<HTMLParagraphElement> : undefined}
                className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance"
                style={animate ? subtitleStyle : undefined}
              >
                {subtitle}
              </p>
            )}
          </header>
        )}
        <div
          ref={animate ? contentRef as React.RefObject<HTMLDivElement> : undefined}
          style={animate ? contentStyle : undefined}
        >
          {children}
        </div>
      </div>
    </section>
  );
});

Section.displayName = "Section";
