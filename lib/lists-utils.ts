import type { UserList } from "./types";

export type AddAlbumResult = "ok" | "duplicate" | "full";

export function normalizeCollectionId(id: number | string): string {
  return String(id);
}

export function canAddAlbum(
  list: UserList,
  collectionId: string
): AddAlbumResult {
  if (list.albumIds.includes(collectionId)) return "duplicate";
  if (list.albumIds.length >= list.capacity) return "full";
  return "ok";
}
