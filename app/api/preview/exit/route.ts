// Zet previewmodus weer uit en keer terug naar de gewone (gecachete) site.
import { NextRequest } from "next/server";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { safeInternalPath } from "@/lib/safe-redirect";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  draftMode().disable();
  // Alleen interne paden toestaan (voorkomt open-redirect via ?path=//evil.com).
  redirect(safeInternalPath(req.nextUrl.searchParams.get("path")));
}
