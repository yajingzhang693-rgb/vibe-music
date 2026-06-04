"use client";

import { meshPaletteFromHex } from "@/lib/colors";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

const BLOBS = [
  {
    colorKey: "warm" as const,
    size: "min(52vw, 42rem)",
    left: "8%",
    top: "6%",
    x: [0, 48, -24, 0],
    y: [0, 32, -20, 0],
    duration: 34,
    delay: 0,
  },
  {
    colorKey: "cool" as const,
    size: "min(46vw, 36rem)",
    left: "62%",
    top: "4%",
    x: [0, -56, 28, 0],
    y: [0, 40, -16, 0],
    duration: 40,
    delay: 2,
  },
  {
    colorKey: "primary" as const,
    size: "min(58vw, 44rem)",
    left: "38%",
    top: "48%",
    x: [0, -36, 44, 0],
    y: [0, -48, 24, 0],
    duration: 46,
    delay: 4,
  },
  {
    colorKey: "deep" as const,
    size: "min(40vw, 32rem)",
    left: "-6%",
    top: "58%",
    x: [0, 64, -12, 0],
    y: [0, -28, 36, 0],
    duration: 38,
    delay: 1,
  },
  {
    colorKey: "cool" as const,
    size: "min(36vw, 28rem)",
    left: "72%",
    top: "62%",
    x: [0, -40, -8, 0],
    y: [0, 20, -44, 0],
    duration: 42,
    delay: 3,
  },
] as const;

export function FluidMeshBackground({ color }: { color: string }) {
  const reduceMotion = useReducedMotion();
  const palette = useMemo(() => meshPaletteFromHex(color), [color]);

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0a0a0a]"
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{ background: palette.staticMesh }}
      />

      {BLOBS.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full will-change-transform"
          style={{
            left: blob.left,
            top: blob.top,
            width: blob.size,
            height: blob.size,
            background: `radial-gradient(circle at 40% 40%, ${palette[blob.colorKey]} 0%, transparent 68%)`,
            filter: "blur(72px)",
          }}
          initial={false}
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [...blob.x],
                  y: [...blob.y],
                  scale: [1, 1.06, 0.97, 1],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: blob.duration,
                  delay: blob.delay,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }
          }
        />
      ))}

      {/* 压暗 + 边缘渐隐，保证前景 UI 可读 */}
      <div className="absolute inset-0 bg-[#0a0a0a]/55" />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 120% 90% at 50% 40%, transparent 0%, #0a0a0a 72%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/75 via-[#0a0a0a]/25 to-[#0a0a0a]/88" />
    </div>
  );
}
