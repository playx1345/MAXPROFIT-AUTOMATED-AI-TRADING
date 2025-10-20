import { Bitcoin } from "lucide-react";

export const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large center Bitcoin */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
        <Bitcoin className="w-96 h-96 text-primary animate-[spin_20s_linear_infinite]" />
      </div>

      {/* Floating Bitcoin elements */}
      <div className="animate-float" style={{ animationDelay: '0s' }}>
        <Bitcoin className="w-24 h-24 text-primary/20 absolute top-20 left-10" />
      </div>
      <div className="animate-float" style={{ animationDelay: '2s' }}>
        <Bitcoin className="w-32 h-32 text-accent/20 absolute top-40 right-20" />
      </div>
      <div className="animate-float" style={{ animationDelay: '4s' }}>
        <Bitcoin className="w-20 h-20 text-primary/30 absolute bottom-40 left-1/4" />
      </div>
      <div className="animate-float" style={{ animationDelay: '1s' }}>
        <Bitcoin className="w-28 h-28 text-accent/15 absolute bottom-20 right-1/3" />
      </div>
      <div className="animate-float" style={{ animationDelay: '3s' }}>
        <Bitcoin className="w-16 h-16 text-primary/25 absolute top-1/3 right-10" />
      </div>

      {/* Particle dots */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent animate-shimmer" />
    </div>
  );
};
