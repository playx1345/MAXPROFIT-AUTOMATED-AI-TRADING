import { memo, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

interface ParticleNetworkProps {
  className?: string;
  particleCount?: number;
  connectionDistance?: number;
  speed?: number;
}

// Throttle helper for performance
const throttle = <T extends (...args: unknown[]) => void>(fn: T, delay: number): T => {
  let lastCall = 0;
  return ((...args: unknown[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  }) as T;
};

export const ParticleNetwork = memo(({
  className,
  particleCount = 30, // Reduced from 50 for better performance
  connectionDistance = 100, // Reduced from 150
  speed = 0.5,
}: ParticleNetworkProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const frameCountRef = useRef(0);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    // Check for mobile devices - disable particles on mobile for performance
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    
    const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    window.addEventListener('resize', checkMobile);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (isReducedMotion || isMobile) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use lower DPR for performance (cap at 2)
    const dpr = Math.min(window.devicePixelRatio, 2);

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    
    // Throttle resize handler
    const throttledResize = throttle(resizeCanvas, 250);
    window.addEventListener('resize', throttledResize);

    // Initialize particles with reduced count on smaller screens
    const adjustedCount = window.innerWidth < 1024 ? Math.floor(particleCount * 0.6) : particleCount;
    particlesRef.current = Array.from({ length: adjustedCount }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    // Throttled mouse move handler (limit to ~30fps for mouse tracking)
    const handleMouseMove = throttle((e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }, 33);

    canvas.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      const particles = particlesRef.current;
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      
      // Frame skipping for connection calculations (every 2nd frame)
      frameCountRef.current = (frameCountRef.current + 1) % 2;
      const shouldDrawConnections = frameCountRef.current === 0;

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;

        // Keep in bounds
        particle.x = Math.max(0, Math.min(width, particle.x));
        particle.y = Math.max(0, Math.min(height, particle.y));

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(45, 93%, 49%, ${particle.opacity})`;
        ctx.fill();

        // Draw connections only every other frame for performance
        if (shouldDrawConnections) {
          // Only check nearby particles (skip some for performance)
          for (let j = i + 1; j < particles.length; j += 1) {
            const other = particles[j];
            const dx = particle.x - other.x;
            const dy = particle.y - other.y;
            
            // Quick distance check before expensive sqrt
            if (Math.abs(dx) > connectionDistance || Math.abs(dy) > connectionDistance) continue;
            
            const distSq = dx * dx + dy * dy;
            const connDistSq = connectionDistance * connectionDistance;

            if (distSq < connDistSq) {
              const distance = Math.sqrt(distSq);
              const opacity = (1 - distance / connectionDistance) * 0.3;
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = `hsla(45, 93%, 49%, ${opacity})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }

          // Connect to mouse (only when drawing connections)
          const mx = mouseRef.current.x;
          const my = mouseRef.current.y;
          if (mx > 0 && my > 0) {
            const mdx = particle.x - mx;
            const mdy = particle.y - my;
            const mouseConnDist = connectionDistance * 1.5;
            
            if (Math.abs(mdx) <= mouseConnDist && Math.abs(mdy) <= mouseConnDist) {
              const mDistSq = mdx * mdx + mdy * mdy;
              const mouseConnDistSq = mouseConnDist * mouseConnDist;
              
              if (mDistSq < mouseConnDistSq) {
                const mDistance = Math.sqrt(mDistSq);
                const opacity = (1 - mDistance / mouseConnDist) * 0.5;
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(mx, my);
                ctx.strokeStyle = `hsla(45, 93%, 49%, ${opacity})`;
                ctx.lineWidth = 1;
                ctx.stroke();
              }
            }
          }
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', throttledResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount, connectionDistance, speed, isReducedMotion, isMobile]);

  // Show simple gradient on mobile or reduced motion
  if (isReducedMotion || isMobile) {
    return (
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5",
        className
      )} />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 w-full h-full", className)}
      style={{ opacity: 0.7 }}
    />
  );
});

ParticleNetwork.displayName = "ParticleNetwork";
