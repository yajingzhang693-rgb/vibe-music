import type { StoredRating } from "./types";

export function ratingStorageKey(collectionId: string | number) {
  return `vibe-rating-${collectionId}`;
}

const DEFAULT_RATING: StoredRating = {
  overall: 8,
  production: 8,
  songwriting: 8,
  review: "",
};

export function loadRating(collectionId: string | number): StoredRating {
  if (typeof window === "undefined") return { ...DEFAULT_RATING };
  try {
    const raw = localStorage.getItem(ratingStorageKey(collectionId));
    if (!raw) return { ...DEFAULT_RATING };
    return { ...DEFAULT_RATING, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_RATING };
  }
}

export function saveRating(
  collectionId: string | number,
  rating: StoredRating
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ratingStorageKey(collectionId), JSON.stringify(rating));
}
