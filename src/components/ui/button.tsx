import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_hsl(45_93%_49%/0.4)] hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-[0_0_15px_hsl(355_90%_62%/0.4)] hover:-translate-y-0.5",
        outline: "border-2 border-primary/30 bg-transparent text-foreground hover:bg-primary/10 hover:border-primary hover:text-primary hover:shadow-[0_0_15px_hsl(45_93%_49%/0.2)] hover:-translate-y-0.5",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md hover:-translate-y-0.5",
        ghost: "hover:bg-primary/10 hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-glow",
        premium: "bg-gradient-to-r from-primary via-primary-glow to-primary text-primary-foreground shadow-[0_4px_15px_hsl(45_93%_49%/0.3)] hover:shadow-[0_6px_25px_hsl(45_93%_49%/0.5)] hover:-translate-y-1 hover:brightness-110 bg-[length:200%_100%] hover:bg-right transition-all duration-500",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-[0_0_20px_hsl(38_92%_50%/0.4)] hover:-translate-y-0.5",
        binance: "bg-primary text-primary-foreground font-bold tracking-wide hover:shadow-[0_0_30px_hsl(45_93%_49%/0.5),0_0_60px_hsl(45_93%_49%/0.2)] hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8",
        xl: "h-14 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
