"use client";

import { ListCapacityPicker } from "@/components/list-capacity-picker";
import { hdArtworkUrl } from "@/lib/artwork";
import { lookupCollectionsSafe } from "@/lib/itunes";
import { useListsStore } from "@/store/use-lists-store";
import type { ITunesResult, ListCapacity, UserList } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

const COVER_STACK_OFFSETS = [
  "left-0 top-0 z-30 opacity-100",
  "left-0 top-0 z-20 translate-x-2 -translate-y-1 opacity-80",
  "left-0 top-0 z-10 translate-x-4 -translate-y-2 opacity-80",
] as const;

function BackLink() {
  return (
    <Link
      href="/"
      className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground shadow-soft transition-all hover:scale-[1.03] hover:border-white/25 active:scale-95"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
      返回
    </Link>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function MusicIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function ListCoverStack({
  albumIds,
  albumMap,
}: {
  albumIds: string[];
  albumMap: Map<string, ITunesResult>;
}) {
  const top3 = albumIds.slice(0, 3);

  if (top3.length === 0) {
    return (
      <div
        className="relative h-12 w-20 shrink-0"
        aria-label="暂无专辑封面"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-md border border-dashed border-border bg-surface">
          <MusicIcon className="h-5 w-5 text-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-12 w-20 shrink-0" aria-hidden>
      {top3.map((id, i) => {
        const album = albumMap.get(id);
        const url = hdArtworkUrl(album?.artworkUrl100);
        const offset = COVER_STACK_OFFSETS[i] ?? COVER_STACK_OFFSETS[2];
        return (
          <div
            key={id}
            className={`absolute overflow-hidden rounded-md border border-border bg-zinc-800 shadow-soft ${offset}`}
            style={{ width: 48, height: 48 }}
          >
            {url ? (
              <Image
                src={url}
                alt={album?.collectionName ?? ""}
                width={48}
                height={48}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <div className="h-full w-full bg-zinc-700" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

export function ListsPage() {
  const lists = useListsStore((s) => s.lists);
  const createList = useListsStore((s) => s.createList);
  const updateList = useListsStore((s) => s.updateList);
  const deleteList = useListsStore((s) => s.deleteList);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [showCapacityPicker, setShowCapacityPicker] = useState(false);

  const previewAlbumIds = useMemo(() => {
    const ids = new Set<number>();
    for (const list of lists) {
      for (const id of list.albumIds.slice(0, 3)) {
        const n = Number(id);
        if (!Number.isNaN(n)) ids.add(n);
      }
    }
    return Array.from(ids);
  }, [lists]);

  const coversQuery = useQuery({
    queryKey: ["lists-page-covers", previewAlbumIds],
    queryFn: () => lookupCollectionsSafe(previewAlbumIds),
    enabled: previewAlbumIds.length > 0,
    staleTime: 60_000,
  });

  const albumMap = useMemo(() => {
    const map = new Map<string, ITunesResult>();
    for (const a of coversQuery.data ?? []) {
      if (a.collectionId) map.set(String(a.collectionId), a);
    }
    return map;
  }, [coversQuery.data]);

  const handleCapacitySelect = useCallback(
    (capacity: ListCapacity) => {
      const list = createList(undefined, capacity);
      setShowCapacityPicker(false);
      setEditingId(list.id);
      setEditDraft(list.title);
    },
    [createList]
  );

  const startRename = useCallback((list: UserList) => {
    setEditingId(list.id);
    setEditDraft(list.title);
  }, []);

  const cancelRename = useCallback(() => {
    setEditingId(null);
    setEditDraft("");
  }, []);

  const commitRename = useCallback(
    (id: string) => {
      if (editingId !== id) return;
      updateList(id, { title: editDraft.trim() || "未命名榜单" });
      cancelRename();
    },
    [editingId, editDraft, updateList, cancelRename]
  );

  const handleDelete = useCallback(
    (list: UserList) => {
      if (editingId === list.id) cancelRename();
      deleteList(list.id);
    },
    [editingId, cancelRename, deleteList]
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-10 flex items-center justify-between gap-4">
          <BackLink />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Collections
          </span>
        </div>

        <header className="mb-8">
          <h1 className="display-title text-balance text-4xl font-semibold md:text-5xl">
            我的榜单
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            把打动你的专辑编排成属于自己的榜单，随时回顾与分享。
          </p>
        </header>

        <div className="mb-8">
          <button
            type="button"
            onClick={() => setShowCapacityPicker(true)}
            className="w-full rounded-full bg-foreground px-4 py-3.5 text-sm font-medium text-background shadow-soft-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            新建我的榜单
          </button>
        </div>

        {lists.length === 0 ? (
          <div className="glass-panel mt-4 rounded-2xl px-6 py-14 text-center shadow-soft">
            <p className="text-sm text-muted">
              还没有榜单，点击上方按钮开始创作
            </p>
          </div>
        ) : (
          <ul className="space-y-3 overflow-x-visible">
            <AnimatePresence initial={false} mode="popLayout">
              {lists.map((list) => (
                <motion.li
                  key={list.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 120 }}
                  transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                  className="group flex items-center gap-4 rounded-2xl glass-panel px-4 py-5 shadow-soft transition-all hover:scale-[1.01] hover:border-white/20"
                >
                <ListCoverStack
                  albumIds={list.albumIds}
                  albumMap={albumMap}
                />
                <div className="min-w-0 flex-1">
                  {editingId === list.id ? (
                    <input
                      type="text"
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      onBlur={() => commitRename(list.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          commitRename(list.id);
                        }
                        if (e.key === "Escape") {
                          e.preventDefault();
                          cancelRename();
                        }
                      }}
                      autoFocus
                      aria-label="榜单名称"
                      className="w-full rounded-lg glass-panel px-2 py-1 font-medium text-foreground outline-none focus:border-white/25"
                    />
                  ) : (
                    <Link
                      href={`/lists/${list.id}`}
                      className="block hover:opacity-90"
                    >
                      <p className="truncate font-medium">{list.title}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {list.albumIds.length} / {list.capacity} 张专辑
                        <span className="text-muted/50"> · </span>
                        {list.capacity} 张榜
                      </p>
                    </Link>
                  )}
                  {editingId === list.id && (
                    <p className="mt-0.5 text-xs text-muted">
                      {list.albumIds.length} / {list.capacity} 张专辑
                      <span className="text-muted/50"> · </span>
                      {list.capacity} 张榜
                    </p>
                  )}
                </div>
                <div
                  className={`flex shrink-0 items-center gap-0.5 transition-opacity duration-200 ${
                    editingId === list.id
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 max-sm:opacity-100"
                  }`}
                >
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => startRename(list)}
                    aria-label="编辑"
                    title="重命名"
                    className="rounded-lg p-2 text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground"
                  >
                    <EditIcon className="h-[18px] w-[18px]" />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleDelete(list)}
                    aria-label="删除"
                    className="rounded-lg p-2 text-muted transition-colors hover:bg-white/[0.06] hover:text-red-300"
                  >
                    <TrashIcon className="h-[18px] w-[18px]" />
                  </button>
                </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {showCapacityPicker && (
        <ListCapacityPicker
          onSelect={handleCapacitySelect}
          onCancel={() => setShowCapacityPicker(false)}
        />
      )}
    </main>
  );
}
