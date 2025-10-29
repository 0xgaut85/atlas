'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface MarginaliaProps {
  children: ReactNode;
  notes: Array<{
    id: string;
    content: ReactNode;
    position?: 'left' | 'right';
  }>;
  className?: string;
}

export default function Marginalia({ children, notes, className = '' }: MarginaliaProps) {
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 ${className}`}
      initial="initial"
      whileInView="animate"
      viewport={{ threshold: 0.35 }}
      variants={staggerContainer}
    >
      {/* Main Content */}
      <motion.div 
        className="lg:col-span-8"
        variants={fadeUp}
      >
        {children}
      </motion.div>

      {/* Marginalia Notes */}
      <motion.div 
        className="lg:col-span-4 space-y-6"
        variants={fadeUp}
      >
        {notes.map((note) => (
          <motion.div
            key={note.id}
            className="relative"
            variants={fadeUp}
          >
            {/* Connector Line */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-red-500 opacity-30" />
            
            {/* Note Content */}
            <div className="ml-4 bg-white border-2 border-dashed border-red-500 p-4">
              <div className="text-sm text-gray-600 leading-relaxed">
                {note.content}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

