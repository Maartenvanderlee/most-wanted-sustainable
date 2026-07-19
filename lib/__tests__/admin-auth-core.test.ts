import { describe, it, expect } from "vitest";
import {
  sessionValue,
  timingSafeStringEqual,
  isValidSessionCookie,
} from "../admin-auth-core";

describe("sessionValue", () => {
  it("is deterministisch voor hetzelfde wachtwoord", () => {
    expect(sessionValue("geheim123")).toBe(sessionValue("geheim123"));
  });

  it("verschilt voor verschillende wachtwoorden", () => {
    expect(sessionValue("geheim123")).not.toBe(sessionValue("geheim124"));
  });

  it("geeft nooit het wachtwoord zelf terug (geen plaintext-lek in de cookie)", () => {
    expect(sessionValue("mijn-wachtwoord")).not.toContain("mijn-wachtwoord");
  });
});

describe("timingSafeStringEqual", () => {
  it("herkent gelijke strings", () => {
    expect(timingSafeStringEqual("abc", "abc")).toBe(true);
  });

  it("herkent ongelijke strings van gelijke lengte", () => {
    expect(timingSafeStringEqual("abc", "abd")).toBe(false);
  });

  it("herkent ongelijke strings van verschillende lengte zonder te crashen", () => {
    expect(timingSafeStringEqual("abc", "abcdef")).toBe(false);
  });

  it("behandelt lege strings correct", () => {
    expect(timingSafeStringEqual("", "")).toBe(true);
    expect(timingSafeStringEqual("", "a")).toBe(false);
  });
});

describe("isValidSessionCookie", () => {
  const pw = "correct-paard-batterij-nietje";

  it("accepteert de juiste sessiewaarde voor het geconfigureerde wachtwoord", () => {
    expect(isValidSessionCookie(sessionValue(pw), pw)).toBe(true);
  });

  it("weigert een verkeerde sessiewaarde", () => {
    expect(isValidSessionCookie("niet-de-juiste-hash", pw)).toBe(false);
  });

  it("weigert wanneer er geen cookie is", () => {
    expect(isValidSessionCookie(undefined, pw)).toBe(false);
  });

  it("weigert wanneer er geen ADMIN_PASSWORD is ingesteld", () => {
    expect(isValidSessionCookie(sessionValue(pw), undefined)).toBe(false);
  });

  it("weigert het RAUWE wachtwoord als cookiewaarde (cookie moet de hash zijn, niet het wachtwoord)", () => {
    // Dit borgt de fix: eerder stond het wachtwoord zelf in de cookie.
    expect(isValidSessionCookie(pw, pw)).toBe(false);
  });
});
