import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GM Dynasty Lite - Own the Franchise. Set the Strategy.",
  description:
    "Premium football franchise simulation platform. Build teams, set tactics, challenge rivals, and compete through realistic live simulations.",
  keywords: [
    "football",
    "franchise",
    "simulation",
    "sports",
    "strategy",
    "dynasty",
  ],
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/logos/gm-logo.png",
        type: "image/png",
      },
    ],
    shortcut: "/favicon.ico",
    apple: "/logos/gm-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`${inter.className} antialiased bg-navy-primary text-text-light`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}