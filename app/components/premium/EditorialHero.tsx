'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface EditorialHeroProps {
  variant?: 'center' | 'left-black' | 'top-banner';
  eyebrow?: string;
  title: string;
  dek?: string;
  ctas?: ReactNode;
  className?: string;
}

const variants = {
  center: 'text-center',
  'left-black': 'grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16',
  'top-banner': 'text-center max-w-4xl mx-auto'
};

const leftBlackStyles = {
  center: '',
  'left-black': 'bg-black text-white p-8 lg:p-12 flex flex-col justify-center',
  'top-banner': ''
};

const rightWhiteStyles = {
  center: '',
  'left-black': 'bg-white text-black p-8 lg:p-12 flex flex-col justify-center',
  'top-banner': ''
};

export default function EditorialHero({
  variant = 'center',
  eyebrow,
  title,
  dek,
  ctas,
  className = ''
}: EditorialHeroProps) {
  const containerClass = variants[variant];
  const leftClass = leftBlackStyles[variant];
  const rightClass = rightWhiteStyles[variant];

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

  if (variant === 'left-black') {
    return (
      <motion.section 
        className={`${containerClass} ${className}`}
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <motion.div className={leftClass} variants={fadeUp}>
          {eyebrow && (
            <motion.p 
              className="text-sm font-medium text-red-500 uppercase tracking-wider mb-4"
              variants={fadeUp}
            >
              {eyebrow}
            </motion.p>
          )}
          <motion.h1 
            className="font-title text-4xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6"
            variants={fadeUp}
          >
            {title}
          </motion.h1>
          {dek && (
            <motion.p 
              className="text-lg lg:text-xl text-gray-300 leading-relaxed"
              variants={fadeUp}
            >
              {dek}
            </motion.p>
          )}
        </motion.div>
        
        <motion.div className={rightClass} variants={fadeUp}>
          {ctas}
        </motion.div>
      </motion.section>
    );
  }

  return (
    <motion.section 
      className={`${containerClass} ${className}`}
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {eyebrow && (
        <motion.p 
          className="text-sm font-medium text-red-500 uppercase tracking-wider mb-4"
          variants={fadeUp}
        >
          {eyebrow}
        </motion.p>
      )}
      
      <motion.h1 
        className="font-title text-4xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6"
        variants={fadeUp}
      >
        {title}
      </motion.h1>
      
      {dek && (
        <motion.p 
          className="text-lg lg:text-xl text-gray-600 leading-relaxed mb-8"
          variants={fadeUp}
        >
          {dek}
        </motion.p>
      )}
      
      {ctas && (
        <motion.div variants={fadeUp}>
          {ctas}
        </motion.div>
      )}
    </motion.section>
  );
}

