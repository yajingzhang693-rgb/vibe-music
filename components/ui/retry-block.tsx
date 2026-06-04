"use client";

export function RetryBlock({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-6 text-center">
      <p className="text-sm text-zinc-400">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
      >
        重试
      </button>
    </div>
  );
}
