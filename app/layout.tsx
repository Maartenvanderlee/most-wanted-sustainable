import type { Metadata } from "next";
import {
  Plus_Jakarta_Sans,
  Be_Vietnam_Pro,
  Space_Grotesk,
  Manrope,
} from "next/font/google";
import "./globals.css";
import { Analytics } from "./analytics";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-jakarta",
});
const vietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-vietnam",
});
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-grotesk",
});
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Most Wanted Sustainable — trending duurzame producten",
  description:
    "Dagelijkse ranglijst van duurzame producten die in populariteit versnellen. Onafhankelijk samengesteld.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="nl"
      className={`${jakarta.variable} ${vietnam.variable} ${grotesk.variable} ${manrope.variable} scroll-smooth`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background font-body text-on-surface antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
