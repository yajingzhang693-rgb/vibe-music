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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal
      aria-labelledby="capacity-picker-title"
      onClick={onCancel}
    >
      <div
        className="glass-panel w-full max-w-md rounded-2xl p-6 shadow-soft-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-1 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted">
          New List
        </p>
        <h2
          id="capacity-picker-title"
          className="mb-5 text-center text-lg font-semibold text-foreground"
        >
          {title}
        </h2>
        <div className="flex flex-col gap-2.5">
          {LIST_CAPACITIES.map((cap) => (
            <button
              key={cap}
              type="button"
              onClick={() => onSelect(cap)}
              className="w-full rounded-full border border-border bg-surface px-4 py-3.5 text-sm font-medium text-foreground transition-all hover:scale-[1.02] hover:border-white/25 hover:bg-surface-elevated active:scale-[0.98]"
            >
              {LABELS[cap]}
            </button>
          ))}
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="mt-4 w-full py-2 text-sm text-muted transition-colors hover:text-foreground"
          >
            取消
          </button>
        )}
      </div>
    </div>
  );
}
