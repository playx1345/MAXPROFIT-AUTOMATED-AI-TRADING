import { memo } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}

export const FeatureCard = memo(({ icon: Icon, title, description, index = 0 }: FeatureCardProps) => {
  const { ref: revealRef, style: revealStyle } = useScrollReveal({
    direction: 'up',
    delay: index * 100,
    duration: 700,
    threshold: 0.1,
  });

  return (
    <div 
      ref={revealRef as React.RefObject<HTMLDivElement>}
      style={revealStyle}
    >
      <article
        className={cn(
          "group relative p-6 sm:p-8 rounded-2xl bg-card border border-border/60",
          "transition-all duration-400 ease-out",
          "hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
          "hover:-translate-y-1",
          "h-full min-h-[200px]"
        )}
      >
        {/* Subtle gradient on hover */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-accent/[0.03] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          aria-hidden="true"
        />
        
        <div className="relative z-10">
          <div 
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center mb-5",
              "bg-gradient-to-br from-primary/15 to-primary/5",
              "transition-all duration-400",
              "group-hover:from-primary/25 group-hover:to-primary/10 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/20"
            )}
          >
            <Icon 
              className="w-7 h-7 text-primary transition-all duration-400 group-hover:scale-105" 
              aria-hidden="true"
            />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2.5 text-foreground transition-colors duration-300 group-hover:text-primary">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </article>
    </div>
  );
});

FeatureCard.displayName = "FeatureCard";
