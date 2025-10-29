'use client';

import Link from 'next/link';
import Image from 'next/image';

interface DocsHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function DocsHeader({ sidebarOpen, setSidebarOpen }: DocsHeaderProps) {
  // Header removed; using global site navigation
  return null;
}
