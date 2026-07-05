---
name: kids-art-box
description: 给孩子做一个专属的"画作记忆盒"网页 App 并部署上线：拍照存画、孩子亲口讲故事的录音、自动记录时间地点、画廊翻看、晾衣绳画作墙，数据全存设备本地不上传。只要用户提到想保存/整理/记录孩子的画、想给娃做作品集、想留住孩子的涂鸦和童言童语、kids art gallery、宝宝画画存档等，即使没明说要"做个 App"，也应使用本技能。基于现成模板仓库，从零到上线约 10 分钟。
---

# Kids Art Box · 孩子的画作记忆盒

> ⚠️ **发布者请注意（使用这份技能的人可以忽略这一块）**：本文全部 `<TEMPLATE_REPO_URL>` 需要在发布前替换成一个真实的模板仓库地址（形如 `https://github.com/<账号>/<仓库名>`）。建议专门建一个和你个人身份不强关联的账号/仓库来存放模板代码，再把地址填进来，这样分享出去之后大家看到的只是一个干净的模板仓库，不会牵出你的其他项目。替换完成后删除这一整段提示。

帮用户为自己的孩子生成一个手绘涂鸦风格的 PWA（网页 App），功能：拍照收录画作、录一段孩子自己讲画的语音故事、自动记下时间和地点、画廊筛选收藏、把最爱挂上"晾衣绳画作墙"、一键导出备份。照片和录音**只存在设备本地（IndexedDB），不经过任何服务器**——这一点对家长很重要，交付时要主动说明。

模板仓库：`<TEMPLATE_REPO_URL>`（Vite + React + TS + PWA，代码已把所有孩子相关信息收拢到一个配置文件，可自由使用）。

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
git clone --depth 1 <TEMPLATE_REPO_URL> my-kids-artbox
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

打开终端里显示的地址（通常是 `http://localhost:5173<base 路径>`；如果 5173 被占用，vite 会自动换成 5174 等端口，一定要看终端实际打印的地址，不要死记 5173），让用户确认名字和标题显示正确。空画廊有引导文案，属正常状态。如果国内网络 `npm install` 慢或超时，用 `npm install --registry=https://registry.npmmirror.com`。

**图标（可选加分项）**：`app/public/` 里的三个 PNG 是黄底白圈字母首字母的手绘风图标。如果孩子名字首字母不同，且当前环境有可用的图像生成手段（画布脚本、图像工具等），可以按同样风格（黄底 #FFC93C、白色圆圈、黑描边、首字母）重做三个尺寸：512、192、180（apple-touch-icon.png）。没有合适工具就保留默认图标，不影响任何功能，不要为此卡住流程。

### 第 4 步 · 部署上线（用户选择上线时）

前提：`config.ts` 已改好，`base` 与将要创建的仓库名一致（如仓库叫 `mia-artbox`，base 就是 `'/mia-artbox/'`）。下文假设仓库名为 `mia-artbox`、GitHub 用户名为 `USERNAME`，按实际替换。

**1. 重置 git 历史**（模板克隆下来带着原作者的历史，先清掉）：

```bash
cd my-kids-artbox
rm -rf .git        # Windows PowerShell: Remove-Item -Recurse -Force .git
git init -b main
git add -A
git commit -m "Mia's Art Box - initial"
```

**2. 创建 GitHub 仓库**，按环境选一条路，从上往下优先：

- **A. 有 gh CLI 且已登录**（`gh auth status` 验证）：
  ```bash
  gh repo create USERNAME/mia-artbox --public --source . --push
  ```

- **B. 没有 gh，但 git 推送凭据可用**（之前 push 过 GitHub）：让用户在浏览器打开 `https://github.com/new`，仓库名填 `mia-artbox`，Public，什么都不勾，点 Create。然后：
  ```bash
  git remote add origin https://github.com/USERNAME/mia-artbox
  git push -u origin main
  ```

- **C. 全新环境（无 gh、无凭据）**：用 GitHub 设备码授权，全程用户只需在浏览器输一个码：
  ```bash
  # 申请设备码（178c6fc778ccc68e1d6a 是 GitHub CLI 的公开 client_id）
  curl -s -X POST https://github.com/login/device/code \
    -H "Accept: application/json" \
    -d "client_id=178c6fc778ccc68e1d6a&scope=repo workflow"
  ```
  把返回的 `user_code` 给用户，请 TA 打开 `https://github.com/login/device` 输入并授权。然后每 5 秒轮询一次直到拿到 token：
  ```bash
  curl -s -X POST https://github.com/login/oauth/access_token \
    -H "Accept: application/json" \
    -d "client_id=178c6fc778ccc68e1d6a&device_code=<DEVICE_CODE>&grant_type=urn:ietf:params:oauth:grant-type:device_code"
  ```
  拿到 `access_token` 后（**不要把 token 展示给用户或写进任何会提交的文件**）：
  ```bash
  curl -s -X POST https://api.github.com/user/repos \
    -H "Authorization: token <TOKEN>" -H "Accept: application/vnd.github+json" \
    -d '{"name":"mia-artbox"}'
  git remote add origin https://github.com/USERNAME/mia-artbox
  git push -u origin main   # 提示输密码时用 token 作为密码
  ```

**3. 开通 GitHub Pages（不能漏）**：模板的 workflow 只负责构建和部署，**Pages 站点本身要先开通**，否则部署步骤会失败：

```bash
# gh 版
gh api repos/USERNAME/mia-artbox/pages -f build_type=workflow
# curl 版
curl -s -X POST https://api.github.com/repos/USERNAME/mia-artbox/pages \
  -H "Authorization: token <TOKEN>" -H "Accept: application/vnd.github+json" \
  -d '{"build_type":"workflow"}'
```

已经存在（409 报错）说明开过了，继续即可。

**4. 等构建、验证**：看 Actions（`https://github.com/USERNAME/mia-artbox/actions`），等最新一次 run 变绿（约 1–2 分钟）。如果 deploy 那步失败且报 "Deployment failed, try again later"，是 Pages 刚开通的瞬时问题，**重跑一次 workflow 即可**。验证 `https://USERNAME.github.io/mia-artbox/` 应返回 200 且标题是孩子的 App 名。

**5. 以后怎么更新**：改完代码 `git add -A && git commit && git push`，Actions 会自动重新部署，约 2 分钟生效。已安装到 iPad 主屏幕的 App 会在下次打开时自动更新（PWA autoUpdate）。

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

## 常见问题排查

**构建 / 部署**

- `npm install` 卡住或超时（国内网络常见）：用国内镜像 `npm install --registry=https://registry.npmmirror.com`
- Actions 第一次部署失败，deploy 步骤报 "Deployment failed, try again later"：Pages 站点刚开通、后台还在初始化，等 30 秒重跑一次 workflow 就好，这是最常见的失败，先重跑再排查别的
- Actions 里 configure-pages 步骤失败（"Get Pages site failed"）：Pages 没开通，回去执行第 4 步的开通 API
- 打开线上地址是 404：刚部署完等 1–2 分钟再刷新；检查 `config.ts` 的 `base` 是否和仓库名完全一致（含大小写、两侧斜杠）
- 页面打开了但一片空白 / 资源 404：几乎都是 `base` 配错，改完 commit → push → 等重新部署

**iPad / 手机使用**

- 拍照或录音时没有弹权限、按钮没反应：必须用 HTTPS 地址（GitHub Pages 自带）或 localhost，用局域网 IP 打开时浏览器会直接禁用相机麦克风；iOS 之前拒绝过权限的话去设置里手动允许
- "添加到主屏幕"后打开是旧版本：PWA 自动更新在下次冷启动生效；彻底不更新时，先用 Backup 导出数据，再删除主屏幕图标重新添加
- 数据会丢吗：数据存在浏览器的 IndexedDB 里，正常使用不会丢，但"删除主屏幕 App"或系统清理存储可能带走数据，所以要固定从主屏幕图标打开（Safari 和主屏幕 App 是两份独立数据），并隔段时间用 Backup 导出
- 定位拿不到 / 地点是空的：正常降级行为，用户拒绝定位或超时后地点栏留空可手动输入，不影响保存

**其他定制**

- 想改配色：`app/src/theme.css` 顶部 `:root` 变量
- 想改字体：`app/index.html` 里的 Google Fonts 链接 + `theme.css` 的 `--marker` / `--hand`；中文可换成手写风格如 "Ma Shan Zheng"
- 多个孩子：最省事的做法是每个孩子部署一个仓库（改 config 换名字再走一遍部署），数据天然隔离
