/** PRD 精选 8 张；部分原 ID 在 iTunes 已失效，已替换为可 lookup 的同名专辑 */
export const FEATURED_COLLECTION_IDS = [
  1739659134, // Billie Eilish — HIT ME HARD AND SOFT
  1630005298, // Beyoncé — RENAISSANCE
  1669095245, // Caroline Polachek — Desire, I Want to Turn Into You
  1564530719, // Clairo — Happier Than Ever
  1806614239, // PinkPantheress — Fancy That
  1665311474, // Kali Uchis — Red Moon In Venus
  1739079974, // Charli XCX — BRAT
  1751414757, // Magdalena Bay — Imaginal Disk
];

export const COVER_LAYOUT_ID_PREFIX = "album-cover";

export function coverLayoutId(collectionId: number | string) {
  return `${COVER_LAYOUT_ID_PREFIX}-${collectionId}`;
}

/** 12:16 分享卡画布（导出 2x → 1080×1440） */
export const SHARE_CARD_WIDTH = 540;
export const SHARE_CARD_HEIGHT = 720;

/** 打分页左侧预览显示宽度（DOM 540×720，CSS scale 缩放） */
export const PREVIEW_DISPLAY_WIDTH = 450;

export function getShareCardPreviewMetrics(width = PREVIEW_DISPLAY_WIDTH) {
  const scale = width / SHARE_CARD_WIDTH;
  return {
    displayWidth: width,
    displayHeight: scale * SHARE_CARD_HEIGHT,
    scale,
  };
}

export const MIN_TRACK_COUNT = 7;

export const MAX_REVIEW_LENGTH = 300;

/** @deprecated 使用 lib/list-share-layout.ts */
export { LIST_SHARE_CARD_WIDTH } from "./list-share-layout";
