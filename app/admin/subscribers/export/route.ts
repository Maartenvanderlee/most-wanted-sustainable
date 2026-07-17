// CSV-export van nieuwsbrief-aanmeldingen. Zelfde cookie-beveiliging als de
// admin-pagina's; zonder geldige login een 401.
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function isAuthed(): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  return cookies().get("mw_admin")?.value === pw;
}

// Waarden met komma's/aanhalingstekens veilig in CSV zetten.
function csvField(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export async function GET() {
  if (!isAuthed()) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("email, created_at")
    .order("created_at", { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = [
    "email,aangemeld_op",
    ...(data ?? []).map(
      (s) => `${csvField(s.email)},${s.created_at.slice(0, 10)}`
    ),
  ];

  return new NextResponse(rows.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="nieuwsbrief-aanmeldingen.csv"',
    },
  });
}
