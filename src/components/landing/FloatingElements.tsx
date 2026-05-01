import { Bitcoin, TrendingUp, Zap, DollarSign, Cpu, Coins } from "lucide-react";
import { useEffect, useState } from "react";

// Particle component for the network effect
const Particle = ({ index }: { index: number }) => {
  const randomDelay = Math.random() * 5;
  const randomDuration = 5 + Math.random() * 5;
  const randomSize = 2 + Math.random() * 4;
  const randomLeft = Math.random() * 100;
  const randomTop = Math.random() * 100;
  
  return (
    <div 
      className="absolute rounded-full bg-primary/40 animate-particle-float"
      style={{
        width: randomSize,
        height: randomSize,
        left: `${randomLeft}%`,
        top: `${randomTop}%`,
        animationDelay: `${randomDelay}s`,
        animationDuration: `${randomDuration}s`,
      }}
    />
  );
};

// Connection line between particles
const ConnectionLine = ({ index }: { index: number }) => {
  const randomWidth = 50 + Math.random() * 150;
  const randomRotation = Math.random() * 360;
  const randomLeft = Math.random() * 100;
  const randomTop = Math.random() * 100;
  const randomDelay = Math.random() * 3;
  
  return (
    <div 
      className="absolute h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse-soft"
      style={{
        width: randomWidth,
        left: `${randomLeft}%`,
        top: `${randomTop}%`,
        transform: `rotate(${randomRotation}deg)`,
        animationDelay: `${randomDelay}s`,
      }}
    />
  );
};

export const FloatingElements = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Circuit board pattern */}
      <div className="absolute inset-0 circuit-pattern opacity-30" />
      
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
      
      {/* Large gradient orbs with mouse follow */}
      <div 
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-radial from-primary/15 via-primary/5 to-transparent rounded-full blur-3xl animate-pulse-soft"
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          transition: 'transform 0.5s ease-out',
        }}
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-radial from-accent/15 via-accent/5 to-transparent rounded-full blur-3xl animate-pulse-soft"
        style={{ 
          animationDelay: '1.5s',
          transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
          transition: 'transform 0.5s ease-out',
        }} 
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-teal/10 via-transparent to-transparent rounded-full blur-3xl opacity-50"
      />
      
      {/* Particle network effect */}
      <div className="absolute inset-0">
        {[...Array(25)].map((_, i) => (
          <Particle key={i} index={i} />
        ))}
        {[...Array(15)].map((_, i) => (
          <ConnectionLine key={i} index={i} />
        ))}
      </div>
      
      {/* Floating crypto icons with enhanced glow */}
      <div className="animate-float animate-optimized">
        <div className="absolute top-20 left-[10%] p-4 rounded-2xl bg-gradient-to-br from-bitcoin/25 to-bitcoin/10 border border-bitcoin/30 backdrop-blur-md shadow-lg shadow-bitcoin/20 group hover:scale-110 transition-transform duration-300">
          <Bitcoin className="w-8 h-8 text-bitcoin drop-shadow-glow" />
          <div className="absolute inset-0 rounded-2xl animate-neon-border opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      
      <div className="animate-float animate-optimized [animation-delay:0.5s]">
        <div className="absolute top-32 right-[15%] p-4 rounded-2xl bg-gradient-to-br from-primary/25 to-primary/10 border border-primary/30 backdrop-blur-md shadow-lg shadow-primary/20">
          <TrendingUp className="w-8 h-8 text-primary drop-shadow-glow" />
        </div>
      </div>
      
      <div className="animate-float animate-optimized [animation-delay:1s]">
        <div className="absolute bottom-40 left-[12%] p-4 rounded-2xl bg-gradient-to-br from-accent/25 to-accent/10 border border-accent/30 backdrop-blur-md shadow-lg shadow-accent/20">
          <Zap className="w-7 h-7 text-accent" />
        </div>
      </div>
      
      <div className="animate-float animate-optimized [animation-delay:1.5s]">
        <div className="absolute bottom-28 right-[18%] p-4 rounded-2xl bg-gradient-to-br from-success/25 to-success/10 border border-success/30 backdrop-blur-md shadow-lg shadow-success/20">
          <DollarSign className="w-7 h-7 text-success" />
        </div>
      </div>

      <div className="animate-float animate-optimized [animation-delay:2s] hidden lg:block">
        <div className="absolute top-1/2 left-[5%] p-3 rounded-xl bg-gradient-to-br from-teal/25 to-teal/10 border border-teal/30 backdrop-blur-md shadow-lg shadow-teal/20">
          <Cpu className="w-6 h-6 text-teal" />
        </div>
      </div>

      <div className="animate-float animate-optimized [animation-delay:2.5s] hidden lg:block">
        <div className="absolute top-1/3 right-[8%] p-3 rounded-xl bg-gradient-to-br from-primary/25 to-accent/10 border border-primary/30 backdrop-blur-md shadow-lg shadow-primary/20">
          <Coins className="w-6 h-6 text-primary" />
        </div>
      </div>

      {/* Glowing lines */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/15 to-transparent" />
      <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-accent/15 to-transparent" />
      <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
      
      {/* Horizontal glowing lines */}
      <div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      <div className="absolute bottom-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
      
      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background)/0.8)_70%)]" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent animate-shimmer opacity-50" />
    </div>
  );
};
