import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Atlas402 Explorer",
  description: "Atlas402 Network Explorer - Track transactions, facilitators, and network activity",
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function ExplorerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
