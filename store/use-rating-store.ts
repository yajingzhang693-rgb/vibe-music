import { create } from "zustand";
import { MAX_REVIEW_LENGTH } from "@/lib/constants";
import { getOrCreateVisitorId } from "@/lib/fingerprint";
import {
  fetchRating,
  upsertRating,
  type RatingAlbumMeta,
} from "@/lib/ratings-sync";
import { calculateFinalScore } from "@/lib/scoring";
import { getSupabase } from "@/lib/supabase";
import {
  EMPTY_RATING,
  hasStoredRating,
  loadRating as loadLocalRating,
  saveRating as saveLocalRating,
} from "@/lib/storage";
import type { StoredRating } from "@/lib/types";

export type LoadRatingResult = "ok" | "error";

interface RatingStore extends StoredRating {
  collectionId: string | null;
  albumMeta: RatingAlbumMeta | null;
  finalScore: number;
  themeColor: string;
  hasExistingRating: boolean;
  isLoadingRating: boolean;
  isSaving: boolean;
  setAlbumMeta: (meta: RatingAlbumMeta) => void;
  loadRating: (albumId: string) => Promise<LoadRatingResult>;
  saveRating: () => Promise<boolean>;
  setOverall: (v: number) => void;
  setProduction: (v: number) => void;
  setSongwriting: (v: number) => void;
  setReview: (v: string) => void;
  setThemeColor: (hex: string) => void;
}

function clampScore(n: number) {
  return Math.min(10, Math.max(0, Math.round(n * 10) / 10));
}

function applyRating(
  rating: StoredRating
): Pick<
  RatingStore,
  "overall" | "production" | "songwriting" | "review" | "finalScore"
> {
  const review = rating.review.slice(0, MAX_REVIEW_LENGTH);
  return {
    overall: rating.overall,
    production: rating.production,
    songwriting: rating.songwriting,
    review,
    finalScore: calculateFinalScore(
      rating.overall,
      rating.production,
      rating.songwriting
    ),
  };
}

export const useRatingStore = create<RatingStore>((set, get) => ({
  collectionId: null,
  albumMeta: null,
  ...applyRating(EMPTY_RATING),
  themeColor: "#1db954",
  hasExistingRating: false,
  isLoadingRating: false,
  isSaving: false,

  setAlbumMeta: (albumMeta) => set({ albumMeta }),

  loadRating: async (albumId) => {
    set({ isLoadingRating: true, collectionId: albumId });

    const userId = getOrCreateVisitorId();
    const result = await fetchRating(userId, albumId);

    if (result.status === "found") {
      set({
        ...applyRating(result.rating),
        hasExistingRating: true,
        isLoadingRating: false,
      });
      return "ok";
    }

    if (result.status === "error") {
      set({
        ...applyRating(EMPTY_RATING),
        hasExistingRating: false,
        isLoadingRating: false,
      });
      return "error";
    }

    if (result.status === "unavailable") {
      const local = loadLocalRating(albumId);
      set({
        ...applyRating(local),
        hasExistingRating: hasStoredRating(albumId),
        isLoadingRating: false,
      });
      return "ok";
    }

    set({
      ...applyRating(EMPTY_RATING),
      hasExistingRating: false,
      isLoadingRating: false,
    });
    return "ok";
  },

  saveRating: async () => {
    const {
      collectionId,
      albumMeta,
      overall,
      production,
      songwriting,
      review,
      finalScore,
    } = get();

    console.log("[saveRating] 开始保存", {
      collectionId,
      albumMeta,
      overall,
      production,
      songwriting,
      review,
      finalScore,
    });

    if (!collectionId || !albumMeta) {
      console.warn("[saveRating] 中止：缺少 collectionId 或 albumMeta");
      return false;
    }

    set({ isSaving: true });

    const rating: StoredRating = {
      overall,
      production,
      songwriting,
      review,
    };

    const userId = getOrCreateVisitorId();
    console.log("[saveRating] visitorId:", userId);

    const supabase = getSupabase();

    if (!supabase) {
      console.warn(
        "[saveRating] Supabase 不可用，仅写入 localStorage（不会同步到云端）"
      );
      saveLocalRating(collectionId, rating);
      set({ hasExistingRating: true, isSaving: false });
      return true;
    }

    console.log("[saveRating] 调用 upsertRating → Supabase");
    const saved = await upsertRating(userId, albumMeta, rating, finalScore);

    if (!saved) {
      console.error("[saveRating] Supabase 保存失败，未写入 localStorage");
      set({ isSaving: false });
      return false;
    }

    console.log("[saveRating] Supabase 成功，写入 localStorage 缓存");
    saveLocalRating(collectionId, rating);
    set({ hasExistingRating: true, isSaving: false });
    return true;
  },

  setOverall: (v) => {
    const overall = clampScore(v);
    const { production, songwriting } = get();
    const finalScore = calculateFinalScore(overall, production, songwriting);
    set({ overall, finalScore });
  },

  setProduction: (v) => {
    const production = clampScore(v);
    const { overall, songwriting } = get();
    const finalScore = calculateFinalScore(overall, production, songwriting);
    set({ production, finalScore });
  },

  setSongwriting: (v) => {
    const songwriting = clampScore(v);
    const { overall, production } = get();
    const finalScore = calculateFinalScore(overall, production, songwriting);
    set({ songwriting, finalScore });
  },

  setReview: (review) => {
    set({ review: review.slice(0, MAX_REVIEW_LENGTH) });
  },

  setThemeColor: (themeColor) => set({ themeColor }),
}));
