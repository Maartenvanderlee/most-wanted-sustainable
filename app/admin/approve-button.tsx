"use client";

// Goedkeur-knop die, als er eerdere afwijzingen bekend zijn voor dit product,
// eerst een bevestigingspop-up toont met de volledige geschiedenis. De admin
// kiest dan bewust: annuleren, of doorgaan met een geïnformeerde keuze.
export function ApproveButton({
  warningText,
}: {
  warningText: string | null;
}) {
  return (
    <button
      className="rounded-full bg-primary-container px-4 py-1.5 text-sm font-semibold text-on-primary hover:opacity-90"
      onClick={(e) => {
        if (warningText && !window.confirm(warningText)) {
          e.preventDefault();
        }
      }}
    >
      Goedkeuren
    </button>
  );
}
