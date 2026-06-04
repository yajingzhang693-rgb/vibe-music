"use client";

import type { ITunesResult } from "@/lib/types";
import { useToastStore } from "@/store/use-toast-store";
import { useCallback, useEffect, useRef, useState } from "react";

export function firstTrackWithPreview(
  tracks: ITunesResult[]
): ITunesResult | undefined {
  return tracks.find((t) => t.previewUrl?.trim());
}

export function useTrackPreview() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeTrackId, setActiveTrackId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const showToast = useToastStore((s) => s.show);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setActiveTrackId(null);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, []);

  const playTrack = useCallback(
    (track: ITunesResult) => {
      const url = track.previewUrl?.trim();
      if (!url) {
        showToast("暂无试听");
        return;
      }

      const audio = audioRef.current;
      if (!audio) return;

      const trackId = track.trackId ?? null;
      if (trackId !== null && activeTrackId === trackId && !audio.paused) {
        audio.pause();
        return;
      }

      audio.src = url;
      setActiveTrackId(trackId);
      void audio.play().catch(() => {
        setIsPlaying(false);
        setActiveTrackId(null);
        showToast("暂无试听");
      });
    },
    [activeTrackId, showToast]
  );

  const playFirstAvailable = useCallback(
    (tracks: ITunesResult[]) => {
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        audio.pause();
        return;
      }
      const first = firstTrackWithPreview(tracks);
      if (!first) {
        showToast("暂无试听");
        return;
      }
      playTrack(first);
    },
    [playTrack, showToast]
  );

  return {
    activeTrackId,
    isPlaying,
    playTrack,
    playFirstAvailable,
    showToast,
  };
}
