# 部署说明（Vercel）

## 当前线上地址

- **Production**: https://vibe-music-nu.vercel.app
- **Vercel 项目**: `pikowa-s-projects/vibe-music`

## 本地构建（部署前）

```powershell
npm install
npm run build
```

## 方式 A：CLI 直接部署（已配置）

需已登录 Vercel CLI（`npx vercel login`）。

```powershell
npx vercel deploy --prod --yes
```

## 方式 B：GitHub + Vercel 自动部署（已配置）

- **仓库**：https://github.com/yajingzhang693-rgb/vibe-music
- **`main` 分支 `git push` 后自动构建部署**

若需在新环境克隆：

```powershell
git clone https://github.com/yajingzhang693-rgb/vibe-music.git
cd vibe-music
npm install
```

Vercel 项目 **Settings → Git** 应已连接上述仓库；构建命令 `npm run build`，无需环境变量。

## 自定义域名（可选）

Vercel 项目 → **Settings → Domains** → 添加域名并按提示配置 DNS（CNAME 到 Vercel）。

## 上线后检查

- 首页 `/` 精选专辑可加载
- `/api/itunes` 代理正常（搜索、艺人、专辑）
- `/lists` 榜单与分享卡导出

## 说明

- 评分与榜单数据在浏览器 **localStorage**，不跨设备同步。
- 无需 `.env` 即可运行。
