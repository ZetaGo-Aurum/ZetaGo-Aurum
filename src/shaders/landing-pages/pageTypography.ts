import { useMemo } from "react";

export type PageTypographyProps = {
  headingFont?: string;
  bodyFont?: string;
  headingWeight?: string;
  bodyWeight?: string;
  primaryColor?: string;
  headingSize?: number;
  bodySize?: number;
  headingLetterSpacing?: number;
};

export type LandingPageCustomization = {
  css?: string;
  fontHref?: string;
  inlineStyles?: Array<{
    selector: string;
    styles: Record<string, string>;
  }>;
};

export type FontOption = {
  value: string;
  label: string;
  stack: string;
  google?: string;
};

export type RecipeContext = {
  heading: string;
  body: string;
  headingWeight: string;
  bodyWeight: string;
  primary: string;
  headingSize: number;
  bodySize: number;
  headingLetterSpacing: number;
  retone: (color: string) => string;
  retoneRgba: (color: string) => string;
  filter: (baseColor?: string) => string;
};

export type PageRecipe = {
  headingFonts: FontOption[];
  bodyFonts: FontOption[];
  headingWeights: string[];
  headingWeight: string;
  bodyWeights: string[];
  bodyWeight: string;
  primaryColor: string;
  headingSize: [number, number, number];
  bodySize: [number, number, number];
  headingLetterSpacing: [number, number, number];
  css: (ctx: RecipeContext) => string;
  inlineStyles?: (ctx: RecipeContext) => Array<{ selector: string; styles: Record<string, string> }>;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function parseHex(hex: unknown, fallback: string): string {
  if (typeof hex !== "string") return fallback;
  const match = hex.trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  if (!match) return fallback;
  const val = match[1].toLowerCase();
  return `#${val.length === 3 ? val.replace(/./g, (c) => c + c) : val}`;
}

function hexToHsl(hex: string) {
  const [r, g, b] = [1, 3, 5].map((idx) => Number.parseInt(hex.slice(idx, idx + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = ((max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60 + 360) % 360;
  return { h, s, l };
}

function hslToRgb({ h, s, l }: { h: number; s: number; l: number }) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] :
    h < 120 ? [x, c, 0] :
    h < 180 ? [0, c, x] :
    h < 240 ? [0, x, c] :
    h < 300 ? [x, 0, c] : [c, 0, x];
  return [r + m, g + m, b + m].map((v) => Math.round(clamp01(v) * 255));
}

function hslToHex(hsl: { h: number; s: number; l: number }) {
  return `#${hslToRgb(hsl).map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function colorDelta(baseHex: string, targetHex: string) {
  const base = hexToHsl(baseHex);
  const target = hexToHsl(targetHex);
  return {
    hue: target.h - base.h,
    saturation: base.s > 0.01 ? Math.min(3, target.s / base.s) : 1,
    lightness: base.l > 0.01 ? Math.min(3, target.l / base.l) : 1,
  };
}

function findOption(val: string | undefined, list: FontOption[]): FontOption {
  return list.find((item) => item.value === val) ?? list[0];
}

function pickWeight(val: string | undefined, allowed: string[], fallback: string): string {
  return val && allowed.includes(val) ? val : fallback;
}

function clampNumeric(val: number | undefined, [min, def, max]: [number, number, number]): number {
  return typeof val === "number" && Number.isFinite(val) ? Math.min(max, Math.max(min, val)) : def;
}

function buildFontUrl(fonts: FontOption[]): string | undefined {
  const families = [...new Set(fonts.map((f) => f.google).filter(Boolean))];
  if (!families.length) return undefined;
  return `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap`;
}

export function splitTypographyProps<T extends PageTypographyProps>(
  props: T
): [PageTypographyProps, Omit<T, keyof PageTypographyProps>] {
  const {
    headingFont,
    bodyFont,
    headingWeight,
    bodyWeight,
    primaryColor,
    headingSize,
    bodySize,
    headingLetterSpacing,
    ...rest
  } = props;
  return [
    {
      headingFont,
      bodyFont,
      headingWeight,
      bodyWeight,
      primaryColor,
      headingSize,
      bodySize,
      headingLetterSpacing,
    },
    rest as Omit<T, keyof PageTypographyProps>,
  ];
}

export function usePageTypography(
  recipe: PageRecipe,
  props: PageTypographyProps
): LandingPageCustomization {
  const {
    headingFont,
    bodyFont,
    headingWeight,
    bodyWeight,
    primaryColor,
    headingSize,
    bodySize,
    headingLetterSpacing,
  } = props;

  return useMemo(() => {
    const hFont = findOption(headingFont, recipe.headingFonts);
    const bFont = findOption(bodyFont, recipe.bodyFonts);
    const targetPrimary = parseHex(primaryColor, recipe.primaryColor);
    const isOriginal = targetPrimary === recipe.primaryColor;
    const delta = colorDelta(recipe.primaryColor, targetPrimary);

    const retone = (colorHex: string) => {
      if (isOriginal) return colorHex;
      const hsl = hexToHsl(parseHex(colorHex, colorHex));
      return hslToHex({
        h: (hsl.h + delta.hue + 360) % 360,
        s: clamp01(hsl.s * delta.saturation),
        l: clamp01(hsl.l * delta.lightness),
      });
    };

    const retoneRgba = (colorRgba: string) => {
      if (isOriginal) return colorRgba;
      const match = colorRgba.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/i);
      if (!match) return colorRgba;
      const hex = `#${[match[1], match[2], match[3]].map((c) => Math.round(Number(c)).toString(16).padStart(2, "0")).join("")}`;
      const [r, g, b] = [1, 3, 5].map((idx) => Number.parseInt(retone(hex).slice(idx, idx + 2), 16));
      return match[4] === undefined ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${match[4]})`;
    };

    const filter = (baseColor: string = recipe.primaryColor) => {
      if (isOriginal) return "none";
      const d = colorDelta(baseColor, retone(baseColor));
      return [
        `hue-rotate(${d.hue.toFixed(2)}deg)`,
        `saturate(${Math.max(0, d.saturation).toFixed(3)})`,
        `brightness(${Math.min(2, Math.max(0.2, d.lightness)).toFixed(3)})`,
      ].join(" ");
    };

    const ctx: RecipeContext = {
      heading: hFont.stack,
      body: bFont.stack,
      headingWeight: pickWeight(headingWeight, recipe.headingWeights, recipe.headingWeight),
      bodyWeight: pickWeight(bodyWeight, recipe.bodyWeights, recipe.bodyWeight),
      primary: targetPrimary,
      headingSize: clampNumeric(headingSize, recipe.headingSize),
      bodySize: clampNumeric(bodySize, recipe.bodySize),
      headingLetterSpacing: clampNumeric(headingLetterSpacing, recipe.headingLetterSpacing),
      retone,
      retoneRgba,
      filter,
    };

    return {
      css: recipe.css(ctx),
      fontHref: buildFontUrl([hFont, bFont]),
      inlineStyles: recipe.inlineStyles?.(ctx),
    };
  }, [
    recipe,
    headingFont,
    bodyFont,
    headingWeight,
    bodyWeight,
    primaryColor,
    headingSize,
    bodySize,
    headingLetterSpacing,
  ]);
}

const STYLE_ID = "threeui-page-typography";
const FONTS_ID = "threeui-page-typography-fonts";
const POST_MSG_TYPE = "threeui-page-customization";

export function postPageCustomization(
  frame: HTMLIFrameElement | null,
  customization?: LandingPageCustomization
) {
  frame?.contentWindow?.postMessage(
    {
      type: POST_MSG_TYPE,
      css: customization?.css ?? "",
      fontHref: customization?.fontHref,
    },
    "*"
  );
}

export function applyPageCustomization(
  frame: HTMLIFrameElement | null,
  customization?: LandingPageCustomization
) {
  const doc = frame?.contentDocument;
  if (!doc?.head) return;

  const fontLink = doc.getElementById(FONTS_ID) as HTMLLinkElement | null;
  if (customization?.fontHref) {
    const link = fontLink ?? doc.createElement("link");
    link.id = FONTS_ID;
    link.rel = "stylesheet";
    if (link.getAttribute("href") !== customization.fontHref) {
      link.href = customization.fontHref;
    }
    if (!fontLink) doc.head.appendChild(link);
  } else {
    fontLink?.remove();
  }

  const existingStyle = doc.getElementById(STYLE_ID);
  if (!customization?.css) {
    existingStyle?.remove();
    return;
  }

  const style = existingStyle ?? doc.createElement("style");
  style.id = STYLE_ID;
  if (style.textContent !== customization.css) {
    style.textContent = customization.css;
  }
  if (!existingStyle) doc.head.appendChild(style);

  for (const item of customization.inlineStyles ?? []) {
    for (const el of doc.querySelectorAll<HTMLElement>(item.selector)) {
      for (const [prop, val] of Object.entries(item.styles)) {
        el.style.setProperty(prop, val);
      }
    }
  }
}
