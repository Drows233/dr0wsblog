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

### 1. 解除 Fork 关系（重要！）

本仓库是从 `CuteLeaf/Firefly` fork 而来，**GitHub 默认禁用 fork 仓库的 Actions**，
这是导致推送后工作流不触发、线上 404 的根本原因。

**Settings → General → 拉到最底部 Danger Zone → Leave fork network**

> 该操作非破坏性：保留全部提交历史。但不可逆（无法再连回 fork 网络）。

### 2. 启用 GitHub Actions

**Settings → Actions → General → Actions permissions**
选择 **Allow all actions and reusable workflows** → Save

### 3. 启用 GitHub Pages

**Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**

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

> ⚠️ **版本必须固定（不要用 `^`）**：pnpm 11 默认开启 `minimumReleaseAge = 1 天`
> 供应链策略，会拒绝安装「发布不足 24 小时」的包，导致 CI 报
> `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`。因此这三个字体在 `package.json`
> 中均固定为确切版本（如 `5.3.0`），升级前请确认目标版本已发布超过一天。

### 4. 站点信息

- `src/config/siteConfig.ts` — 标题、副标题、描述、关键词
- `src/config/profileConfig.ts` — 头像、昵称、签名、社交链接

## 六、常见问题

**Q: 推送后线上 404，Actions 里一条运行记录都没有？**
A: 最典型的原因是**仓库是 fork，Actions 被 GitHub 默认禁用**。
去 Settings → General → Danger Zone → Leave fork network 解除 fork，
再到 Settings → Actions → General 选择 Allow all actions，然后重新 push 一次。
可用 API 自查：`curl https://api.github.com/repos/<user>/<repo>` 看 `"fork"` 字段。

**Q: 部署后页面白屏 / 静态资源 404？**
A: 通常是 base 配置问题。确认仓库是「项目仓库」（地址含 `/dr0wsblog`），
并且 `deploy.yml` 构建时注入了 `GH_PAGES_BASE`。

**Q: Actions 构建失败在字体的 `CannotFetchFontFile`？**
A: 说明字体仍走 CDN。检查 `fontConfig.ts` 中三个字体是否为 `provider: "local"`。

**Q: CI 在 Install dependencies 报 `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`？**
A: pnpm 11 默认拒绝安装发布不足 24 小时的包。把 `package.json` 里对应的
`@fontsource/*` 等依赖降到「发布超过一天」的版本，然后本地执行
`pnpm install --lockfile-only` 重新生成 `pnpm-lock.yaml` 再提交。
（不要用 `^` 范围，否则每次解析都可能踩到刚发布的新版本。）

**Q: 部署成功了，但打开页面白屏、CSS/图片 404？**
A: 多半是 GitHub Pages CDN 正在传播，`_astro/` 目录下的资源会稍晚生效，
**等 1～2 分钟**再刷新即可。判断方法：`_astro/xxx.css` 与 `pagefind/pagefind.js`
都应返回 200。

**Q: 想换自定义域名？**
A: 在 `public/` 放置 `CNAME` 文件写入域名；同时把 `site_url` 改为域名，
并把 `astro.config.mjs` 的 `base` 恢复为 `/`（不再注入 `GH_PAGES_BASE`）。

