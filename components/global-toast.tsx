"use client";

import { useToastStore } from "@/store/use-toast-store";

export function GlobalToast() {
  const message = useToastStore((s) => s.message);
  if (!message) return null;

  return (
    <div
      role="status"
      className="pointer-events-none fixed left-1/2 top-20 z-[100] -translate-x-1/2 rounded-full border border-white/30 bg-black/80 px-4 py-2 text-sm text-white backdrop-blur-md"
    >
      {message}
    </div>
  );
}
