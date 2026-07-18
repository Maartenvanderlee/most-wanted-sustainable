// Admin-pagina: producten goedkeuren/afwijzen, tags en affiliate-links beheren.
// Volgt de sustainability-curation skill (drie poorten + uitsluitingslijst).
import { createServerClient } from "@/lib/supabase/server";
import { CATEGORY_LABELS, isCategory } from "@/lib/categories";
import {
  CERTIFICATIONS,
  CERTIFICATION_LABELS,
  CERTIFICATION_REGISTRIES,
  isCertification,
  splitTags,
} from "@/lib/certifications";
import type { ProductRow } from "@/lib/queries";
import {
  fillMissingImages,
  isAuthenticated,
  logout,
  setStatus,
  updateDetails,
} from "./actions";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";
// Ruime limiet: "Foto's automatisch invullen" doet tot 100 zoekopdrachten.
export const maxDuration = 300;

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-secondary-container/40 text-on-secondary-container",
  approved: "bg-primary-container/30 text-primary",
  rejected: "bg-error-container text-on-error-container",
};

export default async function AdminPage() {
  if (!(await isAuthenticated())) {
    return <LoginForm />;
  }

  const supabase = createServerClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .order("name", { ascending: true }); // stabiele volgorde bij gelijke timestamps
  const products = (data ?? []) as ProductRow[];

  // Bewijs per keurmerk, gegroepeerd per product.
  const { data: evidenceData } = await supabase
    .from("product_certifications")
    .select("product_id, certification, registration_number, evidence_url");
  const evidenceByProduct = new Map<string, CertEvidence[]>();
  for (const row of evidenceData ?? []) {
    const list = evidenceByProduct.get(row.product_id) ?? [];
    list.push(row);
    evidenceByProduct.set(row.product_id, list);
  }

  // Verkoopkanalen (max 3 per product), gegroepeerd per product.
  const { data: offerData } = await supabase
    .from("product_offers")
    .select("product_id, position, retailer, url, price");
  const offersByProduct = new Map<string, Offer[]>();
  for (const row of offerData ?? []) {
    const list = offersByProduct.get(row.product_id) ?? [];
    list.push(row);
    offersByProduct.set(row.product_id, list);
  }

  // Pending eerst, dan approved, dan rejected.
  const order: Record<string, number> = { pending: 0, approved: 1, rejected: 2 };
  products.sort((a, b) => order[a.status] - order[b.status]);

  const counts = {
    pending: products.filter((p) => p.status === "pending").length,
    approved: products.filter((p) => p.status === "approved").length,
    rejected: products.filter((p) => p.status === "rejected").length,
  };

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-headline-md text-on-background">Admin</h1>
        <div className="flex items-center gap-4">
          <a
            href="/admin/stats"
            className="text-sm font-medium text-primary hover:underline"
          >
            Statistieken
          </a>
          <a
            href="/admin/subscribers"
            className="text-sm font-medium text-primary hover:underline"
          >
            Aanmeldingen
          </a>
          <a
            href="/admin/content"
            className="text-sm font-medium text-primary hover:underline"
          >
            Teksten
          </a>
          <form action={logout}>
            <button className="text-sm text-on-surface-variant hover:text-primary">
              Uitloggen
            </button>
          </form>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-body-md text-on-surface-variant">
          {counts.pending} in behandeling · {counts.approved} goedgekeurd ·{" "}
          {counts.rejected} afgewezen
        </p>
        <form action={fillMissingImages}>
          <button className="rounded-full border border-primary px-4 py-1.5 text-sm font-medium text-primary hover:bg-primary-container/10">
            Foto&apos;s automatisch invullen
          </button>
        </form>
      </div>

      <CurationGuide />

      <div className="space-y-4">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            evidence={evidenceByProduct.get(p.id) ?? []}
            offers={offersByProduct.get(p.id) ?? []}
          />
        ))}
      </div>
    </main>
  );
}

function CurationGuide() {
  return (
    <details className="mb-8 rounded-xl border border-outline-variant/30 bg-surface-container-low p-5 text-sm text-on-surface-variant">
      <summary className="cursor-pointer font-semibold text-on-background">
        Curatie-richtlijnen (bij twijfel: afwijzen)
      </summary>
      <div className="mt-4 space-y-3">
        <p>
          Een product moet slagen voor <strong>poort 1 of 2</strong>, en altijd
          voor <strong>poort 3</strong>.
        </p>
        <p>
          <strong>Poort 1 — Certificering.</strong> Vink hieronder de erkende
          keurmerken aan die van toepassing zijn (bv. B Corp, Fairtrade, FSC).
        </p>
        <p>
          <strong>Poort 2 — Handmatige checklist</strong> (min. 3 van 5 ja):
          gemaakt van gerecycled/hernieuwbaar/biologisch afbreekbaar materiaal ·
          vervangt een wegwerpproduct · transparante toeleveringsketen ·
          repareerbaar/navulbaar · duurzaamheid is de kernactiviteit van het merk.
        </p>
        <p>
          <strong>Poort 3 — Uitsluiting.</strong> Automatisch afwijzen:
          fast-fashion(-submerken), wegwerpgadgets met groene marketing,
          ontkrachte claims, of niet-verifieerbare gezondheidsclaims.
        </p>
        <p className="text-on-background">
          Schrijf nooit &quot;duurzaam&quot; als absolute claim; de tags tonen op
          de productpagina wáárom een product op de lijst staat.
        </p>
      </div>
    </details>
  );
}

type CertEvidence = {
  product_id: string;
  certification: string;
  registration_number: string | null;
  evidence_url: string | null;
};

type Offer = {
  product_id: string;
  position: number;
  retailer: string;
  url: string;
  price: number | null;
};

function ProductCard({
  product,
  evidence,
  offers,
}: {
  product: ProductRow;
  evidence: CertEvidence[];
  offers: Offer[];
}) {
  const categoryLabel = isCategory(product.category)
    ? CATEGORY_LABELS[product.category]
    : product.category;
  const { certifications, characteristics } = splitTags(
    product.sustainability_tags
  );
  const evidenceFor = (cert: string) =>
    evidence.find((e) => e.certification === cert);
  const offerAt = (position: number) =>
    offers.find((o) => o.position === position);

  return (
    <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[product.status]}`}
        >
          {product.status}
        </span>
        <h2 className="font-semibold text-on-background">{product.name}</h2>
        <span className="text-xs text-on-surface-variant">{categoryLabel}</span>
      </div>

      {product.status === "rejected" && product.rejection_reason && (
        <p className="mb-3 text-sm text-error">
          Reden: {product.rejection_reason}
        </p>
      )}

      {/* Foto, keurmerken, kenmerken en koop-link bewerken */}
      <form action={updateDetails} className="mb-4 space-y-3">
        <input type="hidden" name="id" value={product.id} />

        <label className="block text-xs text-on-surface-variant">
          Foto (link naar een afbeelding)
          <input
            name="image_url"
            defaultValue={product.image_url ?? ""}
            placeholder="https://.../foto.jpg"
            className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <fieldset>
          <legend className="text-xs text-on-surface-variant">
            Keurmerken (vink aan wat van toepassing is)
          </legend>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            {CERTIFICATIONS.map((cert) => (
              <label key={cert} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  name="cert"
                  value={cert}
                  defaultChecked={certifications.includes(cert)}
                  className="h-4 w-4 rounded border-outline-variant/50 text-primary"
                />
                {CERTIFICATION_LABELS[cert]}
              </label>
            ))}
          </div>
        </fieldset>

        {certifications.length > 0 && (
          <fieldset className="rounded-lg border border-outline-variant/30 bg-surface-container-low/50 p-3">
            <legend className="px-1 text-xs text-on-surface-variant">
              Bewijs per keurmerk (registratienummer en/of link naar het
              openbare register)
            </legend>
            <div className="space-y-3">
              {certifications.map((cert) => {
                const ev = evidenceFor(cert);
                return (
                  <div key={cert}>
                    <p className="mb-1 flex items-center gap-2 text-xs font-semibold text-on-background">
                      {CERTIFICATION_LABELS[cert as keyof typeof CERTIFICATION_LABELS] ?? cert}
                      {isCertification(cert) && (
                        <a
                          href={CERTIFICATION_REGISTRIES[cert]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-normal text-primary underline"
                        >
                          open register ↗
                        </a>
                      )}
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        name={`evidence_number__${cert}`}
                        defaultValue={ev?.registration_number ?? ""}
                        placeholder="Registratienummer (bv. FSC-C012345)"
                        className="w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary sm:w-1/2"
                      />
                      <input
                        name={`evidence_url__${cert}`}
                        defaultValue={ev?.evidence_url ?? ""}
                        placeholder="Link naar registervermelding"
                        className="w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary sm:w-1/2"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-on-surface-variant">
              Nieuw keurmerk aangevinkt? Sla eerst op — daarna verschijnen hier
              de bewijs-velden voor dat keurmerk.
            </p>
          </fieldset>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="block w-full text-xs text-on-surface-variant sm:w-1/2">
            Gemiddelde levensduur (bv. &quot;5-10 jaar&quot;)
            <input
              name="lifespan"
              defaultValue={product.lifespan ?? ""}
              placeholder="bv. 3 maanden / 5-10 jaar"
              className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </label>
          <label className="block w-full text-xs text-on-surface-variant sm:w-1/2">
            Na gebruik (recycling/afdanken)
            <input
              name="end_of_life"
              defaultValue={product.end_of_life ?? ""}
              placeholder="bv. Composteerbaar (GFT) / inleveren als e-waste"
              className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </label>
        </div>

        <label className="block text-xs text-on-surface-variant">
          Overige kenmerken (komma-gescheiden)
          <input
            name="tags"
            defaultValue={characteristics.join(", ")}
            placeholder="bv. navulbaar, herbruikbaar"
            className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <fieldset className="rounded-lg border border-outline-variant/30 bg-surface-container-low/50 p-3">
          <legend className="px-1 text-xs text-on-surface-variant">
            Verkoopkanalen (max 3, elk met eigen affiliate-link)
          </legend>
          <div className="space-y-2">
            {[1, 2, 3].map((position) => {
              const offer = offerAt(position);
              return (
                <div key={position} className="flex flex-col gap-2 sm:flex-row">
                  <input
                    name={`offer_retailer__${position}`}
                    defaultValue={offer?.retailer ?? ""}
                    placeholder={`Winkel ${position} (bv. Bol, Amazon)`}
                    className="w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary sm:w-1/4"
                  />
                  <input
                    name={`offer_url__${position}`}
                    defaultValue={offer?.url ?? ""}
                    placeholder="Affiliate-link (https://...)"
                    className="w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary sm:w-1/2"
                  />
                  <input
                    name={`offer_price__${position}`}
                    defaultValue={offer?.price ?? ""}
                    placeholder="Prijs (bv. 14,99)"
                    inputMode="decimal"
                    className="w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary sm:w-1/4"
                  />
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-on-surface-variant">
            Winkel + link invullen om een knop te tonen; maak ze leeg om een
            kanaal te verwijderen. De prijs is optioneel en voedt de
            prijsindicatie bij de foto.
          </p>
        </fieldset>

        <label className="block text-xs text-on-surface-variant">
          Oude enkele koop-link (fallback als er geen verkoopkanalen zijn)
          <input
            name="affiliate_url"
            defaultValue={product.affiliate_url ?? ""}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <button className="rounded-full border border-primary px-4 py-1.5 text-sm font-medium text-primary hover:bg-primary-container/10">
          Opslaan
        </button>
      </form>

      {/* Goedkeuren / afwijzen */}
      <div className="flex flex-wrap items-end gap-3">
        <form action={setStatus}>
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="status" value="approved" />
          <button className="rounded-full bg-primary-container px-4 py-1.5 text-sm font-semibold text-on-primary hover:opacity-90">
            Goedkeuren
          </button>
        </form>

        <form action={setStatus} className="flex items-end gap-2">
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="status" value="rejected" />
          <input
            name="rejection_reason"
            placeholder="Reden van afwijzing"
            className="rounded-lg border border-outline-variant/50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-error"
          />
          <button className="rounded-full border border-error px-4 py-1.5 text-sm font-medium text-error hover:bg-error-container/40">
            Afwijzen
          </button>
        </form>
      </div>
    </div>
  );
}
