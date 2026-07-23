/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    // Beveiligingsheaders. Geen strikte script-CSP omdat JSON-LD-blokken en de
    // Google Fonts-stylesheet inline/extern nodig zijn; de belangrijkste
    // risico's (clickjacking, MIME-sniffing, verwijzing naar andere sites) zijn
    // wel afgedekt.
    const common = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
    ];

    return [
      {
        // Alles BEHALVE /embed: clickjacking hard blokkeren (admin, etc.).
        source: "/((?!embed).*)",
        headers: [...common, { key: "X-Frame-Options", value: "DENY" }],
      },
      {
        // /embed is de whitelabel-widget en MOET insluitbaar zijn op elk domein.
        // Geen X-Frame-Options; frame-ancestors * staat framing overal toe.
        // Bewust alleen deze route — de rest blijft DENY.
        source: "/embed/:path*",
        headers: [
          ...common,
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
        ],
      },
    ];
  },
};

export default nextConfig;
