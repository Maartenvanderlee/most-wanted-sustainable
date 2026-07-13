// Handmatige/cron-trigger voor de pipeline.
// Beveiligd met CRON_SECRET: geef de sleutel mee als
//   Authorization: Bearer <CRON_SECRET>   of   ?secret=<CRON_SECRET>
import { NextRequest, NextResponse } from "next/server";
import { runPipeline } from "@/lib/pipeline/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // seconden

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const query = req.nextUrl.searchParams.get("secret");
  return bearer === secret || query === secret;
}

async function handle(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { error: "Niet geautoriseerd. Ontbrekend of onjuist CRON_SECRET." },
      { status: 401 }
    );
  }

  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;

  try {
    const result = await runPipeline({ limit });
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

export const GET = handle;
export const POST = handle;
