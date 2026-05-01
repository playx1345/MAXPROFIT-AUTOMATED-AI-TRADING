import { useRef, useState, useEffect, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistance?: number;
}

interface UsePullToRefreshReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  pullDistance: number;
  isPulling: boolean;
  isRefreshing: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();

  const startY = useRef(0);
  const currentY = useRef(0);
  const isAtTop = useRef(true);
  const hasTriggeredHaptic = useRef(false);

  // Haptic feedback
  const triggerHaptic = useCallback(() => {
    if ("vibrate" in navigator) {
      navigator.vibrate(10);
    }
  }, []);

  const triggerSuccessHaptic = useCallback(() => {
    if ("vibrate" in navigator) {
      navigator.vibrate([5, 50, 5]);
    }
  }, []);

  // Check if container is at top
  const checkIsAtTop = useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;
    
    // Check if the container or any parent is scrolled
    let element: HTMLElement | null = container;
    while (element) {
      if (element.scrollTop > 0) return false;
      element = element.parentElement;
    }
    
    // Also check window scroll
    return window.scrollY === 0;
  }, []);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!isMobile || isRefreshing) return;
      
      isAtTop.current = checkIsAtTop();
      if (!isAtTop.current) return;

      startY.current = e.touches[0].clientY;
      hasTriggeredHaptic.current = false;
    },
    [isMobile, isRefreshing, checkIsAtTop]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isMobile || isRefreshing || !isAtTop.current) return;
      
      // Re-check if we're at top
      if (!checkIsAtTop()) {
        isAtTop.current = false;
        setPullDistance(0);
        setIsPulling(false);
        return;
      }

      currentY.current = e.touches[0].clientY;
      const diff = currentY.current - startY.current;

      if (diff > 0) {
        // Prevent default scroll behavior when pulling down
        e.preventDefault();

        // Apply resistance curve for natural feel
        const resistedDistance = Math.pow(diff, 1 / resistance) * 10;
        setPullDistance(Math.min(resistedDistance, threshold * 1.5));
        setIsPulling(true);

        // Trigger haptic at threshold
        if (resistedDistance >= threshold && !hasTriggeredHaptic.current) {
          triggerHaptic();
          hasTriggeredHaptic.current = true;
        } else if (resistedDistance < threshold) {
          hasTriggeredHaptic.current = false;
        }
      }
    },
    [isMobile, isRefreshing, threshold, resistance, checkIsAtTop, triggerHaptic]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isMobile || isRefreshing || !isPulling) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(threshold);

      try {
        await onRefresh();
        triggerSuccessHaptic();
      } catch (error) {
        console.error("Refresh failed:", error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        setIsPulling(false);
      }
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }

    hasTriggeredHaptic.current = false;
  }, [isMobile, isRefreshing, isPulling, pullDistance, threshold, onRefresh, triggerSuccessHaptic]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isMobile) return;

    // Use passive: false to allow preventDefault
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    containerRef,
    pullDistance,
    isPulling,
    isRefreshing,
  };
}
