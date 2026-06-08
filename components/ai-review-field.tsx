"use client";

import { MAX_REVIEW_LENGTH } from "@/lib/constants";
import { hexToRgb } from "@/lib/colors";
import { motion, useReducedMotion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

type Phase = "idle" | "fading" | "fetching" | "typing";

function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(29, 185, 84, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function AnimatedReviewChars({ text }: { text: string }) {
  return (
    <span className="whitespace-pre-wrap text-sm leading-relaxed text-white">
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={
            index === text.length - 1
              ? { opacity: 0, y: 3, filter: "blur(3px)" }
              : false
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.16, ease: "easeOut" }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

export function AiReviewField({
  review,
  onReviewChange,
  themeColor,
  disabled,
  onGenerate,
  onSuccess,
  onError,
}: {
  review: string;
  onReviewChange: (value: string) => void;
  themeColor: string;
  disabled?: boolean;
  onGenerate: (keywords: string) => Promise<string>;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [fadeText, setFadeText] = useState("");
  const [typingText, setTypingText] = useState("");
  const keywordsRef = useRef("");
  const typewriterRef = useRef<number | null>(null);

  const rgb = useMemo(
    () => hexToRgb(themeColor) ?? { r: 29, g: 185, b: 84 },
    [themeColor]
  );
  const secondaryHex = useMemo(
    () =>
      `#${[rgb.r + 36, rgb.g + 12, rgb.b + 48]
        .map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0"))
        .join("")}`,
    [rgb]
  );

  const accentStyle = useMemo(
    (): CSSProperties => ({
      ["--review-accent" as string]: themeColor,
      ["--review-accent-secondary" as string]: secondaryHex,
      ["--review-accent-glow" as string]: hexToRgba(themeColor, 0.45),
      ["--review-accent-secondary-glow" as string]: hexToRgba(secondaryHex, 0.3),
      ["--review-accent-soft" as string]: hexToRgba(themeColor, 0.22),
      ["--review-accent-secondary-soft" as string]: hexToRgba(secondaryHex, 0.14),
    }),
    [themeColor, secondaryHex]
  );

  const isBusy = phase !== "idle";
  const showBorderFlow = phase === "fetching" || phase === "typing";
  const charCount =
    phase === "typing" ? typingText.length : review.length;

  const clearTypewriter = useCallback(() => {
    if (typewriterRef.current !== null) {
      window.clearInterval(typewriterRef.current);
      typewriterRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTypewriter(), [clearTypewriter]);

  const startTypewriter = useCallback(
    (fullText: string) => {
      clearTypewriter();
      setTypingText("");
      setPhase("typing");

      if (reduceMotion) {
        onReviewChange(fullText.slice(0, MAX_REVIEW_LENGTH));
        setTypingText(fullText.slice(0, MAX_REVIEW_LENGTH));
        setPhase("idle");
        onSuccess?.();
        return;
      }

      let index = 0;
      typewriterRef.current = window.setInterval(() => {
        index += 1;
        const slice = fullText.slice(0, index);
        setTypingText(slice);
        onReviewChange(slice);

        if (index >= fullText.length) {
          clearTypewriter();
          setPhase("idle");
          onSuccess?.();
        }
      }, 28);
    },
    [clearTypewriter, onReviewChange, onSuccess, reduceMotion]
  );

  const runFetch = useCallback(async () => {
    setPhase("fetching");
    try {
      const generated = await onGenerate(keywordsRef.current);
      startTypewriter(generated.slice(0, MAX_REVIEW_LENGTH));
    } catch (err) {
      setPhase("idle");
      onReviewChange(keywordsRef.current);
      onError?.(err instanceof Error ? err.message : "乐评生成失败");
    }
  }, [onGenerate, onReviewChange, onError, startTypewriter]);

  const handleGenerateClick = () => {
    if (isBusy || disabled) return;
    keywordsRef.current = review.trim();

    if (review.trim()) {
      setFadeText(review);
      setPhase("fading");
      return;
    }

    onReviewChange("");
    void runFetch();
  };

  const handleFadeComplete = () => {
    if (phase !== "fading") return;
    setFadeText("");
    onReviewChange("");
    void runFetch();
  };

  const textareaClassName =
    "w-full resize-none rounded-xl border border-white/30 bg-white/5 p-4 text-sm backdrop-blur-md outline-none focus:border-white/30 disabled:opacity-60";

  return (
    <div style={accentStyle}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-sm text-zinc-400">
          乐评（选填，{MAX_REVIEW_LENGTH} 字内）
        </label>
        <motion.button
          type="button"
          disabled={disabled || isBusy}
          onClick={handleGenerateClick}
          animate={
            phase === "fetching"
              ? {
                  scale: [1, 1.03, 1],
                  opacity: [0.88, 1, 0.88],
                }
              : { scale: 1, opacity: 1 }
          }
          transition={
            phase === "fetching"
              ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.2 }
          }
          className={[
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium text-white backdrop-blur-xl transition disabled:cursor-not-allowed disabled:opacity-50",
            phase === "fetching"
              ? "ai-review-btn-loading border-white/40"
              : "border-white/30 bg-white/10 hover:border-white/40 hover:bg-white/15",
          ].join(" ")}
        >
          {phase === "fetching" ? (
            <>
              <span
                className="ai-review-btn-spinner inline-block h-3 w-3 rounded-full border-2 border-white/30 border-t-white"
                aria-hidden
              />
              生成中…
            </>
          ) : phase === "typing" ? (
            <>✍ 撰写中…</>
          ) : (
            <>
              <span aria-hidden>✨</span>
              AI 写评
            </>
          )}
        </motion.button>
      </div>

      <div
        className={[
          "relative rounded-xl",
          showBorderFlow ? "ai-review-border-flow" : "",
        ].join(" ")}
      >
        {showBorderFlow && (
          <div
            className="ai-review-border-flow__pulse pointer-events-none absolute inset-0 rounded-xl"
            aria-hidden
          />
        )}

        <div
          className={[
            "relative overflow-hidden rounded-xl",
            showBorderFlow ? "ai-review-border-flow__inner m-[1px]" : "",
          ].join(" ")}
        >
          {phase === "fading" && (
            <motion.div
              key="fade"
              initial={{ opacity: 1, filter: "blur(0px)" }}
              animate={{ opacity: 0, filter: "blur(6px)" }}
              transition={{ duration: 0.32, ease: "easeInOut" }}
              onAnimationComplete={handleFadeComplete}
              className={`${textareaClassName} min-h-[7.5rem] text-zinc-400`}
            >
              {fadeText}
            </motion.div>
          )}

          {phase === "fetching" && (
            <div
              className={`${textareaClassName} min-h-[7.5rem] text-zinc-500`}
            >
              <motion.span
                animate={{ opacity: [0.35, 0.85, 0.35] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                AI 正在聆听你的评分…
              </motion.span>
            </div>
          )}

          {phase === "typing" && (
            <div className={`${textareaClassName} min-h-[7.5rem]`}>
              <AnimatedReviewChars text={typingText} />
              <motion.span
                aria-hidden
                className="ml-0.5 inline-block h-4 w-0.5 align-middle"
                style={{ backgroundColor: themeColor }}
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            </div>
          )}

          {phase === "idle" && (
            <textarea
              value={review}
              onChange={(e) => onReviewChange(e.target.value)}
              maxLength={MAX_REVIEW_LENGTH}
              rows={4}
              disabled={disabled}
              placeholder="写下感受，或输入关键词后点 AI 写评…"
              className={textareaClassName}
            />
          )}
        </div>
      </div>

      <p className="mt-1 text-right text-xs text-zinc-500">
        {charCount}/{MAX_REVIEW_LENGTH}
      </p>
    </div>
  );
}
