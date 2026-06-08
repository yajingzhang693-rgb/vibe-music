# Vibe Music Rating

极简沉浸式音乐专辑评分与分享 Web 应用（首页品牌名 **Discurse**）。浏览精选专辑、搜索艺人、为专辑打分写评、导出竖版分享卡，并创建 **10 / 20 / 30** 张容量的个人榜单与榜单分享卡。专辑元数据来自 Apple iTunes Search / Lookup API。

**线上地址**：<https://vibe-music-nu.vercel.app>  
**源码仓库**：<https://github.com/yajingzhang693-rgb/vibe-music>

---

## 项目进展（当前版本）

| 模块 | 状态 |
| --- | --- |
| 发现页（Discurse 顶栏、编辑精选、底部 Marquee） | 已上线 |
| 艺人页 / 专辑打分 | 已上线 |
| 专辑分享卡（12:16）预览与 PNG 导出 | 已上线 |
| 我的榜单（封面堆叠、行内重命名、拖拽排序） | 已上线 |
| 榜单分享卡（10 / 20 / 30 三套排版） | 已上线 |
| 评分云端存储（Supabase） | 已实现 |
| 右下角 AI 聊天助理 | 已实现 |
| Vercel 生产部署 + GitHub `main` 自动构建 | 已打通 |
| 榜单跨设备同步 | 未实现（仍仅 localStorage） |

---

## 技术栈

| 类别 | 选型 |
| --- | --- |
| 框架 | Next.js 14（App Router）+ TypeScript |
| 样式 | Tailwind CSS |
| 状态 | Zustand（打分、榜单）+ TanStack Query（iTunes） |
| 榜单拖拽 | @dnd-kit |
| 动画 | Framer Motion + CSS Marquee（`globals.css`） |
| 取色 | fast-average-color（封面主色） |
| 导出 | html-to-image（分享卡 PNG，`pixelRatio: 2`） |
| 评分存储 | Supabase（`ratings` 表）+ localStorage 缓存 |
| 榜单存储 | 浏览器 localStorage |
| AI 对话 | Vercel AI SDK + DeepSeek API（`/api/chat`） |

---

## 快速开始

```bash
npm install
cp .env.local.example .env.local   # 按需填写，见下方「环境变量」
npm run dev
```

浏览器打开终端显示的地址（一般为 [http://localhost:3000](http://localhost:3000)；端口被占用时会自动改用 3001 等）。

**若页面空白、500 或 `Cannot find module './xxx.js'`：**

1. 只保留 **一个** `npm run dev` 终端。
2. 清缓存后重启：

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

3. 浏览器 **Ctrl+F5** 硬刷新，确认端口与终端一致。

生产构建：

```bash
npm run build
npm start
```

---

## 环境变量

复制 [`.env.local.example`](.env.local.example) 为 `.env.local` 后填写：

| 变量 | 用途 | 是否必需 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | 评分同步 / AI 查分需要 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | 同上 |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | AI 聊天助理需要 |

未配置 Supabase 时，打分页会回退到 **仅 localStorage** 读写；未配置 DeepSeek 时，AI 助理不可用，其余功能正常。

Supabase 需先在 SQL Editor 执行 [`supabase/ratings.sql`](supabase/ratings.sql) 建表。

---

## 路由与页面

| 路径 | 说明 |
| --- | --- |
| `/` | **发现页**：Discurse 顶栏、搜索、编辑精选、底部 TASTE, ARCHIVED 滚动横幅 |
| `/artist/[artistId]` | **艺人页**：艺人信息 + 专辑列表（去重、过滤 EP） |
| `/album/[collectionId]` | **打分页**：评分、乐评、试听、专辑分享卡 |
| `/lists` | **我的榜单**：封面堆叠、新建 / 重命名 / 删除 |
| `/lists/[listId]` | **榜单编辑**：拖拽排序、移除、分享卡预览与导出 |
| `/api/itunes` | iTunes API 代理（`?forward=` 转发，带缓存） |
| `/api/chat` | AI 聊天接口（流式回复，可调用工具查用户评分） |

---

## 数据存储说明

### 匿名访客 ID

- 键名：`discurse_visitor_id`（localStorage）
- 首次访问时生成 UUID，作为 Supabase `ratings.user_id`
- 无登录体系，同一浏览器内 ID 固定

### 专辑评分

| 存储 | 说明 |
| --- | --- |
| Supabase `ratings` 表 | 主数据源；字段含 `overall` / `production` / `songwriting` / `score` / `review` 及专辑元数据 |
| `vibe-rating-{collectionId}` | 保存成功后的 localStorage 缓存，供榜单分享卡读取分数 |

**打分页行为：**

- 进入页面时，按 `visitorId + albumId` 从 Supabase 加载已有评分
- 无记录时初始分数为 **0**（无默认分），按钮显示「保存评分」
- 点击保存 / 更新后写入 Supabase，并同步 localStorage 缓存

### 榜单

| 键名 | 内容 |
| --- | --- |
| `vibe-music-lists` | 榜单列表：`id`、`title`、`albumIds`、`capacity`（10/20/30）、`createdAt` |

榜单 **仅存 localStorage**，不写入 Supabase。

**请注意：**

- 换浏览器或清除站点数据后，`discurse_visitor_id` 会变，云端评分记录无法关联到新 ID。
- `localhost` 与线上域名的 localStorage **相互独立**。
- 榜单只存专辑 ID；封面与艺人名通过 iTunes API 按需拉取。

---

## 目录结构

```
app/
  page.tsx
  artist/[artistId]/
  album/[collectionId]/
  lists/
  lists/[listId]/
  api/itunes/route.ts
  api/chat/route.ts           # AI 聊天
components/
  discovery-page.tsx
  discovery-footer.tsx
  artist-page.tsx
  album-rater-page.tsx
  ai-assistant.tsx            # 右下角聊天窗
  share-card.tsx
  list-share-card*.tsx
  lists-page.tsx
  list-editor-page.tsx
  providers/
hooks/
  useFingerprint.ts
lib/
  fingerprint.ts
  supabase.ts
  ratings-sync.ts             # 评分读写 Supabase
  ratings-query.ts            # 按用户查评分（供 AI 工具）
  deepseek.ts
  list-share-layout.ts
  storage.ts
store/
  use-rating-store.ts
  use-lists-store.ts
supabase/
  ratings.sql                 # 建表 SQL
```

---

## 核心功能

### 发现页（`/`）

**顶栏**

- 居中毛玻璃胶囊导航条（`glass-panel`）：左侧品牌 **Discurse**（带音符图标），中部「发现 / 精选 / 搜索」当前项白底高亮，右侧「我的榜单」白色胶囊按钮链至 `/lists`。

**Hero**

- 超大细体标题（`display-title`，桌面约 `text-[5.5rem]`），两行：首行白色、次行 `text-muted`。
- 副标题为 `max-w-xl` 居中 `text-muted` 段落。

**搜索**

- 居中窄搜索框（`max-w-sm`）：`glass-panel` 全圆角胶囊 + 放大镜图标 + 右侧白色「搜索」胶囊；`focus-within` 时边框提亮。Enter 或点击搜索展示艺人列表并跳转艺人页。

**编辑精选**

- 居中标题「编辑精选」，下方为 **5 张专辑封面卡片呈扇形交叠**排列（中间最大最靠前，向两侧依次缩小、旋转、降低层级与透明度）。
- 卡片为竖向矩形（桌面约 262×345px，`rounded-2xl`），顶部 **VIBE** 小标签，底部黑色渐变条压住专辑名与艺人名；中间主卡 hover 触发封面主色径向光晕 + 缩放。
- 卡片排下方有数道缓慢飘动的彩色光束氛围效果。

**底部页脚**（[`discovery-footer.tsx`](components/discovery-footer.tsx)）

- **TASTE, ARCHIVED** 横向无限滚动横幅：文案 + 白底箭头圆标重复排列。
- 双段 `ul` 无缝循环（`globals.css` 中 `discovery-marquee`，约 28s；`prefers-reduced-motion` 时停止动画）。
- 页脚 `hairline` 分隔线上方一行：© 2026 · Discurse · **回到顶部**（平滑滚回顶部）。

### 艺人页（`/artist/[artistId]`）

- 左右分栏：左侧大幅艺人背景图 + 底部 `display-title` 大名字与 `font-mono` 的 **ARTIST** 小标签；右侧专辑列表。
- 左上角 `fixed` 定位的毛玻璃返回胶囊（滚动列表时保持固定可见）。
- 专辑过滤：仅 `collection` + `Album`，且 `trackCount > 7`（排除 EP）；按规范化标题去重 Deluxe / Expanded 等变体；列表行 hover 微缩放。

### 打分页（`/album/[collectionId]`）

- 左：分享卡预览（450px 宽）+「下载分享卡片」；右：评分、乐评、曲目列表，均为 `glass-panel` 卡片 + `font-mono` 小标签。
- 总分 = `整体 × 0.7 + ((制作 + 词曲) / 2) × 0.3`；乐评最多 **300 字**。
- 加载时从 Supabase 读取；无记录时分数初始为 0。
- 显式「保存评分 / 更新评分」主按钮（`bg-foreground`），保存成功后 Toast 提示。

### AI 聊天助理

- 全站右下角悬浮按钮，展开为毛玻璃风格聊天窗。
- 后端 [`/api/chat`](app/api/chat/route.ts) 调用 DeepSeek，流式输出回复。
- 内置工具 `get_my_top_albums`：按当前 `visitorId` 从 Supabase 查询用户评分，支持 `genre`、`limit` 参数。
- 查询结果 ≥ 2 张专辑时，聊天窗内可显示「一键生成榜单」，调用现有榜单 store 创建并跳转编辑页。
- 需配置 `DEEPSEEK_API_KEY`；用户须先在打分页保存过评分，助理才能查到数据。

### 我的榜单（`/lists`）

- `display-title` 标题 + `font-mono` 的 **COLLECTIONS** 小标签；新建按钮为白底主按钮。
- 新建时弹出毛玻璃容量选择弹窗，选择 **10张 / 20张 / 30张**（创建后不可改）。
- 榜单条目为 `glass-panel` 卡片（hover 微缩放），左侧 **封面堆叠**（前 3 张专辑；无专辑时音乐图标占位）。
- 副文案 `n / 容量 张专辑 · x 张榜`（`text-xs text-muted`）。
- 行内重命名；hover 编辑 / 删除（删除带滑出动画）。

### 榜单编辑（`/lists/[listId]`）

- 左：分享卡预览 +「导出榜单分享卡」；右：拖拽排序专辑列表。
- 预览补占位、`showScores={false}`；导出仅已添加专辑。

### 榜单分享卡（按容量）

配置见 [`lib/list-share-layout.ts`](lib/list-share-layout.ts)，深色 Mesh 主题；卡片底栏水印仍为 **Vibe Music Rating**。

| 容量 | 布局 | 画布 | 导出 PNG（2×） | 编辑页预览宽 |
| --- | --- | --- | --- | --- |
| 10 张 | Top1 大卡 + 3×3（2–10） | 540×1060 | 1080×2120 | 400px |
| 20 张 | 4×5，专名 + 艺人 + 可选分数 | 540×860 | 1080×1720 | 480px |
| 30 张 | 5×6，专名 + 艺人 + 排名 | 540×880 | 1080×1760 | 480px |

### 专辑分享卡

- 画布 **540×720**（12:16），导出 **1080×1440**；预览宽 **450px**。
- 文件名 `Vibe_Rating_{专辑名}.png`。

---

## iTunes 数据流

```
浏览器  →  /api/itunes?forward=...  →  itunes.apple.com
服务端  →  直连 itunes.apple.com（首页 prefetch 等）
```

- 客户端请求带重试与 429 退避；代理 `s-maxage=300`。
- 曲目 `previewUrl` 用于 30 秒试听片段。

---

## 部署

| 项 | 说明 |
| --- | --- |
| 平台 | Vercel，`npm run build` |
| 仓库 | [yajingzhang693-rgb/vibe-music](https://github.com/yajingzhang693-rgb/vibe-music) |
| 触发 | 推送到 `main` 自动部署 |
| 文档 | [DEPLOY.md](./DEPLOY.md) |

**环境变量（Vercel → Settings → Environment Variables）：**

- 评分同步：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`
- AI 助理：`DEEPSEEK_API_KEY`

未配置时，应用仍可部署运行，对应功能降级或不可用。

```bash
npm run build
git push
```

---

## 品牌与文案说明

| 位置 | 文案 |
| --- | --- |
| 发现页顶栏 | **Discurse** |
| 发现页 Marquee | TASTE, ARCHIVED |
| 发现页页脚中栏 | **Discurse**（右栏为「回到顶部」） |
| 专辑封面卡标签 | **VIBE** |
| 浏览器标签（`layout.tsx`） | Vibe Music Rating |
| 专辑 / 榜单分享卡底栏 | Vibe Music Rating |

---

## UI 规范（全站深色）

全站采用统一的设计系统（定义于 [`globals.css`](app/globals.css) `:root` 与 [`tailwind.config.ts`](tailwind.config.ts)），发现页 / 艺人页 / 打分页 / 我的榜单视觉语言一致。

**设计 Token（CSS 变量 → Tailwind 语义色）**

| Token | 值 | Tailwind 类 |
| --- | --- | --- |
| `--background` | `#0a0a0a` | `bg-background` |
| `--foreground` | `#ededed` | `text-foreground` |
| `--muted` | `#8a8a8f` | `text-muted` |
| `--surface` | `rgba(255,255,255,0.04)` | `bg-surface` |
| `--surface-elevated` | `rgba(255,255,255,0.06)` | `bg-surface-elevated` |
| `--border` | `rgba(255,255,255,0.1)` | `border-border` |
| `--radius` | `0.875rem` | `rounded-lg/xl/2xl` |
| `--album-theme-color` | 封面主色（动态） | 滑块 / hover 光晕 |

**字体**

- 正文与标题统一使用 **Geist Sans**（`geist/font/sans`，挂到 `font-sans`）。
- 标签、年份、版权等小字用 **Geist Mono**（`geist/font/mono`，挂到 `font-mono`），常配 `uppercase tracking-[0.2em]`。

**通用工具类**（`globals.css`）

- `.glass-panel`：毛玻璃面板基底（`--surface` 背景 + `--border` 描边 + `backdrop-blur(20px)`）。
- `.display-title`：大标题紧凑字距（`letter-spacing:-0.03em; line-height:0.95`）。
- `.hairline`：极细顶部分隔线 + 微高光（用于页脚版权行）。
- `shadow-soft` / `shadow-soft-lg`：柔和投影（含内高光），见 `tailwind.config.ts`。

**按钮 / 卡片范式**

- 主按钮（保存评分、新建榜单）：`bg-foreground text-background rounded-full` + `shadow-soft-lg`，hover 微缩放。
- 次级 / 返回按钮：`glass-panel rounded-full`，带返回箭头图标，hover `scale-[1.03]` + `border-white/25`。
- 卡片：`glass-panel rounded-2xl shadow-soft`，列表行 hover `scale-[1.01]`。

---

## 色彩工具（`lib/colors.ts`）

- `meshPaletteFromHex`：流体背景与分享卡 Mesh 色板。
- `relativeLuminance`、`contrastTextForBackground`：对比度适配。

---

## 环境要求

- Node.js 18+
- npm

---

## 已知限制

- 仅 iTunes，无 Spotify。
- 部分曲目无 `previewUrl`，无法试听。
- 无用户登录；访客 ID 存 localStorage，换浏览器后云端评分无法自动关联。
- 榜单仅存 localStorage，不跨设备同步。
- AI 助理依赖 DeepSeek API，需自行配置密钥；只能读取当前访客 ID 下的评分。
- 开发模式热更新可能导致 `.next` 损坏，需删除 `.next` 后重启 `npm run dev`。
- 国内访问 Vercel / Apple CDN / DeepSeek API 速度因网络而异。
