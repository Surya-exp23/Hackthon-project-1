import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
