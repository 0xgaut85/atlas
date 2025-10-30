import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative border-t border-black/10 py-12 sm:py-16 md:py-20 px-4 sm:px-6 overflow-hidden bg-gray-50">
      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.0' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '150px 150px'
        }}
      />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-12 sm:mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-5 tracking-tight text-black font-title">Atlas402</h3>
            <p className="text-gray-600 leading-relaxed font-light text-sm sm:text-base max-w-md">
              The infrastructure layer for pay-per-request digital services. Built on open standards, powered by blockchain technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-medium mb-6 text-gray-500 uppercase tracking-[0.25em]">Product</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/docs" className="text-gray-600 hover:text-red-600 transition-colors duration-300 font-light text-base">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/dapp" className="text-gray-600 hover:text-red-600 transition-colors duration-300 font-light text-base">
                  Launch App
                </Link>
              </li>
              <li>
                <Link href="/explorer" className="text-gray-600 hover:text-red-600 transition-colors duration-300 font-light text-base">
                  Explorer
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xs font-medium mb-6 text-gray-500 uppercase tracking-[0.25em]">Community</h4>
            <ul className="space-y-4">
              <li>
                <a 
                  href="https://github.com/atlas402" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-red-600 transition-colors duration-300 font-light text-base"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a 
                  href="https://x.com/atlas402dotcom" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-red-600 transition-colors duration-300 font-light text-base"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a 
                  href="https://t.me/xatlas402" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-red-600 transition-colors duration-300 font-light text-base"
                >
                  Telegram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-black/20 flex flex-col md:flex-row justify-between items-center gap-5">
          <p className="text-gray-500 text-sm font-light">
            © 2025 Atlas402. Built in the open.
          </p>
          <div className="flex gap-8 text-sm text-gray-500 font-light">
            <Link href="/privacy" className="hover:text-red-600 transition-colors duration-300">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-red-600 transition-colors duration-300">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
