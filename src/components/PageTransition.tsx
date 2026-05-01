import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  variant?: "fade" | "slide" | "scale" | "slideUp";
}

const easing: [number, number, number, number] = [0.22, 1, 0.36, 1];

const variants: Record<string, Variants> = {
  fade: {
    initial: { opacity: 0 },
    enter: { 
      opacity: 1,
      transition: { duration: 0.4, ease: easing }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3, ease: easing }
    },
  },
  slide: {
    initial: { opacity: 0, x: 20 },
    enter: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: easing }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.3, ease: easing }
    },
  },
  scale: {
    initial: { opacity: 0, scale: 0.96 },
    enter: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: easing }
    },
    exit: { 
      opacity: 0, 
      scale: 0.98,
      transition: { duration: 0.3, ease: easing }
    },
  },
  slideUp: {
    initial: { opacity: 0, y: 24 },
    enter: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5, 
        ease: easing,
      }
    },
    exit: { 
      opacity: 0, 
      y: -12,
      transition: { duration: 0.3, ease: easing }
    },
  },
};

export const PageTransition = ({ children, variant = "slideUp" }: PageTransitionProps) => {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={variants[variant]}
      className="min-h-[100dvh]"
    >
      {children}
    </motion.div>
  );
};
