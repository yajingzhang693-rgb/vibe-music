import { loadLists, saveLists } from "@/lib/lists-storage";
import { canAddAlbum, normalizeCollectionId } from "@/lib/lists-utils";
import type { AddAlbumResult } from "@/lib/lists-utils";
import type { ListCapacity, UserList } from "@/lib/types";
import { create } from "zustand";

function newListId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `list-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface ListsStore {
  lists: UserList[];
  hydrated: boolean;
  hydrate: () => void;
  createList: (title?: string, capacity?: ListCapacity) => UserList;
  updateList: (
    id: string,
    patch: Partial<Pick<UserList, "title" | "albumIds">>
  ) => void;
  deleteList: (id: string) => void;
  addAlbumToList: (listId: string, collectionId: string | number) => AddAlbumResult;
  removeAlbumFromList: (listId: string, collectionId: string | number) => void;
  reorderAlbums: (listId: string, albumIds: string[]) => void;
  getList: (id: string) => UserList | undefined;
}

function persist(lists: UserList[]) {
  saveLists(lists);
}

export const useListsStore = create<ListsStore>((set, get) => ({
  lists: [],
  hydrated: false,

  hydrate: () => {
    set({ lists: loadLists(), hydrated: true });
  },

  createList: (title = "未命名榜单", capacity: ListCapacity = 10) => {
    const list: UserList = {
      id: newListId(),
      title: title.trim() || "未命名榜单",
      albumIds: [],
      capacity,
      createdAt: Date.now(),
    };
    const lists = [...get().lists, list];
    set({ lists });
    persist(lists);
    return list;
  },

  updateList: (id, patch) => {
    const lists = get().lists.map((l) =>
      l.id === id ? { ...l, ...patch } : l
    );
    set({ lists });
    persist(lists);
  },

  deleteList: (id) => {
    const lists = get().lists.filter((l) => l.id !== id);
    set({ lists });
    persist(lists);
  },

  addAlbumToList: (listId, collectionId) => {
    const cid = normalizeCollectionId(collectionId);
    const list = get().lists.find((l) => l.id === listId);
    if (!list) return "full";
    const check = canAddAlbum(list, cid);
    if (check !== "ok") return check;
    const lists = get().lists.map((l) =>
      l.id === listId ? { ...l, albumIds: [...l.albumIds, cid] } : l
    );
    set({ lists });
    persist(lists);
    return "ok";
  },

  removeAlbumFromList: (listId, collectionId) => {
    const cid = normalizeCollectionId(collectionId);
    const lists = get().lists.map((l) =>
      l.id === listId
        ? { ...l, albumIds: l.albumIds.filter((id) => id !== cid) }
        : l
    );
    set({ lists });
    persist(lists);
  },

  reorderAlbums: (listId, albumIds) => {
    const lists = get().lists.map((l) =>
      l.id === listId ? { ...l, albumIds } : l
    );
    set({ lists });
    persist(lists);
  },

  getList: (id) => get().lists.find((l) => l.id === id),
}));
