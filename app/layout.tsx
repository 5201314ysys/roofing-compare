import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PriceCompare Pro - US Business Price Comparison Platform",
  description: "Compare real prices across industries in the US. Based on government permit data, covering 50 states, 20+ industries, and 10,000+ verified businesses.",
  keywords: "price comparison, business directory, contractors, service prices, USA",
  openGraph: {
    title: "PriceCompare Pro - US Business Price Comparison Platform",
    description: "Compare real business prices across industries nationwide",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
