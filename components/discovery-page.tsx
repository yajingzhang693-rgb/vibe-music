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
import { FluidMeshBackground } from "@/components/fluid-mesh-background";
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

  const showSkeleton = featured.isPending && featuredAlbums.length === 0;
  const showError = featured.isError && featuredAlbums.length === 0;

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      {/* 沉浸式氛围背景 */}
      <FluidMeshBackground color="#1db954" />

      {/* 顶部玻璃态导航 */}
      <header className="sticky top-0 z-40">
        <div className="glass-panel border-x-0 border-t-0">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium tracking-tight"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
                </svg>
              </span>
              <span className="font-mono text-sm uppercase tracking-[0.2em] text-foreground">
                Discurse
              </span>
            </Link>
            <Link
              href="/lists"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-white/5 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-xl transition-colors hover:border-white/20 hover:bg-white/10"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--album-theme-color)]" />
              我的榜单
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
        {/* Hero 区：强层级标题 */}
        <section className="py-16 md:py-24">
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.32em] text-muted">
            Taste, Archived
          </p>
          <h1 className="display-title text-balance text-5xl font-semibold md:text-7xl">
            发现、评分
            <br />
            <span className="text-muted">并珍藏每一段聆听。</span>
          </h1>
          <p className="mt-6 max-w-md text-pretty text-base leading-relaxed text-muted">
            一个为认真听歌的人准备的极简空间。搜索艺人，浏览精选，
            为打动你的专辑留下属于自己的评价。
          </p>
        </section>

        {/* 搜索 */}
        <section className="mb-16">
          <div className="glass-panel flex items-center gap-2 rounded-full p-1.5 shadow-soft transition-colors focus-within:border-white/25">
            <span className="pl-4 text-muted" aria-hidden>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="搜索艺人…"
              autoComplete="off"
              enterKeyHint="search"
              className="flex-1 bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-muted"
            />
            <button
              type="button"
              onClick={onSearch}
              aria-label="搜索"
              className="flex h-10 shrink-0 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-transform hover:scale-[1.03] active:scale-95"
            >
              搜索
            </button>
          </div>

          {searchTerm && (
            <div className="glass-panel mt-3 rounded-2xl p-2 shadow-soft">
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
                <p className="p-4 text-center text-sm text-muted">
                  未找到相关艺人
                </p>
              )}
              {artists.data?.map((a) => (
                <button
                  key={a.artistId}
                  type="button"
                  onClick={() => router.push(`/artist/${a.artistId}`)}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition-colors hover:bg-white/[0.06]"
                >
                  <span>{a.artistName}</span>
                  <span className="text-muted" aria-hidden>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 编辑精选 */}
        <section>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                编辑精选
              </h2>
              <p className="mt-1.5 text-sm text-muted">
                由编辑团队挑选的当下值得反复聆听的专辑。
              </p>
            </div>
            <span className="hidden shrink-0 font-mono text-xs uppercase tracking-[0.2em] text-muted md:inline">
              Curated
            </span>
          </div>

          {showSkeleton && (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-2xl" />
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
              {featuredAlbums.map((album, i) => (
                <FeaturedCard
                  key={album.collectionId}
                  album={album}
                  index={i}
                />
              ))}
            </div>
          )}
        </section>

        <DiscoveryFooter />
      </div>
    </main>
  );
}

function FeaturedCard({ album, index }: { album: ITunesResult; index: number }) {
  const id = album.collectionId!;
  const [hover, setHover] = useState(false);
  const artwork = hdArtworkUrl(album.artworkUrl100);
  const { color } = useAlbumColors(artwork);

  return (
    <motion.div
      className="group relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.05, 0.4),
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <AddToListButton
        collectionId={id}
        size="sm"
        className="absolute right-2.5 top-2.5 z-30 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />
      <Link
        href={`/album/${id}`}
        className="relative block aspect-square w-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        {/* 封面主色光晕（悬停加强） */}
        <motion.div
          className="pointer-events-none absolute -inset-2 rounded-[1.4rem]"
          initial={false}
          animate={{
            opacity: hover ? 0.9 : 0,
            scale: hover ? 1.06 : 0.95,
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: `radial-gradient(ellipse 75% 65% at 50% 55%, ${color}55 0%, transparent 70%)`,
            filter: "blur(22px)",
          }}
          aria-hidden
        />
        <motion.div
          className="relative h-full w-full overflow-hidden rounded-2xl border border-border bg-white/[0.04]"
          initial={false}
          animate={{
            scale: hover ? 1.025 : 1,
            boxShadow: hover
              ? `0 18px 50px -12px ${color}66, 0 0 0 1px rgba(255,255,255,0.12) inset`
              : `0 8px 30px -16px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04) inset`,
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="h-full w-full origin-center"
            initial={false}
            animate={{ scale: hover ? 1.06 : 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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
            transition={{ duration: 0.25 }}
            className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/35 to-transparent p-4"
          >
            <p className="text-sm font-semibold leading-tight text-white">
              {album.collectionName}
            </p>
            <p className="mt-0.5 text-xs text-white/60">{album.artistName}</p>
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
