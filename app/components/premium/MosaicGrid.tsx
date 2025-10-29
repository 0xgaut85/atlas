'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface MosaicItem {
  id: string;
  title: string;
  content: ReactNode;
  href?: string;
  tag?: string;
}

interface MosaicGridProps {
  items: MosaicItem[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
};

export default function MosaicGrid({ 
  items, 
  columns = 3, 
  className = '' 
}: MosaicGridProps) {
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  return (
    <motion.div 
      className={`grid ${gridCols[columns]} gap-6 lg:gap-8 ${className}`}
      initial="initial"
      whileInView="animate"
      viewport={{ threshold: 0.35 }}
      variants={staggerContainer}
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          variants={fadeUp}
          className="group"
        >
          <div className="h-full bg-white border-2 border-dashed border-black p-6 lg:p-8 hover:border-red-500 transition-colors duration-300">
            {item.tag && (
              <div className="inline-block bg-red-500 text-white text-xs font-medium px-2 py-1 mb-4 uppercase tracking-wider">
                {item.tag}
              </div>
            )}
            
            <h3 className="font-title text-xl lg:text-2xl font-bold text-black mb-4 group-hover:text-red-500 transition-colors duration-300">
              {item.title}
            </h3>
            
            <div className="text-gray-600 leading-relaxed">
              {item.content}
            </div>
            
            {item.href && (
              <div className="mt-6">
                <a 
                  href={item.href}
                  className="inline-flex items-center text-red-500 font-medium hover:text-red-600 transition-colors duration-300"
                >
                  Learn more
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

