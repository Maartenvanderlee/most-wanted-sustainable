/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    // Beveiligingsheaders voor alle pagina's. Geen strikte script-CSP omdat
    // JSON-LD-blokken en de Google Fonts-stylesheet inline/extern nodig zijn;
    // de belangrijkste risico's (clickjacking, MIME-sniffing, verwijzing naar
    // andere sites) zijn wel afgedekt.
    const securityHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
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
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
