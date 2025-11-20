import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { FloatingButtons } from "@/components/FloatingButtons";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Quran Memorizer - Your AI-Powered Memorization Companion",
  description: "Revolutionary Quran memorization app with AI-powered learning, spaced repetition, and beautiful recitations.",
  keywords: ["Quran", "memorization", "Hifz", "Islamic", "learning", "AI"],
  authors: [{ name: "Quran Memorizer Team" }],
  creator: "Quran Memorizer",
  publisher: "Quran Memorizer",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Quran Memorizer"
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1B4F3A" },
    { media: "(prefers-color-scheme: dark)", color: "#0c2621" }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AnimatedBackground />
          <FloatingButtons />
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <Sidebar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
