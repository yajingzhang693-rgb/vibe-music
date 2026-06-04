import { MIN_TRACK_COUNT } from "./constants";
import type { ITunesResponse, ITunesResult } from "./types";

const ITUNES_BASE = "https://itunes.apple.com";

function isBrowser() {
  return typeof window !== "undefined";
}

function resolveFetchUrl(itunesUrl: string): string {
  if (!isBrowser()) return itunesUrl;
  return `/api/itunes?forward=${encodeURIComponent(itunesUrl)}`;
}

async function fetchWithRetry(
  itunesUrl: string,
  maxRetries = 2
): Promise<Response> {
  const url = resolveFetchUrl(itunesUrl);
  let lastRes: Response | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      lastRes = res;
      if (res.status !== 429 || attempt === maxRetries) return res;
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 800));
    } catch (e) {
      clearTimeout(timer);
      if (attempt === maxRetries) throw e;
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 800));
    }
  }
  return lastRes!;
}

async function getJson<T>(pathWithQuery: string): Promise<T> {
  const itunesUrl = pathWithQuery.startsWith("http")
    ? pathWithQuery
    : `${ITUNES_BASE}${pathWithQuery}`;
  const res = await fetchWithRetry(itunesUrl);
  if (!res.ok) throw new Error(`iTunes API error: ${res.status}`);
  const data = (await res.json()) as T & { error?: string };
  if (data && typeof data === "object" && "error" in data && !("resultCount" in data)) {
    throw new Error(data.error ?? "iTunes proxy error");
  }
  return data;
}

export function isValidAlbum(item: ITunesResult): boolean {
  return (
    item.wrapperType === "collection" &&
    item.collectionType === "Album" &&
    (item.trackCount ?? 0) > MIN_TRACK_COUNT
  );
}

export function filterAlbums(results: ITunesResult[]): ITunesResult[] {
  return results.filter(isValidAlbum);
}

const VARIANT_SUFFIX =
  /\s*[\(\[](?:(?:deluxe|expanded|special|bonus|commemorative|anniversary|remastered|super)[^)\]]*)[\)\]]\s*|\s*-\s*ep\s*$/gi;

/** 括号内变体关键词（不含 Taylor's Version） */
const VARIANT_PAREN_CONTENT =
  /message\s+from|3am|til\s+dawn|anthology|deluxe|expanded|bonus|more\s+only|commemorative|anniversary|remastered|super|acoustic|live\s+from/i;

const VARIANT_PAREN =
  /\s*\((?!\s*taylor'?s?\s+version\s*\))([^)]*)\)\s*/gi;

/** 去掉 Deluxe、[+ Message]、(3am Edition) 等，合并同专辑不同 iTunes 条目 */
export function normalizeAlbumTitle(name: string): string {
  let n = name.trim();

  while (/\s*\[[^\]]+\]\s*$/.test(n)) {
    n = n.replace(/\s*\[[^\]]+\]\s*$/, "");
  }

  VARIANT_PAREN.lastIndex = 0;
  let prev = "";
  while (prev !== n) {
    prev = n;
    VARIANT_PAREN.lastIndex = 0;
    n = n.replace(VARIANT_PAREN, (full, inner) =>
      VARIANT_PAREN_CONTENT.test(inner) ? " " : full
    );
  }

  n = n.replace(/\s*:\s*the\s+anthology\s*/gi, " ");
  n = n.replace(VARIANT_SUFFIX, "");
  return n.replace(/\s+/g, " ").trim().toUpperCase();
}

function isVariantEdition(name: string): boolean {
  const raw = name.trim();
  if (/\b(deluxe|expanded|bonus tracks|special edition)\b/i.test(raw)) return true;
  if (/\[[^\]]*(?:message from|deluxe|expanded|bonus)/i.test(raw)) return true;
  if (/\([^)]*(?:message from|3am|til dawn|anthology|deluxe|expanded|bonus|more only)/i.test(raw))
    return true;
  return false;
}

/** 同一专辑多条记录时，优先保留标准版（非 Deluxe/Expanded） */
function pickPreferredAlbum(
  current: ITunesResult,
  incoming: ITunesResult
): ITunesResult {
  const curName = current.collectionName ?? "";
  const incName = incoming.collectionName ?? "";
  const curVar = isVariantEdition(curName);
  const incVar = isVariantEdition(incName);
  if (curVar && !incVar) return incoming;
  if (!curVar && incVar) return current;
  return curName.length <= incName.length ? current : incoming;
}

/**
 * iTunes 去重：合并重复 collectionId，以及 Deluxe/Expanded 等同专辑变体（保留标准版）
 * 键：规范化专辑名（去掉 Deluxe 等后缀，不按年份区分变体）
 */
export function dedupeAlbums(albums: ITunesResult[]): ITunesResult[] {
  const seen = new Map<string, ITunesResult>();
  for (const album of albums) {
    const key = normalizeAlbumTitle(album.collectionName ?? "");
    if (!key) continue;
    const existing = seen.get(key);
    seen.set(key, existing ? pickPreferredAlbum(existing, album) : album);
  }
  return Array.from(seen.values());
}

export async function searchArtists(term: string): Promise<ITunesResult[]> {
  const q = encodeURIComponent(term.trim());
  const data = await getJson<ITunesResponse>(
    `/search?term=${q}&entity=musicArtist&limit=5`
  );
  return data.results ?? [];
}

/**
 * 先批量 lookup，再对缺失 id 逐个补全
 */
export async function lookupCollections(
  ids: (number | string)[]
): Promise<ITunesResult[]> {
  const numericIds = ids.map((id) => Number(id));
  const byId = new Map<number, ITunesResult>();

  try {
    const batch = await getJson<ITunesResponse>(
      `/lookup?id=${ids.join(",")}`
    );
    for (const r of batch.results ?? []) {
      if (r.collectionId) byId.set(r.collectionId, r);
    }
  } catch {
    /* 批量失败则逐个补全 */
  }

  const missing = numericIds.filter((id) => !byId.has(id));
  for (const id of missing) {
    try {
      const data = await getJson<ITunesResponse>(`/lookup?id=${id}`);
      const item =
        data.results?.find((r) => r.collectionId === id) ??
        data.results?.[0];
      if (item?.collectionId) byId.set(item.collectionId, item);
    } catch {
      /* 单条失败跳过 */
    }
  }

  const ordered = numericIds
    .map((id) => byId.get(id))
    .filter((r): r is ITunesResult => r != null);

  if (ordered.length === 0 && ids.length > 0) {
    throw new Error("无法加载专辑，请检查网络后重试");
  }

  return ordered;
}

/** 首页服务端预取：失败时返回空数组，不抛错以免整页崩溃 */
export async function lookupCollectionsSafe(
  ids: (number | string)[]
): Promise<ITunesResult[]> {
  try {
    return await lookupCollections(ids);
  } catch {
    return [];
  }
}

export async function lookupArtistAlbums(
  artistId: string | number
): Promise<{ artist: ITunesResult | null; albums: ITunesResult[] }> {
  const data = await getJson<ITunesResponse>(
    `/lookup?id=${artistId}&entity=album`
  );
  const results = data.results ?? [];
  const artist =
    results.find((r) => r.wrapperType === "artist") ?? results[0] ?? null;
  const albums = dedupeAlbums(
    sortAlbumsNewestFirst(filterAlbums(results))
  );
  return { artist, albums };
}

export async function lookupAlbum(
  collectionId: string | number
): Promise<ITunesResult | null> {
  const results = await lookupCollections([collectionId]);
  return (
    results.find((r) => r.collectionId === Number(collectionId)) ??
    results[0] ??
    null
  );
}

export async function lookupSongs(
  collectionId: string | number
): Promise<ITunesResult[]> {
  const data = await getJson<ITunesResponse>(
    `/lookup?id=${collectionId}&entity=song`
  );
  return (data.results ?? []).filter((r) => r.wrapperType === "track");
}

export function sortAlbumsNewestFirst(albums: ITunesResult[]): ITunesResult[] {
  return [...albums].sort(
    (a, b) =>
      new Date(b.releaseDate ?? 0).getTime() -
      new Date(a.releaseDate ?? 0).getTime()
  );
}
