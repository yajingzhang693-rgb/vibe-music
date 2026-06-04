"use client";

import {
  SHARE_CARD_HEIGHT,
  SHARE_CARD_WIDTH,
} from "@/lib/constants";
import { toPng } from "html-to-image";
import { useState } from "react";

export function ExportCardButton({ albumName }: { albumName: string }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    const node = document.getElementById("share-card");
    if (!node) return;
    setLoading(true);
    try {
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        width: SHARE_CARD_WIDTH,
        height: SHARE_CARD_HEIGHT,
        skipFonts: true,
      });
      const link = document.createElement("a");
      const safeName = albumName.replace(/[^\w\u4e00-\u9fa5-]+/g, "_").slice(0, 40);
      link.download = `Vibe_Rating_${safeName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error(e);
      alert("导出失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className="w-full rounded-full border border-white/30 bg-white/10 py-3.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] backdrop-blur-xl transition hover:bg-white/15 active:bg-white/12 disabled:opacity-60"
    >
      {loading ? "生成中…" : "下载分享卡片"}
    </button>
  );
}
