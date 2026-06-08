"use client";

import { hdArtworkUrl, releaseYear } from "@/lib/artwork";
import { lookupArtistAlbums } from "@/lib/itunes";
import type { ITunesResult } from "@/lib/types";
import { AddToListButton } from "@/components/add-to-list-button";
import { AlbumCover } from "@/components/album-cover";
import { RetryBlock } from "@/components/ui/retry-block";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export function ArtistPage({ artistId }: { artistId: string }) {
  const albumsQuery = useQuery({
    queryKey: ["artist-albums", artistId],
    queryFn: () => lookupArtistAlbums(artistId),
  });

  const artistInfo = albumsQuery.data?.artist;
  const albums = albumsQuery.data?.albums ?? [];
  const artistName = artistInfo?.artistName ?? albums[0]?.artistName ?? "艺人";
  const artistArt = artistInfo?.artworkUrl100;
  const latestArt = albums[0]?.artworkUrl100;
  const bgUrl = artistArt
    ? hdArtworkUrl(artistArt)
    : latestArt
      ? hdArtworkUrl(latestArt)
      : "";

  const [bgFailed, setBgFailed] = useState(false);

  return (
    <main className="relative min-h-screen bg-[#0a0a0a] text-foreground">
      <Link
        href="/"
        className="glass-panel fixed left-4 top-8 z-20 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground shadow-soft transition-all hover:scale-[1.03] hover:border-white/25 active:scale-95 lg:left-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        返回
      </Link>
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="relative h-64 shrink-0 lg:sticky lg:top-0 lg:h-screen lg:w-[42%]">
          {bgUrl && !bgFailed ? (
            <Image
              src={bgUrl}
              alt=""
              fill
              className="object-cover"
              onError={() => setBgFailed(true)}
              unoptimized
              priority
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: "linear-gradient(135deg, #1a1a2e, #0a0a0a)",
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent backdrop-blur-[2px] lg:bg-gradient-to-r" />
          <div className="absolute bottom-6 left-6 right-6">
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-white/60">
              Artist
            </p>
            <h1 className="display-title text-balance text-4xl font-semibold md:text-5xl lg:text-6xl">
              {artistName}
            </h1>
          </div>
        </aside>

        <section className="flex-1 px-4 py-8 lg:overflow-y-auto lg:px-10">
          <h2 className="mb-6 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted">
            专辑
          </h2>

          {albumsQuery.isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          )}

          {albumsQuery.isError && (
            <RetryBlock
              message="加载专辑失败"
              onRetry={() => albumsQuery.refetch()}
            />
          )}

          {albumsQuery.isSuccess && albums.length === 0 && (
            <p className="glass-panel rounded-2xl p-8 text-center text-sm text-muted shadow-soft">
              该艺人暂无正规专辑
            </p>
          )}

          <ul className="space-y-2">
            {albums.map((album) => (
              <AlbumRow key={album.collectionId} album={album} />
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

function AlbumRow({ album }: { album: ITunesResult }) {
  const id = album.collectionId!;

  return (
    <li className="group flex items-center gap-2 rounded-2xl p-3 transition-all hover:scale-[1.01] hover:bg-white/[0.04]">
      <Link
        href={`/album/${id}`}
        className="flex min-w-0 flex-1 items-center gap-4"
      >
        <AlbumCover
          collectionId={id}
          src={album.artworkUrl100}
          alt={album.collectionName ?? ""}
          className="h-20 w-20 shrink-0 rounded-lg shadow-soft"
          size={80}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">
            {album.collectionName}
          </p>
          <p className="mt-0.5 text-sm text-muted">
            {releaseYear(album.releaseDate) ?? "—"} · {album.artistName}
          </p>
        </div>
      </Link>
      <AddToListButton collectionId={id} />
    </li>
  );
}
