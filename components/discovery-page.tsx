"use client";

import { FEATURED_COLLECTION_IDS } from "@/lib/constants";
import { hdArtworkUrl } from "@/lib/artwork";
import { lookupCollections, searchArtists } from "@/lib/itunes";
import { useAlbumColors } from "@/hooks/use-album-colors";
import type { ITunesResult } from "@/lib/types";
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

const NAV_ITEMS = [
  { label: "发现", href: "#top", active: true },
  { label: "精选", href: "#featured", active: false },
  { label: "搜索", href: "#search", active: false },
] as const;

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
  const heroCards = featuredAlbums.slice(0, 5);

  return (
    <main id="top" className="relative min-h-screen bg-background text-foreground">
      {/* 沉浸式氛围背景 */}
      <FluidMeshBackground color="#1db954" />

      {/* 顶部居中胶囊导航 */}
      <header className="sticky top-0 z-40 px-4 pt-4 md:px-8">
        <div className="glass-panel mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full px-3 py-2 shadow-soft">
          {/* 左：Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 pl-2 text-sm font-medium tracking-tight"
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

          {/* 中：胶囊导航（桌面端） */}
          <nav className="hidden items-center gap-1 rounded-full border border-border bg-black/30 p-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={
                  item.active
                    ? "rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background"
                    : "rounded-full px-4 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 右：我的榜单 */}
          <Link
            href="/lists"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform hover:scale-[1.03] active:scale-95"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#1db954]" />
            我的榜单
          </Link>
        </div>
      </header>

      {/* Hero：居中沉浸式（标题 + 副标题 + 搜索） */}
      <section className="relative mx-auto max-w-5xl px-4 pt-20 text-center md:px-8 md:pt-28">
        {/* 超大细体标题 */}
        <h1 className="display-title mx-auto max-w-3xl text-balance text-5xl font-medium md:text-7xl lg:text-[5.5rem]">
          为你聆听的一切
          <br />
          <span className="text-muted">留下评分</span>
        </h1>
        <p className="mx-auto mt-7 max-w-xl text-pretty text-base leading-relaxed text-muted md:text-lg">
          一个为认真听歌的人准备的极简空间。搜索艺人、浏览精选，
          为每一张打动你的专辑写下属于自己的评价。
        </p>

        {/* 搜索（居中，紧随标题） */}
        <div id="search" className="mx-auto mt-12 max-w-3xl scroll-mt-24 text-left">
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
        </div>
      </section>

      {/* 编辑精选：居中标题 + 漂浮交叠卡片排 */}
      <section
        id="featured"
        className="relative mx-auto max-w-6xl scroll-mt-24 px-4 pt-48 text-center md:px-8 md:pt-[110px]"
      >
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          编辑精选
        </h2>

        {showError ? (
          <div className="mx-auto mt-10 max-w-md">
            <RetryBlock
              message={
                featured.error instanceof Error
                  ? featured.error.message
                  : "加载精选专辑失败"
              }
              onRetry={() => featured.refetch()}
            />
          </div>
        ) : !showSkeleton && featuredAlbums.length === 0 ? (
          <div className="mx-auto mt-10 max-w-md">
            <RetryBlock
              message="精选专辑未加载，请检查网络或重启开发服务后重试"
              onRetry={() => featured.refetch()}
            />
          </div>
        ) : (
          <HeroFloatingCards albums={heroCards} loading={showSkeleton} />
        )}
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
        <DiscoveryFooter />
      </div>
    </main>
  );
}

/* Hero 底部漂浮交叠卡片 + 彩色光束 */
function HeroFloatingCards({
  albums,
  loading,
}: {
  albums: ITunesResult[];
  loading: boolean;
}) {
  // 中间 3 张为主卡，最外侧 2 张作虚化玻璃卡
  const layout = [
    { rotate: -16, x: "-118%", y: 36, scale: 0.82, blur: true, z: 10 },
    { rotate: -8, x: "-62%", y: 14, scale: 0.92, blur: false, z: 20 },
    { rotate: 0, x: "0%", y: 0, scale: 1, blur: false, z: 30 },
    { rotate: 8, x: "62%", y: 14, scale: 0.92, blur: false, z: 20 },
    { rotate: 16, x: "118%", y: 36, scale: 0.82, blur: true, z: 10 },
  ];

  return (
    <div className="relative mt-[22px] h-[300px] md:h-[380px]">
      {/* 彩色光束 */}
      <LightStreaks />

      {/* 底部向 background 的渐隐，营造卡片浮出感 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-24 bg-gradient-to-t from-background to-transparent" />

      <div className="absolute inset-0 flex items-center justify-center">
        {(loading || albums.length === 0
          ? Array.from({ length: 5 }).map(() => null)
          : albums
        )
          .slice(0, 5)
          .map((album, i) => {
            const cfg = layout[i];
            return (
              <motion.div
                key={album?.collectionId ?? `ph-${i}`}
                className="absolute"
                style={{ zIndex: cfg.z }}
                initial={{ opacity: 0, y: 40, rotate: cfg.rotate }}
                animate={{
                  opacity: 1,
                  y: cfg.y,
                  rotate: cfg.rotate,
                  x: cfg.x,
                  scale: cfg.scale,
                }}
                transition={{
                  duration: 0.7,
                  delay: 0.15 + i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {album ? (
                  <HeroCard album={album} dim={cfg.blur} />
                ) : (
                  <div className="h-[220px] w-[170px] rounded-2xl border border-border bg-white/[0.04] md:h-[280px] md:w-[210px]" />
                )}
              </motion.div>
            );
          })}
      </div>
    </div>
  );
}

function HeroCard({ album, dim }: { album: ITunesResult; dim: boolean }) {
  const id = album.collectionId!;
  const artwork = hdArtworkUrl(album.artworkUrl100);
  const { color } = useAlbumColors(artwork);

  return (
    <Link
      href={`/album/${id}`}
      className="group relative block h-[220px] w-[170px] md:h-[280px] md:w-[210px]"
    >
      {/* 主色光晕 */}
      <div
        className="pointer-events-none absolute -inset-3 rounded-[1.6rem] opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-90"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 60%, ${color}66 0%, transparent 70%)`,
        }}
        aria-hidden
      />
      <div
        className="relative h-full w-full overflow-hidden rounded-2xl border border-white/15 shadow-soft-lg transition-transform duration-300 group-hover:-translate-y-2"
        style={{
          boxShadow: `0 24px 60px -20px ${color}55, 0 0 0 1px rgba(255,255,255,0.1) inset`,
        }}
      >
        <AlbumCover
          collectionId={id}
          src={album.artworkUrl100}
          alt={album.collectionName ?? "Album"}
          sharedLayout={false}
          fillContainer
        />
        {/* 顶部品牌行 */}
        <div className="absolute inset-x-0 top-0 flex items-center gap-1.5 p-3">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/90 text-black">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
            </svg>
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/90 drop-shadow">
            Vibe
          </span>
        </div>
        {/* 底部信息 */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-3">
          <p className="truncate text-xs font-semibold text-white">
            {album.collectionName}
          </p>
          <p className="truncate text-[11px] text-white/60">
            {album.artistName}
          </p>
        </div>
        {/* 侧卡蒙版（虚化氛围） */}
        {dim && (
          <div className="absolute inset-0 bg-background/45 backdrop-blur-[1px]" />
        )}
      </div>
    </Link>
  );
}

/* 彩色动态光束（水平模糊光轨） */
function LightStreaks() {
  const streaks = [
    { color: "#ff4d3d", top: "32%", w: "60%", left: "-10%", delay: 0, dur: 9 },
    { color: "#ffb43d", top: "48%", w: "70%", left: "20%", delay: 1.5, dur: 11 },
    { color: "#1db954", top: "60%", w: "55%", left: "-5%", delay: 0.8, dur: 10 },
    { color: "#4d8bff", top: "70%", w: "65%", left: "30%", delay: 2.2, dur: 12 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {streaks.map((s, i) => (
        <motion.div
          key={i}
          className="absolute h-[3px] rounded-full"
          style={{
            top: s.top,
            left: s.left,
            width: s.w,
            background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`,
            filter: "blur(6px)",
          }}
          initial={{ opacity: 0.3, x: "-15%" }}
          animate={{ opacity: [0.2, 0.7, 0.2], x: ["-15%", "15%", "-15%"] }}
          transition={{
            duration: s.dur,
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
