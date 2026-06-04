"use client";

import { hdArtworkUrl } from "@/lib/artwork";
import { meshPaletteFromHex } from "@/lib/colors";
import { getListShareLayout } from "@/lib/list-share-layout";
import { calculateFinalScore } from "@/lib/scoring";
import { loadRating } from "@/lib/storage";
import { useAlbumColors } from "@/hooks/use-album-colors";
import type { ITunesResult, ListCapacity } from "@/lib/types";
import Image from "next/image";
import { useMemo, useState, type ReactNode } from "react";

export type ListShareSlot = ITunesResult | null;

export function buildListShareSlots(
  albums: ITunesResult[],
  capacity: ListCapacity,
  showPlaceholders: boolean
): ListShareSlot[] {
  const filled = albums.slice(0, capacity);
  if (!showPlaceholders) return filled;
  const slots: ListShareSlot[] = [...filled];
  while (slots.length < capacity) slots.push(null);
  return slots;
}

export function isFilledSlot(slot: ListShareSlot): slot is ITunesResult {
  return slot != null && !!slot.collectionId;
}

export function useListShareTheme(topAlbum?: ITunesResult) {
  const artwork = hdArtworkUrl(topAlbum?.artworkUrl100);
  const { color: themeColor } = useAlbumColors(artwork);
  const palette = useMemo(() => meshPaletteFromHex(themeColor), [themeColor]);
  const [bgFailed, setBgFailed] = useState(false);
  return { artwork, palette, bgFailed, setBgFailed };
}

export function getAlbumScore(album: ITunesResult): number | null {
  if (!album.collectionId) return null;
  const rating = loadRating(album.collectionId);
  if (!rating) return null;
  return calculateFinalScore(
    rating.overall,
    rating.production,
    rating.songwriting
  );
}

export function ListShareCardShell({
  id,
  capacity,
  listTitle,
  theme,
  children,
  titleClassName = "mb-3 text-2xl",
}: {
  id: string;
  capacity: ListCapacity;
  listTitle: string;
  theme: ReturnType<typeof useListShareTheme>;
  children: ReactNode;
  /** 含字号，如 mb-4 text-3xl */
  titleClassName?: string;
}) {
  const { width, height } = getListShareLayout(capacity);

  return (
    <div
      id={id}
      className="relative overflow-hidden rounded-2xl border border-white/30 text-white"
      style={{ width, height }}
    >
      <div
        className="absolute inset-0"
        style={{ background: theme.palette.staticMesh }}
      />
      {theme.artwork && !theme.bgFailed && (
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <Image
            src={theme.artwork}
            alt=""
            fill
            className="object-cover scale-[1.12]"
            style={{ filter: "blur(76px)" }}
            onError={() => theme.setBgFailed(true)}
            unoptimized
            crossOrigin="anonymous"
          />
        </div>
      )}
      <div className="absolute inset-0 bg-[#0a0a0a]/55" aria-hidden />
      <div className="relative z-10 flex h-full flex-col p-5">
        <h2
          className={`shrink-0 text-center font-bold leading-tight tracking-wide ${titleClassName}`}
        >
          {listTitle}
        </h2>
        {children}
        <p className="mt-3 shrink-0 text-center text-[9px] uppercase tracking-[0.35em] text-white/45">
          Vibe Music Rating
        </p>
      </div>
    </div>
  );
}

export function RankBadge({
  rank,
  className = "",
}: {
  rank: number;
  className?: string;
}) {
  return (
    <span
      className={`absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold ${className}`}
    >
      {rank}
    </span>
  );
}

export function PlaceholderSlot({
  rank,
  className = "",
}: {
  rank: number;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-md border border-dashed border-white/20 bg-zinc-900/80 ${className}`}
    >
      <RankBadge rank={rank} />
      <span className="text-lg text-white/15">—</span>
    </div>
  );
}

export function PlaceholderHero({
  rank,
  coverClassName = "h-36 w-36",
  coverStyle,
}: {
  rank: number;
  coverClassName?: string;
  coverStyle?: { width: string; height?: string };
}) {
  return (
    <div className="flex w-full shrink-0 flex-col items-center gap-2">
      <div
        className={`relative flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-white/20 bg-zinc-900/80 ${coverClassName}`}
        style={coverStyle}
      >
        <RankBadge rank={rank} />
        <span className="text-2xl text-white/15">—</span>
      </div>
      <p
        className="h-4 rounded bg-white/5"
        style={coverStyle ? { width: coverStyle.width } : undefined}
        aria-hidden
      />
    </div>
  );
}

export function ScoreBadge({
  score,
  className = "",
}: {
  score: number;
  className?: string;
}) {
  return (
    <span
      className={`absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${className}`}
    >
      {score.toFixed(1)}
    </span>
  );
}
