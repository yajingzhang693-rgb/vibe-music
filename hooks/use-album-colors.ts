"use client";

import { useEffect, useState } from "react";
import { FastAverageColor } from "fast-average-color";

export function useAlbumColors(artworkUrl: string | undefined) {
  const [color, setColor] = useState("#1db954");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!artworkUrl) return;
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = artworkUrl;

    setLoading(true);
    img.onload = async () => {
      try {
        const fac = new FastAverageColor();
        const result = await fac.getColorAsync(img, {
          algorithm: "dominant",
          mode: "precision",
        });
        if (!cancelled && result.hex) setColor(result.hex);
      } catch {
        if (!cancelled) setColor("#1db954");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    img.onerror = () => {
      if (!cancelled) {
        setColor("#3f3f46");
        setLoading(false);
      }
    };

    return () => {
      cancelled = true;
    };
  }, [artworkUrl]);

  return { color, loading };
}
