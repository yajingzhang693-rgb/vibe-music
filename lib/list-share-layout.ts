import type { ListCapacity } from "./types";

export const LIST_SHARE_CARD_WIDTH = 540;

export interface ListShareLayoutConfig {
  capacity: ListCapacity;
  width: number;
  height: number;
  exportPixelRatio: number;
}

const LAYOUTS: Record<ListCapacity, ListShareLayoutConfig> = {
  /** Top1 2× 方格 + 3×3 网格与行内标题 */
  10: { capacity: 10, width: 540, height: 1060, exportPixelRatio: 2 },
  20: { capacity: 20, width: 540, height: 860, exportPixelRatio: 2 },
  30: { capacity: 30, width: 540, height: 880, exportPixelRatio: 2 },
};

export function getListShareLayout(capacity: ListCapacity): ListShareLayoutConfig {
  return LAYOUTS[capacity];
}

export const LIST_PREVIEW_DISPLAY_WIDTH = 400;

/** 编辑页预览显示宽度（仅缩放展示，不影响导出画布） */
const PREVIEW_DISPLAY_WIDTH: Record<ListCapacity, number> = {
  10: 400,
  20: 480,
  30: 480,
};

export function getListShareCardPreviewMetrics(capacity: ListCapacity) {
  const { width, height } = getListShareLayout(capacity);
  const displayWidth = PREVIEW_DISPLAY_WIDTH[capacity];
  const scale = displayWidth / width;
  return {
    displayWidth,
    displayHeight: scale * height,
    scale,
    width,
    height,
  };
}
