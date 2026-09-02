/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      fontFamily: {
        // font-sans est l'implicite : tout le texte courant
        sans: ["Inter", "system-ui", "sans-serif"],
        // font-display : titres de page et de section
        display: ["Poppins", "Inter", "sans-serif"],
      },

      // Palette brute, accessible via text-focus-yellow, border-focus-muted, etc.
      // À utiliser seulement quand les tokens DaisyUI (primary, base-200...)
      // ne conviennent pas.
      colors: {
        focus: {
          yellow: "#F2B705",
          teal: "#17B890",
          coral: "#E83658",
          "teal-dark": "#2E6373",
          surface: "#0F242F",
          void: "#0D1117",
          cream: "#F5F5F0",
          muted: "#9FB4BD",
          "muted-dark": "#7B8B93",
          line: "#4A555C",
        },
      },
    },
  },

  plugins: [daisyui],

  daisyui: {
    themes: [
      {
        focus: {
          primary: "#F2B705",
          "primary-content": "#0D1117",

          secondary: "#17B890",
          "secondary-content": "#0D1117",

          accent: "#E83658",
          "accent-content": "#F5F5F0",

          neutral: "#2E6373",
          "neutral-content": "#F5F5F0",

          "base-100": "#0D1117", // fond de page
          "base-200": "#0F242F", // cards, surfaces
          "base-300": "#1B3A49", // bordures, surfaces surélevées
          "base-content": "#F5F5F0", // texte principal

          info: "#7FB3BF",
          success: "#17B890",
          warning: "#F2B705",
          error: "#E83658",

          // Rayons relevés dans le style guide
          "--rounded-box": "0.75rem", // 12px : cards, modales
          "--rounded-btn": "0.5rem", // 8px  : boutons, inputs
          "--rounded-badge": "1.375rem", // 22px : pastilles, tags

          "--btn-text-case": "none", // pas de majuscules forcées
          "--border-btn": "1px",
          "--animation-btn": "0.2s",
          "--animation-input": "0.2s",
          "--tab-radius": "0.5rem",
        },
      },
    ],
    // Quand le thème clair arrivera (US "modifier mon thème"), il suffira
    // d'ajouter un objet "focus-light" ci-dessus et de basculer l'attribut
    // data-theme sur <html>. Aucune autre logique à retoucher.
    darkTheme: "focus",
    logs: false,
  },
};
