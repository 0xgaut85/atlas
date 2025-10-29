'use client';

import { motion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';

interface SynopsisItem {
  id: string;
  label: string;
  href?: string;
}

interface StickySynopsisProps {
  items: SynopsisItem[];
  children: ReactNode;
  className?: string;
}

export default function StickySynopsis({ 
  items, 
  children, 
  className = '' 
}: StickySynopsisProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            if (id) setActiveId(id);
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe all sections with IDs
    const sections = document.querySelectorAll('[id]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 ${className}`}>
      {/* Sticky Synopsis Rail */}
      <motion.div 
        className="lg:sticky lg:top-24 lg:h-fit"
        initial="initial"
        animate="animate"
        variants={fadeUp}
      >
        <div className="bg-white border-2 border-dashed border-black p-6">
          <h3 className="font-title text-lg font-bold text-black mb-6">Contents</h3>
          <nav className="space-y-3">
            {items.map((item) => (
              <a
                key={item.id}
                href={item.href || `#${item.id}`}
                className={`block text-sm transition-colors duration-300 ${
                  activeId === item.id
                    ? 'text-red-500 font-medium'
                    : 'text-gray-600 hover:text-red-500'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        className="lg:col-span-3"
        initial="initial"
        animate="animate"
        variants={fadeUp}
      >
        {children}
      </motion.div>
    </div>
  );
}

