import type { StoredRating } from "./types";

export function ratingStorageKey(collectionId: string | number) {
  return `vibe-rating-${collectionId}`;
}

export const EMPTY_RATING: StoredRating = {
  overall: 0,
  production: 0,
  songwriting: 0,
  review: "",
};

export function loadRating(collectionId: string | number): StoredRating {
  if (typeof window === "undefined") return { ...EMPTY_RATING };
  try {
    const raw = localStorage.getItem(ratingStorageKey(collectionId));
    if (!raw) return { ...EMPTY_RATING };
    return { ...EMPTY_RATING, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_RATING };
  }
}

export function hasStoredRating(collectionId: string | number): boolean {
  const data = loadRating(collectionId);
  return (
    data.overall > 0 ||
    data.production > 0 ||
    data.songwriting > 0 ||
    data.review.trim().length > 0
  );
}

export function saveRating(
  collectionId: string | number,
  rating: StoredRating
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ratingStorageKey(collectionId), JSON.stringify(rating));
}
