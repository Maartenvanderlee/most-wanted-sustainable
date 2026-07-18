import type { Metadata } from "next";
import { HomeView } from "./home-view";

// ISR: pagina wordt gecachet en maximaal elk uur opnieuw opgebouwd.
// Admin-acties en de pipeline verversen de cache direct via revalidatePath.
// In previewmodus (Draft Mode, via /api/preview) rendert Next.js dynamisch
// met conceptteksten — zonder de cache voor bezoekers te raken.
export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: { nl: "/", en: "/en" },
  },
};

export default function HomePage() {
  return <HomeView locale="nl" />;
}
