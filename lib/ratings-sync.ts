import { getSupabase } from "@/lib/supabase";
import type { StoredRating } from "@/lib/types";

export interface RatingAlbumMeta {
  albumId: string;
  albumName: string;
  artistName: string;
  genre: string;
  releaseDate: string;
}

export type FetchRatingResult =
  | { status: "found"; rating: StoredRating }
  | { status: "not_found" }
  | { status: "error" }
  | { status: "unavailable" };

function toStoredRating(row: {
  overall: number | string;
  production: number | string;
  songwriting: number | string;
  review: string | null;
}): StoredRating {
  return {
    overall: Number(row.overall) || 0,
    production: Number(row.production) || 0,
    songwriting: Number(row.songwriting) || 0,
    review: row.review ?? "",
  };
}

export async function fetchRating(
  userId: string,
  albumId: string
): Promise<FetchRatingResult> {
  const supabase = getSupabase();
  if (!supabase) return { status: "unavailable" };

  const { data, error } = await supabase
    .from("ratings")
    .select("overall, production, songwriting, review")
    .eq("user_id", userId)
    .eq("album_id", albumId)
    .maybeSingle();

  if (error) {
    console.error("[ratings-sync] fetch", error.message);
    return { status: "error" };
  }

  if (!data) return { status: "not_found" };

  return { status: "found", rating: toStoredRating(data) };
}

export async function upsertRating(
  userId: string,
  meta: RatingAlbumMeta,
  rating: StoredRating,
  finalScore: number
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn("[ratings-sync] upsertRating 跳过：Supabase 客户端不可用");
    return false;
  }

  const payload = {
    user_id: userId,
    album_id: meta.albumId,
    album_name: meta.albumName,
    artist_name: meta.artistName,
    genre: meta.genre,
    release_date: meta.releaseDate,
    overall: rating.overall,
    production: rating.production,
    songwriting: rating.songwriting,
    score: finalScore,
    review: rating.review,
  };

  console.log("正在发送数据到 Supabase:", payload);

  const { data, error } = await supabase
    .from("ratings")
    .upsert(payload, { onConflict: "user_id,album_id" })
    .select();

  if (error) {
    console.error("Supabase 保存失败，具体错误：", error);
    return false;
  }

  console.log("Supabase 保存成功，返回结果：", data);
  return true;
}
