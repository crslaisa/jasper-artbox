# 常见问题排查

## 构建 / 部署

**`npm install` 卡住或超时（国内网络常见）**
用国内镜像：`npm install --registry=https://registry.npmmirror.com`

**Actions 第一次部署失败：deploy 步骤报 "Deployment failed, try again later"**
Pages 站点刚开通、GitHub 后台还在初始化。等 30 秒重跑一次 workflow 就好。这是最常见的失败，先重跑再排查别的。

**Actions 里 configure-pages 步骤失败（"Get Pages site failed"）**
Pages 没开通。回去执行部署文档第 3 步的开通 API（`build_type: workflow`）。

**打开线上地址是 404**
- 刚部署完等 1–2 分钟再刷新
- 检查 `config.ts` 的 `base` 是否和仓库名完全一致（含大小写、两侧斜杠）

**页面打开了但一片空白 / 资源 404**
几乎都是 `base` 配错。改 `config.ts` 的 `base` → commit → push → 等重新部署。

## iPad / 手机使用

**拍照或录音时没有弹权限、按钮没反应**
- 必须用 HTTPS 地址（GitHub Pages 自带）或 localhost，用局域网 IP 打开时浏览器会直接禁用相机麦克风
- iOS 之前拒绝过权限的话：设置 → Safari（或该 App 名）→ 允许相机/麦克风

**"添加到主屏幕"后打开是旧版本**
PWA 自动更新在下次冷启动生效；彻底不更新时，删掉主屏幕图标重新添加（注意：删除图标前先用 Backup 导出数据——见下条）。

**数据会丢吗？**
数据存在浏览器的 IndexedDB 里，正常使用不会丢，但"删除主屏幕 App"或系统清理存储可能带走数据。所以：
1. 固定从主屏幕图标打开（Safari 和主屏幕 App 是两份独立数据，混用会觉得"画不见了"）
2. 隔段时间点侧边栏的 **Backup**，把 zip 存到 iCloud/网盘
3. 换设备用 **Restore** 导入备份包即可

**定位拿不到 / 地点是空的**
正常降级行为：用户拒绝定位或超时后，地点栏留空可手动输入，不影响保存。

## 其他定制

**想改配色**：`app/src/theme.css` 顶部 `:root` 变量（黄 #FFC93C、珊瑚红 #FF6B4A、蓝 #4FB0E8、绿 #6BBF59）
**想改字体**：`app/index.html` 里的 Google Fonts 链接 + `theme.css` 的 `--marker` / `--hand`；中文可换成手写风格如 "Ma Shan Zheng"
**多个孩子**：最省事的做法是每个孩子部署一个仓库（改 config 换名字再走一遍部署），数据天然隔离
