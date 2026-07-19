import { describe, it, expect } from "vitest";
import { isSafeSlug, parseFrontmatter } from "../blog-parsing";

describe("isSafeSlug", () => {
  it("staat normale slugs toe", () => {
    expect(isSafeSlug("de-woensdag")).toBe(true);
    expect(isSafeSlug("the-five-euro-shirt")).toBe(true);
    expect(isSafeSlug("artikel123")).toBe(true);
  });

  it("blokkeert path traversal buiten de blogmap", () => {
    expect(isSafeSlug("../../.env")).toBe(false);
    expect(isSafeSlug("..%2f..%2f.env")).toBe(false);
    expect(isSafeSlug("../../../etc/passwd")).toBe(false);
  });

  it("blokkeert absolute paden en scheidingstekens", () => {
    expect(isSafeSlug("/etc/passwd")).toBe(false);
    expect(isSafeSlug("C:\\Windows\\System32")).toBe(false);
    expect(isSafeSlug("map/bestand")).toBe(false);
  });

  it("blokkeert hoofdletters, spaties en speciale tekens", () => {
    expect(isSafeSlug("De-Woensdag")).toBe(false);
    expect(isSafeSlug("de woensdag")).toBe(false);
    expect(isSafeSlug("de-woensdag.md")).toBe(false);
    expect(isSafeSlug("")).toBe(false);
  });
});

describe("parseFrontmatter", () => {
  it("leest titel, datum en overige velden uit het frontmatter-blok", () => {
    const raw = [
      "---",
      "title: Testartikel",
      "date: 2026-01-01",
      "image: https://example.com/foto.jpg",
      "---",
      "",
      "De inhoud van het artikel.",
    ].join("\n");

    const { meta, body } = parseFrontmatter(raw);
    expect(meta.title).toBe("Testartikel");
    expect(meta.date).toBe("2026-01-01");
    expect(meta.image).toBe("https://example.com/foto.jpg");
    expect(body.trim()).toBe("De inhoud van het artikel.");
  });

  it("geeft de hele tekst als body als er geen frontmatter-blok is", () => {
    const raw = "Gewoon een bestand zonder frontmatter.";
    const { meta, body } = parseFrontmatter(raw);
    expect(meta).toEqual({});
    expect(body).toBe(raw);
  });

  it("gaat correct om met een dubbele punt in de waarde (bv. een URL)", () => {
    const raw = ["---", "title: Titel", "image: https://x.com/a.jpg", "---", "body"].join(
      "\n"
    );
    const { meta } = parseFrontmatter(raw);
    expect(meta.image).toBe("https://x.com/a.jpg");
  });
});
