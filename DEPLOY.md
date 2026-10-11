# dr0wsblog 部署指南

本仓库基于 [Firefly](https://github.com/Cuteleaf/Firefly) Astro 主题搭建，已配置为通过 **GitHub Actions 自动部署到 GitHub Pages**。

## 一、站点信息

| 项目 | 值 |
| --- | --- |
| 仓库 | https://github.com/Drows233/dr0wsblog |
| 线上地址 | https://drows233.github.io/dr0wsblog/ |
| 构建产物 | `dist/` |
| 部署分支 | `master` |

## 二、一次性配置（GitHub 网页端）

> 只需操作一次。

1. 打开仓库 **Settings → Pages**
2. **Build and deployment → Source** 选择 **GitHub Actions**（不要选 "Deploy from a branch"）
3. 保存即可

之后每次 `git push` 到 `master`，会自动触发 `.github/workflows/deploy.yml` 完成构建与部署。

## 三、日常发布流程

```bash
# 1. 写文章（在 Firefly/ 目录下）
pnpm new-post          # 生成新文章草稿

# 2. 本地预览
pnpm dev               # http://localhost:4321

# 3. 提交并推送，自动部署
git add -A
git commit -m "post: 新文章标题"
git push origin master
```

推送后可在仓库 **Actions** 标签页查看部署进度，完成后访问
https://drows233.github.io/dr0wsblog/

## 四、本地构建（与 CI 一致）

```bash
cd Firefly
pnpm install
pnpm build             # 产出 dist/
pnpm preview           # 预览构建结果
```

## 五、关键配置说明

### 1. 子路径（base）

项目部署在 `https://<user>.github.io/<repo>/` 子路径下，因此构建时需要注入 base：

- `astro.config.mjs` 读取环境变量 `GH_PAGES_BASE`（默认 `/`）
- `deploy.yml` 在构建步骤注入 `GH_PAGES_BASE: /${{ github.event.repository.name }}`
- 本地如需模拟子路径构建：
  ```bash
  GH_PAGES_BASE=/dr0wsblog pnpm build
  ```

### 2. 站点 URL

`src/config/siteConfig.ts` 中的 `site_url` 已设置为：
```
https://drows233.github.io/dr0wsblog
```

> 若日后绑定了自定义域名，需同步修改 `site_url`，并去掉子路径。

### 3. 字体

为避免构建时依赖 jsDelivr CDN，`src/config/fontConfig.ts` 中的
Zen Maru Gothic / Inter / JetBrains Mono 已改为 **local provider**，
直接引用 `node_modules/@fontsource/*` 中的 woff2 文件，
保证离线与 CI 环境都能稳定构建。

### 4. 站点信息

- `src/config/siteConfig.ts` — 标题、副标题、描述、关键词
- `src/config/profileConfig.ts` — 头像、昵称、签名、社交链接

## 六、常见问题

**Q: 部署后页面白屏 / 静态资源 404？**
A: 通常是 base 配置问题。确认仓库是「项目仓库」（地址含 `/dr0wsblog`），
并且 `deploy.yml` 构建时注入了 `GH_PAGES_BASE`。

**Q: Actions 构建失败在字体的 `CannotFetchFontFile`？**
A: 说明字体仍走 CDN。检查 `fontConfig.ts` 中三个字体是否为 `provider: "local"`。

**Q: 想换自定义域名？**
A: 在 `public/` 放置 `CNAME` 文件写入域名；同时把 `site_url` 改为域名，
并把 `astro.config.mjs` 的 `base` 恢复为 `/`（不再注入 `GH_PAGES_BASE`）。
