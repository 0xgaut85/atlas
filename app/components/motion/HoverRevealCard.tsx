'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface HoverRevealCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function HoverRevealCard({ children, className = '', delay = 0 }: HoverRevealCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      onMouseEnter={() => setIsRevealed(true)}
      onMouseLeave={() => setIsRevealed(false)}
      onFocus={() => setIsRevealed(true)}
      onBlur={() => setIsRevealed(false)}
      tabIndex={0}
      className={className}
      style={{ cursor: 'pointer' }}
    >
      <motion.div
        animate={{
          scale: prefersReducedMotion ? 1 : isRevealed ? 1.0 : 0.98,
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="h-full"
      >
      <motion.div
        animate={{
          opacity: prefersReducedMotion ? 1 : isRevealed ? 1 : 0.7,
        }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        {children}
      </motion.div>
      </motion.div>
    </motion.div>
  );
}

