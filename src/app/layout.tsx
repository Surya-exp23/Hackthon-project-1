import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/ThemeToggle";
import NextTopLoader from 'nextjs-toploader';

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "CivicLens — AI-Powered Civic Intelligence Platform",
  description: "See the problem. Understand the impact. Drive the change. CivicLens converts citizen observations into structured, actionable civic intelligence.",
  keywords: ["civic tech", "city intelligence", "AI", "civic issues", "pothole reporting"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${playfair.variable}`}>
        <NextTopLoader 
          color="var(--accent)" 
          initialPosition={0.08} 
          crawlSpeed={200} 
          height={3} 
          crawl={true} 
          showSpinner={false} 
          easing="ease" 
          speed={200} 
          shadow="0 0 10px var(--accent),0 0 5px var(--accent)" 
        />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            {children}
            <ThemeToggle />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
