"use client";

import { ListCapacityPicker } from "@/components/list-capacity-picker";
import { canAddAlbum, normalizeCollectionId } from "@/lib/lists-utils";
import type { ListCapacity } from "@/lib/types";
import { useListsStore } from "@/store/use-lists-store";
import { useToastStore } from "@/store/use-toast-store";
import { useEffect, useRef, useState } from "react";

export function ListSelectorPopover({
  collectionId,
  open,
  onClose,
  anchorRef,
}: {
  collectionId: string | number;
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const lists = useListsStore((s) => s.lists);
  const createList = useListsStore((s) => s.createList);
  const addAlbumToList = useListsStore((s) => s.addAlbumToList);
  const showToast = useToastStore((s) => s.show);
  const [showCapacityPicker, setShowCapacityPicker] = useState(false);

  const cid = normalizeCollectionId(collectionId);

  useEffect(() => {
    if (!open) {
      setShowCapacityPicker(false);
      return;
    }
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        popoverRef.current?.contains(t) ||
        anchorRef.current?.contains(t)
      ) {
        return;
      }
      onClose();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  const handleAdd = (listId: string, title: string) => {
    const list = lists.find((l) => l.id === listId);
    if (!list) return;
    const check = canAddAlbum(list, cid);
    if (check === "duplicate") {
      showToast("该专辑已在此榜单中");
      return;
    }
    if (check === "full") {
      showToast("榜单已满");
      return;
    }
    const result = addAlbumToList(listId, cid);
    if (result === "ok") {
      showToast(`已加入 ${title}`);
      onClose();
    }
  };

  const handleCapacitySelect = (capacity: ListCapacity) => {
    const list = createList(undefined, capacity);
    setShowCapacityPicker(false);
    const result = addAlbumToList(list.id, cid);
    if (result === "ok") {
      showToast(`已加入 ${list.title}`);
      onClose();
    } else if (result === "duplicate") {
      showToast("该专辑已在此榜单中");
    } else {
      showToast("榜单已满");
    }
  };

  return (
    <>
      <div
        ref={popoverRef}
        className="absolute right-0 top-full z-50 mt-2 min-w-[12rem] rounded-xl border border-white/30 bg-[#141414]/95 p-2 shadow-xl backdrop-blur-xl"
        role="menu"
      >
        {lists.length === 0 && (
          <div className="px-2 py-2 text-center">
            <p className="text-sm text-zinc-400">暂无榜单</p>
            <button
              type="button"
              onClick={() => setShowCapacityPicker(true)}
              className="mt-2 w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/15"
            >
              新建榜单
            </button>
          </div>
        )}

        {lists.length > 0 && (
          <>
            <ul className="max-h-48 overflow-y-auto">
              {lists.map((list) => {
                const check = canAddAlbum(list, cid);
                const disabled = check !== "ok";
                return (
                  <li key={list.id}>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleAdd(list.id, list.title)}
                      className="flex w-full flex-col rounded-lg px-3 py-2 text-left text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="truncate font-medium">{list.title}</span>
                      <span className="text-xs text-zinc-500">
                        {list.albumIds.length}/{list.capacity} 张
                      </span>
                      {check === "duplicate" && (
                        <span className="text-xs text-zinc-500">已添加</span>
                      )}
                      {check === "full" && (
                        <span className="text-xs text-zinc-500">已满</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={() => setShowCapacityPicker(true)}
              className="mt-1 w-full rounded-lg border border-dashed border-white/20 px-3 py-2 text-sm text-zinc-400 transition hover:border-white/30 hover:text-white"
            >
              + 新建榜单
            </button>
          </>
        )}
      </div>

      {showCapacityPicker && (
        <ListCapacityPicker
          title="新建榜单并加入专辑"
          onSelect={handleCapacitySelect}
          onCancel={() => setShowCapacityPicker(false)}
        />
      )}
    </>
  );
}
