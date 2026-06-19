import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Faculty Desk Finder | BRACU CSE",
  description:
    "Find any faculty desk in the BRACU CSE Department with interactive pathfinding and animated navigation.",
  keywords: [
    "BRACU",
    "CSE",
    "Faculty",
    "Desk Finder",
    "Seat Map",
    "BRAC University",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-slate-950`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
