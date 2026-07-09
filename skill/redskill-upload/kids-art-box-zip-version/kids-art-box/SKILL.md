---
name: kids-art-box
description: 给孩子做一个专属的"画作记忆盒"网页 App：拍照存画、孩子亲口讲故事的录音、自动记录时间地点、画廊翻看、晾衣绳画作墙，数据全存设备本地不上传。App 完整源代码打包在本技能自带的 app-source.zip 里，不需要访问任何外部网址或代码仓库，从零到本地可用约 5 分钟。只要用户提到想保存/整理/记录孩子的画、想给娃做作品集、想留住孩子的涂鸦和童言童语、kids art gallery、宝宝画画存档等，即使没明说要"做个 App"，也应使用本技能。
---

# Kids Art Box · 孩子的画作记忆盒

帮用户为自己的孩子生成一个手绘涂鸦风格的 PWA（网页 App），功能：拍照收录画作、录一段孩子自己讲画的语音故事、自动记下时间和地点、画廊筛选收藏、把最爱挂上"晾衣绳画作墙"、一键导出备份。照片和录音**只存在设备本地（IndexedDB），不经过任何服务器**——这一点对家长很重要，交付时要主动说明。

**完整源代码就在本技能自带的 `app-source.zip` 里**，不依赖任何外部代码仓库或下载链接。

## 工作流程

### 第 1 步 · 问清两件事

开始前向用户确认（一次问完，别挤牙膏）：

1. **孩子的名字和年龄**（名字用于 App 标题、画作署名、语音故事标签；英文名中文名都可以）
2. **App 标题**：默认 `<名字>'s Art Box`；中文名建议形如 `小雨的画画盒`（侧边栏 logo 分两行显示，需要拆成上下两行）

### 第 2 步 · 解压模板

在用户电脑上新建一个项目文件夹（比如 `<孩子名字>-art-box`），把本技能同目录下的 `app-source.zip` 解压到这个文件夹的 `app/` 子目录里——**不要用 git clone，也不要访问任何网址**，直接解压这个压缩包就行。

解压后的目录结构：

```
<项目文件夹>/
└── app/
    ├── index.html
    ├── package.json / package-lock.json
    ├── vite.config.ts
    ├── tsconfig*.json
    ├── .oxlintrc.json
    ├── .gitignore
    ├── public/（图标）
    └── src/
        ├── main.tsx / App.tsx / config.ts / db.ts / nav.ts / theme.css
        ├── components/（Sidebar / PaintingCard / Waveform）
        ├── screens/（Gallery / Capture / Detail / Wall）
        └── lib/（audio / backup / geo / image / ui）
```

解压出来还有一个 `optional-github-actions-deploy.yml`，这是可选的部署配置，只有用户明确要部署到 GitHub Pages 时才用得上（见第 4 步），平时忽略即可。

**编辑 `app/src/config.ts`**，把 `childName`／`childAge`／`titleTop`／`titleBottom`／`title` 换成第 1 步问到的真实信息（原文件里是占位示例值）。`base` 字段保持 `'/'` 不用改，除非用户明确要部署到某个子路径。其余文件不用动。

### 第 3 步 · 本地跑起来给用户看

```bash
cd <项目文件夹>/app
npm install
npm run dev
```

打开终端里显示的地址（通常是 `http://localhost:5173/`；如果被占用会自动换端口，看终端实际打印的地址），确认名字和标题显示正确。空画廊有引导文案，属正常状态。如果 `npm install` 慢或超时，换成国内镜像源重试。

浏览器里可以直接试用拍照、录音、画廊筛选、备份导出这些功能——本地运行完全够用，交付给家长看不需要额外部署。

### 第 4 步 · 交付

告诉用户：

1. **本地地址**：`http://localhost:5173/`，以后要用就在这个项目文件夹里 `npm run dev` 重新启动
2. **隐私**：照片录音只存这台设备的浏览器里，不上传到任何地方
3. **备份**：侧边栏底部 **Backup** 按钮导出 zip 备份包，**Restore** 可以在同一台设备恢复；建议隔一阵子备份一次

### （可选）想在手机/平板上单独使用

拍照和录音功能需要网页运行在 HTTPS 环境下（或本机 `localhost`），要在手机/平板上脱离电脑单独使用，需要把 `npm run build` 生成的 `app/dist/` 部署到一个支持 HTTPS 的静态网页托管服务上——不限定用哪一个，用户已有账号的任何平台都可以。这一步不是必需的，先把本地版本做好、让家长满意就是完整交付；用户如果确定要部署到 GitHub Pages，压缩包里的 `optional-github-actions-deploy.yml` 是现成的自动构建配置（放到项目的 `.github/workflows/deploy.yml`），其余步骤请 AI 助手根据用户当时的账号情况现场处理。

## 注意事项

- 相机和麦克风 API 要求 HTTPS 或 localhost，本地开发用 `npm run dev` 天然满足
- 不要往模板里加登录、云存储、统计等功能，除非用户明确要求——本地优先、零账号是这个 App 的卖点
- 用户如果想改配色/字体/墙的样式，主题变量集中在 `app/src/theme.css` 的 `:root` 里

## 常见问题排查

- `npm install` 卡住或超时：换用国内镜像源重试
- 页面打开是空白 / 报错：检查 `app/src/config.ts` 是否原样保留了 `base: '/'`（除非确实需要部署到子路径）
- 拍照或录音没反应：确认是通过 `npm run dev` 用 `http://localhost:...` 打开的，不是通过局域网 IP（如 `192.168.x.x`）访问——非 localhost 的 HTTP 地址浏览器会禁用摄像头/麦克风
- 定位拿不到 / 地点是空的：正常降级行为，用户拒绝定位或超时后地点栏留空可手动输入，不影响保存
- 多个孩子：给每个孩子建一个独立的项目文件夹（重复第 2、3 步，换一次 `config.ts` 里的名字），数据天然隔离，互不影响
