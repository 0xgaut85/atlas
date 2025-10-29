'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState } from 'react';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface PremiumTabsProps {
  tabs: Tab[];
  className?: string;
}

export default function PremiumTabs({ tabs, className = '' }: PremiumTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  };

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className="flex border-b-2 border-dashed border-black mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 font-medium transition-colors duration-300 ${
              activeTab === tab.id
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-gray-600 hover:text-red-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={fadeUp}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {tabs.find(tab => tab.id === activeTab)?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

