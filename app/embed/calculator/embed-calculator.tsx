"use client";

// Interactieve whitelabel-calculator. Vertaalt een hoeveelheid vermeden CO2
// per jaar naar de verborgen maatschappelijke waarde (€) en tastbare
// vergelijkingen. Alle rekenwaarden en bronnen komen uit lib/true-price.ts,
// zodat de embed niet kan afwijken van de site.
import { useEffect, useRef, useState } from "react";
import {
  formatHiddenCost,
  kmEquivalent,
  treeMonthsEquivalent,
} from "@/lib/true-price";

type Props = {
  locale: "nl" | "en";
  accent: string;
  brand: string | null;
  defaultKg: number;
  actionLabel: string | null;
  showPowered: boolean;
  sourcesUrl: string;
  homeUrl: string;
};

const T = {
  nl: {
    title: "Wat is je CO₂-winst waard?",
    intro: (a: string | null) =>
      `Bereken de verborgen maatschappelijke waarde van${a ? ` ${a}` : " vermeden CO₂"}.`,
    sliderLabel: "CO₂ bespaard per jaar",
    kg: "kg",
    damage: "Voorkomen milieuschade",
    driving: "autorijden",
    tree: "CO₂-opname van een boom",
    treeLessThanMonth: "< 1 maand",
    months: (n: number) => `${n} maand${n === 1 ? "" : "en"}`,
    years: (n: number) => `${n} jaar`,
    source:
      "Berekening: CE Delft, Handboek Milieuprijzen 2023 (€0,13/kg CO₂), CBS (autokilometers) en Staatsbosbeheer (boom).",
    viewSources: "Bekijk de bronnen",
    powered: "Rekentool door Risegoods",
  },
  en: {
    title: "What is your CO₂ gain worth?",
    intro: (a: string | null) =>
      `Calculate the hidden societal value of${a ? ` ${a}` : " avoided CO₂"}.`,
    sliderLabel: "CO₂ saved per year",
    kg: "kg",
    damage: "Environmental damage prevented",
    driving: "of driving",
    tree: "of a tree's CO₂ uptake",
    treeLessThanMonth: "< 1 month",
    months: (n: number) => `${n} month${n === 1 ? "" : "s"}`,
    years: (n: number) => `${n} year${n === 1 ? "" : "s"}`,
    source:
      "Calculation: CE Delft Environmental Prices Handbook 2023 (€0.13/kg CO₂), CBS (car km) and Staatsbosbeheer (tree).",
    viewSources: "See the sources",
    powered: "Calculator by Risegoods",
  },
};

export function EmbedCalculator({
  locale,
  accent,
  brand,
  defaultKg,
  actionLabel,
  showPowered,
  sourcesUrl,
  homeUrl,
}: Props) {
  const [kg, setKg] = useState(defaultKg);
  const t = T[locale];
  const rootRef = useRef<HTMLDivElement>(null);

  // Auto-hoogte: laat de insluitende pagina de iframe meeschalen (optioneel;
  // werkt alleen als de integrator ernaar luistert — zie de embed-handleiding).
  useEffect(() => {
    const send = () => {
      const h = rootRef.current?.scrollHeight;
      if (h) window.parent?.postMessage({ type: "risegoods-embed-height", height: h }, "*");
    };
    send();
    window.addEventListener("resize", send);
    return () => window.removeEventListener("resize", send);
  }, [kg]);

  const treeMonths = treeMonthsEquivalent(kg);
  const treeText =
    treeMonths < 1
      ? t.treeLessThanMonth
      : treeMonths < 12
        ? t.months(treeMonths)
        : t.years(Math.round(treeMonths / 12));

  return (
    <div
      ref={rootRef}
      style={{ ["--accent" as string]: accent }}
      className="mx-auto max-w-xl px-4 py-5 font-body text-on-surface"
    >
      <h1 className="text-lg font-extrabold" style={{ color: "var(--accent)" }}>
        {brand ?? t.title}
      </h1>
      <p className="mt-1 text-sm text-on-surface-variant">{t.intro(actionLabel)}</p>

      <div className="mt-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-4">
        <div className="flex items-baseline justify-between">
          <label htmlFor="kg" className="text-sm font-medium">
            {t.sliderLabel}
          </label>
          <span className="text-base font-extrabold tabular-nums" style={{ color: "var(--accent)" }}>
            {Math.round(kg).toLocaleString(locale === "en" ? "en-GB" : "nl-NL")} {t.kg}
          </span>
        </div>
        <input
          id="kg"
          type="range"
          min={0}
          max={500}
          step={1}
          value={Math.min(kg, 500)}
          onChange={(e) => setKg(Number(e.target.value))}
          className="mt-2 w-full"
          style={{ accentColor: "var(--accent)" }}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Tile emoji="🌍" value={formatHiddenCost(kg)} label={t.damage} accent />
        <Tile
          emoji="🚗"
          value={`${kmEquivalent(kg).toLocaleString(locale === "en" ? "en-GB" : "nl-NL")} km`}
          label={t.driving}
        />
        <Tile emoji="🌳" value={treeText} label={t.tree} />
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-on-surface-variant">
        {t.source}{" "}
        <a
          href={sourcesUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
          style={{ color: "var(--accent)" }}
        >
          {t.viewSources}
        </a>
      </p>

      {showPowered && (
        <p className="mt-2 text-[11px] text-on-surface-variant">
          <a
            href={homeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline opacity-80 hover:opacity-100"
          >
            {t.powered}
          </a>
        </p>
      )}
    </div>
  );
}

function Tile({
  emoji,
  value,
  label,
  accent = false,
}: {
  emoji: string;
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low/60 p-3 text-center">
      <div className="text-xl" aria-hidden="true">
        {emoji}
      </div>
      <div
        className="mt-1 text-lg font-extrabold tabular-nums"
        style={accent ? { color: "var(--accent)" } : undefined}
      >
        {value}
      </div>
      <div className="mt-0.5 text-xs text-on-surface-variant">{label}</div>
    </div>
  );
}
