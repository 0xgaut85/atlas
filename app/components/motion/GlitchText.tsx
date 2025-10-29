'use client';

import { motion, useInView } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface GlitchTextProps {
  text: string;
  delay?: number; // ms before starting once triggered
  className?: string;
  replayOnView?: boolean; // re-run when scrolled into view
  inViewThreshold?: number; // 0..1
}

// Generate loading-style glitches that rearrange characters
const generateLoadingGlitch = (text: string): string => {
  const chars = text.split('');
  const shuffled = [...chars];
  
  // Randomly swap 2-3 characters
  for (let i = 0; i < Math.min(3, chars.length); i++) {
    const idx1 = Math.floor(Math.random() * chars.length);
    const idx2 = Math.floor(Math.random() * chars.length);
    [shuffled[idx1], shuffled[idx2]] = [shuffled[idx2], shuffled[idx1]];
  }
  
  return shuffled.join('');
};

export default function GlitchText({ text, delay = 1500, className = '', replayOnView = true, inViewThreshold = 0.4 }: GlitchTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [isGlitching, setIsGlitching] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(spanRef, { amount: inViewThreshold, once: !replayOnView });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!inView && replayOnView) return; // wait until visible
    if (prefersReducedMotion) {
      setDisplayText(text);
      return;
    }

    let intervalId: any;
    const timeoutId = setTimeout(() => {
      setIsGlitching(true);
      const glitchDuration = 3000; // 3 seconds
      const frameMs = 60;
      let elapsed = 0;

      intervalId = setInterval(() => {
        elapsed += frameMs;
        const progress = elapsed / glitchDuration;

        if (progress < 1) {
          if (progress < 0.83) {
            setDisplayText(generateLoadingGlitch(text));
          } else {
            const settleProgress = (progress - 0.83) / 0.17;
            if (Math.random() > settleProgress) {
              setDisplayText(generateLoadingGlitch(text));
            } else {
              setDisplayText(text);
            }
          }
        } else {
          clearInterval(intervalId);
          setDisplayText(text);
          setIsGlitching(false);
        }
      }, frameMs);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, delay, prefersReducedMotion, inView, replayOnView]);

  return (
    <motion.span
      ref={spanRef}
      initial={{ opacity: prefersReducedMotion ? 0 : 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: prefersReducedMotion ? delay / 1000 : 0 }}
      className={className}
      style={{
        color: isGlitching ? '#ff0000' : 'inherit',
        // Remove any blur/glow while glitching for a clean look
        transition: 'color 0.1s',
        display: 'inline-block',
        minWidth: '1ch',
      }}
    >
      {displayText}
    </motion.span>
  );
}

