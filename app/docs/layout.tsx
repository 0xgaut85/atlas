'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import DocsSidebar from '../components/docs/DocsSidebar';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Back Button - Top Right */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="fixed top-6 right-6 sm:top-8 sm:right-8 z-50"
      >
        <Link
          href="/"
          className="group flex items-center gap-2 px-4 sm:px-6 py-3 bg-white border-2 border-black hover:bg-black hover:text-white transition-all duration-300 shadow-lg"
        >
          <span className="text-sm sm:text-base font-medium">Back</span>
          <span className="text-lg sm:text-xl transition-transform duration-300 group-hover:translate-x-1">↩</span>
        </Link>
      </motion.div>

      <div className="flex">
        <DocsSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="lg:ml-64 flex-1 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-16 sm:py-20 lg:py-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
