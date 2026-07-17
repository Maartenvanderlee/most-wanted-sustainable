// Admin-overzicht van nieuwsbrief-aanmeldingen, met CSV-export.
// Leest via de service-role client (server-only); anon kan deze tabel nooit lezen.
import { createServerClient } from "@/lib/supabase/server";
import { isAuthenticated } from "../actions";
import { LoginForm } from "../login-form";

export const dynamic = "force-dynamic";

type Subscriber = { id: string; email: string; created_at: string };

export default async function SubscribersPage() {
  if (!(await isAuthenticated())) {
    return <LoginForm />;
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Aanmeldingen laden: ${error.message}`);

  const subscribers = (data ?? []) as Subscriber[];

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-headline-md text-on-background">
          Nieuwsbrief-aanmeldingen
        </h1>
        <a
          href="/admin"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Terug naar admin
        </a>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <p className="text-body-md text-on-surface-variant">
          {subscribers.length}{" "}
          {subscribers.length === 1 ? "aanmelding" : "aanmeldingen"}
        </p>
        {subscribers.length > 0 && (
          <a
            href="/admin/subscribers/export"
            className="rounded-full border border-primary px-4 py-1.5 text-sm font-medium text-primary hover:bg-primary-container/10"
          >
            Download als CSV
          </a>
        )}
      </div>

      {subscribers.length === 0 ? (
        <p className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-8 text-center text-on-surface-variant">
          Nog geen aanmeldingen. Zodra iemand zich inschrijft via de site,
          verschijnt het adres hier.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-outline-variant/30">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low text-left text-on-surface-variant">
              <tr>
                <th className="px-4 py-3 font-medium">E-mailadres</th>
                <th className="px-4 py-3 font-medium">Aangemeld op</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-outline-variant/20 bg-surface-container-lowest"
                >
                  <td className="px-4 py-3 text-on-background">{s.email}</td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {new Date(s.created_at).toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
