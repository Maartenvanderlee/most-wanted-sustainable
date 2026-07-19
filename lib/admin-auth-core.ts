// Pure sessielogica zonder next/headers of de "server-only"-guard, zodat dit
// bestand ook los (bijv. in tests) te importeren is. lib/admin-auth.ts bouwt
// hier de cookiestore-integratie bovenop.
import { createHash, timingSafeEqual } from "node:crypto";

// Sessiewaarde afgeleid van het wachtwoord (nooit het wachtwoord zelf in de
// cookie). Onomkeerbaar: uit deze waarde is het wachtwoord niet te herleiden.
export function sessionValue(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

// Vergelijkt in constante tijd, zodat de reactiesnelheid van de server geen
// aanwijzing geeft over hoeveel tekens van een waarde al kloppen.
export function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

// True als de meegestuurde cookiewaarde bij een geldige sessie voor dit
// wachtwoord hoort. `password` expliciet meegeven (i.p.v. process.env lezen)
// houdt deze functie zuiver en makkelijk testbaar.
export function isValidSessionCookie(
  cookieValue: string | undefined,
  password: string | undefined
): boolean {
  if (!password || !cookieValue) return false;
  return timingSafeStringEqual(cookieValue, sessionValue(password));
}
