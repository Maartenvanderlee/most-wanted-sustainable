"use client";

// Registreert anoniem paginabezoeken en link-kliks. Geen cookies, geen
// persoonsgegevens. De admin (/admin) wordt niet gemeten.
import { usePathname } from "next/navigation";
import { useEffect } from "react";

type Payload = { type: "page_view" | "click" | "outbound"; path: string; label?: string };

function send(payload: Payload) {
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/track", {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      });
    }
  } catch {
    // stil falen
  }
}

export function Analytics() {
  const pathname = usePathname();

  // Paginabezoek registreren bij elke navigatie (behalve de admin).
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    send({ type: "page_view", path: pathname });
  }, [pathname]);

  // Link-kliks registreren via één gedeelde luisteraar.
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      if (!href || href.startsWith("#")) return;

      const isExternal =
        /^https?:\/\//.test(href) && !href.includes(window.location.host);
      const text = (anchor.textContent ?? "").trim().slice(0, 80);

      send({
        type: isExternal ? "outbound" : "click",
        path: pathname,
        label: isExternal ? href : text || href,
      });
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [pathname]);

  return null;
}
