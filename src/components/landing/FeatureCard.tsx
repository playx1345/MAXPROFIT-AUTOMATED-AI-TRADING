import { memo, useRef, useState } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}

export const FeatureCard = memo(({ icon: Icon, title, description, index = 0 }: FeatureCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation (max 8 degrees)
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    
    setTransform({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0 });
    setIsHovered(false);
  };

  return (
    <article
      ref={cardRef}
      className={cn(
        "group relative p-6 sm:p-8 rounded-2xl bg-card border border-border",
        "transition-all duration-300 ease-out",
        "hover:border-primary/30 hover:shadow-lg",
        "will-change-transform"
      )}
      style={{
        transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
        transitionDelay: `${index * 50}ms`,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Hover gradient overlay */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl",
          "transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )}
        aria-hidden="true"
      />
      
      {/* Glow effect on hover */}
      <div 
        className={cn(
          "absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/20 to-transparent",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10"
        )}
        aria-hidden="true"
      />
      
      <div className="relative z-10">
        <div 
          className={cn(
            "w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5",
            "transition-all duration-300",
            "group-hover:bg-primary/20 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20"
          )}
        >
          <Icon 
            className={cn(
              "w-7 h-7 text-primary transition-transform duration-300",
              "group-hover:scale-110"
            )} 
            aria-hidden="true"
          />
        </div>
        <h3 className="text-xl font-semibold mb-3 text-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </article>
  );
});

FeatureCard.displayName = "FeatureCard";
