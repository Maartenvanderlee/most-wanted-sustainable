// Ontvangt anonieme gebeurtenissen (paginabezoek / klik) en slaat ze op.
// Geen persoonsgegevens; faalt stil zodat het bezoek nooit hindert.
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { EventType } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPES: EventType[] = ["page_view", "click", "outbound"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = String(body.type) as EventType;
    if (!TYPES.includes(type)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const path = String(body.path ?? "").slice(0, 300);
    const label = body.label ? String(body.label).slice(0, 300) : null;
    const visitorId = body.visitorId ? String(body.visitorId).slice(0, 64) : null;

    const supabase = createServerClient();
    await supabase.from("events").insert({ type, path, label, visitor_id: visitorId });
  } catch {
    // Nooit een fout teruggeven aan de bezoeker.
  }
  return new NextResponse(null, { status: 204 });
}
