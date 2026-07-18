// Zet previewmodus (Draft Mode) aan: de publieke pagina's tonen dan
// conceptteksten uit het CMS. Alleen voor ingelogde admins.
import { NextRequest, NextResponse } from "next/server";
import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || cookies().get("mw_admin")?.value !== pw) {
    return NextResponse.json(
      { error: "Niet ingelogd. Log eerst in op /admin." },
      { status: 401 }
    );
  }

  draftMode().enable();
  const path = req.nextUrl.searchParams.get("path") ?? "/";
  redirect(path.startsWith("/") ? path : "/");
}
