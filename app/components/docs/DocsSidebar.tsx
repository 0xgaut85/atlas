'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const docSections = [
  {
    title: 'Getting Started',
    items: [
      { label: 'Introduction', href: '/docs' },
      { label: 'What is x402?', href: '/docs/x402-protocol' },
      { label: 'Quick Start', href: '/docs/quickstart' },
    ]
  },
  {
    title: 'Building Services',
    items: [
      { label: 'Express.js Server', href: '/docs/server-express' },
      { label: 'Python Server', href: '/docs/server-python' },
      { label: 'Echo Merchant', href: '/docs/echo-merchant' },
    ]
  },
  {
    title: 'Client Integration',
    items: [
      { label: 'Client Libraries', href: '/docs/clients' },
      { label: 'Payment Flow', href: '/docs/payment-flow' },
      { label: 'Code Examples', href: '/docs/examples' },
    ]
  },
  {
    title: 'Advanced',
    items: [
      { label: 'Facilitators', href: '/docs/facilitators' },
      { label: 'API Reference', href: '/docs/api-reference' },
      { label: 'Deployment', href: '/docs/deployment' },
    ]
  }
];

interface DocsSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function DocsSidebar({ sidebarOpen, setSidebarOpen }: DocsSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside className={`fixed left-0 top-0 h-screen w-64 overflow-y-auto border-r-2 border-dashed border-black bg-white z-40 transform transition-transform duration-300 lg:transform-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 space-y-8">
          {docSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-bold text-red-500 uppercase tracking-[0.2em] mb-3">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`block px-3 py-3 text-sm transition-all min-h-[44px] flex items-center border-2 border-dashed ${
                          isActive
                            ? 'border-red-500 text-red-500 bg-red-50'
                            : 'border-black text-black hover:bg-gray-50'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* External Links */}
          <div className="pt-6 border-t-2 border-dashed border-red-500/30">
            <h3 className="text-xs font-bold text-red-500 uppercase tracking-[0.2em] mb-3">
              Resources
            </h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="https://docs.payai.network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-3 text-sm text-black hover:bg-gray-50 border-2 border-dashed border-black transition-all min-h-[44px] flex items-center"
                >
                  PayAI Docs
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/atlas402"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-3 text-sm text-black hover:bg-gray-50 border-2 border-dashed border-black transition-all min-h-[44px] flex items-center"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
