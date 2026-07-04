# Jasper's Art Box

*创建：2026-07-04*

给 Jasper（6 岁）存画画照片的 app：拍下画作、录一段孩子自己讲的故事、自动记下时间地点；画廊翻看、收藏、把最爱挂上"画作墙"（晾衣绳样式）。

- **线上地址**：https://crslaisa.github.io/jasper-artbox/
- **GitHub 仓库**：https://github.com/crslaisa/jasper-artbox （push 到 main 自动部署）
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
- 部署：`.github\workflows\deploy.yml`，push main → Actions 构建 → GitHub Pages

## 下一版想法

- 画作墙的另外两种样式（拼贴簿、冰箱贴）
- 手机竖屏布局细化（设计稿有手机版）
- 云同步（若哪天需要多设备）

## 进度

- 2026-07-04 建项目、同步设计稿、实现 v1（四界面 + 备份 + PWA）、部署上线
