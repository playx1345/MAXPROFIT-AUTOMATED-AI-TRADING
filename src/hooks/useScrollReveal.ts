import { useEffect, useRef, useState, useCallback } from 'react';

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale' | 'rotate';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  once?: boolean;
}

export const useScrollReveal = ({
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  direction = 'up',
  delay = 0,
  duration = 700,
  once = true,
}: UseScrollRevealOptions = {}) => {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  const getTransformOrigin = useCallback(() => {
    switch (direction) {
      case 'up':
        return 'translateY(28px)';
      case 'down':
        return 'translateY(-28px)';
      case 'left':
        return 'translateX(32px)';
      case 'right':
        return 'translateX(-32px)';
      case 'scale':
        return 'scale(0.92)';
      case 'rotate':
        return 'rotate(-3deg) scale(0.96)';
      case 'fade':
      default:
        return 'none';
    }
  }, [direction]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setIsVisible(true);
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (once && hasAnimated) return;
            
            requestAnimationFrame(() => {
              setTimeout(() => {
                setIsVisible(true);
                setHasAnimated(true);
              }, delay);
            });
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [threshold, rootMargin, delay, once, hasAnimated]);

  const style: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'none' : getTransformOrigin(),
    transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
    transitionDelay: `${delay}ms`,
    willChange: 'opacity, transform',
  };

  return { ref, isVisible, style };
};

// Hook for staggered children animations
export const useStaggeredReveal = (
  itemCount: number,
  baseDelay: number = 0,
  staggerDelay: number = 100,
  options: Omit<UseScrollRevealOptions, 'delay'> = {}
) => {
  const containerRef = useRef<HTMLElement>(null);
  const [isContainerVisible, setIsContainerVisible] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setIsContainerVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsContainerVisible(true);
          }
        });
      },
      { threshold: options.threshold || 0.1, rootMargin: options.rootMargin || '0px 0px -50px 0px' }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin]);

  const getItemStyle = useCallback((index: number): React.CSSProperties => {
    const delay = baseDelay + index * staggerDelay;
    const duration = options.duration || 700;

    return {
      opacity: isContainerVisible ? 1 : 0,
      transform: isContainerVisible ? 'none' : 'translateY(24px)',
      transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
      transitionDelay: `${delay}ms`,
      willChange: 'opacity, transform',
    };
  }, [isContainerVisible, baseDelay, staggerDelay, options.duration]);

  return { containerRef, isContainerVisible, getItemStyle };
};

// Enhanced parallax hook with more control
export const useEnhancedParallax = (options: {
  speed?: number;
  direction?: 'vertical' | 'horizontal';
  scale?: boolean;
  rotate?: boolean;
} = {}) => {
  const { speed = 0.3, direction = 'vertical', scale = false, rotate = false } = options;
  const ref = useRef<HTMLElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1, rotation: 0 });

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
          const distance = (elementCenter - viewportCenter) / windowHeight;

          const offset = distance * speed * 100;
          
          setTransform({
            x: direction === 'horizontal' ? offset : 0,
            y: direction === 'vertical' ? offset : 0,
            scale: scale ? 1 + Math.abs(distance) * 0.05 : 1,
            rotation: rotate ? distance * 5 : 0,
          });

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, direction, scale, rotate]);

  const style: React.CSSProperties = {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale}) rotate(${transform.rotation}deg)`,
    willChange: 'transform',
    transition: 'transform 0.1s ease-out',
  };

  return { ref, transform, style };
};
