"use client";

import { coverLayoutId } from "@/lib/constants";
import { hdArtworkUrl } from "@/lib/artwork";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

export function AlbumCover({
  collectionId,
  src,
  alt,
  className = "",
  size = 160,
  priority = false,
  sharedLayout = true,
  fillContainer = false,
}: {
  collectionId: number | string;
  src?: string;
  alt: string;
  className?: string;
  size?: number;
  priority?: boolean;
  /** 同页多处封面时关闭，避免重复 layoutId */
  sharedLayout?: boolean;
  /** 铺满父级容器（网格卡片等），勿与固定 size 混用 */
  fillContainer?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const url = hdArtworkUrl(src);
  const layoutId = sharedLayout ? coverLayoutId(collectionId) : undefined;
  const motionProps = layoutId ? { layoutId } : {};

  const boxClass = fillContainer
    ? `relative h-full w-full overflow-hidden ${className}`
    : `relative overflow-hidden ${className}`;

  const boxStyle = fillContainer ? undefined : { width: size, height: size };

  if (!url || failed) {
    return (
      <motion.div
        {...motionProps}
        className={`bg-zinc-700 ${boxClass}`}
        style={boxStyle}
      />
    );
  }

  if (fillContainer) {
    return (
      <motion.div {...motionProps} className={boxClass}>
        <Image
          src={url}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
          onError={() => setFailed(true)}
          priority={priority}
          unoptimized
          crossOrigin="anonymous"
        />
      </motion.div>
    );
  }

  return (
    <motion.div {...motionProps} className={boxClass} style={boxStyle}>
      <Image
        src={url}
        alt={alt}
        width={size}
        height={size}
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
        priority={priority}
        unoptimized
        crossOrigin="anonymous"
      />
    </motion.div>
  );
}
