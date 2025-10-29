'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';

interface CurtainRevealProps {
  leftContent: ReactNode;
  rightContent?: ReactNode;
  mediaSlot?: ReactNode;
  className?: string;
}

export default function CurtainReveal({ 
  leftContent, 
  rightContent, 
  mediaSlot,
  className = '' 
}: CurtainRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  const curtainMask = {
    initial: { 
      clipPath: shouldReduceMotion ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)' 
    },
    animate: { 
      clipPath: 'inset(0 0 0 0)',
      transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <motion.section 
      className={`relative overflow-hidden ${className}`}
      initial="initial"
      whileInView="animate"
      viewport={{ threshold: 0.35 }}
      variants={staggerContainer}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px] lg:min-h-[800px]">
        {/* Left Panel */}
        <motion.div 
          className="bg-black text-white p-8 lg:p-12 flex flex-col justify-center relative"
          variants={curtainMask}
        >
          <motion.div variants={fadeUp}>
            {leftContent}
          </motion.div>
        </motion.div>

        {/* Right Panel */}
        <motion.div 
          className="bg-white text-black p-8 lg:p-12 flex flex-col justify-center"
          variants={fadeUp}
        >
          {rightContent}
        </motion.div>
      </div>

      {/* Optional Media Slot */}
      {mediaSlot && (
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          variants={fadeUp}
        >
          {mediaSlot}
        </motion.div>
      )}
    </motion.section>
  );
}

