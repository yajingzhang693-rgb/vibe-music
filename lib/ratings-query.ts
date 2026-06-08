import { getSupabase } from "@/lib/supabase";

export interface RatedAlbum {
  album_id: string;
  album_name: string;
  artist_name: string;
  genre: string;
  score: number;
  review: string;
  overall: number;
  production: number;
  songwriting: number;
}

export async function getTopAlbumsForUser(
  userId: string,
  options: { genre?: string; limit?: number }
): Promise<RatedAlbum[]> {
  const supabase = getSupabase();
  if (!supabase || !userId) return [];

  const limit = options.limit ?? 10;

  let query = supabase
    .from("ratings")
    .select(
      "album_id, album_name, artist_name, genre, score, review, overall, production, songwriting"
    )
    .eq("user_id", userId)
    .order("score", { ascending: false })
    .limit(limit);

  if (options.genre?.trim()) {
    query = query.ilike("genre", `%${options.genre.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[ratings-query]", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    album_id: String(row.album_id),
    album_name: row.album_name ?? "",
    artist_name: row.artist_name ?? "",
    genre: row.genre ?? "",
    score: Number(row.score) || 0,
    review: row.review ?? "",
    overall: Number(row.overall) || 0,
    production: Number(row.production) || 0,
    songwriting: Number(row.songwriting) || 0,
  }));
}
