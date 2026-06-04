"use client";

import { AlbumCover } from "@/components/album-cover";
import {
  buildListShareSlots,
  isFilledSlot,
  ListShareCardShell,
  PlaceholderSlot,
  RankBadge,
  useListShareTheme,
  type ListShareSlot,
} from "@/components/list-share-card-shared";
import type { ITunesResult } from "@/lib/types";

function GridCell30({ slot, rank }: { slot: ListShareSlot; rank: number }) {
  if (!isFilledSlot(slot)) {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <PlaceholderSlot
          rank={rank}
          className="aspect-square w-full rounded-sm border-white/15"
        />
        <p className="h-2 w-full" aria-hidden />
        <p className="h-1.5 w-full" aria-hidden />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative aspect-square w-full overflow-hidden rounded-sm border border-white/20 bg-zinc-900">
        <AlbumCover
          collectionId={slot.collectionId!}
          src={slot.artworkUrl100}
          alt={slot.collectionName ?? ""}
          fillContainer
          sharedLayout={false}
        />
        <RankBadge rank={rank} className="text-[8px] px-1 py-0" />
      </div>
      {slot.collectionName && (
        <p className="shrink-0 truncate px-0.5 py-0.5 text-[6px] leading-tight text-white/90">
          {slot.collectionName}
        </p>
      )}
      {slot.artistName && (
        <p className="shrink-0 truncate px-0.5 pb-0.5 text-[5px] leading-tight text-white/50">
          {slot.artistName}
        </p>
      )}
    </div>
  );
}

export function ListShareCard30({
  listTitle,
  albums,
  id = "list-share-card",
  showPlaceholders = false,
}: {
  listTitle: string;
  albums: ITunesResult[];
  id?: string;
  showPlaceholders?: boolean;
}) {
  const slots = buildListShareSlots(albums, 30, showPlaceholders);
  const theme = useListShareTheme(albums[0]);
  return (
    <ListShareCardShell
      id={id}
      capacity={30}
      listTitle={listTitle}
      theme={theme}
      titleClassName="mb-3 text-3xl"
    >
      {(slots.length > 0 || showPlaceholders) && (
        <div className="mt-5 flex min-h-0 flex-1 flex-col">
          <div className="grid grid-cols-5 content-start gap-1 auto-rows-auto">
            {slots.map((slot, i) => (
              <GridCell30 key={i} slot={slot} rank={i + 1} />
            ))}
          </div>
        </div>
      )}
    </ListShareCardShell>
  );
}
