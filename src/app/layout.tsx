import FirstVisitLoader from "@/components/FirstVisitLoader";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/contexts/ToastContext";
import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

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
  title: "Sigag Lauren — DJ, Producer, House Music",
  description:
    "Sigag Lauren is a DJ and producer. House music, events, live sets, and sample packs. Artist profile, upcoming shows, and music.",
    icons: {
      icon: "/assets/sigaglogo.svg",
      shortcut: "/assets/sigaglogo.svg",
      apple: "/assets/sigaglogo.svg",
      other: {
        rel: "icon",
        url: "/assets/sigaglogo.svg",
      },
    },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sora.variable} ${inter.variable}`}>
      <body
        className="antialiased w-full min-h-screen"
        style={{ backgroundColor: "var(--bg-page)", color: "var(--text-primary)" }}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('sigag-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);})();`,
          }}
        />
        <ThemeProvider>
          <ToastProvider>
            <FirstVisitLoader />
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
