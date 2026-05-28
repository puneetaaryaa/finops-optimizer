import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Multi-Region Cloud Asset Optimizer | FinOps Dynamic Dashboard",
  description: "Real-time, state-of-the-art monitoring, analytics, and auto-scaling optimizer for multi-regional cloud workloads, designed with premium aesthetics.",
  keywords: ["FinOps", "Cloud Optimization", "Autoscaling", "Next.js", "Express", "Tailwind CSS", "MySQL"],
  authors: [{ name: "Antigravity AI Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Fallbacks for older browsers and icons */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>" />
      </head>
      <body className="antialiased min-h-screen text-slate-100 bg-[#090D16] tech-grid-bg relative select-none">
        {/* Animated Background Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none -z-10 animate-pulse duration-[8s]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-900/10 blur-[130px] pointer-events-none -z-10 animate-pulse duration-[12s]" />
        
        <main className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 min-h-screen flex flex-col gap-6">
          {children}
        </main>
      </body>
    </html>
  );
}
