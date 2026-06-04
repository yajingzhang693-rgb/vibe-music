"use client";

import { ListShareCard10 } from "@/components/list-share-card-10";
import { ListShareCard20 } from "@/components/list-share-card-20";
import { ListShareCard30 } from "@/components/list-share-card-30";
import type { ITunesResult, ListCapacity } from "@/lib/types";

export function ListShareCard({
  listTitle,
  albums,
  capacity,
  id = "list-share-card",
  showPlaceholders = false,
  showScores = true,
}: {
  listTitle: string;
  albums: ITunesResult[];
  capacity: ListCapacity;
  id?: string;
  /** 编辑页预览：未满时显示虚线占位格；导出应为 false */
  showPlaceholders?: boolean;
  /** 编辑页预览可关闭分数角标 */
  showScores?: boolean;
}) {
  const props = { listTitle, albums, id, showPlaceholders, showScores };

  switch (capacity) {
    case 10:
      return <ListShareCard10 {...props} />;
    case 20:
      return <ListShareCard20 {...props} />;
    case 30:
      return <ListShareCard30 {...props} />;
    default:
      return <ListShareCard10 {...props} />;
  }
}
