import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ReconX — Payment Clearing & Reconciliation Platform",
  description: "Enterprise multi-pass payment clearing, automated ledger reconciliation, and exception resolution platform.",
  icons: {
    icon: [
      { url: "/icon.svg?v=2", type: "image/svg+xml" },
      { url: "/icon.png?v=2", sizes: "256x256", type: "image/png" },
      { url: "/favicon.ico?v=2", sizes: "any" },
    ],
    shortcut: "/icon.svg?v=2",
    apple: "/apple-touch-icon.png?v=2",
  },
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg?v=2" />
        <link rel="icon" type="image/png" sizes="256x256" href="/icon.png?v=2" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
      </head>
      <body
        className={`${plusJakarta.variable} ${jetbrainsMono.variable} font-sans antialiased text-slate-900 dark:text-slate-100 min-h-screen bg-slate-50 dark:bg-slate-950`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
