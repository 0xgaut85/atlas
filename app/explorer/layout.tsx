import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";
import "../globals.css";

const garamond = EB_Garamond({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

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
  return (
    <html lang="en">
      <body className={garamond.className}>{children}</body>
    </html>
  );
}
