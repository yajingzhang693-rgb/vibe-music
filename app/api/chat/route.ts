import {
  DISCURSE_SYSTEM_PROMPT,
  REVIEW_WRITER_SYSTEM_PROMPT,
  deepseek,
} from "@/lib/deepseek";
import type {
  GenerateReviewAlbum,
  GenerateReviewRequest,
  GenerateReviewScores,
} from "@/lib/generate-review";
import { getTopAlbumsForUser } from "@/lib/ratings-query";
import { MAX_REVIEW_LENGTH } from "@/lib/constants";
import {
  convertToModelMessages,
  generateText,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";

export const maxDuration = 30;

function buildReviewPrompt(
  album: GenerateReviewAlbum,
  scores: GenerateReviewScores,
  keywords?: string
): string {
  const keywordBlock = keywords?.trim()
    ? `用户关键词 / 意图片段：${keywords.trim()}`
    : "用户未提供关键词，请根据分数与流派推断评价方向。";

  return `专辑：${album.albumName} — ${album.artistName}
流派：${album.genre || "未知"}
发行：${album.releaseDate || "未知"}

评分：
- 整体 (70%)：${scores.overall}
- 制作 Production (15%)：${scores.production}
- 词曲 Songwriting (15%)：${scores.songwriting}
- 综合得分：${scores.finalScore}

${keywordBlock}

请撰写乐评：`;
}

async function handleGenerateReview(body: GenerateReviewRequest) {
  const { album, scores, keywords } = body;

  const { text } = await generateText({
    model: deepseek.chat("deepseek-chat"),
    system: REVIEW_WRITER_SYSTEM_PROMPT,
    prompt: buildReviewPrompt(album, scores, keywords),
  });

  const review = text.trim().slice(0, MAX_REVIEW_LENGTH);
  return Response.json({ review });
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!process.env.DEEPSEEK_API_KEY) {
    return Response.json({ error: "Missing DEEPSEEK_API_KEY" }, { status: 500 });
  }

  if (body.intent === "generate-review") {
    const { album, scores } = body as GenerateReviewRequest;
    if (!album?.albumName || !scores) {
      return Response.json({ error: "Missing album or scores" }, { status: 400 });
    }
    try {
      return await handleGenerateReview(body as GenerateReviewRequest);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "乐评生成失败，请稍后再试";
      return Response.json({ error: message }, { status: 502 });
    }
  }

  const { messages, visitorId }: { messages: UIMessage[]; visitorId?: string } =
    body;

  if (!visitorId) {
    return Response.json({ error: "Missing visitorId" }, { status: 400 });
  }

  const result = streamText({
    model: deepseek.chat("deepseek-chat"),
    system: DISCURSE_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: {
      get_my_top_albums: tool({
        description:
          "查询当前用户在 Discurse 上的专辑评分记录，按分数降序返回。可按流派关键词筛选。",
        inputSchema: z.object({
          genre: z
            .string()
            .optional()
            .describe("流派关键词，如 Rock、Pop、Hip-Hop/Rap"),
          limit: z
            .number()
            .int()
            .min(1)
            .max(30)
            .default(10)
            .describe("返回专辑数量，最多 30"),
        }),
        execute: async ({ genre, limit }) => {
          const albums = await getTopAlbumsForUser(visitorId, { genre, limit });
          return {
            count: albums.length,
            albums,
            canCreateList: albums.length >= 2,
          };
        },
      }),
    },
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
