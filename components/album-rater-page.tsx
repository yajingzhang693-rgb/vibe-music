"use client";

import {
  getShareCardPreviewMetrics,
  PREVIEW_DISPLAY_WIDTH,
  SHARE_CARD_HEIGHT,
  SHARE_CARD_WIDTH,
} from "@/lib/constants";
import { hdArtworkUrl } from "@/lib/artwork";
import { fetchGeneratedReview } from "@/lib/generate-review";
import { AiReviewField } from "@/components/ai-review-field";
import { lookupAlbum, lookupSongs } from "@/lib/itunes";
import { useAlbumColors } from "@/hooks/use-album-colors";
import { useTrackPreview } from "@/hooks/use-track-preview";
import { PreviewPlayButton } from "@/components/preview-play-button";
import { AddToListButton } from "@/components/add-to-list-button";
import { useRatingStore } from "@/store/use-rating-store";
import { useToastStore } from "@/store/use-toast-store";
import { ShareCard } from "@/components/share-card";
import { ExportCardButton } from "@/components/export-card-button";
import { AlbumCover } from "@/components/album-cover";
import { RetryBlock } from "@/components/ui/retry-block";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { ITunesResult } from "@/lib/types";
import { FluidMeshBackground } from "@/components/fluid-mesh-background";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

function BackButton() {
  return (
    <Link
      href="/"
      className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground shadow-soft transition-all hover:scale-[1.03] hover:border-white/25 active:scale-95"
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
  );
}

function PreviewCardAmbientGlow({
  color,
  isPlaying,
}: {
  color: string;
  isPlaying: boolean;
}) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -inset-12 -z-10 overflow-visible"
      initial={false}
      animate={
        isPlaying
          ? {
              opacity: [0.2, 0.8, 0.2],
              scale: [0.9, 1.15, 0.9],
              filter: ["blur(30px)", "blur(60px)", "blur(30px)"],
            }
          : { opacity: 0, scale: 0.9, filter: "blur(30px)" }
      }
      transition={
        isPlaying
          ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.5, ease: "easeOut" }
      }
    >
      <div
        className="absolute inset-0 rounded-[2rem] mix-blend-screen"
        style={{
          background: `radial-gradient(ellipse 55% 50% at 50% 58%, ${color} 0%, ${color} 28%, transparent 62%)`,
        }}
      />
      <div
        className="absolute inset-0 rounded-[2rem] mix-blend-screen"
        style={{
          background: `radial-gradient(ellipse 100% 95% at 50% 65%, ${color} 0%, transparent 78%)`,
        }}
      />
    </motion.div>
  );
}

export function AlbumRaterPage({
  collectionId,
}: {
  collectionId: string;
}) {
  const albumQuery = useQuery({
    queryKey: ["album", collectionId],
    queryFn: () => lookupAlbum(collectionId),
  });

  const tracksQuery = useQuery({
    queryKey: ["tracks", collectionId],
    queryFn: () => lookupSongs(collectionId),
    enabled: !!collectionId,
  });

  const {
    loadRating,
    saveRating,
    overall,
    production,
    songwriting,
    review,
    finalScore,
    themeColor,
    hasExistingRating,
    isLoadingRating,
    isSaving,
    setOverall,
    setProduction,
    setSongwriting,
    setReview,
    setThemeColor,
    setAlbumMeta,
  } = useRatingStore();

  const showToast = useToastStore((s) => s.show);

  const album = albumQuery.data;
  const artwork = hdArtworkUrl(album?.artworkUrl100);
  const { color } = useAlbumColors(artwork);

  useEffect(() => {
    if (!album) return;

    setAlbumMeta({
      albumId: collectionId,
      albumName: album.collectionName ?? "",
      artistName: album.artistName ?? "",
      genre: album.primaryGenreName ?? "",
      releaseDate: album.releaseDate ?? "",
    });

    void loadRating(collectionId).then((result) => {
      if (result === "error") showToast("加载评分失败");
    });
  }, [album, collectionId, setAlbumMeta, loadRating, showToast]);

  useEffect(() => {
    if (color) setThemeColor(color);
  }, [color, setThemeColor]);

  const glowIntensity = useMemo(
    () => (production + songwriting) / 20,
    [production, songwriting]
  );

  const pageStyle = {
    ["--album-theme-color" as string]: themeColor,
  } as React.CSSProperties;

  const preview = getShareCardPreviewMetrics(PREVIEW_DISPLAY_WIDTH);
  const {
    activeTrackId,
    isPlaying,
    playTrack,
    playFirstAvailable,
  } = useTrackPreview();
  const tracks = tracksQuery.data ?? [];

  if (albumQuery.isLoading) {
    return (
      <main
        className="relative flex h-screen flex-col overflow-hidden text-white"
        style={pageStyle}
      >
        <FluidMeshBackground color={themeColor} />
        <header className="relative z-10 shrink-0 px-8 py-5">
          <Skeleton className="h-5 w-16" />
        </header>
        <div className="relative z-10 flex min-h-0 flex-1 flex-col lg:flex-row">
          <aside className="flex items-start justify-center px-8 py-8 lg:w-[42%]">
            <Skeleton
              className="rounded-2xl"
              style={{
                width: preview.displayWidth,
                height: preview.displayHeight,
              }}
            />
          </aside>
          <div className="vibe-scrollbar min-h-0 flex-1 overflow-y-auto px-8 pb-20">
            <Skeleton className="h-full min-h-[24rem] w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (albumQuery.isError || !album) {
    return (
      <main
        className="relative flex h-screen flex-col overflow-hidden text-white"
        style={pageStyle}
      >
        <FluidMeshBackground color={themeColor} />
        <header className="relative z-10 shrink-0 px-8 py-5">
          <BackButton />
        </header>
        <div className="relative z-10 flex flex-1 items-center justify-center px-8">
          <RetryBlock
            message="加载专辑失败"
            onRetry={() => albumQuery.refetch()}
          />
        </div>
      </main>
    );
  }

  const handleSaveRating = async () => {
    const ok = await saveRating();
    showToast(ok ? "评分已保存" : "保存失败，请重试");
  };

  const name = album.collectionName ?? "专辑";
  const artist = album.artistName ?? "";

  return (
    <main
      className="relative flex h-screen flex-col overflow-hidden text-white"
      style={pageStyle}
    >
      <FluidMeshBackground color={themeColor} />
      <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-border px-8 py-5">
        <BackButton />
        <PreviewPlayButton
          isPlaying={isPlaying}
          disabled={tracksQuery.isLoading || tracks.length === 0}
          onClick={() => playFirstAvailable(tracks)}
        />
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* 左侧预览：顶部与右侧专辑信息对齐，不随右侧滚动 */}
        <aside className="flex min-h-0 shrink-0 items-start justify-center border-b border-border px-6 py-8 lg:w-[46%] lg:border-b-0 lg:border-r lg:px-8">
          <div
            className="flex flex-col items-stretch gap-12"
            style={{ width: preview.displayWidth }}
          >
            <div
              className="relative shrink-0 overflow-visible"
              style={{
                width: preview.displayWidth,
                height: preview.displayHeight,
              }}
            >
              <PreviewCardAmbientGlow
                color={themeColor}
                isPlaying={isPlaying}
              />
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <div
                  className="origin-top-left"
                  style={{
                    transform: `scale(${preview.scale})`,
                    width: SHARE_CARD_WIDTH,
                    height: SHARE_CARD_HEIGHT,
                  }}
                >
                  <ShareCard
                    collectionId={collectionId}
                    artworkUrl={album.artworkUrl100}
                    collectionName={name}
                    artistName={artist}
                    finalScore={finalScore}
                    review={review}
                    themeColor={themeColor}
                    glowIntensity={glowIntensity}
                  />
                </div>
              </div>
            </div>
            <ExportCardButton albumName={name} />
          </div>
        </aside>

        {/* 右侧控制区：独立滚动 */}
        <div className="vibe-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-8 py-8 pb-20">
          <div className="mx-auto w-full max-w-xl space-y-8">
            <section className="flex items-center gap-5">
              <AlbumCover
                collectionId={collectionId}
                src={album.artworkUrl100}
                alt={name}
                className="h-24 w-24 shrink-0 rounded-xl shadow-soft"
                size={96}
                sharedLayout={false}
              />
              <div className="min-w-0 flex-1">
                <h1 className="display-title text-balance text-2xl font-semibold leading-tight md:text-3xl">
                  {name}
                </h1>
                <p className="mt-1.5 text-base text-muted">{artist}</p>
              </div>
              <AddToListButton collectionId={collectionId} />
            </section>

            {isLoadingRating ? (
              <div className="space-y-8">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            ) : (
              <>
                <div className="glass-panel rounded-2xl p-5 shadow-soft">
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                    最后总分
                  </p>
                  <motion.p
                    key={finalScore}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 280, damping: 22 }}
                    className="mt-1.5 text-5xl font-semibold tabular-nums text-foreground"
                  >
                    {finalScore.toFixed(1)}
                  </motion.p>
                </div>

                <ScoreField
                  label="整体分数 (70%)"
                  value={overall}
                  onChange={setOverall}
                />

                <SliderField
                  label="制作 Production (15%)"
                  value={production}
                  onChange={setProduction}
                  color={themeColor}
                />

                <SliderField
                  label="词曲 Songwriting (15%)"
                  value={songwriting}
                  onChange={setSongwriting}
                  color={themeColor}
                />

                <AiReviewField
                  review={review}
                  onReviewChange={setReview}
                  themeColor={themeColor}
                  disabled={isLoadingRating || isSaving}
                  onGenerate={(keywords) =>
                    fetchGeneratedReview({
                      album: {
                        albumName: name,
                        artistName: artist,
                        genre: album.primaryGenreName ?? "",
                        releaseDate: album.releaseDate,
                      },
                      scores: {
                        overall,
                        production,
                        songwriting,
                        finalScore,
                      },
                      keywords: keywords || undefined,
                    })
                  }
                  onSuccess={() => showToast("乐评已生成")}
                  onError={(message) => showToast(message)}
                />

                <button
                  type="button"
                  disabled={isSaving || isLoadingRating}
                  onClick={() => void handleSaveRating()}
                  className="w-full rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background shadow-soft-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSaving
                    ? "保存中…"
                    : hasExistingRating
                      ? "更新评分"
                      : "保存评分"}
                </button>
              </>
            )}

            <TracklistSection
              tracksQuery={tracksQuery}
              activeTrackId={activeTrackId}
              isPlaying={isPlaying}
              onTrackClick={playTrack}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

const TRACKLIST_GLASS =
  "glass-panel relative overflow-hidden rounded-2xl shadow-soft";

const TRACKLIST_SCROLL =
  "tracklist-scroll tracklist-fade-mask max-h-[300px] list-none overflow-y-auto overscroll-contain";

function TracklistSection({
  tracksQuery,
  activeTrackId,
  isPlaying,
  onTrackClick,
}: {
  tracksQuery: UseQueryResult<ITunesResult[], Error>;
  activeTrackId: number | null;
  isPlaying: boolean;
  onTrackClick: (track: ITunesResult) => void;
}) {
  return (
    <section>
      <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">
        曲目列表
      </h3>

      <div className={TRACKLIST_GLASS}>
        {tracksQuery.isLoading && (
          <div className={`${TRACKLIST_SCROLL} space-y-1 px-4 py-3`}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-7 w-full rounded-md" />
            ))}
          </div>
        )}

        {tracksQuery.isError && (
          <p className="px-4 py-4 text-sm text-white">暂无曲目信息</p>
        )}

        {tracksQuery.isSuccess && tracksQuery.data.length === 0 && (
          <p className="px-4 py-4 text-sm text-white">暂无曲目信息</p>
        )}

        {tracksQuery.isSuccess && tracksQuery.data.length > 0 && (
          <>
            <ol className={`${TRACKLIST_SCROLL} px-4 py-3 pr-3`}>
              {tracksQuery.data.map((t, i) => {
                const isActive =
                  isPlaying &&
                  t.trackId != null &&
                  t.trackId === activeTrackId;
                return (
                  <li key={t.trackId ?? i}>
                    <button
                      type="button"
                      onClick={() => onTrackClick(t)}
                      className={`w-full rounded-lg px-2.5 py-2 text-left text-sm leading-snug text-foreground transition-colors hover:bg-white/[0.06] ${
                        isActive ? "bg-white/[0.08]" : ""
                      }`}
                    >
                      <span className={isActive ? "text-foreground" : ""}>
                        {i + 1}. {t.trackName}
                        {isActive && (
                          <span className="ml-2 text-xs text-muted">
                            试听中
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 rounded-b-xl tracklist-bottom-vignette"
              aria-hidden
            />
          </>
        )}
      </div>
    </section>
  );
}

function clampScoreInput(value: number): number {
  const normalized = parseFloat(value.toFixed(1));
  return Math.min(10, Math.max(0, normalized));
}

function formatScoreDisplay(value: number): string {
  return clampScoreInput(value).toFixed(1).replace(/\.0$/, "");
}

function stripLeadingZeros(intPart: string): string {
  if (intPart === "" || intPart === "0") return intPart;
  const parsed = parseInt(intPart, 10);
  if (Number.isNaN(parsed)) return intPart;
  return String(parsed);
}

function sanitizeScoreDraft(raw: string): string {
  if (raw === "") return "";

  let s = raw.replace(/[^\d.]/g, "");
  if (!s) return "";

  const firstDot = s.indexOf(".");
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
  }

  const endsWithDot = s.endsWith(".");
  const [intRaw, decRaw = ""] = s.split(".");
  const intPart = intRaw === "" ? "0" : stripLeadingZeros(intRaw);
  const decPart = decRaw.slice(0, 1);

  if (endsWithDot || s.includes(".")) {
    if (decPart === "" && endsWithDot) {
      return `${intPart}.`;
    }
    if (decPart !== "") {
      return `${intPart}.${decPart}`;
    }
  }

  const intValue = parseInt(intPart, 10);
  if (!Number.isNaN(intValue) && intValue > 10) {
    return "10";
  }

  return intPart;
}

function parseDraftScore(draft: string): number | null {
  if (draft === "" || draft === "." || draft.endsWith(".")) return null;
  const parsed = parseFloat(draft);
  if (Number.isNaN(parsed)) return null;
  return clampScoreInput(parsed);
}

function ScoreField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  const focusedRef = useRef(false);
  const [draft, setDraft] = useState(() => formatScoreDisplay(value));
  valueRef.current = value;

  useEffect(() => {
    if (!focusedRef.current) {
      setDraft(formatScoreDisplay(value));
    }
  }, [value]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const next = clampScoreInput(valueRef.current + delta);
      onChange(next);
      setDraft(formatScoreDisplay(next));
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextDraft = sanitizeScoreDraft(e.target.value);
    setDraft(nextDraft);

    const parsed = parseDraftScore(nextDraft);
    if (parsed !== null) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    focusedRef.current = false;
    const parsed = parseDraftScore(draft);
    const next = parsed ?? 0;
    onChange(next);
    setDraft(formatScoreDisplay(next));
  };

  return (
    <div ref={containerRef}>
      <label className="mb-2 block text-sm text-muted">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={draft}
        onFocus={() => {
          focusedRef.current = true;
        }}
        onBlur={handleBlur}
        onChange={handleChange}
        className="glass-panel w-full rounded-xl px-4 py-3 text-2xl font-semibold tabular-nums text-foreground outline-none transition-colors focus:border-white/25 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="tabular-nums text-foreground">{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={0.1}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10"
        style={{
          accentColor: color,
          background: `linear-gradient(to right, ${color} 0%, ${color} ${value * 10}%, rgba(255,255,255,0.1) ${value * 10}%, rgba(255,255,255,0.1) 100%)`,
        }}
      />
    </div>
  );
}
