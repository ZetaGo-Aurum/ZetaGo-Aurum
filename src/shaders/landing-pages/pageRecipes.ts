import type { FontOption, PageRecipe } from "./pageTypography";

const px = (val: number) => `${Number(val.toFixed(3))}px`;
const fmt = (val: number) => Number(val.toFixed(3));

export const FONT_IOWAN_OLD_STYLE: FontOption = {
  value: "iowan-old-style",
  label: "Iowan Old Style",
  stack: '"Iowan Old Style", Baskerville, "Times New Roman", serif',
};

export const FONT_INTER: FontOption = {
  value: "inter",
  label: "Inter",
  stack: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  google: "Inter:wght@400;500;600",
};

export const FONT_GEIST: FontOption = {
  value: "geist",
  label: "Geist",
  stack: '"Geist", system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
  google: "Geist:wght@100..900",
};

export const FONT_INSTRUMENT_SERIF: FontOption = {
  value: "instrument-serif",
  label: "Instrument Serif",
  stack: '"Instrument Serif", Georgia, "Times New Roman", serif',
  google: "Instrument+Serif",
};

export const FONT_NEWSREADER: FontOption = {
  value: "newsreader",
  label: "Newsreader",
  stack: '"Newsreader", Georgia, serif',
  google: "Newsreader:wght@200..700",
};

export const COMPLETE_SHELF_TYPOGRAPHY: PageRecipe = {
  headingFonts: [FONT_IOWAN_OLD_STYLE, FONT_INSTRUMENT_SERIF, FONT_NEWSREADER, FONT_GEIST],
  bodyFonts: [FONT_INTER, FONT_GEIST, FONT_NEWSREADER, FONT_INSTRUMENT_SERIF],
  headingWeights: ["400", "500", "600"],
  headingWeight: "400",
  bodyWeights: ["400", "500", "600"],
  bodyWeight: "400",
  primaryColor: "#c87046",
  headingSize: [32, 60, 88],
  bodySize: [10, 12, 18],
  headingLetterSpacing: [-0.1, -0.055, 0.08],
  css: (e) => `
:root { --accent: ${e.primary}; }
body { font-family: ${e.body}; font-weight: ${e.bodyWeight}; }
.selection__title, .detail-title, .editorial-identity strong, .page-status strong {
  font-family: ${e.heading};
  font-weight: ${e.headingWeight};
}
.selection__title {
  font-size: clamp(32px, 3.4vw, ${px(e.headingSize)});
  letter-spacing: ${e.headingLetterSpacing}em;
}
.detail-title {
  font-size: clamp(56px, 6.3vw, ${px((e.headingSize * 107.2) / 60)});
  letter-spacing: ${fmt(e.headingLetterSpacing - 0.01)}em;
}
.selection__note { font-size: ${px(e.bodySize)}; font-weight: ${e.bodyWeight}; }
.detail-deck { font-family: ${e.body}; font-weight: ${e.bodyWeight}; }
@media (max-width: 880px) {
  .selection__title { font-size: clamp(32px, 9vw, ${px((e.headingSize * 56) / 60)}); }
  .detail-title { font-size: clamp(48px, 14vw, ${px((e.headingSize * 80) / 60)}); }
}
@media (max-width: 560px) {
  .selection__title { font-size: ${px((e.headingSize * 32) / 60)}; }
}
`,
};

// Placeholders for other landing page recipes if referenced
export const ANTHRA_A40_TYPOGRAPHY = COMPLETE_SHELF_TYPOGRAPHY;
export const ATTUNE_TYPOGRAPHY = COMPLETE_SHELF_TYPOGRAPHY;
export const AURELLO_TYPOGRAPHY = COMPLETE_SHELF_TYPOGRAPHY;
export const AXONIS_TYPOGRAPHY = COMPLETE_SHELF_TYPOGRAPHY;
export const BESTSELLERS_TYPOGRAPHY = COMPLETE_SHELF_TYPOGRAPHY;
export const BETAWISE_HERO_TYPOGRAPHY = COMPLETE_SHELF_TYPOGRAPHY;
export const BETAWISE_TYPOGRAPHY = COMPLETE_SHELF_TYPOGRAPHY;
export const INKBOUND_TYPOGRAPHY = COMPLETE_SHELF_TYPOGRAPHY;
export const ECHO_VALE_TYPOGRAPHY = COMPLETE_SHELF_TYPOGRAPHY;
export const HALVORSEN_TYPOGRAPHY = COMPLETE_SHELF_TYPOGRAPHY;
export const KAGE_TYPOGRAPHY = COMPLETE_SHELF_TYPOGRAPHY;
export const KAIRO_TYPOGRAPHY = COMPLETE_SHELF_TYPOGRAPHY;
export const MK78_KEYBOARD_TYPOGRAPHY = COMPLETE_SHELF_TYPOGRAPHY;
export const MARA_VOSS_TYPOGRAPHY = COMPLETE_SHELF_TYPOGRAPHY;
export const NOEMA_N1_TYPOGRAPHY = COMPLETE_SHELF_TYPOGRAPHY;
export const RENDERLAB_TYPOGRAPHY = COMPLETE_SHELF_TYPOGRAPHY;
export const MENG_TO_SKETCHBOOK_TYPOGRAPHY = COMPLETE_SHELF_TYPOGRAPHY;
export const NOCTURNE_TYPOGRAPHY = COMPLETE_SHELF_TYPOGRAPHY;
export const SYLVA_TYPOGRAPHY = COMPLETE_SHELF_TYPOGRAPHY;
export const TIDECREST_TYPOGRAPHY = COMPLETE_SHELF_TYPOGRAPHY;
export const VOLTA_ATELIER_TYPOGRAPHY = COMPLETE_SHELF_TYPOGRAPHY;
