import { describe, it, expect } from "vitest";
import { loadSeedKeywords, slugify } from "../keywords";

describe("slugify", () => {
  it("maakt een URL-vriendelijke slug", () => {
    expect(slugify("Bamboo Toothbrush")).toBe("bamboo-toothbrush");
    expect(slugify("e ink tablet")).toBe("e-ink-tablet");
    expect(slugify("  Solar   Power Bank!  ")).toBe("solar-power-bank");
  });
});

describe("loadSeedKeywords", () => {
  it("leest zoekwoorden met hun categorie uit data/seed-keywords.md", async () => {
    const seeds = await loadSeedKeywords();

    // Er staan 100 zoektermen in het bestand.
    expect(seeds.length).toBe(100);

    // Elke categorie uit de kopjes komt voor.
    const categories = new Set(seeds.map((s) => s.category));
    expect(categories).toEqual(
      new Set(["home", "personal_care", "fashion", "tech", "food"])
    );

    // Steekproef: een bekend zoekwoord zit in de juiste categorie.
    const bamboo = seeds.find((s) => s.keyword === "bamboo toothbrush");
    expect(bamboo?.category).toBe("personal_care");
  });
});
