/* GENERATED FROM tokens.json -- DO NOT EDIT. Run scripts/build-tokens.mjs. */
// Portable design tokens (colors as hex). Web consumes the theme via
// src/index.css; mobile (Expo) and any other platform import this object so the
// whole product shares one source of truth.
export const tokens = {
  "color": {
    "light": {
      "background": "#edf2f1",
      "foreground": "#172830",
      "border": "#c7d3d5",
      "input": "#c5d2d2",
      "ring": "#3b9793",
      "card": "#f4f7f7",
      "cardForeground": "#24464c",
      "popover": "#f8fbfa",
      "popoverForeground": "#345257",
      "primary": "#0d7777",
      "primaryForeground": "#f5fbfa",
      "secondary": "#e4eeee",
      "secondaryForeground": "#30464c",
      "muted": "#e9f3f1",
      "mutedForeground": "#748689",
      "accent": "#e3a62f",
      "accentForeground": "#172830",
      "destructive": "#7d3832",
      "destructiveForeground": "#ffe2d8",
      "chart1": "#168988",
      "chart2": "#e3a62f",
      "chart3": "#c06b58",
      "chart4": "#50ce9c",
      "chart5": "#7048a2",
      "sidebar": "#f4f7f7",
      "sidebarForeground": "#30464c",
      "sidebarBorder": "#c7d3d5",
      "sidebarPrimary": "#0d7777",
      "sidebarPrimaryForeground": "#f5fbfa",
      "sidebarAccent": "#e4eeee",
      "sidebarAccentForeground": "#1a6566",
      "sidebarRing": "#3b9793"
    },
    "dark": {
      "background": "#172830",
      "foreground": "#d6e6e7",
      "border": "#38545a",
      "input": "#55767b",
      "ring": "#3b9793",
      "card": "#213940",
      "cardForeground": "#eef8f6",
      "popover": "#1c2d33",
      "popoverForeground": "#d3e8e1",
      "primary": "#168f8a",
      "primaryForeground": "#ffffff",
      "secondary": "#2f4b50",
      "secondaryForeground": "#c7d8d9",
      "muted": "#26444a",
      "mutedForeground": "#92abad",
      "accent": "#e3a62f",
      "accentForeground": "#172830",
      "destructive": "#a95249",
      "destructiveForeground": "#ffe2d8",
      "chart1": "#50ce9c",
      "chart2": "#e3a62f",
      "chart3": "#ee9183",
      "chart4": "#9bcfbe",
      "chart5": "#b18bdb",
      "sidebar": "#1c2d33",
      "sidebarForeground": "#c7d8d9",
      "sidebarBorder": "#2e4a50",
      "sidebarPrimary": "#168f8a",
      "sidebarPrimaryForeground": "#ffffff",
      "sidebarAccent": "#2a4850",
      "sidebarAccentForeground": "#d7e7e2",
      "sidebarRing": "#3b9793"
    }
  },
  "fontFamily": {
    "sans": [
      "Outfit",
      "sans-serif"
    ],
    "serif": [
      "Georgia",
      "serif"
    ],
    "mono": [
      "DM Mono",
      "monospace"
    ]
  },
  "radius": "0.3125rem",
  "spacing": "0.25rem"
} as const;

export type Tokens = typeof tokens;
export default tokens;
