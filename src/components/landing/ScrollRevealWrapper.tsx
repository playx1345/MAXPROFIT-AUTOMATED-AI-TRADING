import { memo, ReactNode } from 'react';
import { useScrollReveal, RevealDirection } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

interface ScrollRevealWrapperProps {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
}

export const ScrollRevealWrapper = memo(({
  children,
  direction = 'up',
  delay = 0,
  duration = 700,
  threshold = 0.1,
  className,
}: ScrollRevealWrapperProps) => {
  const { ref, style } = useScrollReveal({
    direction,
    delay,
    duration,
    threshold,
  });

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(className)}
      style={style}
    >
      {children}
    </div>
  );
});

ScrollRevealWrapper.displayName = 'ScrollRevealWrapper';

// Staggered reveal for lists
interface StaggeredRevealProps {
  children: ReactNode[];
  baseDelay?: number;
  staggerDelay?: number;
  direction?: RevealDirection;
  className?: string;
  itemClassName?: string;
}

export const StaggeredReveal = memo(({
  children,
  baseDelay = 0,
  staggerDelay = 100,
  direction = 'up',
  className,
  itemClassName,
}: StaggeredRevealProps) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <ScrollRevealWrapper
          key={index}
          direction={direction}
          delay={baseDelay + index * staggerDelay}
          className={itemClassName}
        >
          {child}
        </ScrollRevealWrapper>
      ))}
    </div>
  );
});

StaggeredReveal.displayName = 'StaggeredReveal';
