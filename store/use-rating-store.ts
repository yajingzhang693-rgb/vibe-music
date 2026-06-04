import { create } from "zustand";
import { MAX_REVIEW_LENGTH } from "@/lib/constants";
import { calculateFinalScore } from "@/lib/scoring";
import { loadRating, saveRating } from "@/lib/storage";
import type { StoredRating } from "@/lib/types";

interface RatingStore extends StoredRating {
  collectionId: string | null;
  finalScore: number;
  themeColor: string;
  setCollectionId: (id: string) => void;
  hydrate: (id: string) => void;
  setOverall: (v: number) => void;
  setProduction: (v: number) => void;
  setSongwriting: (v: number) => void;
  setReview: (v: string) => void;
  setThemeColor: (hex: string) => void;
}

function clampScore(n: number) {
  return Math.min(10, Math.max(0, Math.round(n * 10) / 10));
}

function persist(
  id: string,
  state: StoredRating & { finalScore: number }
) {
  saveRating(id, {
    overall: state.overall,
    production: state.production,
    songwriting: state.songwriting,
    review: state.review,
  });
}

export const useRatingStore = create<RatingStore>((set, get) => ({
  collectionId: null,
  overall: 8,
  production: 8,
  songwriting: 8,
  review: "",
  finalScore: calculateFinalScore(8, 8, 8),
  themeColor: "#1db954",

  setCollectionId: (id) => set({ collectionId: id }),

  hydrate: (id) => {
    const data = loadRating(id);
    const finalScore = calculateFinalScore(
      data.overall,
      data.production,
      data.songwriting
    );
    set({
      collectionId: id,
      ...data,
      review: data.review.slice(0, MAX_REVIEW_LENGTH),
      finalScore,
    });
  },

  setOverall: (v) => {
    const overall = clampScore(v);
    const { production, songwriting, collectionId } = get();
    const finalScore = calculateFinalScore(overall, production, songwriting);
    set({ overall, finalScore });
    if (collectionId) persist(collectionId, { ...get(), overall, finalScore });
  },

  setProduction: (v) => {
    const production = clampScore(v);
    const { overall, songwriting, collectionId } = get();
    const finalScore = calculateFinalScore(overall, production, songwriting);
    set({ production, finalScore });
    if (collectionId) persist(collectionId, { ...get(), production, finalScore });
  },

  setSongwriting: (v) => {
    const songwriting = clampScore(v);
    const { overall, production, collectionId } = get();
    const finalScore = calculateFinalScore(overall, production, songwriting);
    set({ songwriting, finalScore });
    if (collectionId)
      persist(collectionId, { ...get(), songwriting, finalScore });
  },

  setReview: (review) => {
    set({ review: review.slice(0, MAX_REVIEW_LENGTH) });
    const { collectionId } = get();
    if (collectionId) persist(collectionId, get());
  },

  setThemeColor: (themeColor) => set({ themeColor }),
}));
