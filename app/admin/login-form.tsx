"use client";

import { useFormState, useFormStatus } from "react-dom";
import { login } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-primary-container px-6 py-3 font-semibold text-on-primary shadow-md transition hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Bezig..." : "Inloggen"}
    </button>
  );
}

export function LoginForm() {
  const [error, formAction] = useFormState(login, null);

  return (
    <form
      action={formAction}
      className="mx-auto mt-24 max-w-sm rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-8 shadow-sm"
    >
      <h1 className="mb-2 font-display text-headline-md-mobile text-on-background">
        Admin
      </h1>
      <p className="mb-6 text-body-md text-on-surface-variant">
        Log in om producten te beheren.
      </p>
      <input
        type="password"
        name="password"
        placeholder="Wachtwoord"
        autoFocus
        className="mb-3 w-full rounded-lg border border-outline-variant/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {error && <p className="mb-3 text-sm text-error">{error}</p>}
      <SubmitButton />
    </form>
  );
}
