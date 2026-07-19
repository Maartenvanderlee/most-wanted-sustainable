import { describe, it, expect } from "vitest";
import { safeJsonLd } from "../json-ld";

describe("safeJsonLd", () => {
  it("serialiseert gewone data zoals JSON.stringify", () => {
    const data = { a: 1, b: "text" };
    expect(JSON.parse(safeJsonLd(data))).toEqual(data);
  });

  it("escapet '<' zodat een </script> in de data niet uit het scriptblok breekt", () => {
    const data = { name: '</script><script>alert(1)</script>' };
    const out = safeJsonLd(data);
    expect(out).not.toContain("</script>");
    expect(out).toContain("\\u003c");
    // Na parsen moet de oorspronkelijke waarde intact zijn.
    expect(JSON.parse(out)).toEqual(data);
  });

  it("laat andere tekens ongemoeid", () => {
    const data = { name: "AT&T > Vodafone" };
    const out = safeJsonLd(data);
    expect(JSON.parse(out)).toEqual(data);
  });
});
