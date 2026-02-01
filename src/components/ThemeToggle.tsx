import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  const toggleTheme = useCallback(() => {
    // Haptic feedback on mobile
    if ("vibrate" in navigator) {
      navigator.vibrate(10);
    }
    setTheme(isDark ? "light" : "dark");
  }, [isDark, setTheme]);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="w-10 h-10 rounded-xl bg-muted/50 border border-border"
        disabled
      >
        <span className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-xl bg-muted/50 border border-border hover:bg-muted hover:border-primary/30 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background overflow-hidden no-theme-transition"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <Sun 
        className={`absolute h-5 w-5 text-primary transition-all duration-300 ${
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`} 
      />
      <Moon 
        className={`absolute h-5 w-5 text-primary transition-all duration-300 ${
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        }`} 
      />
    </Button>
  );
}
