import type { Metadata, Viewport } from "next";
import { Caveat, Cormorant_Garamond, Great_Vibes, Inter, Kantumruy_Pro, Moul, Poppins } from "next/font/google";
import { site } from "@/config/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-poppins" });
const caveat = Caveat({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-caveat" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-cormorant" });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-greatvibes" });
const kantumruy = Kantumruy_Pro({ subsets: ["khmer", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-kantumruy" });
const moul = Moul({ subsets: ["khmer", "latin"], weight: "400", variable: "--font-moul" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: { siteName: site.name, type: "website" },
};

export const viewport: Viewport = { themeColor: "#fff5f5", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const fonts = [inter, poppins, caveat, cormorant, greatVibes, kantumruy, moul].map((f) => f.variable).join(" ");
  return (
    <html lang="en" className={fonts}>
      <body>{children}</body>
    </html>
  );
}
