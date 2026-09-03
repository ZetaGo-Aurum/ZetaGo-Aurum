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
  title: "ZetAgo Aurum: A Central Atelier of Digital Works",
  description:
    "ZetAgo Aurum is a personal hub for designs, domains, code, and systems: refined with patience, polished to a golden standard. Forward. Endlessly. Like gold.",
  keywords: [
    "ZetAgo Aurum",
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
  authors: [{ name: "ZetAgo Aurum" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "ZetAgo Aurum: A Central Atelier of Digital Works",
    description:
      "A personal hub for designs, domains, code, and systems: polished to a golden standard.",
    url: "https://zetagoaurum.com",
    siteName: "ZetAgo Aurum",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZetAgo Aurum",
    description: "A personal hub: polished to a golden standard.",
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
          defaultTheme="light"
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
