'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface KPIMetric {
  id: string;
  value: string;
  label: string;
  description?: string;
}

interface KPIFilmstripProps {
  metrics: KPIMetric[];
  className?: string;
}

export default function KPIFilmstrip({ metrics, className = '' }: KPIFilmstripProps) {
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
      className={`overflow-hidden ${className}`}
      initial="initial"
      whileInView="animate"
      viewport={{ threshold: 0.35 }}
      variants={staggerContainer}
    >
      <div className="flex space-x-6 lg:space-x-8">
        {metrics.map((metric) => (
          <motion.div
            key={metric.id}
            variants={fadeUp}
            className="flex-shrink-0"
          >
            <div className="bg-white border-2 border-dashed border-black p-6 lg:p-8 min-w-[200px] lg:min-w-[250px] hover:border-red-500 transition-colors duration-300">
              <div className="text-center">
                <div className="font-title text-3xl lg:text-4xl font-bold text-red-500 mb-2">
                  {metric.value}
                </div>
                <div className="text-sm font-medium text-black uppercase tracking-wider mb-2">
                  {metric.label}
                </div>
                {metric.description && (
                  <div className="text-xs text-gray-600 leading-relaxed">
                    {metric.description}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

