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

## 方式 B：GitHub + Vercel 自动部署（推荐长期）

1. 在 GitHub 新建空仓库（例如 `vibe-music`）。
2. 本地推送（将 `<user>` / `<repo>` 换成你的）：

```powershell
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

3. 打开 [vercel.com](https://vercel.com) → **Add New → Project** → 导入该仓库。
4. 保持默认：**Build** `npm run build`，**无需环境变量**。
5. 之后每次 `git push` 到 `main` 会自动重新部署。

若 CLI 已创建项目，可在 Vercel 项目 **Settings → Git** 中改为连接 GitHub 仓库。

## 自定义域名（可选）

Vercel 项目 → **Settings → Domains** → 添加域名并按提示配置 DNS（CNAME 到 Vercel）。

## 上线后检查

- 首页 `/` 精选专辑可加载
- `/api/itunes` 代理正常（搜索、艺人、专辑）
- `/lists` 榜单与分享卡导出

## 说明

- 评分与榜单数据在浏览器 **localStorage**，不跨设备同步。
- 无需 `.env` 即可运行。
