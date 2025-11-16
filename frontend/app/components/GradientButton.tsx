import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import type { ReactNode, ComponentPropsWithoutRef } from "react";

interface GradientButtonProps extends ComponentPropsWithoutRef<typeof Button> {
  gradient?: "primary" | "secondary" | "accent";
  children: ReactNode;
}

export const GradientButton = ({ 
  children, 
  className, 
  gradient = "primary",
  asChild,
  ...props 
}: GradientButtonProps) => {
  const gradients = {
    primary: "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90",
    secondary: "bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90",
    accent: "bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90"
  };

  // If asChild is true, just pass through to Button without motion wrapper
  if (asChild) {
    return (
      <Button
        asChild
        className={cn(
          "rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all",
          gradients[gradient],
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button
      className={cn(
        "rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all",
        gradients[gradient],
        className
      )}
      {...props}
    >
      <motion.span
        className="flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {children}
      </motion.span>
    </Button>
  );
}