"use client";

import { AlbumCover } from "@/components/album-cover";
import {
  buildListShareSlots,
  getAlbumScore,
  isFilledSlot,
  ListShareCardShell,
  PlaceholderHero,
  PlaceholderSlot,
  RankBadge,
  ScoreBadge,
  useListShareTheme,
  type ListShareSlot,
} from "@/components/list-share-card-shared";
import type { ITunesResult } from "@/lib/types";

/** 与下方 3 列 gap-2 网格单格相比，Top1 封面边长为其 2 倍 */
/** width 的 % 相对父级宽度；高度须用 aspect-square，勿把同一 calc 写在 height 上 */
const HERO_COVER_SIZE = "calc((100% - 1rem) / 3 * 2 + 0.5rem)";
const heroCoverStyle = { width: HERO_COVER_SIZE };
const heroTitleClass =
  "w-full max-w-full truncate text-center text-xl font-bold leading-snug text-white";

function GridCell({
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
        <PlaceholderSlot rank={rank} className="aspect-square w-full" />
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
        <RankBadge rank={rank} />
        {score != null && <ScoreBadge score={score} />}
      </div>
      {slot.collectionName && (
        <p className="w-full shrink-0 truncate px-0.5 text-center text-[10px] leading-tight text-white/85">
          {slot.collectionName}
        </p>
      )}
    </div>
  );
}

export function ListShareCard10({
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
  const slots = buildListShareSlots(albums, 10, showPlaceholders);
  const hero = slots[0];
  const rest = showPlaceholders ? slots.slice(1, 10) : slots.slice(1);
  const theme = useListShareTheme(
    isFilledSlot(hero) ? hero : albums[0]
  );
  const heroScore =
    showScores && isFilledSlot(hero) ? getAlbumScore(hero) : null;
  return (
    <ListShareCardShell
      id={id}
      capacity={10}
      listTitle={listTitle}
      theme={theme}
      titleClassName="mb-4 text-3xl"
    >
      <div className="mt-5 flex min-h-0 flex-1 flex-col gap-2.5 pb-2">
        {showPlaceholders || isFilledSlot(hero) ? (
          isFilledSlot(hero) ? (
            <div className="flex w-full shrink-0 flex-col items-center gap-2">
              <div
                className="relative aspect-square shrink-0 overflow-hidden rounded-lg border border-white/25 bg-zinc-900"
                style={heroCoverStyle}
              >
                <AlbumCover
                  collectionId={hero.collectionId!}
                  src={hero.artworkUrl100}
                  alt={hero.collectionName ?? ""}
                  fillContainer
                  sharedLayout={false}
                />
                <RankBadge rank={1} />
                {heroScore != null && <ScoreBadge score={heroScore} />}
              </div>
              {hero.collectionName && (
                <p className={heroTitleClass} style={{ maxWidth: HERO_COVER_SIZE }}>
                  {hero.collectionName}
                </p>
              )}
            </div>
          ) : (
            <PlaceholderHero rank={1} coverStyle={heroCoverStyle} />
          )
        ) : null}

        {rest.length > 0 && (
          <div className="grid shrink-0 grid-cols-3 content-start gap-2 auto-rows-auto">
            {rest.map((slot, i) => (
              <GridCell
                key={i}
                slot={slot}
                rank={i + 2}
                showScores={showScores}
              />
            ))}
          </div>
        )}
      </div>
    </ListShareCardShell>
  );
}
