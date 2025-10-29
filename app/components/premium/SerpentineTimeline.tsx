'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactNode, useEffect, useRef, useState } from 'react';

interface TimelinePhase {
  id: string;
  title: string;
  content: ReactNode;
  status: 'completed' | 'current' | 'upcoming';
}

interface SerpentineTimelineProps {
  phases: TimelinePhase[];
  className?: string;
}

export default function SerpentineTimeline({ phases, className = '' }: SerpentineTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  // Generate SVG path points for serpentine curve
  const generatePathPoints = () => {
    const points = [];
    const phaseCount = phases.length;
    
    for (let i = 0; i < phaseCount; i++) {
      const x = (i / (phaseCount - 1)) * 100;
      const y = 50 + Math.sin((i / phaseCount) * Math.PI * 2) * 20;
      points.push(`${x},${y}`);
    }
    
    return points.join(' ');
  };

  return (
    <motion.div 
      ref={containerRef}
      className={`relative ${className}`}
      initial="initial"
      whileInView="animate"
      viewport={{ threshold: 0.35 }}
      variants={staggerContainer}
    >
      {/* SVG Timeline Path */}
      <div className="absolute inset-0 pointer-events-none">
        <svg 
          className="w-full h-full" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
        >
          <motion.path
            d={`M ${generatePathPoints()}`}
            stroke="#ff0000"
            strokeWidth="0.5"
            fill="none"
            strokeDasharray="1 1"
            style={{ pathLength }}
          />
        </svg>
      </div>

      {/* Timeline Phases */}
      <div className="relative space-y-16 lg:space-y-24">
        {phases.map((phase, index) => (
          <motion.div
            key={phase.id}
            variants={fadeUp}
            className={`flex items-center ${
              index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
            }`}
          >
            {/* Phase Content */}
            <div className={`flex-1 ${index % 2 === 0 ? 'pr-8 lg:pr-16' : 'pl-8 lg:pl-16'}`}>
              <div className="bg-white border-2 border-dashed border-black p-6 lg:p-8 hover:border-red-500 transition-colors duration-300">
                <div className="flex items-center mb-4">
                  <div className={`w-3 h-3 rounded-full mr-4 ${
                    phase.status === 'completed' ? 'bg-red-500' :
                    phase.status === 'current' ? 'bg-red-500 animate-pulse' :
                    'bg-gray-300'
                  }`} />
                  <span className="text-sm font-medium text-red-500 uppercase tracking-wider">
                    {phase.status}
                  </span>
                </div>
                
                <h3 className="font-title text-xl lg:text-2xl font-bold text-black mb-4">
                  {phase.title}
                </h3>
                
                <div className="text-gray-600 leading-relaxed">
                  {phase.content}
                </div>
              </div>
            </div>

            {/* Phase Anchor */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {index + 1}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

