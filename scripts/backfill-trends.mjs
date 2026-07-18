// Eenmalige backfill: haalt per zoekwoord de wekelijkse Google Trends-interesse
// van de afgelopen 12 maanden op en slaat die op als historische signalen.
// Veilig om opnieuw te draaien: voegt alleen punten toe die OUDER zijn dan het
// oudste bestaande google_trends-signaal per product (signals blijft append-only).
//
// Gebruik:  node --env-file=.env.local scripts/backfill-trends.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stripPrefix = (text) => {
  const idx = text.indexOf("{");
  return idx === -1 ? text : text.slice(idx);
};

function mergeCookie(res, current) {
  const set = res.headers?.getSetCookie?.() ?? [];
  const pairs = set.map((c) => c.split(";")[0]);
  return pairs.length ? pairs.join("; ") : current;
}

async function primeCookie() {
  try {
    const res = await fetch("https://trends.google.com/?geo=NL", {
      headers: { "User-Agent": UA },
    });
    return mergeCookie(res, "");
  } catch {
    return "";
  }
}

// Wekelijkse reeks (12 maanden) voor één zoekwoord: [{measuredAt, value}].
async function yearSeries(keyword, cookieRef) {
  const headers = () => ({
    "User-Agent": UA,
    Cookie: cookieRef.value,
    Referer: "https://trends.google.com/trends/explore",
  });

  const exploreReq = {
    comparisonItem: [{ keyword, geo: "", time: "today 12-m" }],
    category: 0,
    property: "",
  };
  const exploreUrl =
    `https://trends.google.com/trends/api/explore?hl=en-US&tz=0&req=` +
    encodeURIComponent(JSON.stringify(exploreReq));
  const exploreRes = await fetch(exploreUrl, { headers: headers() });
  cookieRef.value = mergeCookie(exploreRes, cookieRef.value);
  if (!exploreRes.ok) return null;

  const explore = JSON.parse(stripPrefix(await exploreRes.text()));
  const widget = explore.widgets?.find((w) => w.id === "TIMESERIES");
  if (!widget) return null;

  const dataUrl =
    `https://trends.google.com/trends/api/widgetdata/multiline?hl=en-US&tz=0&req=` +
    encodeURIComponent(JSON.stringify(widget.request)) +
    `&token=${widget.token}`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    await sleep(900 * attempt);
    const dataRes = await fetch(dataUrl, { headers: headers() });
    cookieRef.value = mergeCookie(dataRes, cookieRef.value);
    if (dataRes.ok) {
      const data = JSON.parse(stripPrefix(await dataRes.text()));
      const timeline = data.default?.timelineData ?? [];
      return timeline
        .filter((p) => p.time && Array.isArray(p.value))
        .map((p) => ({
          measuredAt: new Date(Number(p.time) * 1000).toISOString(),
          value: p.value[0] ?? 0,
        }));
    }
    if (dataRes.status !== 429) return null;
  }
  return null;
}

// Zoekwoorden uit data/seed-keywords.md ("- keyword" per regel).
const seedFile = await fs.readFile(
  path.join(process.cwd(), "data", "seed-keywords.md"),
  "utf-8"
);
const keywords = seedFile
  .split(/\r?\n/)
  .filter((l) => l.startsWith("- "))
  .map((l) => l.slice(2).trim())
  .filter(Boolean);

// Producten op naam matchen (pipeline zet name = keyword).
const { data: products, error: productError } = await supabase
  .from("products")
  .select("id, name");
if (productError) throw new Error(productError.message);
const idByName = new Map(products.map((p) => [p.name, p.id]));

// Oudste bestaande google_trends-meting per product (om duplicaten te voorkomen).
const { data: existing, error: existingError } = await supabase
  .from("signals")
  .select("product_id, measured_at")
  .eq("source", "google_trends");
if (existingError) throw new Error(existingError.message);
const earliestByProduct = new Map();
for (const s of existing ?? []) {
  const cur = earliestByProduct.get(s.product_id);
  if (!cur || s.measured_at < cur) earliestByProduct.set(s.product_id, s.measured_at);
}

const cookieRef = { value: await primeCookie() };
let done = 0;
let inserted = 0;
let failed = 0;

for (const keyword of keywords) {
  const productId = idByName.get(keyword);
  done++;
  if (!productId) {
    console.log(`[${done}/${keywords.length}] ${keyword}: geen product, overslaan`);
    continue;
  }

  try {
    const series = await yearSeries(keyword, cookieRef);
    if (!series || series.length === 0) {
      failed++;
      console.log(`[${done}/${keywords.length}] ${keyword}: geen data`);
      await sleep(1500);
      continue;
    }

    const cutoff = earliestByProduct.get(productId) ?? "9999-12-31";
    const rows = series
      .filter((p) => p.measuredAt < cutoff)
      .map((p) => ({
        product_id: productId,
        source: "google_trends",
        value: p.value,
        measured_at: p.measuredAt,
      }));

    if (rows.length > 0) {
      const { error } = await supabase.from("signals").insert(rows);
      if (error) throw new Error(error.message);
      inserted += rows.length;
    }
    console.log(
      `[${done}/${keywords.length}] ${keyword}: ${rows.length} weekpunten toegevoegd`
    );
  } catch (err) {
    failed++;
    console.log(`[${done}/${keywords.length}] ${keyword}: FOUT ${err.message}`);
  }
  await sleep(1500);
}

console.log(
  `\nKlaar. ${inserted} historische metingen toegevoegd; ${failed} zoekwoorden mislukt (opnieuw draaien mag).`
);
