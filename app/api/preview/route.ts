// Zet previewmodus (Draft Mode) aan: de publieke pagina's tonen dan
// conceptteksten uit het CMS. Alleen voor ingelogde admins.
import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminRequestAuthed } from "@/lib/admin-auth";
import { safeInternalPath } from "@/lib/safe-redirect";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdminRequestAuthed()) {
    return NextResponse.json(
      { error: "Niet ingelogd. Log eerst in op /admin." },
      { status: 401 }
    );
  }

  draftMode().enable();
  // Alleen interne paden toestaan (voorkomt open-redirect via ?path=//evil.com).
  redirect(safeInternalPath(req.nextUrl.searchParams.get("path")));
}
