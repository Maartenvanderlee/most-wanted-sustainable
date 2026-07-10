import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="nl">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
