"use client";

// Interactieve "wat dit je oplevert"-kaart: de bezoeker kan de
// gebruiksintensiteit aanpassen (bv. "ik was vaker/minder vaak dan
// gemiddeld") en ziet live het effect op kg CO2, milieukost, euro-besparing
// en de tastbare vergelijkingen. De basiscijfers (100%) blijven de
// indicatieve schatting uit /admin; de schuifregelaar schaalt ze lineair.
import { useState } from "react";
import { UI, type Locale } from "@/lib/i18n";
import {
  formatHiddenCost,
  kmEquivalent,
  treeMonthsEquivalent,
} from "@/lib/true-price";

export function TruePriceCard({
  co2KgPerYear,
  annualSavingEur,
  usageBasis,
  locale,
}: {
  co2KgPerYear: number | null;
  annualSavingEur: number | null;
  usageBasis: string | null;
  locale: Locale;
}) {
  const [pct, setPct] = useState(100);
  const ui = UI[locale];

  if (!co2KgPerYear && !annualSavingEur) return null;

  const multiplier = pct / 100;
  const kg = co2KgPerYear ? co2KgPerYear * multiplier : null;
  const eur = annualSavingEur ? annualSavingEur * multiplier : null;

  return (
    <div className="mb-4">
      <p className="mb-2 text-sm text-on-surface-variant">{ui.whatYouGet}</p>
      <div className="flex flex-wrap gap-2">
        {kg !== null && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-container/25 px-3 py-1.5 text-sm font-semibold text-primary">
            <span aria-hidden="true">🌍</span>
            {ui.co2PerYear(Math.round(kg).toLocaleString(ui.dateLocale))}
            <span className="text-xs font-normal opacity-80">
              ({ui.hiddenCost(formatHiddenCost(kg))})
            </span>
          </span>
        )}
        {eur !== null && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container/30 px-3 py-1.5 text-sm font-semibold text-secondary">
            <span aria-hidden="true">💶</span>
            {ui.savingPerYear(Math.round(eur).toLocaleString(ui.dateLocale))}
          </span>
        )}
      </div>

      {kg !== null && (
        <p className="mt-2 text-xs text-on-surface-variant">
          {ui.tangibleEquivalent(
            kmEquivalent(kg).toLocaleString(ui.dateLocale),
            (() => {
              const months = treeMonthsEquivalent(kg);
              if (months < 1) return ui.treeLessThanMonth;
              return months < 12
                ? ui.treeMonths(months)
                : ui.treeYears(Math.round(months / 12));
            })()
          )}
        </p>
      )}

      <div className="mt-3 rounded-lg bg-surface-container-lowest/60 p-3">
        <label className="flex items-center justify-between text-xs text-on-surface-variant">
          <span>{ui.personalizeLabel}</span>
          <span className="font-semibold text-on-background">{pct}%</span>
        </label>
        <input
          type="range"
          min={50}
          max={300}
          step={10}
          value={pct}
          onChange={(e) => setPct(Number(e.target.value))}
          className="mt-1.5 w-full accent-primary"
          aria-label={ui.personalizeLabel}
        />
        <p className="mt-1.5 text-[11px] text-on-surface-variant">
          {ui.usageBasisLabel} {usageBasis ?? ui.usageBasisFallback}
        </p>
      </div>
    </div>
  );
}
