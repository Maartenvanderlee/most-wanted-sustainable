import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Material 3 palet uit de mockup
        primary: "#006e2f",
        "primary-container": "#22c55e",
        "on-primary": "#ffffff",
        "on-primary-fixed-variant": "#005321",
        "primary-fixed": "#6bff8f",
        secondary: "#735c00",
        "secondary-container": "#fed01b",
        "on-secondary-container": "#6f5900",
        tertiary: "#006591",
        "tertiary-container": "#36b6fb",
        background: "#f7f9fb",
        surface: "#f7f9fb",
        "surface-container": "#eceef0",
        "surface-container-low": "#f2f4f6",
        "surface-container-lowest": "#ffffff",
        "on-background": "#191c1e",
        "on-surface": "#191c1e",
        "on-surface-variant": "#3d4a3d",
        outline: "#6d7b6c",
        "outline-variant": "#bccbb9",
        // behoud van onze merk-groentinten voor accenten
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
      },
      fontFamily: {
        display: ["var(--font-jakarta)", "sans-serif"],
        body: ["var(--font-vietnam)", "sans-serif"],
        label: ["var(--font-grotesk)", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["56px", { lineHeight: "64px", letterSpacing: "-0.02em", fontWeight: "800" }],
        "display-lg-mobile": ["40px", { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "800" }],
        "headline-md": ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "headline-md-mobile": ["24px", { lineHeight: "32px", fontWeight: "700" }],
        "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.1em", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "2rem",
      },
      maxWidth: {
        container: "1280px",
      },
      spacing: {
        gutter: "24px",
      },
    },
  },
  plugins: [],
};

export default config;
