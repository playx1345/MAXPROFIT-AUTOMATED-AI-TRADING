import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        bitcoin: "hsl(var(--bitcoin-orange))",
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        teal: {
          DEFAULT: "hsl(var(--logo-teal))",
        },
        crypto: {
          green: "hsl(var(--crypto-green))",
          red: "hsl(var(--crypto-red))",
        },
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
        display: ['Poppins', '"Playfair Display"', 'Georgia', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'touch': '44px',
        'touch-lg': '48px',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(10px)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "scale-out": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.95)", opacity: "0" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-out-right": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-out-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "slide-in-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-out-down": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(100%)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "glow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "rotate-y": {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(360deg)" },
        },
        "scroll-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(45 93% 49% / 0.3)" },
          "50%": { boxShadow: "0 0 40px hsl(45 93% 49% / 0.6)" },
        },
        "pulse-accent": {
          "0%, 100%": { boxShadow: "0 0 15px hsl(38 92% 50% / 0.3)" },
          "50%": { boxShadow: "0 0 30px hsl(38 92% 50% / 0.5)" },
        },
        "fade-in-fast": {
          "0%": { opacity: "0", transform: "translateY(5px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-hover": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.05)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-bottom": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "text-reveal": {
          "0%": { opacity: "0", transform: "translateY(30px)", filter: "blur(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)", filter: "blur(0)" },
        },
        "text-reveal-delayed": {
          "0%, 20%": { opacity: "0", transform: "translateY(20px)", filter: "blur(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)", filter: "blur(0)" },
        },
        "particle-float": {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)", opacity: "0.6" },
          "25%": { transform: "translate(10px, -15px) rotate(90deg)", opacity: "1" },
          "50%": { transform: "translate(20px, 0) rotate(180deg)", opacity: "0.6" },
          "75%": { transform: "translate(10px, 15px) rotate(270deg)", opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { 
            boxShadow: "0 0 20px hsl(45 93% 49% / 0.4), 0 0 40px hsl(45 93% 49% / 0.2), 0 0 60px hsl(45 93% 49% / 0.1)",
            borderColor: "hsl(45 93% 49% / 0.5)"
          },
          "50%": { 
            boxShadow: "0 0 30px hsl(45 93% 49% / 0.6), 0 0 60px hsl(45 93% 49% / 0.4), 0 0 80px hsl(45 93% 49% / 0.2)",
            borderColor: "hsl(45 93% 49% / 0.8)"
          },
        },
        "border-glow-animate": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "coin-rotate": {
          "0%": { transform: "rotateY(0deg) rotateX(10deg)" },
          "100%": { transform: "rotateY(360deg) rotateX(10deg)" },
        },
        "slide-notification": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "10%": { transform: "translateX(0)", opacity: "1" },
          "90%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(-100%)", opacity: "0" },
        },
        "typing": {
          "0%": { width: "0" },
          "100%": { width: "100%" },
        },
        "blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "sparkle": {
          "0%, 100%": { transform: "scale(0) rotate(0deg)", opacity: "0" },
          "50%": { transform: "scale(1) rotate(180deg)", opacity: "1" },
        },
        "ripple": {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        "tilt-3d": {
          "0%, 100%": { transform: "perspective(1000px) rotateX(0) rotateY(0)" },
          "25%": { transform: "perspective(1000px) rotateX(2deg) rotateY(3deg)" },
          "75%": { transform: "perspective(1000px) rotateX(-2deg) rotateY(-3deg)" },
        },
        "counter-tick": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "success-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(160 85% 43% / 0.4)" },
          "50%": { boxShadow: "0 0 0 10px hsl(160 85% 43% / 0)" },
        },
        "neon-border": {
          "0%, 100%": { 
            boxShadow: "0 0 5px hsl(45 93% 49% / 0.5), inset 0 0 5px hsl(45 93% 49% / 0.1)"
          },
          "50%": { 
            boxShadow: "0 0 20px hsl(45 93% 49% / 0.8), inset 0 0 10px hsl(45 93% 49% / 0.2)"
          },
        },
        "logo-carousel": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "hover-glow": {
          "0%, 100%": { boxShadow: "0 0 0 hsl(45 93% 49% / 0)" },
          "50%": { boxShadow: "0 0 30px hsl(45 93% 49% / 0.3)" },
        },
        "card-shine": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "scale-out": "scale-out 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-out-right": "slide-out-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "slide-out-left": "slide-out-left 0.3s ease-out",
        "slide-in-up": "slide-in-up 0.3s ease-out",
        "slide-out-down": "slide-out-down 0.3s ease-out",
        "shimmer": "shimmer 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 1.5s ease-in-out infinite",
        "rotate-y": "rotate-y 12s linear infinite",
        "scroll-left": "scroll-left 20s linear infinite",
        "pulse-glow": "pulse-glow 1.5s ease-in-out infinite",
        "fade-in-fast": "fade-in-fast 0.2s ease-out",
        "scale-hover": "scale-hover 0.2s ease-out",
        "slide-up": "slide-up 0.5s ease-out forwards",
        "slide-in-bottom": "slide-in-bottom 0.6s ease-out forwards",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        "count-up": "count-up 0.4s ease-out forwards",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "gradient-shift": "gradient-shift 3s ease infinite",
        "spin-slow": "spin-slow 3s linear infinite",
        "text-reveal": "text-reveal 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        "text-reveal-delayed": "text-reveal-delayed 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        "particle-float": "particle-float 8s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "border-glow": "border-glow-animate 3s ease infinite",
        "coin-rotate": "coin-rotate 8s linear infinite",
        "slide-notification": "slide-notification 5s ease-in-out forwards",
        "typing": "typing 3s steps(40, end) forwards",
        "blink": "blink 1s step-end infinite",
        "sparkle": "sparkle 2s ease-in-out infinite",
        "ripple": "ripple 0.6s linear",
        "tilt-3d": "tilt-3d 6s ease-in-out infinite",
        "counter-tick": "counter-tick 0.3s ease-out",
        "success-pulse": "success-pulse 2s ease-out infinite",
        "neon-border": "neon-border 2s ease-in-out infinite",
        "logo-carousel": "logo-carousel 30s linear infinite",
        "hover-glow": "hover-glow 2s ease-in-out infinite",
        "card-shine": "card-shine 3s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
