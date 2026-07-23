# Jasper's Art Box

*创建：2026-07-04*

给 Jasper（6 岁）存画画照片的 app：拍下画作、录一段孩子自己讲的故事、自动记下时间地点；画廊翻看、收藏、把最爱挂上"画作墙"（晾衣绳样式）。

- **线上地址**：https://crslaisa-1449771562.cos.ap-guangzhou.myqcloud.com/jasper-artbox/index.html（注意结尾必须带 `index.html`，见下方「托管迁移」；2026-07 起从 GitHub Pages 迁移到腾讯云 COS）
- **GitHub 仓库**：https://github.com/crslaisa/jasper-artbox （push 到 main 自动部署，仓库计划转 private）
- **技术**：Vite + React + TS 的 PWA，数据存设备本地（IndexedDB），零账号零后端

## iPad 安装（一次性）

1. iPad 上用 **Safari** 打开线上地址
2. 点分享按钮 → **添加到主屏幕**
3. 以后固定从主屏幕图标打开（数据存在这个"app"里，别混用 Safari 打开）
4. 第一次拍照/录音/定位时会弹权限请求，都选允许

## 数据与备份

- 所有照片和录音只存在 iPad 本地，不上传任何服务器
- 侧边栏底部 **Backup** 按钮：导出 zip 备份包（照片+录音+信息），存到 iCloud 云盘；**Restore** 导入恢复
- 建议每隔一阵子备份一次——设备丢了/换了全靠它

## 开发

```
cd app
npm install
npm run dev     # 本地开发（http://localhost:5173/jasper-artbox/）
npm run build   # 产线构建
```

- 设计稿：`design\My Art Box - iPad.dc.html`（Claude Design 项目 "Kids Painting Memory App"，[在线链接](https://claude.ai/design/p/3e194f59-76ef-4c99-aa6d-ae6377b7d8cc?file=My+Art+Box+-+iPad.dc.html&via=share)）
- 部署：`.github\workflows\deploy.yml`，push main → Actions 构建 → 上传到腾讯云 COS（`upload_to_cos.py`）

## 托管迁移（GitHub Pages → 腾讯云 COS）

仓库源码里有 Jasper 的真实姓名/年龄（`app/src/config.ts`），公开仓库任何人可见，出于隐私把托管迁到了腾讯云 COS（复用 `01 table-tennis-calendar` 项目同一个 bucket `crslaisa-1449771562`，`jasper-artbox/` 子路径，互不干扰）。迁移后计划把本仓库设为 private——GitHub 免费账号的 private 仓库不能跑 GitHub Pages，所以必须先切换托管，否则会先断线上服务。

**PWA 数据是按域名隔离的**，换域名后 iPad 上旧的 IndexedDB 照片默认不可见，迁移必须做：旧地址 Backup 导出 → 新地址 Safari 打开、添加到主屏幕、Restore 导入 → 确认拍照/录音权限正常 → 删除指向旧 `crslaisa.github.io` 地址的旧主屏幕图标。

**必须带 `index.html`**：腾讯云 COS 的默认域名不会像 GitHub Pages 那样自动把目录地址解析成首页——COS 有"静态网站"功能能做到这点，但境内节点开启需要 ICP 备案（`01 table-tennis-calendar` 项目当初也踩过这个坑），所以没走这条路。首次打开、iPad 添加到主屏幕，都要用带 `index.html` 的完整地址；`vite.config.ts` 里手动把 PWA manifest 的 `start_url` 也锁定成这个完整路径，避免主屏幕图标重新启动时 404。**一旦 Service Worker 装上后，站内导航会自动兜底到缓存的 index.html**，不受这个限制——只有"最初那一次冷启动"必须用完整地址。

GitHub Actions 需要 4 个 repo secret（Settings → Secrets and variables → Actions）：`TENCENT_SECRET_ID`、`TENCENT_SECRET_KEY`、`TENCENT_BUCKET`（`crslaisa-1449771562`）、`TENCENT_REGION`（`ap-guangzhou`）。**没有复用乒乓日历项目的密钥**——腾讯云和 GitHub 的密钥都是"创建时只显示一次、之后无法查看"，旧密钥值已经拿不回来了，所以新建了一个专用子账号 `github-actions-deploy2`，只授权 `QcloudCOSFullAccess`（仅 COS 权限，不是主账号完整权限）。

## 下一版想法

- 画作墙的另外两种样式（拼贴簿、冰箱贴）
- 手机竖屏布局细化（设计稿有手机版）
- 云同步（若哪天需要多设备）

## 进度

- 2026-07-04 建项目、同步设计稿、实现 v1（四界面 + 备份 + PWA）、部署上线（GitHub Pages）
- 2026-07-10 出于隐私考虑，托管迁移到腾讯云 COS（新建专用子账号密钥），验证线上可用；待办：iPad 上 Backup 旧数据 → 装新地址 → Restore，然后仓库转 private
