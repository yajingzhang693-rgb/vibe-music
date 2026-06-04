"use client";

import { getListShareLayout } from "@/lib/list-share-layout";
import type { ListCapacity } from "@/lib/types";
import { toPng } from "html-to-image";
import { useState } from "react";

export function ExportListCardButton({
  listTitle,
  capacity,
  disabled = false,
}: {
  listTitle: string;
  capacity: ListCapacity;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const layout = getListShareLayout(capacity);

  const handleExport = async () => {
    const node = document.getElementById("list-share-card");
    if (!node) return;
    setLoading(true);
    try {
      const dataUrl = await toPng(node, {
        pixelRatio: layout.exportPixelRatio,
        cacheBust: true,
        width: layout.width,
        height: layout.height,
        skipFonts: true,
      });
      const link = document.createElement("a");
      const safeName = listTitle.replace(/[^\w\u4e00-\u9fa5-]+/g, "_").slice(0, 40);
      link.download = `Vibe_List_${safeName}.png`;
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
      disabled={loading || disabled}
      className="w-full max-w-md rounded-full border border-white/30 bg-white/10 py-3.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] backdrop-blur-xl transition hover:bg-white/15 disabled:opacity-60"
    >
      {loading ? "生成中…" : "导出榜单分享卡"}
    </button>
  );
}
