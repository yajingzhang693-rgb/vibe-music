import { create } from "zustand";

let hideTimer: ReturnType<typeof setTimeout> | null = null;

interface ToastStore {
  message: string | null;
  show: (message: string, durationMs?: number) => void;
  hide: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  message: null,
  show: (message, durationMs = 2200) => {
    set({ message });
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      set({ message: null });
      hideTimer = null;
    }, durationMs);
  },
  hide: () => {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = null;
    set({ message: null });
  },
}));
