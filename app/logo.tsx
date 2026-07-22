// Merklogo RiseGoods: driehoek met turquoise-groen verloop en geel stipje,
// plus het woordmerk "RISE / GOODS". Vormen en kleuren overgenomen uit het
// Claude Design-project "Most Wanted naar RiseGoods" (RiseGoods Logo.dc.html,
// variant "Horizontaal · lichte achtergrond").
export function Logo({ size = "nav" }: { size?: "nav" | "footer" }) {
  const icon = size === "footer" ? 34 : 30;
  const title = size === "footer" ? "text-[20px]" : "text-[17px]";
  const sub = size === "footer" ? "text-[9px]" : "text-[8px]";

  return (
    <span className="inline-flex items-center gap-2.5">
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="rg-logo-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#299FBA" />
            <stop offset="1" stopColor="#21B584" />
          </linearGradient>
        </defs>
        <polygon points="50,30 5,95 95,95" fill="url(#rg-logo-gradient)" />
        <circle cx="37.5" cy="17.5" r="15" fill="#FFC72C" />
      </svg>
      <span className="font-logo leading-none">
        <span className={`block font-extrabold tracking-tight text-[#0E7C4A] ${title}`}>
          RISE
        </span>
        <span
          className={`mt-1 block font-bold uppercase tracking-[0.2em] text-[#437DED] ${sub}`}
        >
          GOODS
        </span>
      </span>
      <span className="sr-only">Risegoods</span>
    </span>
  );
}
