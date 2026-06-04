export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace("#", "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
}

/** WCAG 2.x 相对明度（0 = 黑，1 = 白） */
export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** 与打分页 UI 共用的明度分界（≥ 视为浅色背景） */
export const BACKGROUND_LUMINANCE_THRESHOLD = 0.55;

export function isDarkBackgroundColor(hex: string): boolean {
  return relativeLuminance(hex) < BACKGROUND_LUMINANCE_THRESHOLD;
}

export function isLightBackgroundColor(hex: string): boolean {
  return !isDarkBackgroundColor(hex);
}

/** 根据背景明度返回可读的前景色：深底白字，浅底黑字 */
export function contrastTextForBackground(
  hex: string
): "#ffffff" | "#000000" {
  return isDarkBackgroundColor(hex) ? "#ffffff" : "#000000";
}

function clampChannel(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

export type MeshPalette = {
  primary: string;
  warm: string;
  cool: string;
  deep: string;
  staticMesh: string;
};

/** 从专辑主色生成低饱和 mesh 色板（用于流体背景） */
export function meshPaletteFromHex(hex: string): MeshPalette {
  const rgb = hexToRgb(hex) ?? { r: 30, g: 30, b: 40 };
  const primary = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)`;
  const warm = `rgba(${clampChannel(rgb.r + 36)}, ${clampChannel(rgb.g + 12)}, ${clampChannel(rgb.b + 48)}, 0.18)`;
  const cool = `rgba(${clampChannel(rgb.r - 28)}, ${clampChannel(rgb.g - 8)}, ${clampChannel(rgb.b + 24)}, 0.16)`;
  const deep = `rgba(${clampChannel(rgb.r * 0.45)}, ${clampChannel(rgb.g * 0.45)}, ${clampChannel(rgb.b * 0.55)}, 0.28)`;
  const staticMesh = [
    `radial-gradient(ellipse 90% 70% at 12% 18%, ${warm} 0%, transparent 58%)`,
    `radial-gradient(ellipse 75% 55% at 88% 22%, ${cool} 0%, transparent 52%)`,
    `radial-gradient(ellipse 65% 80% at 72% 88%, ${primary} 0%, transparent 55%)`,
    `radial-gradient(ellipse 55% 45% at 28% 72%, ${deep} 0%, transparent 48%)`,
    `radial-gradient(ellipse 100% 80% at 50% 110%, ${primary} 0%, transparent 62%)`,
    "#0a0a0a",
  ].join(", ");
  return { primary, warm, cool, deep, staticMesh };
}

/** @deprecated 使用 meshPaletteFromHex */
export function meshGradientFromHex(hex: string): string {
  return meshPaletteFromHex(hex).staticMesh;
}
