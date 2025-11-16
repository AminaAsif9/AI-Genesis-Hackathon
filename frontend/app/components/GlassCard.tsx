import { cn } from "~/lib/utils";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard = ({ children, className, hover = false }: GlassCardProps) => {
  const Card = hover ? motion.div : 'div';
  
  const hoverProps = hover ? {
    whileHover: { scale: 1.02, y: -5 },
    transition: { duration: 0.2 }
  } : {};

  return (
    <Card
      className={cn(
        "glass-card p-6 shadow-lg hover:shadow-xl transition-shadow",
        className
      )}
      {...hoverProps}
    >
      {children}
    </Card>
  );
}
