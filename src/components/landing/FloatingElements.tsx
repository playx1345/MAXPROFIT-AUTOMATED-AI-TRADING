import { Bitcoin } from "lucide-react";

export const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient background overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-10 bg-gradient-to-r from-primary to-accent rounded-full blur-3xl" />

      {/* Simplified floating Bitcoin elements */}
      <div className="animate-float animate-optimized">
        <Bitcoin className="w-24 h-24 text-primary/20 absolute top-20 left-10" />
      </div>
      <div className="animate-float animate-optimized [animation-delay:1s]">
        <Bitcoin className="w-32 h-32 text-accent/20 absolute top-40 right-20" />
      </div>
      <div className="animate-float animate-optimized [animation-delay:2s]">
        <Bitcoin className="w-20 h-20 text-primary/30 absolute bottom-40 left-1/4" />
      </div>

      {/* Particle dots */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent animate-shimmer" />
    </div>
  );
};
