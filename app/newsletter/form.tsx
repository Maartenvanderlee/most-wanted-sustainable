"use client";

import { useFormState, useFormStatus } from "react-dom";
import { subscribe } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-secondary-container px-8 py-4 font-bold text-on-secondary-container shadow-xl transition-transform hover:scale-105 disabled:opacity-60"
    >
      {pending ? "Bezig..." : "Aanmelden"}
    </button>
  );
}

export function NewsletterForm() {
  const [state, formAction] = useFormState(subscribe, null);

  return (
    <div>
      <form
        action={formAction}
        className="flex flex-col justify-center gap-4 md:flex-row"
      >
        <input
          type="email"
          name="email"
          placeholder="Je e-mailadres"
          className="w-full rounded-full border border-white/30 bg-white/20 px-6 py-4 text-white backdrop-blur-md placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-secondary-container md:w-80"
        />
        <SubmitButton />
      </form>
      {state && (
        <p
          className={`mt-4 text-sm font-medium ${state.ok ? "text-white" : "text-on-error-container"}`}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}
