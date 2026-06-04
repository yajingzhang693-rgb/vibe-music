import { NextRequest, NextResponse } from "next/server";

const ITUNES_ORIGIN = "https://itunes.apple.com";

/** 服务端代理 iTunes API，避免浏览器直连失败（网络/CORS/超时） */
export async function GET(request: NextRequest) {
  const forward = request.nextUrl.searchParams.get("forward");
  if (!forward || !forward.startsWith(`${ITUNES_ORIGIN}/`)) {
    return NextResponse.json({ error: "Invalid forward URL" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    const res = await fetch(forward, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    clearTimeout(timer);

    if (!res.ok) {
      return NextResponse.json(
        { error: `iTunes upstream ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Proxy fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
