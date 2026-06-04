import type { ListCapacity, UserList } from "./types";

export const LISTS_STORAGE_KEY = "vibe-music-lists";

export const LIST_CAPACITIES = [10, 20, 30] as const satisfies readonly ListCapacity[];

export function isListCapacity(n: number): n is ListCapacity {
  return (LIST_CAPACITIES as readonly number[]).includes(n);
}

export function getListCapacity(list: UserList): ListCapacity {
  return list.capacity;
}

function normalizeList(raw: UserList): UserList {
  const capacity = isListCapacity(raw.capacity) ? raw.capacity : 10;
  return { ...raw, capacity };
}

export function loadLists(): UserList[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LISTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UserList[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeList);
  } catch {
    return [];
  }
}

export function saveLists(lists: UserList[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists));
}
