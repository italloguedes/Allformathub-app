import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

import Script from "next/script";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "All Format Hub — File Conversion Tool",
  description:
    "Convert files between formats. Images, documents, audio, video, and archives. No sign-up required.",
  other: {
    "google-adsense-account": "ca-pub-8720603829530997",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          <LocaleProvider>
            <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Script
              async
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8720603829530997"
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
