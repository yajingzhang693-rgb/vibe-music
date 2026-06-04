"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ExportListCardButton } from "@/components/export-list-card-button";
import { ListShareCard } from "@/components/list-share-card";
import { AlbumCover } from "@/components/album-cover";
import { getListShareCardPreviewMetrics } from "@/lib/list-share-layout";
import { lookupCollectionsSafe } from "@/lib/itunes";
import { useListsStore } from "@/store/use-lists-store";
import { useQuery } from "@tanstack/react-query";
import type { ITunesResult } from "@/lib/types";
import Link from "next/link";
import { useMemo } from "react";

function BackLink() {
  return (
    <Link
      href="/lists"
      className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-xl transition hover:border-white/40 hover:bg-white/15"
    >
      返回
    </Link>
  );
}

function SortableAlbumRow({
  albumId,
  album,
  rank,
  onRemove,
}: {
  albumId: string;
  album: ITunesResult | undefined;
  rank: number;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: albumId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-xl border border-white/30 bg-white/5 p-3 backdrop-blur-md"
    >
      <button
        type="button"
        className="cursor-grab touch-none px-1 text-zinc-500 active:cursor-grabbing"
        aria-label="拖拽排序"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <span className="w-6 shrink-0 text-center text-sm font-bold text-zinc-400">
        {rank}
      </span>
      {album ? (
        <>
          <AlbumCover
            collectionId={album.collectionId!}
            src={album.artworkUrl100}
            alt={album.collectionName ?? ""}
            className="h-14 w-14 shrink-0 rounded-md"
            size={56}
            sharedLayout={false}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {album.collectionName}
            </p>
            <p className="truncate text-xs text-zinc-400">{album.artistName}</p>
          </div>
          <Link
            href={`/album/${album.collectionId}`}
            className="shrink-0 text-xs text-zinc-400 hover:text-white"
          >
            打分
          </Link>
        </>
      ) : (
        <div className="min-w-0 flex-1 text-sm text-zinc-500">
          专辑信息加载失败 (ID: {albumId})
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-white/10 hover:text-red-300"
      >
        移除
      </button>
    </li>
  );
}

export function ListEditorPage({ listId }: { listId: string }) {
  const list = useListsStore((s) => s.getList(listId));
  const removeAlbumFromList = useListsStore((s) => s.removeAlbumFromList);
  const reorderAlbums = useListsStore((s) => s.reorderAlbums);

  const albumsQuery = useQuery({
    queryKey: ["list-albums", listId, list?.albumIds],
    queryFn: () => lookupCollectionsSafe(list!.albumIds.map(Number)),
    enabled: !!list && list.albumIds.length > 0,
  });

  const albumMap = useMemo(() => {
    const map = new Map<string, ITunesResult>();
    for (const a of albumsQuery.data ?? []) {
      if (a.collectionId) map.set(String(a.collectionId), a);
    }
    return map;
  }, [albumsQuery.data]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!list) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] px-6 py-10 text-white">
        <BackLink />
        <p className="mt-8 text-zinc-400">榜单不存在或已被删除。</p>
      </main>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = list.albumIds.indexOf(String(active.id));
    const newIndex = list.albumIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    reorderAlbums(listId, arrayMove(list.albumIds, oldIndex, newIndex));
  };

  const sharePreview = getListShareCardPreviewMetrics(list.capacity);
  const shareAlbums = list.albumIds
    .map((id) => albumMap.get(id))
    .filter((a): a is ITunesResult => !!a);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8 flex items-start justify-between gap-4 border-b border-white/10 pb-6">
          <BackLink />
          <h1 className="min-w-0 max-w-md truncate text-right text-2xl font-bold sm:text-3xl">
            {list.title}
          </h1>
        </header>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
          <aside className="flex w-full shrink-0 flex-col items-center gap-6 border-b border-white/10 pb-10 lg:w-auto lg:border-b-0 lg:border-r lg:pr-12 lg:pb-0 lg:sticky lg:top-8">
            <div
              className="flex flex-col items-stretch gap-6"
              style={{ width: sharePreview.displayWidth }}
            >
              <div
                className="relative shrink-0 overflow-hidden rounded-2xl shadow-2xl"
                style={{
                  width: sharePreview.displayWidth,
                  height: sharePreview.displayHeight,
                }}
              >
                <div
                  className="origin-top-left"
                  style={{
                    transform: `scale(${sharePreview.scale})`,
                    width: sharePreview.width,
                    height: sharePreview.height,
                  }}
                >
                  <ListShareCard
                    id="list-share-card-preview"
                    listTitle={list.title}
                    albums={shareAlbums}
                    capacity={list.capacity}
                    showPlaceholders
                    showScores={false}
                  />
                </div>
              </div>

              <div
                className="pointer-events-none fixed left-[-9999px] top-0 opacity-0"
                aria-hidden
              >
                <ListShareCard
                  id="list-share-card"
                  listTitle={list.title}
                  albums={shareAlbums}
                  capacity={list.capacity}
                  showPlaceholders={false}
                />
              </div>

              <ExportListCardButton
                listTitle={list.title}
                capacity={list.capacity}
                disabled={shareAlbums.length === 0}
              />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            {list.albumIds.length === 0 ? (
              <p className="rounded-xl border border-white/30 bg-white/5 p-8 text-center text-zinc-400">
                榜单为空。在发现页、艺人页或打分页点击专辑旁的「+」添加。
              </p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={list.albumIds}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="space-y-2">
                    {list.albumIds.map((albumId, i) => (
                      <SortableAlbumRow
                        key={albumId}
                        albumId={albumId}
                        album={albumMap.get(albumId)}
                        rank={i + 1}
                        onRemove={() => removeAlbumFromList(listId, albumId)}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
