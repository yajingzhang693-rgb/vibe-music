"use client";

import { AlbumCover } from "@/components/album-cover";
import {
  buildListShareSlots,
  getAlbumScore,
  isFilledSlot,
  ListShareCardShell,
  PlaceholderSlot,
  RankBadge,
  ScoreBadge,
  useListShareTheme,
  type ListShareSlot,
} from "@/components/list-share-card-shared";
import type { ITunesResult } from "@/lib/types";

function GridCell20({
  slot,
  rank,
  showScores,
}: {
  slot: ListShareSlot;
  rank: number;
  showScores: boolean;
}) {
  if (!isFilledSlot(slot)) {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <PlaceholderSlot rank={rank} className="aspect-square w-full rounded-md" />
        <p className="h-2 w-full" aria-hidden />
        <p className="h-1.5 w-full" aria-hidden />
      </div>
    );
  }

  const score = showScores ? getAlbumScore(slot) : null;
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative aspect-square w-full overflow-hidden rounded-md border border-white/20 bg-zinc-900">
        <AlbumCover
          collectionId={slot.collectionId!}
          src={slot.artworkUrl100}
          alt={slot.collectionName ?? ""}
          fillContainer
          sharedLayout={false}
        />
        <RankBadge rank={rank} className="text-[9px]" />
        {score != null && <ScoreBadge score={score} className="text-[9px]" />}
      </div>
      {slot.collectionName && (
        <p className="mt-0.5 truncate text-center text-[8px] font-bold uppercase leading-tight text-white">
          {slot.collectionName}
        </p>
      )}
      {slot.artistName && (
        <p className="truncate text-center text-[7px] leading-tight text-white/55">
          {slot.artistName}
        </p>
      )}
    </div>
  );
}

export function ListShareCard20({
  listTitle,
  albums,
  id = "list-share-card",
  showPlaceholders = false,
  showScores = true,
}: {
  listTitle: string;
  albums: ITunesResult[];
  id?: string;
  showPlaceholders?: boolean;
  showScores?: boolean;
}) {
  const slots = buildListShareSlots(albums, 20, showPlaceholders);
  const theme = useListShareTheme(albums[0]);
  return (
    <ListShareCardShell
      id={id}
      capacity={20}
      listTitle={listTitle}
      theme={theme}
      titleClassName="mb-3 text-3xl"
    >
      {(slots.length > 0 || showPlaceholders) && (
        <div className="mt-5 flex min-h-0 flex-1 flex-col">
          <div className="grid grid-cols-4 content-start gap-1.5 auto-rows-auto">
            {slots.map((slot, i) => (
              <GridCell20
                key={i}
                slot={slot}
                rank={i + 1}
                showScores={showScores}
              />
            ))}
          </div>
        </div>
      )}
    </ListShareCardShell>
  );
}
