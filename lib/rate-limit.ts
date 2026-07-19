// Simpele, database-gestutte snelheidsbegrenzer voor het admin-inlogscherm.
// Serverless functies delen geen geheugen, dus tellen we mislukte pogingen
// per IP in Supabase (admin_login_attempts) in plaats van in-memory.
import { createServerClient } from "./supabase/server";

const WINDOW_MS = 15 * 60 * 1000; // 15 minuten
export const MAX_ATTEMPTS = 8; // pogingen toegestaan binnen het venster

// True als dit IP-adres het venster al heeft volgemaakt met mislukte pogingen.
export async function isRateLimited(ip: string): Promise<boolean> {
  const supabase = createServerClient();
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count } = await supabase
    .from("admin_login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", since);
  return (count ?? 0) >= MAX_ATTEMPTS;
}

export async function recordFailedAttempt(ip: string): Promise<void> {
  const supabase = createServerClient();
  await supabase.from("admin_login_attempts").insert({ ip });
}

// Client-IP uit de standaard proxy-header (Vercel zet x-forwarded-for).
// Valt terug op "unknown" zodat een ontbrekende header nooit een crash geeft
// (in dat geval werkt de limiter gewoon op één gedeelde "unknown"-emmer).
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
}
