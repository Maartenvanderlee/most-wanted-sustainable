import type { Metadata } from "next";
import { HomeView } from "@/app/home-view";

// ISR, identiek aan de Nederlandse homepage.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Most Wanted Sustainable: trending sustainable products",
  description:
    "Daily ranking of sustainable products accelerating in popularity. Independently curated.",
  alternates: {
    canonical: "/en",
    languages: { nl: "/", en: "/en" },
  },
};

export default function EnglishHomePage() {
  return <HomeView locale="en" />;
}
