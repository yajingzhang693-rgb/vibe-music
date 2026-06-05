"use client";

import { FEATURED_COLLECTION_IDS } from "@/lib/constants";
import { hdArtworkUrl } from "@/lib/artwork";
import { lookupCollections, searchArtists } from "@/lib/itunes";
import { useAlbumColors } from "@/hooks/use-album-colors";
import type { ITunesResult } from "@/lib/types";
import { AddToListButton } from "@/components/add-to-list-button";
import { AlbumCover } from "@/components/album-cover";
import { RetryBlock } from "@/components/ui/retry-block";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, KeyboardEvent } from "react";
import { DiscoveryFooter } from "@/components/discovery-footer";
import { motion } from "framer-motion";

export function DiscoveryPage({
  initialFeatured = null,
}: {
  initialFeatured?: import("@/lib/types").ITunesResult[] | null;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState<string | null>(null);

  const featured = useQuery({
    queryKey: ["featured", FEATURED_COLLECTION_IDS],
    queryFn: () => lookupCollections([...FEATURED_COLLECTION_IDS]),
    initialData: initialFeatured ?? undefined,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });

  const artists = useQuery({
    queryKey: ["search-artists", searchTerm],
    queryFn: () => searchArtists(searchTerm!),
    enabled: !!searchTerm?.trim(),
  });

  const onSearch = () => {
    const t = query.trim();
    if (t) setSearchTerm(t);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearch();
  };

  const featuredAlbums = (featured.data ?? [])
    .filter((r) => r.collectionId)
    .sort(
      (a, b) =>
        FEATURED_COLLECTION_IDS.indexOf(Number(a.collectionId)) -
        FEATURED_COLLECTION_IDS.indexOf(Number(b.collectionId))
    );

  const showSkeleton =
    featured.isPending && featuredAlbums.length === 0;
  const showError = featured.isError && featuredAlbums.length === 0;

  return (
    <main
      className="min-h-screen bg-[#0a0a0a] text-white"
      style={{ backgroundColor: "#0a0a0a", color: "#ededed" }}
    >
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <header className="mb-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-5xl font-bold leading-none tracking-tight">
              Discurse
            </h1>
            <Link
              href="/lists"
              className="inline-flex shrink-0 items-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-xl transition hover:border-white/40 hover:bg-white/15"
            >
              我的榜单
            </Link>
          </div>
          <p className="mt-2 text-white">发现 · 评分 · 分享</p>
        </header>

        <section className="mb-14">
          <div className="flex gap-2 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="搜索艺人…"
              autoComplete="off"
              enterKeyHint="search"
              className="flex-1 bg-transparent px-5 py-3 text-sm outline-none placeholder:text-zinc-500"
            />
            <button
              type="button"
              onClick={onSearch}
              aria-label="搜索"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:bg-zinc-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          </div>

          {searchTerm && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-md">
              {artists.isLoading && (
                <div className="space-y-2 p-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              )}
              {artists.isError && (
                <RetryBlock
                  message="搜索失败"
                  onRetry={() => artists.refetch()}
                />
              )}
              {artists.isSuccess && artists.data.length === 0 && (
                <p className="p-4 text-center text-sm text-zinc-400">
                  未找到相关艺人
                </p>
              )}
              {artists.data?.map((a) => (
                <button
                  key={a.artistId}
                  type="button"
                  onClick={() => router.push(`/artist/${a.artistId}`)}
                  className="block w-full rounded-lg px-4 py-3 text-left text-sm transition hover:bg-white/10"
                >
                  {a.artistName}
                </button>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-6 text-lg font-semibold text-zinc-300">编辑精选</h2>
          {showSkeleton && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full" />
              ))}
            </div>
          )}
          {showError && (
            <RetryBlock
              message={
                featured.error instanceof Error
                  ? featured.error.message
                  : "加载精选专辑失败"
              }
              onRetry={() => featured.refetch()}
            />
          )}
          {!showSkeleton && !showError && featuredAlbums.length === 0 && (
            <RetryBlock
              message="精选专辑未加载，请检查网络或重启开发服务后重试"
              onRetry={() => featured.refetch()}
            />
          )}
          {featured.isSuccess &&
            featuredAlbums.length > 0 &&
            featuredAlbums.length < 8 && (
              <p className="mb-4 text-sm text-amber-400/90">
                部分精选专辑暂时无法加载（{featuredAlbums.length}/8）
              </p>
            )}
          {featuredAlbums.length > 0 && (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
              {featuredAlbums.map((album) => (
                <FeaturedCard key={album.collectionId} album={album} />
              ))}
            </div>
          )}
        </section>

        <DiscoveryFooter />
      </div>
    </main>
  );
}

function FeaturedCard({ album }: { album: ITunesResult }) {
  const id = album.collectionId!;
  const [hover, setHover] = useState(false);
  const artwork = hdArtworkUrl(album.artworkUrl100);
  const { color } = useAlbumColors(artwork);

  return (
    <div
      className="group relative aspect-square rounded-xl p-1"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <AddToListButton
        collectionId={id}
        size="sm"
        className="absolute right-2 top-2 z-30"
      />
      <Link
        href={`/album/${id}`}
        className="relative block h-full w-full rounded-xl"
      >
      {/* 封面主色光晕（悬停加强） */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        initial={false}
        animate={{
          opacity: hover ? 0.85 : 0.35,
          scale: hover ? 1.08 : 1,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: `radial-gradient(ellipse 80% 70% at 50% 55%, ${color}66 0%, transparent 72%)`,
          filter: "blur(18px)",
        }}
        aria-hidden
      />
      <motion.div
        className="relative h-full w-full overflow-hidden rounded-xl bg-zinc-800"
        initial={false}
        animate={{
          boxShadow: hover
            ? `0 12px 36px ${color}55, 0 0 28px ${color}33`
            : `0 4px 14px rgba(0,0,0,0.35)`,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="h-full w-full origin-center"
          initial={false}
          animate={{ scale: hover ? 1.05 : 1 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <AlbumCover
            collectionId={id}
            src={album.artworkUrl100}
            alt={album.collectionName ?? "Album"}
            fillContainer
          />
        </motion.div>
        <motion.div
          initial={false}
          animate={{ opacity: hover ? 1 : 0 }}
          transition={{ delay: hover ? 0.1 : 0, duration: 0.22 }}
          className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4"
        >
          <p className="text-sm font-semibold leading-tight text-white">
            {album.collectionName}
          </p>
          <p className="text-xs text-zinc-300">{album.artistName}</p>
        </motion.div>
      </motion.div>
      </Link>
    </div>
  );
}
