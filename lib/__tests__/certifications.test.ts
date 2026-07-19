import { describe, it, expect } from "vitest";
import {
  isCertification,
  certificationLabel,
  certificationIcon,
  splitTags,
  CERTIFICATIONS,
} from "../certifications";

describe("isCertification", () => {
  it("herkent bekende keurmerk-slugs", () => {
    expect(isCertification("fsc")).toBe(true);
    expect(isCertification("b-corp")).toBe(true);
  });

  it("wijst onbekende of aangeleverde tekst af (belangrijk: dit voedt een SQL-filter in de admin)", () => {
    expect(isCertification("herbruikbaar")).toBe(false);
    expect(isCertification('fsc"); drop table products; --')).toBe(false);
    expect(isCertification("")).toBe(false);
  });

  it("kent elk keurmerk uit CERTIFICATIONS als geldig", () => {
    for (const c of CERTIFICATIONS) expect(isCertification(c)).toBe(true);
  });
});

describe("certificationLabel / certificationIcon", () => {
  it("geeft de nette naam en het icoon voor een bekend keurmerk", () => {
    expect(certificationLabel("fsc")).toBe("FSC");
    expect(certificationIcon("fsc")).toBe("🌳");
  });

  it("valt terug op de tag zelf / een vinkje bij onbekende input", () => {
    expect(certificationLabel("onbekend-label")).toBe("onbekend-label");
    expect(certificationIcon("onbekend-label")).toBe("✓");
  });
});

describe("splitTags", () => {
  it("scheidt keurmerken van gewone kenmerken", () => {
    const { certifications, characteristics } = splitTags([
      "fsc",
      "herbruikbaar",
      "b-corp",
      "plasticvrij",
    ]);
    expect(certifications.sort()).toEqual(["b-corp", "fsc"]);
    expect(characteristics.sort()).toEqual(["herbruikbaar", "plasticvrij"]);
  });

  it("werkt met een lege lijst", () => {
    expect(splitTags([])).toEqual({ certifications: [], characteristics: [] });
  });
});
