import { memo, useRef, useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw,
  X 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoVideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DemoVideoModal = memo(({ open, onOpenChange }: DemoVideoModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isEnded, setIsEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset and autoplay when modal opens
  useEffect(() => {
    if (open && videoRef.current) {
      videoRef.current.currentTime = 0;
      setProgress(0);
      setIsEnded(false);
      videoRef.current.play().catch(() => {
        // Autoplay was prevented, user will need to click play
        setIsPlaying(false);
      });
    } else if (!open && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [open]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isEnded) {
      videoRef.current.currentTime = 0;
      setIsEnded(false);
    }
    
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, [isEnded]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleFullscreen = useCallback(() => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  }, []);

  const handleReplay = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    setIsEnded(false);
    videoRef.current.play();
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    setCurrentTime(current);
    setProgress((current / total) * 100);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    setIsLoading(false);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setIsEnded(true);
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * videoRef.current.duration;
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Keyboard controls
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'Escape':
          onOpenChange(false);
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          handleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, togglePlay, toggleMute, handleFullscreen, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "max-w-4xl w-[95vw] p-0 gap-0 overflow-hidden",
          "bg-black/95 border-border/50 backdrop-blur-xl"
        )}
      >
        <DialogTitle className="sr-only">Demo Video</DialogTitle>
        
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-background/20 hover:bg-background/40 transition-colors text-white"
          aria-label="Close video"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video container */}
        <div className="relative aspect-video bg-black">
          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            onCanPlay={() => setIsLoading(false)}
            playsInline
            preload="metadata"
          >
            <source src="/demo-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Replay overlay */}
          {isEnded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Button
                onClick={handleReplay}
                size="lg"
                className="gap-2 px-8 py-6 text-lg bg-primary hover:bg-primary/90"
              >
                <RotateCcw className="w-6 h-6" />
                Replay
              </Button>
            </div>
          )}

          {/* Play/Pause overlay on click */}
          <div 
            className="absolute inset-0 cursor-pointer"
            onClick={togglePlay}
            aria-hidden="true"
          />
        </div>

        {/* Controls */}
        <div className="bg-background/80 backdrop-blur-sm px-4 py-3 space-y-2">
          {/* Progress bar */}
          <div 
            className="relative h-1.5 bg-muted rounded-full cursor-pointer group"
            onClick={handleProgressClick}
          >
            <div 
              className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="h-9 w-9 text-foreground hover:bg-muted"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="h-9 w-9 text-foreground hover:bg-muted"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>

              <span className="text-sm text-muted-foreground font-mono ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFullscreen}
                className="h-9 w-9 text-foreground hover:bg-muted"
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

DemoVideoModal.displayName = "DemoVideoModal";
