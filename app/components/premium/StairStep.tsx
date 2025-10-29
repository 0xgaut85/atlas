'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Step {
  id: string;
  number: number;
  title: string;
  content: ReactNode;
}

interface StairStepProps {
  steps: Step[];
  className?: string;
}

export default function StairStep({ steps, className = '' }: StairStepProps) {
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <motion.div 
      className={`space-y-16 lg:space-y-24 ${className}`}
      initial="initial"
      whileInView="animate"
      viewport={{ threshold: 0.35 }}
      variants={staggerContainer}
    >
      {steps.map((step, index) => {
        const isEven = index % 2 === 0;
        const alignment = isEven ? 'text-left' : 'text-right';
        const marginClass = isEven ? 'ml-0 mr-auto' : 'ml-auto mr-0';
        
        return (
          <motion.div
            key={step.id}
            variants={fadeUp}
            className={`max-w-2xl ${marginClass}`}
          >
            <div className="bg-white border-2 border-dashed border-black p-8 lg:p-12 hover:border-red-500 transition-colors duration-300">
              {/* Large step number */}
              <div className="mb-6">
                <span className="font-title text-6xl lg:text-8xl font-bold text-red-500 leading-none">
                  {step.number.toString().padStart(2, '0')}
                </span>
              </div>
              
              {/* Step title */}
              <h3 className={`font-title text-2xl lg:text-3xl font-bold text-black mb-6 ${alignment}`}>
                {step.title}
              </h3>
              
              {/* Step content */}
              <div className={`text-gray-600 leading-relaxed ${alignment}`}>
                {step.content}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

