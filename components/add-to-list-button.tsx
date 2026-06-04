"use client";

import { ListSelectorPopover } from "@/components/list-selector-popover";
import { useRef, useState } from "react";

export function AddToListButton({
  collectionId,
  className = "",
  size = "md",
}: {
  collectionId: string | number;
  className?: string;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const sizeClass =
    size === "sm"
      ? "h-8 w-8 text-base"
      : "h-10 w-10 text-lg";

  const positioned = /\babsolute\b/.test(className);

  return (
    <div
      className={
        positioned
          ? `shrink-0 ${className}`
          : `relative shrink-0 ${className}`
      }
    >
      <button
        ref={anchorRef}
        type="button"
        aria-label="添加到榜单"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`flex items-center justify-center rounded-full border border-white/30 bg-white/10 font-light text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-md transition hover:bg-white/15 ${sizeClass}`}
      >
        +
      </button>
      <ListSelectorPopover
        collectionId={collectionId}
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
      />
    </div>
  );
}
