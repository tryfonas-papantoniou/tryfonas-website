import { DM_Sans, Playfair_Display } from "next/font/google";
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

export const metadata = {
  title: "Tryfonas Papantoniou — AI Solutions Builder",
  description:
    "Computer Science graduate building enterprise-grade AI solutions. From RAG systems to intelligent chatbots, with 6+ years of corporate experience.",
  openGraph: {
    title: "Tryfonas Papantoniou — AI Solutions Builder",
    description:
      "Computer Science graduate building enterprise-grade AI solutions.",
    url: "https://tryfonaspapantoniou.com",
    siteName: "Tryfonas Papantoniou",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}