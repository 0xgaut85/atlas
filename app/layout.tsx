import type { Metadata } from "next";
import { headers } from 'next/headers';
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import { WalletProvider } from "./components/WalletProvider";
import NavbarVertical from "./components/NavbarVertical";

export const metadata: Metadata = {
  title: "Atlas402",
  description: "Monetize every request, Atlas a x402 centric ecosystem",
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg',
    apple: '/logo.jpg',
  },
  openGraph: {
    title: "Atlas402",
    description: "Monetize every request, Atlas a x402 centric ecosystem",
    images: ['/logo.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Atlas402",
    description: "Monetize every request, Atlas a x402 centric ecosystem",
    images: ['/logo.jpg'],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get('cookie');

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{__html: `
          .wallet-adapter-button {
            background-color: rgba(178, 169, 98, 0.1) !important;
            color: #ff0000 !important;
            border: 1px solid rgba(178, 169, 98, 0.3) !important;
          }
          .wallet-adapter-button:hover {
            background-color: rgba(178, 169, 98, 0.2) !important;
          }
          .wallet-adapter-modal {
            background: #0a0a0a !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
          }
          .wallet-adapter-modal-title {
            color: white !important;
          }
          .wallet-adapter-modal-list-item {
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
          }
          .wallet-adapter-modal-list-item:hover {
            background: rgba(178, 169, 98, 0.1) !important;
            border-color: rgba(178, 169, 98, 0.3) !important;
          }
        `}} />
      </head>
      <body className="antialiased">
        {/* Fixed bottom-right brand logo (site-wide) */}
        <Link href="/" aria-label="Atlas402 Home" className="fixed bottom-4 left-4 lg:left-auto lg:right-4 z-[60] block p-2 bg-black rounded-xl hover:bg-red-600 transition-all duration-300 shadow-lg">
          <Image src="/logosvg.svg" alt="Atlas402" width={80} height={80} priority className="w-[60px] h-auto md:w-[80px]" />
        </Link>
        
        {/* Fixed right-side vertical nav (site-wide) */}
        <NavbarVertical />
        
        <WalletProvider cookies={cookies}>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
