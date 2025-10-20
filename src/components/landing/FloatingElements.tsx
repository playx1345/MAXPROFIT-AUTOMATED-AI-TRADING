import { Bitcoin } from "lucide-react";

export const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large center Bitcoin - static, no rotation */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03]">
        <Bitcoin className="w-[500px] h-[500px] text-primary" />
      </div>

      {/* Subtle floating Bitcoin elements - reduced quantity */}
      <div className="animate-float" style={{ animationDelay: '0s' }}>
        <Bitcoin className="w-20 h-20 text-primary/10 absolute top-20 left-10" />
      </div>
      <div className="animate-float" style={{ animationDelay: '3s' }}>
        <Bitcoin className="w-24 h-24 text-primary/10 absolute top-40 right-20" />
      </div>
      <div className="animate-float" style={{ animationDelay: '6s' }}>
        <Bitcoin className="w-20 h-20 text-primary/10 absolute bottom-40 left-1/4" />
      </div>

      {/* Gradient mesh background */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
    </div>
  );
};
