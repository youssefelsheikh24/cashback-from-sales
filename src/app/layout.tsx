import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";

// Body — clean, neutral, highly legible.
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Headings — condensed, cinematic, poster-like (a production-house feel).
const heading = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CashBack — Request a Production | Creative Production House",
  description:
    "Book a shoot, request a quote, or plan a production with CashBack — video production, photography, studios, locations, crew and full production, end to end.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${heading.variable} dark`}>
      <body className="min-h-screen bg-dark-bg text-white antialiased font-sans flex flex-col">
        {children}
      </body>
    </html>
  );
}
