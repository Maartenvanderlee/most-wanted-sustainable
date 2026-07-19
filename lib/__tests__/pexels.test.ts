import { describe, it, expect } from "vitest";
import { pexelsSized } from "../pexels";

describe("pexelsSized", () => {
  it("voegt de gevraagde afmetingen toe aan een Pexels-URL", () => {
    const url = pexelsSized(
      "https://images.pexels.com/photos/1/pexels-photo-1.jpeg",
      600,
      400
    );
    expect(url).toContain("w=600");
    expect(url).toContain("h=400");
    expect(url).toContain("dpr=1");
  });

  it("laat niet-Pexels-URLs ongemoeid (bv. handmatig geplakte foto's)", () => {
    const url = "https://example.com/eigen-foto.jpg";
    expect(pexelsSized(url, 600, 400)).toBe(url);
  });

  it("crasht niet op een ongeldige URL en geeft die ongewijzigd terug", () => {
    const bad = "niet-een-url";
    expect(pexelsSized(bad, 600, 400)).toBe(bad);
  });
});
