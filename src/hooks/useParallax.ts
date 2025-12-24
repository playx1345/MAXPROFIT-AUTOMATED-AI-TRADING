import { useState, useEffect, useRef, useCallback } from 'react';

export const useParallax = (speed: number = 0.5) => {
  const [offset, setOffset] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate how far the element is from the center of the viewport
    const elementCenter = rect.top + rect.height / 2;
    const viewportCenter = windowHeight / 2;
    const distance = elementCenter - viewportCenter;
    
    // Apply parallax offset based on distance from center
    setOffset(distance * speed * 0.1);
  }, [speed]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return { ref, offset };
};

export const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate scroll progress (0 = not visible, 1 = fully visible/passed)
    const elementTop = rect.top;
    const elementHeight = rect.height;
    
    if (elementTop > windowHeight) {
      setProgress(0);
    } else if (elementTop + elementHeight < 0) {
      setProgress(1);
    } else {
      const visiblePortion = windowHeight - elementTop;
      const totalTravelDistance = windowHeight + elementHeight;
      setProgress(Math.min(1, Math.max(0, visiblePortion / totalTravelDistance)));
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return { ref, progress };
};
