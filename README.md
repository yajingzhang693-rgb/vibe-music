# Vibe Music Rating

极简沉浸式音乐专辑评分与分享应用。用户可浏览精选专辑、搜索艺人、为专辑打分写评，并导出 12:16 竖版分享卡片 PNG。数据来自 Apple iTunes Search / Lookup API。

---

## 技术栈


| 类别  | 选型                                       |
| --- | ---------------------------------------- |
| 框架  | Next.js 14（App Router）+ TypeScript       |
| 样式  | Tailwind CSS                             |
| 状态  | Zustand（打分数据）+ TanStack Query（iTunes 请求） |
| 动画  | Framer Motion                            |
| 取色  | fast-average-color（封面主色）                 |
| 导出  | html-to-image（分享卡 PNG）                   |
| 持久化 | localStorage                             |


---

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开终端显示的地址（一般为 [http://localhost:3000](http://localhost:3000)）。

**若页面空白、500 或 chunk 找不到：**

1. 只保留 **一个** `npm run dev` 终端。
2. 清缓存后重启：

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

1. 浏览器 **Ctrl+F5** 硬刷新，确认端口与终端一致。

生产构建：

```bash
npm run build
npm start
```

---

## 路由与页面


| 路径                      | 说明                                 |
| ----------------------- | ---------------------------------- |
| `/`                     | **发现页**：8 张精选专辑网格 + 艺人搜索           |
| `/artist/[artistId]`    | **艺人页**：艺人信息 + 专辑列表（去重、过滤 EP）      |
| `/album/[collectionId]` | **打分交互页**：评分、乐评、曲目试听、分享卡预览与导出      |
| `/lists`                | **我的榜单**：创建、查看、删除榜单列表              |
| `/lists/[listId]`       | **榜单编辑**：重命名、拖拽排序、移除、榜单分享卡导出       |
| `/api/itunes`           | iTunes API 代理（客户端经 `?forward=` 转发） |


---

## 目录结构

```
app/                    # App Router 页面与 API
  page.tsx              # 发现页（服务端 prefetch 精选专辑）
  artist/[artistId]/
  album/[collectionId]/
  api/itunes/route.ts   # iTunes 代理
components/
  discovery-page.tsx    # 发现页 UI
  artist-page.tsx       # 艺人页 UI
  album-rater-page.tsx  # 打分交互页（核心）
  share-card.tsx        # 分享卡 DOM（预览 + 导出同源）
  fluid-mesh-background.tsx
  export-card-button.tsx
  preview-play-button.tsx
  album-cover.tsx
hooks/
  use-album-colors.ts   # 封面主色提取
  use-track-preview.ts  # 试听播放（HTMLAudioElement）
lib/
  itunes.ts             # iTunes 请求、专辑过滤与去重
  scoring.ts            # 总分公式
  colors.ts             # 明度、对比色、Mesh 色板
  constants.ts          # 精选 ID、分享卡尺寸、字数上限等
  storage.ts            # localStorage 读写
store/
  use-rating-store.ts   # 打分 Zustand store
```

---

## 核心功能

### 发现页（`/`）

- 展示 **8 张精选专辑**（`FEATURED_COLLECTION_IDS`，见 `lib/constants.ts`）。
- 艺人搜索：输入后 Enter 或点击搜索，跳转艺人页。
- 搜索框为 `type="text"`，无浏览器默认清除按钮。
- 专辑封面 hover 时有主题色光晕与轻微缩放。

### 艺人页（`/artist/[artistId]`）

- 拉取艺人信息与专辑列表。
- **专辑过滤**：仅 `collection` + `Album`，且 `trackCount > 7`（排除 EP）。
- **去重**：按规范化标题合并 Deluxe / Expanded 等变体条目。

### 打分交互页（`/album/[collectionId]`）

**布局**

- 左侧：分享卡预览（450px 宽，12:16）+「下载分享卡片」毛玻璃按钮（间距 48px）。
- 右侧：专辑信息、评分控件、乐评、曲目列表（独立滚动）。
- 全页 **流体 Mesh 背景**（专辑主色 + Framer Motion 缓慢位移）。
- 顶栏：「返回」毛玻璃按钮 + 试听播放按钮。

**评分**

- **整体分数（70%）**：数字输入框，滚轮 ±0.1、前导零清理、支持 `0.` 中间态、范围 0–10、最多一位小数。
- **制作 Production（15%）**、**词曲 Songwriting（15%）**：滑块 0–10。
- **最后总分** = `整体 × 0.7 + ((制作 + 词曲) / 2) × 0.3`，保留一位小数。

**乐评**

- 选填，最多 **300 字**，写入分享卡预览并随 PNG 导出。

**试听联动**

- 右上角播放：播放曲目列表中第一首有 `previewUrl` 的歌。
- 曲目列表可点击切换试听；无试听时 Toast「暂无试听」。
- 播放时左侧分享卡下方 **环境光晕** 呼吸动画（opacity / blur / scale），不缩放卡片本体以免文字发糊。

**持久化**

- 每张专辑评分存于 `localStorage`，键名 `vibe-rating-{collectionId}`。

### 我的榜单（My Lists）

- 榜单数据存于 `localStorage` 键名 `vibe-music-lists`；创建时选择容量 **10 / 20 / 30** 张（创建后不可改），同榜不重复。
- **我的榜单**页：「新建我的榜单」→ 选容量 → 生成「未命名榜单」并进入行内重命名；列表卡片 hover 显示编辑/删除。
- 发现页 / 艺人页 / 打分页 **「+」** → Popover 选已有榜或新建（同样需选 10/20/30）并加入。
- 榜单分享卡（按容量三套排版，Vibe Mesh 深色主题）：
  - **10 张**：Top1 大卡 + 3×3（2–10），画布 540×1060
  - **20 张**：4×5，封面下专辑名 + 艺人 + 分数角标，画布 540×860
  - **30 张**：5×6，封面 + 排名 + 专辑名 + 艺人，画布 540×880
  - 仅渲染已添加专辑（不补空位）；导出 PNG 画布尺寸见上，**pixelRatio 均为 2**（如 20 张为 1080×1720）。

### 分享卡（`components/share-card.tsx`）

**画布**

- DOM 尺寸：**540 × 720**（12:16）。
- 导出 2×：**1080 × 1440** PNG。
- 预览通过 CSS `scale` 缩至 **450px** 宽显示。

**视觉**

- 背景：封面铺满 + `blur(76px)` + 黑色遮罩（遮罩强度随制作/词曲滑块微调）。
- 1px、30% 透明度白色描边。
- 左上大封面（224×224）、右上大号分数、专辑名/艺人/乐评、底部水印。

**导出**

- `html-to-image` 对 `#share-card` 节点截图，文件名 `Vibe_Rating_{专辑名}.png`。

---

## iTunes 数据流

```
浏览器  →  /api/itunes?forward=...  →  itunes.apple.com
服务端  →  直连 itunes.apple.com（prefetch 等）
```

- 客户端请求带重试与 429 退避（`lib/itunes.ts`）。
- 曲目列表：`lookup?id={collectionId}&entity=song`，使用 `previewUrl` 试听。

---

## UI 规范（打分页）

- 卡片/输入框等描边：**30% 透明度白色**（`border-white/30`）。
- 布局分割线（顶栏底、左右栏分界）：**5%**（`border-white/5`），保持不变。
- 下载/返回等按钮：**毛玻璃**（`bg-white/10` + `backdrop-blur-xl`），非专辑主色实心底。
- 分享卡下载按钮文字：固定白色（不再随主色切换黑/白）。

---

## 色彩工具（`lib/colors.ts`）

- `relativeLuminance`：WCAG 相对明度。
- `contrastTextForBackground`：深底白字 / 浅底黑字（用于需对比度适配的场景）。
- `meshPaletteFromHex`：流体背景与 Mesh 渐变色板。

---

## 环境要求

- Node.js 18+
- npm

---

## 已知限制

- 仅 iTunes 数据，无 Spotify。
- 试听依赖 Apple 提供的 `previewUrl`，部分曲目可能无试听。
- 开发模式下频繁热更新可能导致 `.next` 缓存损坏，需按上文步骤清理重启。

