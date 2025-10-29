'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface BandProps {
  children: ReactNode;
  watermark?: string;
  className?: string;
  variant?: 'default' | 'inverted';
}

export default function Band({ 
  children, 
  watermark, 
  className = '',
  variant = 'default'
}: BandProps) {
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  };

  const bgClass = variant === 'inverted' ? 'bg-black text-white' : 'bg-white text-black';
  const borderClass = variant === 'inverted' ? 'border-white' : 'border-black';

  return (
    <motion.section 
      className={`relative w-full py-16 lg:py-24 ${bgClass} ${className}`}
      initial="initial"
      whileInView="animate"
      viewport={{ threshold: 0.35 }}
      variants={fadeUp}
    >
      {/* Watermark */}
      {watermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-title text-8xl lg:text-9xl font-bold opacity-5 select-none">
            {watermark}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Bottom Separator */}
      <div className={`absolute bottom-0 left-0 right-0 h-px border-t border-dashed ${borderClass} opacity-30`} />
    </motion.section>
  );
}

