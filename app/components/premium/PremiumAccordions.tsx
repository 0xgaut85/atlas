'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState } from 'react';

interface AccordionItem {
  id: string;
  question: string;
  answer: ReactNode;
}

interface PremiumAccordionsProps {
  items: AccordionItem[];
  className?: string;
}

export default function PremiumAccordions({ items, className = '' }: PremiumAccordionsProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const fadeUp = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: 'auto' },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item) => (
        <div key={item.id} className="bg-white border-2 border-dashed border-black hover:border-red-500 transition-colors duration-300">
          <button
            onClick={() => toggleItem(item.id)}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-300"
          >
            <span className="font-title text-lg font-medium text-black">
              {item.question}
            </span>
            <motion.div
              animate={{ rotate: openItems.includes(item.id) ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </button>
          
          <AnimatePresence>
            {openItems.includes(item.id) && (
              <motion.div
                variants={fadeUp}
                initial="initial"
                animate="animate"
                exit="exit"
                className="overflow-hidden"
              >
                <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                  {item.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

