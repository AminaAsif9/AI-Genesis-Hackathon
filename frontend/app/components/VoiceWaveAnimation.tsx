import { motion } from "framer-motion";
import { cn } from "~/lib/utils";

interface VoiceWaveAnimationProps {
  isActive?: boolean;
  className?: string;
}

export function VoiceWaveAnimation({ isActive = false, className }: VoiceWaveAnimationProps) {
  const bars = [
    { delay: 0, height: [20, 40, 20] },
    { delay: 0.1, height: [30, 60, 30] },
    { delay: 0.2, height: [25, 50, 25] },
    { delay: 0.15, height: [35, 70, 35] },
    { delay: 0.25, height: [20, 45, 20] },
  ];

  return (
    <div className={cn("flex items-center justify-center gap-2 h-20", className)}>
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          className="w-2 bg-linear-to-t from-accent to-primary rounded-full"
          initial={{ height: 20 }}
          animate={
            isActive
              ? {
                  height: bar.height,
                  transition: {
                    duration: 0.8,
                    repeat: Infinity,
                    delay: bar.delay,
                    ease: "easeInOut",
                  },
                }
              : { height: 20 }
          }
        />
      ))}
    </div>
  );
}
