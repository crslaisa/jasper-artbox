---
name: kids-art-box
description: 给孩子做一个专属的"画作记忆盒"网页 App 并部署上线：拍照存画、孩子亲口讲故事的录音、自动记录时间地点、画廊翻看、晾衣绳画作墙，数据全存设备本地不上传。只要用户提到想保存/整理/记录孩子的画、想给娃做作品集、想留住孩子的涂鸦和童言童语、kids art gallery、宝宝画画存档等，即使没明说要"做个 App"，也应使用本技能。基于现成模板仓库，从零到上线约 10 分钟。
---

# Kids Art Box · 孩子的画作记忆盒

帮用户为自己的孩子生成一个手绘涂鸦风格的 PWA（网页 App），功能：拍照收录画作、录一段孩子自己讲画的语音故事、自动记下时间和地点、画廊筛选收藏、把最爱挂上"晾衣绳画作墙"、一键导出备份。照片和录音**只存在设备本地（IndexedDB），不经过任何服务器**——这一点对家长很重要，交付时要主动说明。

模板仓库：`https://github.com/crslaisa/jasper-artbox`（MIT 风格使用，Vite + React + TS + PWA，代码已把所有孩子相关信息收拢到一个配置文件）。

## 工作流程

### 第 1 步 · 问清三件事

开始前向用户确认（一次问完，别挤牙膏）：

1. **孩子的名字和年龄**（名字用于 App 标题、画作署名、语音故事标签；英文名中文名都可以）
2. **App 标题**：默认 `<名字>'s Art Box`；中文名建议形如 `小雨的画画盒`（侧边栏 logo 分两行显示，需要拆成上下两行）
3. **要不要部署上线**：
   - **上线（推荐）**：部署到用户自己的 GitHub Pages，免费 + 自动 HTTPS，iPad/手机随处可用。需要用户有 GitHub 账号（没有的话现场注册一个也就两分钟）
   - **先本地看看**：跳过部署，本地跑起来预览，之后随时可再部署

### 第 2 步 · 克隆模板并改配置

```bash
git clone --depth 1 https://github.com/crslaisa/jasper-artbox my-kids-artbox
cd my-kids-artbox/app
```

**只需要改一个文件：`app/src/config.ts`**。把里面的名字、年龄、标题换成用户孩子的：

```ts
export const APP = {
  childName: 'Mia',        // 孩子的名字
  childAge: 5,             // 年龄
  titleTop: "Mia's",       // 侧边栏 logo 第一行
  titleBottom: 'Art Box',  // 侧边栏 logo 第二行
  title: "Mia's Art Box",  // 浏览器标签页 + PWA 安装名
  shortName: 'Art Box',    // 主屏幕图标下的短名（≤12 字符）
  base: '/my-kids-artbox/', // 部署路径：'/<GitHub 仓库名>/'；纯本地预览用 '/'
}
```

标题、短名都支持中文。`base` 的规则：部署到 GitHub Pages 就填 `'/<仓库名>/'`（第 4 步建仓库时保持一致），只在本地跑就填 `'/'`。

### 第 3 步 · 本地跑起来给用户看

```bash
npm install
npm run dev
```

打开 `http://localhost:5173<base 路径>`，让用户确认名字和标题显示正确。空画廊有引导文案，属正常状态。如果国内网络 `npm install` 慢或超时，用 `npm install --registry=https://registry.npmmirror.com`。

**图标（可选加分项）**：`app/public/` 里的三个 PNG 是黄底白圈字母"J"的手绘风图标。如果孩子名字首字母不是 J，且当前环境有可用的图像生成手段（画布脚本、图像工具等），可以按同样风格（黄底 #FFC93C、白色圆圈、黑描边、首字母）重做三个尺寸：512、192、180（apple-touch-icon.png）。没有合适工具就保留默认图标，不影响任何功能，不要为此卡住流程。

### 第 4 步 · 部署上线（用户选择上线时）

完整步骤见 [references/deploy-github-pages.md](references/deploy-github-pages.md)。概要：

1. 清掉模板的 git 历史，重新 init：`rm -rf .git && git init -b main && git add -A && git commit`
2. 在用户的 GitHub 账号下建一个公开仓库（仓库名必须与 config.ts 的 `base` 一致）
3. push 后模板自带的 GitHub Actions workflow 会自动构建
4. 用 API 开通 Pages（`build_type: workflow`）——workflow 里没有自动开通，这步不能漏
5. 等 Actions 跑完，验证 `https://<用户名>.github.io/<仓库名>/` 返回 200

遇到报错先查 [references/troubleshooting.md](references/troubleshooting.md)（第一次部署失败重跑一次通常就好）。

### 第 5 步 · 交付

给用户一段清晰的交付说明，包含：

1. **线上地址**（或本地地址）
2. **iPad/手机安装**：Safari 打开地址 → 分享按钮 → "添加到主屏幕" → 以后固定从主屏幕图标打开（数据存在这个"app"里，别混用 Safari 打开，否则看到的是两份独立数据）
3. **首次权限**：第一次拍照/录音/定位会弹系统权限请求，选允许
4. **隐私与备份**：照片录音只存设备本地、不上云；侧边栏底部 **Backup** 按钮导出 zip 备份包（建议存到 iCloud/网盘，隔段时间备份一次），**Restore** 可在新设备恢复

## 注意事项

- 相机和麦克风 API 要求 HTTPS（或 localhost），所以"发给家人用"必须走部署，不能发 IP 地址
- 不要往模板里加登录、云存储、统计等功能，除非用户明确要求——本地优先、零账号是这个 App 的卖点
- 用户如果想改配色/字体/墙的样式，主题变量集中在 `app/src/theme.css` 的 `:root` 里
