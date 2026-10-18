import React from 'react';
import { motion } from 'motion/react';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  showSubtitle?: boolean;
  animated?: boolean;
  className?: string;
}

export const CoolvengersLogo: React.FC<Props> = ({
  size = 'md',
  showWordmark = true,
  showSubtitle = true,
  animated = true,
  className = '',
}) => {
  const sizeMap = {
    sm: {
      full: 'h-8 sm:h-9',
      mascot: 'w-7 h-7',
    },
    md: {
      full: 'h-10 sm:h-11',
      mascot: 'w-9 h-9',
    },
    lg: {
      full: 'h-13 sm:h-14',
      mascot: 'w-12 h-12',
    },
    xl: {
      full: 'h-16 sm:h-20',
      mascot: 'w-16 h-16',
    },
  };

  const currentSize = sizeMap[size];

  if (!showWordmark) {
    return (
      <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
        {animated && (
          <motion.div
            className="absolute -inset-1 rounded-full bg-gradient-to-r from-sky-400/25 via-cyan-400/30 to-amber-400/20 blur-xs -z-10"
            animate={{
              opacity: [0.35, 0.75, 0.35],
              scale: [0.96, 1.05, 0.96],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
        <motion.img
          src="/coolvengers-mascot.png"
          alt="Coolvengers Mascot"
          className={`${currentSize.mascot} object-contain drop-shadow-xs`}
          whileHover={animated ? { scale: 1.06, rotate: 2 } : undefined}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        />
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center select-none ${className}`}>
      {/* Subtle Ambient Cool Glow behind the logo */}
      {animated && (
        <motion.div
          className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-sky-400/20 via-cyan-300/25 to-blue-500/15 blur-sm -z-10"
          animate={{
            opacity: [0.3, 0.65, 0.3],
            scale: [0.98, 1.02, 0.98],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      <motion.img
        src="/coolvengers-logo.png"
        alt="Coolvengers Aircons - AC Installation & Service"
        className={`${currentSize.full} w-auto object-contain drop-shadow-xs`}
        whileHover={animated ? { scale: 1.03 } : undefined}
        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      />
    </div>
  );
};
