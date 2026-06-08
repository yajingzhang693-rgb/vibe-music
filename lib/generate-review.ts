import { MAX_REVIEW_LENGTH } from "@/lib/constants";

export interface GenerateReviewAlbum {
  albumName: string;
  artistName: string;
  genre: string;
  releaseDate?: string;
}

export interface GenerateReviewScores {
  overall: number;
  production: number;
  songwriting: number;
  finalScore: number;
}

export interface GenerateReviewRequest {
  intent: "generate-review";
  album: GenerateReviewAlbum;
  scores: GenerateReviewScores;
  keywords?: string;
}

export async function fetchGeneratedReview(
  payload: Omit<GenerateReviewRequest, "intent">
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intent: "generate-review", ...payload }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "乐评生成失败");
  }

  const data = (await res.json()) as { review: string };
  return data.review.slice(0, MAX_REVIEW_LENGTH);
}
