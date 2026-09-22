// Server-side data-ophaalfuncties voor de publieke pagina's.
// Draait met de service-role client (server-only) en filtert publieke
// weergaven expliciet op status 'approved'. Zo blijft de anon-sleutel + RLS
// de tweede beschermlaag voor eventuele directe browsertoegang.
import { createServerClient } from "./supabase/server";
import type { Category } from "./categories";
import type { ProductStatus, SourceName } from "./supabase/types";
import { WEIGHTS } from "./scoring/version";
import { priceRangeFrom, type PriceRange } from "./price";
import { getLatestScores, type LatestScore } from "./score-window";

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  category: Category;
  image_url: string | null;
  affiliate_url: string | null;
  sustainability_tags: string[];
  status: ProductStatus;
  rejection_reason: string | null;
  lifespan: string | null;
  end_of_life: string | null;
  description: string | null;
  description_en: string | null;
  why_sustainable: string | null;
  why_sustainable_en: string | null;
  co2_note: string | null;
  co2_note_en: string | null;
  co2_kg_per_year: number | null;
  annual_saving_eur: number | null;
  usage_basis: string | null;
  usage_basis_en: string | null;
  created_at: string;
};

export type { LatestScore };

export type RankedProduct = ProductRow & {
  latest: LatestScore | null;
  priceRange: PriceRange | null; // indicatie uit de verkoopkanalen
};

// Goedgekeurde producten met hun laatste score, hoogste score bovenaan.
// Producten zonder score komen achteraan (nieuw, nog geen 2 weken historie).
export async function getRankedProducts(filter?: {
  category?: Category;
}): Promise<RankedProduct[]> {
  const supabase = createServerClient();

  let query = supabase.from("products").select("*").eq("status", "approved");
  if (filter?.category) query = query.eq("category", filter.category);

  const { data: products, error } = await query;
  if (error) throw new Error(`Producten laden: ${error.message}`);

  const latest = await getLatestScores(supabase);

  // Prijzen uit de verkoopkanalen voor de prijsindicatie per kaart.
  const { data: offerPrices } = await supabase
    .from("product_offers")
    .select("product_id, price");
  const pricesByProduct = new Map<string, (number | null)[]>();
  for (const o of offerPrices ?? []) {
    const list = pricesByProduct.get(o.product_id) ?? [];
    list.push(o.price);
    pricesByProduct.set(o.product_id, list);
  }

  return (products ?? [])
    .map((p) => ({
      ...(p as ProductRow),
      latest: latest.get(p.id) ?? null,
      priceRange: priceRangeFrom(pricesByProduct.get(p.id) ?? []),
    }))
    .sort((a, b) => {
      // Hoogste trendscore bovenaan. Rang is de tiebreak; die kan van een iets
      // oudere snapshot komen als een product de laatste run miste.
      if (a.latest && b.latest) {
        if (b.latest.score !== a.latest.score) return b.latest.score - a.latest.score;
        return a.latest.rank - b.latest.rank;
      }
      if (a.latest) return -1;
      if (b.latest) return 1;
      return a.name.localeCompare(b.name);
    });
}

export type SourceMeasurement = {
  source: SourceName;
  value: number | null; // null = onvoldoende data
  measuredAt: string | null;
};

export type CertificationEvidence = {
  certification: string;
  registration_number: string | null;
  evidence_url: string | null;
};

export type ProductOffer = {
  position: number;
  retailer: string;
  url: string;
  price: number | null;
};

export type ProductDetail = {
  product: ProductRow;
  latest: LatestScore | null;
  history: { snapshot_date: string; score: number }[]; // laatste 30 dagen
  measurements: SourceMeasurement[]; // laatste ruwe meting per bron
  certificationEvidence: CertificationEvidence[]; // bewijs per keurmerk
  offers: ProductOffer[]; // verkoopkanalen (max 3), op positie
};

// Bronnen die meewegen in de score (leidt af uit de formule-weging).
const ALL_SOURCES = Object.keys(WEIGHTS) as SourceName[];

// Eén goedgekeurd product met scorehistorie en de laatste meting per bron.
export async function getProductBySlug(
  slug: string
): Promise<ProductDetail | null> {
  const supabase = createServerClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();
  if (!product) return null;

  const p = product as ProductRow;

  // Scorehistorie van de laatste 30 dagen.
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const { data: scoreRows } = await supabase
    .from("scores")
    .select("score, rank, snapshot_date")
    .eq("product_id", p.id)
    .gte("snapshot_date", cutoff)
    .order("snapshot_date", { ascending: true });

  const history = (scoreRows ?? []).map((s) => ({
    snapshot_date: s.snapshot_date,
    score: s.score,
  }));
  const last = scoreRows?.[scoreRows.length - 1];
  const latest: LatestScore | null = last
    ? { score: last.score, rank: last.rank, snapshot_date: last.snapshot_date }
    : null;

  // Laatste ruwe meting per bron (server-side; anon ziet signals nooit).
  const { data: signals } = await supabase
    .from("signals")
    .select("source, value, measured_at")
    .eq("product_id", p.id)
    .order("measured_at", { ascending: false });

  const measurements: SourceMeasurement[] = ALL_SOURCES.map((source) => {
    const hit = (signals ?? []).find((s) => s.source === source);
    return {
      source,
      value: hit ? hit.value : null,
      measuredAt: hit ? hit.measured_at : null,
    };
  });

  // Bewijs per keurmerk (registratienummer + link naar openbaar register).
  const { data: evidence } = await supabase
    .from("product_certifications")
    .select("certification, registration_number, evidence_url")
    .eq("product_id", p.id);

  // Verkoopkanalen (max 3), gesorteerd op positie.
  const { data: offers } = await supabase
    .from("product_offers")
    .select("position, retailer, url, price")
    .eq("product_id", p.id)
    .order("position", { ascending: true });

  return {
    product: p,
    latest,
    history,
    measurements,
    certificationEvidence: evidence ?? [],
    offers: offers ?? [],
  };
}

// Alle slugs van goedgekeurde producten (voor sitemap en statische paden).
export async function getApprovedSlugs(): Promise<string[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("products")
    .select("slug")
    .eq("status", "approved");
  return (data ?? []).map((p) => p.slug);
}
