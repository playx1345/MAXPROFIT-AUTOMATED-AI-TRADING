import { useState, useEffect, useRef, useCallback } from 'react';

export const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Debounced callback for intersection observer
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }
  }, []);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin: '50px 0px', // Start animation slightly before element enters viewport
    });

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
  }, [threshold, handleIntersection]);

  return { ref, isVisible };
};

// Hook for multiple elements with single observer (more performant)
export const useScrollAnimationGroup = (threshold = 0.1) => {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setVisibleItems(new Set(elementsRef.current.keys()));
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-scroll-id');
            if (id) {
              requestAnimationFrame(() => {
                setVisibleItems((prev) => new Set(prev).add(id));
              });
            }
          }
        });
      },
      { threshold, rootMargin: '50px 0px' }
    );

    elementsRef.current.forEach((element) => {
      observerRef.current?.observe(element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold]);

  const registerElement = useCallback((id: string, element: HTMLElement | null) => {
    if (element) {
      element.setAttribute('data-scroll-id', id);
      elementsRef.current.set(id, element);
      observerRef.current?.observe(element);
    } else {
      const existingElement = elementsRef.current.get(id);
      if (existingElement) {
        observerRef.current?.unobserve(existingElement);
        elementsRef.current.delete(id);
      }
    }
  }, []);

  const isVisible = useCallback((id: string) => visibleItems.has(id), [visibleItems]);

  return { registerElement, isVisible };
};
