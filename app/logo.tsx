// Merklogo: driehoek met blauw-groen verloop en geel stipje, plus de
// woordmerk "MOST WANTED / sustainable" in Manrope.
export function Logo({ size = "nav" }: { size?: "nav" | "footer" }) {
  const icon = size === "footer" ? 34 : 30;
  const title = size === "footer" ? "text-[20px]" : "text-[17px]";
  const sub = size === "footer" ? "text-[9px]" : "text-[8px]";

  return (
    <span className="inline-flex items-center gap-2.5">
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 46 46"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="mw-logo-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2F8FE0" />
            <stop offset="1" stopColor="#1FB979" />
          </linearGradient>
        </defs>
        <polygon points="23,8 44,44 2,44" fill="url(#mw-logo-gradient)" />
        <circle cx="23" cy="5" r="5" fill="#FFC72C" />
      </svg>
      <span className="font-logo leading-none">
        <span className={`block font-extrabold tracking-tight text-[#0E7C4A] ${title}`}>
          MOST WANTED
        </span>
        <span
          className={`mt-1 block font-bold uppercase tracking-[0.26em] text-[#2F6FEB] ${sub}`}
        >
          sustainable
        </span>
      </span>
      <span className="sr-only">Most Wanted Sustainable</span>
    </span>
  );
}
