import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "ZetaGo-Aurum: A Central Atelier of Digital Works",
  description:
    "ZetaGo-Aurum is a personal hub for designs, domains, code, and systems: refined with patience, polished to a golden standard. Forward. Endlessly. Like gold.",
  keywords: [
    "ZetaGo-Aurum",
    "zetagoaurum",
    "portfolio",
    "kyoko.biz.id",
    "kyokonime.kyoko.biz.id",
    "mod-kita.kyoko.biz.id",
    "SawitDB",
    "aurum-baileys",
    "aleopantest",
    "diringkes",
    "decagramton",
    "straw",
    "plester",
    "personal hub",
  ],
  authors: [{ name: "ZetaGo-Aurum" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "ZetaGo-Aurum: A Central Atelier of Digital Works",
    description:
      "A personal hub for designs, domains, code, and systems: polished to a golden standard.",
    url: "https://zetago-aurum.vercel.app",
    siteName: "ZetaGo-Aurum",
    type: "website",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "ZetaGo-Aurum" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZetaGo-Aurum",
    description: "A personal hub: polished to a golden standard.",
    images: ["/icon-512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <LanguageProvider>
            {children}
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
