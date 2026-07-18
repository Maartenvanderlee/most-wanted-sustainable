// CMS: siteteksten bewerken met concept, preview en publiceren.
// Werkwijze: tekst aanpassen -> "Opslaan als concept" -> "Preview bekijken"
// (toont de echte pagina met conceptteksten) -> "Publiceren".
import { createServerClient } from "@/lib/supabase/server";
import { CONTENT_DEFAULTS, CONTENT_SECTIONS } from "@/lib/content";
import { isAuthenticated } from "../actions";
import { LoginForm } from "../login-form";
import { saveDrafts, publishContent } from "./actions";

export const dynamic = "force-dynamic";

type ContentRow = {
  key: string;
  published: string | null;
  draft: string | null;
};

export default async function ContentPage() {
  if (!(await isAuthenticated())) {
    return <LoginForm />;
  }

  const supabase = createServerClient();
  const { data } = await supabase
    .from("site_content")
    .select("key, published, draft");
  const rows = new Map<string, ContentRow>(
    (data ?? []).map((r) => [r.key, r as ContentRow])
  );

  const inputClass =
    "mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-headline-md text-on-background">
          Siteteksten
        </h1>
        <a
          href="/admin"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Terug naar admin
        </a>
      </div>

      <p className="mb-8 text-body-md text-on-surface-variant">
        Pas een tekst aan, sla op als concept en bekijk de preview — bezoekers
        zien pas iets veranderen als je op Publiceren klikt. Een veld leegmaken
        herstelt de standaardtekst.
      </p>

      <div className="space-y-8">
        {CONTENT_SECTIONS.map((section) => (
          <form
            key={section.title}
            className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5"
          >
            <h2 className="mb-4 font-semibold text-on-background">
              {section.title}
            </h2>

            <div className="space-y-4">
              {section.fields.map((field) => {
                const row = rows.get(field.key);
                const value =
                  row?.draft ?? row?.published ?? CONTENT_DEFAULTS[field.key] ?? "";
                const hasDraft = row?.draft != null;
                return (
                  <label
                    key={field.key}
                    className="block text-xs text-on-surface-variant"
                  >
                    <span className="flex items-center gap-2">
                      {field.label}
                      {hasDraft && (
                        <span className="rounded bg-secondary-container/40 px-1.5 py-0.5 text-[10px] font-semibold text-on-secondary-container">
                          concept — nog niet gepubliceerd
                        </span>
                      )}
                    </span>
                    {field.multiline ? (
                      <textarea
                        name={`content__${field.key}`}
                        defaultValue={value}
                        rows={3}
                        className={inputClass}
                      />
                    ) : (
                      <input
                        name={`content__${field.key}`}
                        defaultValue={value}
                        className={inputClass}
                      />
                    )}
                  </label>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                formAction={saveDrafts}
                className="rounded-full border border-primary px-4 py-1.5 text-sm font-medium text-primary hover:bg-primary-container/10"
              >
                Opslaan als concept
              </button>
              <a
                href={`/api/preview?path=${encodeURIComponent(section.previewPath)}`}
                target="_blank"
                className="rounded-full border border-outline-variant px-4 py-1.5 text-sm font-medium text-on-surface-variant hover:text-primary"
              >
                Preview bekijken ↗
              </a>
              <button
                formAction={publishContent}
                className="rounded-full bg-primary-container px-4 py-1.5 text-sm font-semibold text-on-primary hover:opacity-90"
              >
                Publiceren
              </button>
            </div>
          </form>
        ))}
      </div>
    </main>
  );
}
