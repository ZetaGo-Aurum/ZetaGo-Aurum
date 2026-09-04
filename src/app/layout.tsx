import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf9f4" },
    { media: "(prefers-color-scheme: dark)", color: "#090a0f" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const siteUrl = "https://www.zetagoaurum.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ZetaGo-Aurum: Sovereign Digital Atelier & Autonomous Systems",
    template: "%s | ZetaGo-Aurum",
  },
  description:
    "Official sovereign atelier of ZetaGo-Aurum (Est. 2019). Architectural software engineering, offensive security systems (OctoDos), socket engines (Aurum-Baileys), media networks (Kyokonime, Mod-Kita), and sound design.",
  keywords: [
    "ZetaGo-Aurum",
    "ZetaGo Aurum",
    "zetagoaurum",
    "Aleocrophic",
    "kyokounerge",
    "deltaastra24",
    "admin@zetagoaurum.com",
    "OctoDos",
    "aurum-baileys",
    "aleopantest",
    "diringkes",
    "decagramton",
    "straw",
    "plester",
    "Kyoko Faction",
    "kyoko.biz.id",
    "kyokonime.kyoko.biz.id",
    "mod-kita.kyoko.biz.id",
    "offensive security toolkit",
    "pentest automation",
    "DDoS stress testing",
    "recon and data extraction",
    "audiomack deltaastra24",
    "suno zetagoaurum",
    "personal hub",
    "digital atelier",
    "software architect",
  ],
  authors: [{ name: "ZetaGo-Aurum", url: siteUrl }],
  creator: "ZetaGo-Aurum",
  publisher: "ZetaGo-Aurum",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      "en-US": siteUrl,
      "id-ID": siteUrl,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "ZetaGo-Aurum: Sovereign Digital Atelier & Autonomous Systems",
    description:
      "Official sovereign atelier of ZetaGo-Aurum (Est. 2019). Architectural software engineering, offensive security systems (OctoDos), socket engines (Aurum-Baileys), media platforms, and sound design.",
    url: siteUrl,
    siteName: "ZetaGo-Aurum",
    locale: "en_US",
    alternateLocale: ["id_ID"],
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ZetaGo-Aurum Digital Atelier Banner",
        type: "image/jpeg",
      },
      {
        url: "/og-image-square.jpg",
        width: 1200,
        height: 1200,
        alt: "ZetaGo-Aurum Golden Emblem",
        type: "image/jpeg",
      },
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "ZetaGo-Aurum Icon",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZetaGo-Aurum: Sovereign Digital Atelier",
    description:
      "Architectural software engineering, offensive security tools (OctoDos), media networks, and sound design.",
    images: ["/og-image.jpg"],
    creator: "@kyokounerge",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://www.zetagoaurum.com/#person",
      name: "ZetaGo-Aurum",
      alternateName: [
        "Aleocrophic",
        "kyokounerge",
        "deltaastra24",
        "ZetaGo Aurum",
      ],
      url: "https://www.zetagoaurum.com",
      image: "https://www.zetagoaurum.com/og-image-square.jpg",
      email: "mailto:admin@zetagoaurum.com",
      jobTitle: "Systems Architect, Offensive Security Researcher & Creative Producer",
      description:
        "Founder of ZetaGo-Aurum atelier (Est. 2019). Creator of OctoDos, aurum-baileys, and Kyoko Faction sovereign network platforms.",
      sameAs: [
        "https://github.com/ZetaGo-Aurum",
        "https://www.npmjs.com/~zetagoaurum",
        "https://instagram.com/kyokounerge",
        "https://audiomack.com/deltaastra24",
        "https://suno.com/@zetagoaurum",
        "https://kyoko.biz.id",
        "https://kyokonime.kyoko.biz.id",
        "https://mod-kita.kyoko.biz.id",
        "https://github.com/ZetaGo-Aurum/OctoDos",
      ],
      knowsAbout: [
        "Offensive Security",
        "Penetration Testing Automation",
        "DDoS Stress Testing",
        "Network Reconnaissance and Data Extraction",
        "TypeScript & Node.js",
        "Next.js Systems Architecture",
        "Protocol Reverse Engineering",
        "Sound Design and Music Production",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://www.zetagoaurum.com/#website",
      url: "https://www.zetagoaurum.com",
      name: "ZetaGo-Aurum",
      description:
        "Central digital atelier for sovereign engineering, offensive security tools, media platforms, and sound design.",
      publisher: {
        "@id": "https://www.zetagoaurum.com/#person",
      },
      inLanguage: ["en-US", "id-ID"],
    },
    {
      "@type": "ProfilePage",
      "@id": "https://www.zetagoaurum.com/#webpage",
      url: "https://www.zetagoaurum.com",
      name: "ZetaGo-Aurum: Digital Atelier & Sovereign Systems",
      isPartOf: {
        "@id": "https://www.zetagoaurum.com/#website",
      },
      about: {
        "@id": "https://www.zetagoaurum.com/#person",
      },
      mainEntity: {
        "@id": "https://www.zetagoaurum.com/#person",
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: "https://www.zetagoaurum.com/og-image.jpg",
        width: 1200,
        height: 630,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
