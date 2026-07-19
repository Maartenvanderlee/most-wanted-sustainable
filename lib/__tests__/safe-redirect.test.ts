import { describe, it, expect } from "vitest";
import { safeInternalPath } from "../safe-redirect";

describe("safeInternalPath", () => {
  it("staat een normaal intern pad toe", () => {
    expect(safeInternalPath("/blog")).toBe("/blog");
    expect(safeInternalPath("/product/bamboo-cutting-board")).toBe(
      "/product/bamboo-cutting-board"
    );
  });

  it("valt terug op / als er geen pad is", () => {
    expect(safeInternalPath(null)).toBe("/");
    expect(safeInternalPath("")).toBe("/");
  });

  it("blokkeert protocol-relatieve URLs (open redirect via //host)", () => {
    expect(safeInternalPath("//evil.com")).toBe("/");
    expect(safeInternalPath("//evil.com/phishing")).toBe("/");
  });

  it("blokkeert paden die niet met een slash beginnen", () => {
    expect(safeInternalPath("https://evil.com")).toBe("/");
    expect(safeInternalPath("evil.com")).toBe("/");
    expect(safeInternalPath("javascript:alert(1)")).toBe("/");
  });

  it("blokkeert backslash-varianten die browsers als // interpreteren", () => {
    expect(safeInternalPath("/\\evil.com")).toBe("/");
  });

  it("gebruikt een aangepaste fallback indien opgegeven", () => {
    expect(safeInternalPath(null, "/en")).toBe("/en");
    expect(safeInternalPath("//evil.com", "/en")).toBe("/en");
  });
});
