// Zet previewmodus weer uit en keer terug naar de gewone (gecachete) site.
import { NextRequest } from "next/server";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  draftMode().disable();
  const path = req.nextUrl.searchParams.get("path") ?? "/";
  redirect(path.startsWith("/") ? path : "/");
}
