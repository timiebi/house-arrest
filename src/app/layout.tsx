import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

// Add fonts
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sigag Lauren",
  description:
    "Sigag Lauren — DJ, music producer, and performer. Dive into immersive house sets, cutting-edge productions, and unforgettable live shows.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sora.variable} ${inter.variable} antialiased bg-black text-white`}
      >
        {children}
      </body>
    </html>
  );
}
