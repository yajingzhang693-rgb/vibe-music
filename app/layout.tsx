import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { GlobalToast } from "@/components/global-toast";
import { AiAssistant } from "@/components/ai-assistant";
import { ListsHydrator } from "@/components/providers/lists-hydrator";
import { QueryProvider } from "@/components/providers/query-provider";
import { MotionProvider } from "@/components/providers/motion-provider";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Vibe Music Rating",
  description: "极简沉浸式音乐评价空间",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`dark bg-background ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body
        className="min-h-screen bg-[#0a0a0a] font-sans text-[#ededed] antialiased"
        style={{ backgroundColor: "#0a0a0a", color: "#ededed" }}
      >
        <QueryProvider>
          <MotionProvider>
            <ListsHydrator />
            {children}
            <GlobalToast />
            <AiAssistant />
          </MotionProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
