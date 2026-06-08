"use client";

import { getOrCreateVisitorId } from "@/lib/fingerprint";
import type { RatedAlbum } from "@/lib/ratings-query";
import type { ListCapacity } from "@/lib/types";
import { useListsStore } from "@/store/use-lists-store";
import { useToastStore } from "@/store/use-toast-store";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface TopAlbumsToolOutput {
  count: number;
  albums: RatedAlbum[];
  canCreateList: boolean;
}

function isTopAlbumsOutput(value: unknown): value is TopAlbumsToolOutput {
  if (!value || typeof value !== "object") return false;
  const v = value as TopAlbumsToolOutput;
  return Array.isArray(v.albums);
}

function pickListCapacity(count: number): ListCapacity {
  if (count <= 10) return 10;
  if (count <= 20) return 20;
  return 30;
}

function MessageParts({ message }: { message: UIMessage }) {
  const router = useRouter();
  const showToast = useToastStore((s) => s.show);
  const hydrate = useListsStore((s) => s.hydrate);
  const createList = useListsStore((s) => s.createList);
  const addAlbumToList = useListsStore((s) => s.addAlbumToList);

  const handleCreateList = (albums: RatedAlbum[], genreHint?: string) => {
    if (albums.length < 2) return;
    hydrate();
    const capacity = pickListCapacity(albums.length);
    const title = genreHint?.trim()
      ? `AI · ${genreHint.trim()} 精选`
      : "AI 推荐榜单";
    const list = createList(title, capacity);
    for (const album of albums.slice(0, capacity)) {
      addAlbumToList(list.id, album.album_id);
    }
    showToast("榜单已生成");
    router.push(`/lists/${list.id}`);
  };

  return (
    <>
      {message.parts.map((part, index) => {
        if (part.type === "text") {
          return (
            <p
              key={`${message.id}-text-${index}`}
              className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-100"
            >
              {part.text}
            </p>
          );
        }

        if (part.type === "tool-get_my_top_albums") {
          if (part.state === "input-streaming" || part.state === "input-available") {
            return (
              <p
                key={`${message.id}-tool-${index}`}
                className="text-xs text-zinc-500"
              >
                正在检索你的评分记录…
              </p>
            );
          }

          if (part.state === "output-available" && isTopAlbumsOutput(part.output)) {
            const { albums, canCreateList } = part.output;
            const genreHint =
              typeof part.input === "object" &&
              part.input &&
              "genre" in part.input &&
              typeof part.input.genre === "string"
                ? part.input.genre
                : undefined;

            return (
              <div
                key={`${message.id}-tool-${index}`}
                className="mt-2 space-y-2 rounded-xl border border-white/20 bg-white/5 p-3"
              >
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  找到 {albums.length} 张专辑
                </p>
                <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-zinc-300">
                  {albums.map((album) => (
                    <li key={album.album_id} className="flex justify-between gap-2">
                      <span className="truncate">
                        {album.album_name} · {album.artist_name}
                      </span>
                      <span className="shrink-0 tabular-nums text-zinc-400">
                        {album.score.toFixed(1)}
                      </span>
                    </li>
                  ))}
                </ul>
                {canCreateList && (
                  <button
                    type="button"
                    onClick={() => handleCreateList(albums, genreHint)}
                    className="w-full rounded-full border border-white/30 bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur-xl transition hover:border-white/40 hover:bg-white/15"
                  >
                    一键生成榜单
                  </button>
                )}
              </div>
            );
          }
        }

        return null;
      })}
    </>
  );
}

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ visitorId: getOrCreateVisitorId() }),
      }),
    []
  );

  const { messages, sendMessage, status, error } = useChat({
    transport,
  });

  const isBusy = status === "submitted" || status === "streaming";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isBusy) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="pointer-events-auto flex h-[min(520px,calc(100vh-7rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/30 bg-black/70 shadow-2xl backdrop-blur-xl"
          >
            <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">Discurse 助理</p>
                <p className="text-xs text-zinc-500">懂你的审美偏好</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/20 px-2.5 py-1 text-xs text-zinc-400 transition hover:border-white/30 hover:text-white"
              >
                关闭
              </button>
            </header>

            <div className="vibe-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.length === 0 && (
                <p className="text-sm leading-relaxed text-zinc-500">
                  问我「我评分最高的摇滚专辑有哪些？」或「分析一下我的审美」——我会从你的
                  Discurse 评分记录里找答案。
                </p>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.role === "user"
                      ? "ml-8 rounded-xl border border-white/20 bg-white/10 px-3 py-2"
                      : "mr-4 space-y-2"
                  }
                >
                  {message.role === "user" ? (
                    <p className="text-sm text-white">
                      {message.parts
                        .filter((p) => p.type === "text")
                        .map((p) => (p.type === "text" ? p.text : ""))
                        .join("")}
                    </p>
                  ) : (
                    <MessageParts message={message} />
                  )}
                </div>
              ))}

              {isBusy && (
                <p className="text-xs text-zinc-500">助理正在思考…</p>
              )}

              {error && (
                <p className="text-xs text-red-400">
                  出错了：{error.message || "请稍后再试"}
                </p>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="shrink-0 border-t border-white/10 p-3"
            >
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isBusy}
                  placeholder="聊聊你的音乐品味…"
                  className="min-w-0 flex-1 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white/30"
                />
                <button
                  type="submit"
                  disabled={isBusy || !input.trim()}
                  className="shrink-0 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-xl transition hover:border-white/40 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  发送
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "关闭 AI 助理" : "打开 AI 助理"}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/10 text-xl text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl transition hover:border-white/40 hover:bg-white/15"
      >
        {open ? "×" : "✦"}
      </button>
    </div>
  );
}
