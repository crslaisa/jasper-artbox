# 部署到用户自己的 GitHub Pages

前提：`config.ts` 已改好，`base` 与将要创建的仓库名一致（如仓库叫 `mia-artbox`，base 就是 `'/mia-artbox/'`）。本文假设仓库名为 `mia-artbox`、GitHub 用户名为 `USERNAME`，按实际替换。

## 1. 重置 git 历史

模板克隆下来带着原作者的历史，先清掉：

```bash
cd my-kids-artbox
rm -rf .git        # Windows PowerShell: Remove-Item -Recurse -Force .git
git init -b main
git add -A
git commit -m "Mia's Art Box - initial"
```

## 2. 创建 GitHub 仓库

按环境选一条路，从上往下优先：

**A. 有 gh CLI 且已登录**（`gh auth status` 验证）：

```bash
gh repo create USERNAME/mia-artbox --public --source . --push
```

**B. 没有 gh，但 git 推送凭据可用**（之前 push 过 GitHub）：

让用户在浏览器打开 `https://github.com/new`，仓库名填 `mia-artbox`，Public，什么都不勾，点 Create。然后：

```bash
git remote add origin https://github.com/USERNAME/mia-artbox
git push -u origin main
```

**C. 全新环境（无 gh、无凭据）**：用 GitHub 设备码授权，全程用户只需在浏览器输一个码：

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
# 建仓库
curl -s -X POST https://api.github.com/user/repos \
  -H "Authorization: token <TOKEN>" -H "Accept: application/vnd.github+json" \
  -d '{"name":"mia-artbox"}'
# 推送（推完把凭据存进本机凭据管理器，方便以后更新）
git remote add origin https://github.com/USERNAME/mia-artbox
git push -u origin main   # 提示输密码时用 token 作为密码
```

## 3. 开通 GitHub Pages（不能漏）

模板的 workflow 只负责构建和部署，**Pages 站点本身要先开通**，否则部署步骤会失败：

```bash
# gh 版
gh api repos/USERNAME/mia-artbox/pages -f build_type=workflow
# curl 版
curl -s -X POST https://api.github.com/repos/USERNAME/mia-artbox/pages \
  -H "Authorization: token <TOKEN>" -H "Accept: application/vnd.github+json" \
  -d '{"build_type":"workflow"}'
```

已经存在（409 报错）说明开过了，继续即可。

## 4. 等构建、验证

- 看 Actions：`https://github.com/USERNAME/mia-artbox/actions`，等最新一次 run 变绿（约 1–2 分钟）
- 如果 deploy 那步失败且报 "Deployment failed, try again later"，是 Pages 刚开通的瞬时问题，**重跑一次 workflow 即可**（Actions 页面 Re-run，或 `gh run rerun <id>`）
- 验证：`https://USERNAME.github.io/mia-artbox/` 应返回 200 且标题是孩子的 App 名

## 5. 以后怎么更新

改完代码 `git add -A && git commit && git push`，Actions 会自动重新部署，约 2 分钟生效。已安装到 iPad 主屏幕的 App 会在下次打开时自动更新（PWA autoUpdate）。
