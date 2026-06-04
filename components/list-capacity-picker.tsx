"use client";

import type { ListCapacity } from "@/lib/types";
import { LIST_CAPACITIES } from "@/lib/lists-storage";

const LABELS: Record<ListCapacity, string> = {
  10: "10张",
  20: "20张",
  30: "30张",
};

export function ListCapacityPicker({
  onSelect,
  onCancel,
  title = "选择榜单容量",
}: {
  onSelect: (capacity: ListCapacity) => void;
  onCancel?: () => void;
  title?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal
      aria-labelledby="capacity-picker-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/30 bg-[#141414] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="capacity-picker-title"
          className="mb-4 text-center text-lg font-semibold text-white"
        >
          {title}
        </h2>
        <div className="flex flex-col gap-2">
          {LIST_CAPACITIES.map((cap) => (
            <button
              key={cap}
              type="button"
              onClick={() => onSelect(cap)}
              className="w-full rounded-full border border-white/30 bg-white/10 px-4 py-3.5 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/15"
            >
              {LABELS[cap]}
            </button>
          ))}
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="mt-3 w-full py-2 text-sm text-zinc-500 transition hover:text-white"
          >
            取消
          </button>
        )}
      </div>
    </div>
  );
}
