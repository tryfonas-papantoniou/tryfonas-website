import { DM_Sans, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = "https://tryfonaspapantoniou.com";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tryfonas Papantoniou — AI Solutions Builder",
    template: "%s — Tryfonas Papantoniou",
  },
  description:
    "Computer Science graduate building enterprise-grade AI solutions. From RAG systems to intelligent chatbots, with 6+ years of corporate experience at Accenture, Infosys, and HEINEKEN.",
  keywords: [
    "AI engineer",
    "RAG",
    "Retrieval Augmented Generation",
    "Anthropic Claude",
    "LLM",
    "AI portfolio",
    "Next.js",
    "Kraków",
    "Tryfonas Papantoniou",
  ],
  authors: [{ name: "Tryfonas Papantoniou", url: SITE_URL }],
  creator: "Tryfonas Papantoniou",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Tryfonas Papantoniou — AI Solutions Builder",
    description:
      "Computer Science graduate building enterprise-grade AI solutions — RAG systems, chatbots, and agentic workflows.",
    url: SITE_URL,
    siteName: "Tryfonas Papantoniou",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tryfonas Papantoniou — AI Solutions Builder",
    description:
      "Building enterprise-grade AI solutions — RAG, chatbots, agentic workflows.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Tryfonas Papantoniou",
  url: SITE_URL,
  image: `${SITE_URL}/tryfonas.jpg`,
  jobTitle: "AI Solutions Builder",
  description:
    "Computer Science graduate building enterprise-grade AI solutions — RAG systems, chatbots, and agentic workflows.",
  email: "mailto:tryfonaspapantoniou@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kraków",
    addressCountry: "PL",
  },
  alumniOf: [
    {
      "@type": "CollegeOrUniversity",
      name: "University of Macedonia",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Thessaloniki",
        addressCountry: "GR",
      },
    },
  ],
  worksFor: [],
  knowsAbout: [
    "Artificial Intelligence",
    "Large Language Models",
    "Retrieval Augmented Generation",
    "Agentic AI",
    "Next.js",
    "React",
    "Python",
    "Anthropic Claude API",
    "Pinecone",
  ],
  sameAs: [
    "https://linkedin.com/in/tryfonaspapantoniou",
    "https://github.com/tryfonas-papantoniou",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <body>
        <ScrollProgressBar />
        {children}
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </body>
    </html>
  );
}
