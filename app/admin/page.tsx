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
import { ApproveButton } from "./approve-button";
import { suggestCo2KgPerYear } from "@/lib/true-price";

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

  // Curatiegeschiedenis per product-slug (append-only: alle beslissingen
  // ooit, nieuwste eerst). Gebruikt voor de waarschuwing bij goedkeuren.
  const { data: historyData } = await supabase
    .from("curation_history")
    .select("product_slug, decision, reason, decided_at")
    .order("decided_at", { ascending: false });
  const historyBySlug = new Map<string, HistoryEntry[]>();
  for (const row of historyData ?? []) {
    const list = historyBySlug.get(row.product_slug) ?? [];
    list.push(row);
    historyBySlug.set(row.product_slug, list);
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
            history={historyBySlug.get(p.slug) ?? []}
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

        <div className="border-t border-outline-variant/30 pt-3">
          <p className="mb-2 font-semibold text-on-background">
            Veld voor veld: zo controleer je het
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Foto</strong>: gebruik &quot;Foto&apos;s automatisch
              invullen&quot; of plak zelf een link. Check: toont de foto écht
              dit product (niet een lookalike)?
            </li>
            <li>
              <strong>Keurmerken</strong>: alleen aanvinken als je het bewijs
              vindt. Klik &quot;open register&quot; naast het keurmerk, zoek
              het merk op, en noteer registratienummer + link naar de
              registervermelding. Niet vindbaar = niet aanvinken.
            </li>
            <li>
              <strong>Levensduur / na gebruik</strong>: van de fabrikantsite
              of Milieu Centraal. Bij twijfel een voorzichtige bandbreedte
              (&quot;5-10 jaar&quot;), nooit een precies getal zonder bron.
            </li>
            <li>
              <strong>Redactionele teksten</strong>: beschrijving = wat is het
              en waarvoor; duurzame winst = concreet en controleerbaar, nooit
              vergelijkend (&quot;groener dan X&quot; is verboden); CO2 =
              altijd een bandbreedte (&quot;5 tot 10 kg per jaar&quot;),
              afgeleid uit de studies op{" "}
              <a
                href="/bronnen"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                /bronnen
              </a>
              .
            </li>
            <li>
              <strong>CO2 kg/jaar (getal)</strong>: neem het midden van je
              eigen bandbreedte, de suggestie verschijnt automatisch onder
              het veld zodra de CO2-tekst een &quot;per jaar&quot;-bandbreedte
              bevat. Eenmalige besparingen (&quot;per plank&quot;) krijgen
              bewust geen suggestie: niet invullen.
            </li>
            <li>
              <strong>Besparing €/jaar</strong>: alleen invullen als je de
              rekensom kunt laten zien: gebruiksfrequentie (publieke bron,
              bv. een enquête of Nibud) × prijs van het wegwerpalternatief
              (supermarkt/winkelprijs). Geen bron voor de frequentie? Leeg
              laten, een leeg veld is eerlijker dan een gok.
            </li>
            <li>
              <strong>Gemiddeld gebruik (100%)</strong>: beschrijf kort waar
              de schatting van uitgaat, mét bron, bv. &quot;2,9 wasbeurten
              per week (Stichting HIER)&quot;. Dit is wat de bezoeker naast
              de schuifregelaar ziet.
            </li>
            <li>
              <strong>Verkoopkanalen</strong>: affiliate-link uit je Bol
              Partner- of Amazon PartnerNet-dashboard, nooit een kale
              winkellink. Prijs is indicatief en mag afgerond.
            </li>
          </ul>
        </div>
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

type HistoryEntry = {
  product_slug: string;
  decision: "approved" | "rejected";
  reason: string | null;
  decided_at: string;
};

function formatHistoryDate(iso: string): string {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Bouwt de tekst voor de bevestigingspop-up uit alle eerdere afwijzingen
// van dit product (cumulatief — elke afwijzing ooit, niet alleen de laatste).
function buildWarningText(name: string, history: HistoryEntry[]): string | null {
  const rejections = history.filter((h) => h.decision === "rejected");
  if (rejections.length === 0) return null;

  const lines = rejections.map(
    (r) => `• ${formatHistoryDate(r.decided_at)}: ${r.reason ?? "(geen reden genoteerd)"}`
  );
  return (
    `Let op: "${name}" is eerder ${rejections.length > 1 ? `${rejections.length} keer` : "al eens"} afgewezen.\n\n` +
    lines.join("\n") +
    `\n\nWeet je zeker dat je dit product nu wilt goedkeuren?`
  );
}

function ProductCard({
  product,
  evidence,
  offers,
  history,
}: {
  product: ProductRow;
  evidence: CertEvidence[];
  offers: Offer[];
  history: HistoryEntry[];
}) {
  const priorRejections = history.filter((h) => h.decision === "rejected");
  const warningText = buildWarningText(product.name, history);
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
  // Automatische, herleidbare suggestie: midden van de "X tot Y kg per
  // jaar"-bandbreedte uit de eigen CO2-tekst. Geen "per jaar" in de tekst
  // (bv. eenmalig "per plank")? Dan bewust geen suggestie.
  const co2Suggestion = suggestCo2KgPerYear(product.co2_note);

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

      {priorRejections.length > 0 && product.status !== "rejected" && (
        <div className="mb-3 rounded-lg border border-error/40 bg-error-container/20 p-3 text-sm text-on-error-container">
          <p className="font-semibold">
            ⚠ Dit product is eerder{" "}
            {priorRejections.length > 1 ? `${priorRejections.length} keer` : "al eens"}{" "}
            afgewezen:
          </p>
          <ul className="mt-1.5 list-disc space-y-1 pl-5">
            {priorRejections.map((r, i) => (
              <li key={i}>
                <span className="text-xs opacity-80">{formatHistoryDate(r.decided_at)}:</span>{" "}
                {r.reason ?? "(geen reden genoteerd)"}
              </li>
            ))}
          </ul>
        </div>
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

        <fieldset className="rounded-lg border border-outline-variant/30 bg-surface-container-low/50 p-3">
          <legend className="px-1 text-xs text-on-surface-variant">
            Redactionele tekst (NL + EN) — beschrijving, duurzame winst en
            CO2-indicatie
          </legend>
          <div className="space-y-3">
            <label className="block text-xs text-on-surface-variant">
              Beschrijving &amp; toepassing (NL)
              <textarea
                name="description"
                defaultValue={product.description ?? ""}
                rows={2}
                placeholder="Wat is het en waarvoor gebruik je het?"
                className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="block text-xs text-on-surface-variant">
              Description &amp; use (EN)
              <textarea
                name="description_en"
                defaultValue={product.description_en ?? ""}
                rows={2}
                className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="block text-xs text-on-surface-variant">
              Waarom duurzamer dan het gangbare alternatief (NL)
              <textarea
                name="why_sustainable"
                defaultValue={product.why_sustainable ?? ""}
                rows={2}
                placeholder="Concreet en controleerbaar; geen absolute claims."
                className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="block text-xs text-on-surface-variant">
              Why more sustainable (EN)
              <textarea
                name="why_sustainable_en"
                defaultValue={product.why_sustainable_en ?? ""}
                rows={2}
                className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="block text-xs text-on-surface-variant">
              Geschatte CO2-besparing (NL) — altijd als bandbreedte
              <textarea
                name="co2_note"
                defaultValue={product.co2_note ?? ""}
                rows={2}
                placeholder="bv. Naar schatting 5-10 kg CO2 per jaar t.o.v. ..."
                className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="block text-xs text-on-surface-variant">
              Estimated CO2 saving (EN)
              <textarea
                name="co2_note_en"
                defaultValue={product.co2_note_en ?? ""}
                rows={2}
                className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
          </div>
          <p className="mt-2 text-[11px] text-on-surface-variant">
            De site toont de CO2-regel altijd met de disclaimer
            &quot;indicatieve schatting&quot;. Engels leeg? Dan valt de pagina
            terug op de Nederlandse tekst.
          </p>

          <div className="mt-3 flex flex-col gap-2 border-t border-outline-variant/30 pt-3 sm:flex-row">
            <label className="block w-full text-xs text-on-surface-variant sm:w-1/2">
              CO2-besparing per jaar (kg, getal)
              <input
                name="co2_kg_per_year"
                defaultValue={product.co2_kg_per_year ?? ""}
                placeholder="bv. 24"
                inputMode="decimal"
                className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {co2Suggestion !== null && !product.co2_kg_per_year && (
                <span className="mt-1 block text-[11px] text-primary">
                  Suggestie: {co2Suggestion.toLocaleString("nl-NL")} — het
                  midden van je eigen bandbreedte in de CO2-tekst hierboven.
                </span>
              )}
            </label>
            <label className="block w-full text-xs text-on-surface-variant sm:w-1/2">
              Besparing per jaar (€, getal)
              <input
                name="annual_saving_eur"
                defaultValue={product.annual_saving_eur ?? ""}
                placeholder="bv. 46"
                inputMode="decimal"
                className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
          </div>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <label className="block w-full text-xs text-on-surface-variant sm:w-1/2">
              Gemiddeld gebruik = 100% (NL, met bron)
              <input
                name="usage_basis"
                defaultValue={product.usage_basis ?? ""}
                placeholder="bv. 2,9 wasbeurten per week (Stichting HIER)"
                className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="block w-full text-xs text-on-surface-variant sm:w-1/2">
              Average use = 100% (EN)
              <input
                name="usage_basis_en"
                defaultValue={product.usage_basis_en ?? ""}
                placeholder="e.g. 2.9 laundry loads per week"
                className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
          </div>
          <p className="mt-2 text-[11px] text-on-surface-variant">
            Optioneel. Ingevuld? Dan tonen we op de productpagina een &quot;wat
            dit je oplevert&quot;-kaart met deze cijfers en een
            schuifregelaar; het &quot;gemiddeld gebruik&quot; vertelt de
            bezoeker waar 100% voor staat. Onderbouw alles net als de tekst
            hierboven, zie{" "}
            <a
              href="/bronnen"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              /bronnen
            </a>
            .
          </p>
        </fieldset>

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
          <ApproveButton warningText={warningText} />
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
