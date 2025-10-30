import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search } from 'lucide-react';
import { HeadingContainer } from './page-utils';

export function ExplorerHeading() {
  return (
    <HeadingContainer className="flex flex-col gap-4 py-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex-shrink-0">
            <Image 
              src="/logo.jpg" 
              alt="Atlas402 Logo" 
              width={48} 
              height={48}
              className="rounded-lg"
              priority
            />
          </Link>
          <h1 className="text-3xl md:text-5xl font-title font-bold">Atlas402 Explorer</h1>
        </div>
        <p className="text-gray-600 text-sm md:text-base font-body">
          The x402 analytics dashboard and block explorer by Atlas402
        </p>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-2">
        <button className="w-full md:w-fit flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-body">
          <Search className="size-4" />
          <span className="text-sm">Search</span>
        </button>
        <Link
          href="/workspace"
          className="w-full md:w-fit flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-body"
        >
          <Plus className="size-4" />
          <span className="text-sm">Register Resource</span>
        </Link>
      </div>
    </HeadingContainer>
  );
}

