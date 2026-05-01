import React from "react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
  className,
}: PullToRefreshProps) {
  const isMobile = useIsMobile();
  const { containerRef, pullDistance, isPulling, isRefreshing } = usePullToRefresh({
    onRefresh: disabled ? async () => {} : onRefresh,
    threshold: 80,
    resistance: 2.5,
  });

  const threshold = 80;
  const progress = Math.min(pullDistance / threshold, 1);
  const isReady = pullDistance >= threshold;
  const showIndicator = isMobile && (isPulling || isRefreshing) && pullDistance > 10;

  // Calculate rotation based on pull progress
  const rotation = progress * 360;

  return (
    <div
      ref={containerRef}
      className={cn("relative min-h-full", className)}
      role="region"
      aria-live="polite"
    >
      {/* Pull indicator */}
      {showIndicator && (
        <div
          className="pull-indicator"
          style={{
            transform: `translateY(${Math.min(pullDistance - 40, 40)}px)`,
            opacity: progress,
          }}
          aria-hidden="true"
        >
          <div
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 rounded-full glass-card-crypto border border-primary/30",
              isReady && "border-primary shadow-neon",
              isRefreshing && "animate-pulse"
            )}
          >
            <RefreshCw
              className={cn(
                "h-5 w-5 text-primary transition-transform duration-100",
                isRefreshing && "animate-spin"
              )}
              style={{
                transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
              }}
            />
            <span className="text-xs font-medium text-foreground/80">
              {isRefreshing
                ? "Refreshing..."
                : isReady
                ? "Release to refresh"
                : "Pull to refresh"}
            </span>
          </div>
        </div>
      )}

      {/* Content with elastic transform */}
      <div
        className="pull-content"
        style={{
          transform: isPulling || isRefreshing
            ? `translateY(${pullDistance * 0.5}px)`
            : undefined,
          transition: isPulling ? "none" : "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {children}
      </div>

      {/* Screen reader announcement */}
      {isRefreshing && (
        <span className="sr-only" role="status">
          Refreshing content, please wait
        </span>
      )}
    </div>
  );
}
