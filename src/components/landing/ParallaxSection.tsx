import { memo, ReactNode, useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: 'up' | 'down';
  overflow?: boolean;
}

export const ParallaxSection = memo(({
  children,
  className,
  speed = 0.3,
  direction = 'up',
  overflow = false,
}: ParallaxSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (!ref.current) {
            ticking = false;
            return;
          }

          const rect = ref.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const elementCenter = rect.top + rect.height / 2;
          const viewportCenter = windowHeight / 2;
          const distance = elementCenter - viewportCenter;
          
          const multiplier = direction === 'up' ? -1 : 1;
          setOffset(distance * speed * 0.1 * multiplier);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, direction]);

  return (
    <div
      ref={ref}
      className={cn(
        'relative',
        !overflow && 'overflow-hidden',
        className
      )}
    >
      <div
        style={{
          transform: `translate3d(0, ${offset}px, 0)`,
          transition: 'transform 0.1s ease-out',
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
});

ParallaxSection.displayName = 'ParallaxSection';

// Floating element with parallax
interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  amplitude?: number;
}

export const FloatingElement = memo(({
  children,
  className,
  speed = 3,
  amplitude = 10,
}: FloatingElementProps) => {
  return (
    <div
      className={cn('animate-float', className)}
      style={{
        animationDuration: `${speed}s`,
        // @ts-expect-error - CSS custom property
        '--float-amplitude': `${amplitude}px`,
      }}
    >
      {children}
    </div>
  );
});

FloatingElement.displayName = 'FloatingElement';

// Background parallax layer
interface ParallaxBackgroundProps {
  className?: string;
  speed?: number;
}

export const ParallaxBackground = memo(({
  className,
  speed = 0.5,
}: ParallaxBackgroundProps) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{
        transform: `translate3d(0, ${scrollY * speed}px, 0)`,
        willChange: 'transform',
      }}
      aria-hidden="true"
    />
  );
});

ParallaxBackground.displayName = 'ParallaxBackground';
