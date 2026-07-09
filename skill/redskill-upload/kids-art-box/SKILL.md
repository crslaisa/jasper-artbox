---
name: kids-art-box
description: 给孩子做一个专属的"画作记忆盒"网页 App：拍照存画、孩子亲口讲故事的录音、自动记录时间地点、画廊翻看、晾衣绳画作墙，数据全存设备本地不上传。完整代码直接内置在本文里，不需要访问任何外部代码仓库，从零到本地可用约 5 分钟。只要用户提到想保存/整理/记录孩子的画、想给娃做作品集、想留住孩子的涂鸦和童言童语、kids art gallery、宝宝画画存档等，即使没明说要"做个 App"，也应使用本技能。
---

# Kids Art Box · 孩子的画作记忆盒

帮用户为自己的孩子生成一个手绘涂鸦风格的 PWA（网页 App），功能：拍照收录画作、录一段孩子自己讲画的语音故事、自动记下时间和地点、画廊筛选收藏、把最爱挂上"晾衣绳画作墙"、一键导出备份。照片和录音**只存在设备本地（IndexedDB），不经过任何服务器**——这一点对家长很重要，交付时要主动说明。

**完整源代码就在本文档里**（见"第 2 步"），不依赖任何外部代码仓库或下载链接——把下面每个文件的内容原样写到本地对应路径即可，不需要联网获取。

## 工作流程

### 第 1 步 · 问清两件事

开始前向用户确认（一次问完，别挤牙膏）：

1. **孩子的名字和年龄**（名字用于 App 标题、画作署名、语音故事标签；英文名中文名都可以）
2. **App 标题**：默认 `<名字>'s Art Box`；中文名建议形如 `小雨的画画盒`（侧边栏 logo 分两行显示，需要拆成上下两行）

### 第 2 步 · 创建项目文件

在用户电脑上新建一个项目文件夹（比如 `<孩子名字>-art-box`），按下面的目录结构原样创建每一个文件——**不要用 git clone，也不要访问任何网址**，直接把每段代码写入对应路径就行：

```
<项目文件夹>/
└── app/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── tsconfig.node.json
    ├── .oxlintrc.json
    ├── .gitignore
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── config.ts
        ├── db.ts
        ├── nav.ts
        ├── theme.css
        ├── components/
        │   ├── Sidebar.tsx
        │   ├── PaintingCard.tsx
        │   └── Waveform.tsx
        ├── screens/
        │   ├── Gallery.tsx
        │   ├── Capture.tsx
        │   ├── Detail.tsx
        │   └── Wall.tsx
        └── lib/
            ├── audio.ts
            ├── backup.ts
            ├── geo.ts
            ├── image.ts
            └── ui.ts
```

**写 `src/config.ts` 时，把 `childName`／`childAge`／`titleTop`／`titleBottom`／`title` 换成第 1 步问到的真实信息**（下面代码块里的 "Alex" / 6 岁只是示例占位值）。`base` 字段保持 `'/'` 不用改（除非用户明确要部署到某个子路径）。其余文件原样抄写即可，不用改动。

#### `app/index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>__APP_TITLE__</title>
    <meta name="theme-color" content="#FFF6DF" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="__APP_TITLE__" />
    <link rel="icon" type="image/png" href="./icon-192.png" />
    <link rel="apple-touch-icon" href="./apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&family=Permanent+Marker&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

（`__APP_TITLE__` 是占位符，会在构建时被 `vite.config.ts` 里的小插件自动替换成 `config.ts` 里的 `title`，不用手动改这个文件。图标文件 `icon-192.png` / `icon-512.png` / `apple-touch-icon.png` 是可选的——没有也不影响功能，浏览器只是显示不出自定义图标；如果当前环境有画图/画布工具，可以做三张手绘风小图标放进 `app/public/` 目录，没有就跳过，不要为此卡住流程。）

#### `app/package.json`

```json
{
  "name": "app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "dexie": "^4.4.4",
    "dexie-react-hooks": "^4.4.0",
    "jszip": "^3.10.1",
    "react": "^19.2.7",
    "react-dom": "^19.2.7"
  },
  "devDependencies": {
    "@types/node": "^24.13.2",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.3",
    "oxlint": "^1.71.0",
    "typescript": "~6.0.2",
    "vite": "^8.1.1",
    "vite-plugin-pwa": "^1.3.0"
  }
}
```

#### `app/vite.config.ts`

```ts
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { APP } from './src/config.ts'

/** Injects the per-child app title from src/config.ts into index.html. */
function htmlTitle(): Plugin {
  return {
    name: 'html-title-from-config',
    transformIndexHtml(html) {
      return html.replaceAll('__APP_TITLE__', APP.title)
    },
  }
}

export default defineConfig({
  base: APP.base,
  plugins: [
    react(),
    htmlTitle(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: APP.title,
        short_name: APP.shortName,
        description: `${APP.childName}'s painting memory box — photos, voice stories, places and times.`,
        theme_color: '#FFF6DF',
        background_color: '#FFFDF6',
        display: 'standalone',
        orientation: 'any',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
})
```

#### `app/tsconfig.json`

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

#### `app/tsconfig.app.json`

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "types": ["vite/client"],
    "allowArbitraryExtensions": true,
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

#### `app/tsconfig.node.json`

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023"],
    "types": ["node"],
    "skipLibCheck": true,

    "module": "nodenext",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

#### `app/.oxlintrc.json`

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

#### `app/.gitignore`

```
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

#### `app/src/main.tsx`

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './theme.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

#### `app/src/App.tsx`

```tsx
import { useEffect, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Gallery } from './screens/Gallery'
import { Capture } from './screens/Capture'
import { Detail } from './screens/Detail'
import { Wall } from './screens/Wall'
import { migrateLegacyBlobs, requestPersistentStorage } from './db'
import { APP } from './config'
import type { Screen } from './nav'

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'gallery' })

  useEffect(() => {
    document.title = APP.title
    requestPersistentStorage()
    migrateLegacyBlobs()
  }, [])

  return (
    <div className="app">
      <Sidebar screen={screen} go={setScreen} />
      <main className="main">
        {screen.name === 'gallery' && <Gallery go={setScreen} />}
        {screen.name === 'favorites' && <Gallery lovedOnly go={setScreen} />}
        {screen.name === 'capture' && <Capture go={setScreen} />}
        {screen.name === 'wall' && <Wall go={setScreen} />}
        {screen.name === 'detail' && <Detail id={screen.id} go={setScreen} />}
      </main>
    </div>
  )
}
```

#### `app/src/config.ts`

```ts
/**
 * 每个孩子专属的配置 — 想给自己的孩子做一个，只改这个文件即可。
 * Per-child configuration — to make this app for your own kid, edit this file only.
 */
export const APP = {
  /** 孩子的名字（画作署名、语音故事标签用） */
  childName: 'Alex',
  /** 年龄（侧边栏和署名里显示） */
  childAge: 6,
  /** 侧边栏 logo 第一行 */
  titleTop: "Alex's",
  /** 侧边栏 logo 第二行 */
  titleBottom: 'Art Box',
  /** 完整应用名（浏览器标签页、PWA 安装名） */
  title: "Alex's Art Box",
  /** PWA 短名（主屏幕图标下的文字，别超过 12 字符） */
  shortName: 'Art Box',
  /** 部署路径：只在本地跑，或部署到网站根目录，填 '/'；部署到某个子路径下就填 '/<路径>/' */
  base: '/',
}

export const AVATAR_INITIAL = APP.childName.trim().charAt(0).toUpperCase() || 'A'
```

#### `app/src/db.ts`

```ts
import Dexie, { type EntityTable } from 'dexie'

/**
 * Binary data is stored as ArrayBuffer + mime type, NOT as Blob.
 * iOS Safari has long-standing bugs where Blobs stored in IndexedDB can come
 * back corrupted or mixed up after records are deleted and re-added.
 * ArrayBuffers round-trip reliably on every browser.
 */
export interface Painting {
  id: number
  title: string
  photo: ArrayBuffer
  photoType: string
  thumb: ArrayBuffer
  thumbType: string
  audio: ArrayBuffer | null
  audioType: string | null
  audioDuration: number | null
  story: string
  place: string
  lat: number | null
  lng: number | null
  takenAt: number
  loved: 0 | 1
  onWall: 0 | 1
  createdAt: number
}

export const db = new Dexie('kids-art-box') as Dexie & {
  paintings: EntityTable<Painting, 'id'>
}

db.version(1).stores({
  paintings: '++id, takenAt, loved, onWall, createdAt',
})
db.version(2).stores({
  paintings: '++id, takenAt, loved, onWall, createdAt',
})

/** Rebuild a Blob from stored bytes. */
export function blobOf(buf: ArrayBuffer, type: string): Blob {
  return new Blob([buf], { type })
}

/**
 * One-time lazy migration for records created before the ArrayBuffer switch.
 * Runs outside the upgrade transaction because Blob.arrayBuffer() is async
 * and would kill an IndexedDB upgrade transaction.
 */
export async function migrateLegacyBlobs(): Promise<void> {
  try {
    const all = await db.paintings.toArray()
    for (const p of all) {
      const rec = p as unknown as Record<string, unknown>
      if (!(rec.photo instanceof Blob) && !(rec.thumb instanceof Blob) && !(rec.audio instanceof Blob)) {
        continue
      }
      try {
        const patch: Record<string, unknown> = {}
        if (rec.photo instanceof Blob) {
          patch.photoType = rec.photo.type || 'image/jpeg'
          patch.photo = await rec.photo.arrayBuffer()
        }
        if (rec.thumb instanceof Blob) {
          patch.thumbType = rec.thumb.type || 'image/jpeg'
          patch.thumb = await rec.thumb.arrayBuffer()
        }
        if (rec.audio instanceof Blob) {
          patch.audioType = rec.audio.type || 'audio/mp4'
          patch.audio = await rec.audio.arrayBuffer()
        }
        await db.paintings.update(p.id, patch as Partial<Painting>)
      } catch {
        // A record whose Blob is already corrupted cannot be recovered here;
        // leave it in place rather than losing the metadata.
      }
    }
  } catch {
    /* migration is best-effort */
  }
}

export function requestPersistentStorage() {
  if (navigator.storage?.persist) {
    navigator.storage.persist().catch(() => {})
  }
}
```

#### `app/src/nav.ts`

```ts
export type Screen =
  | { name: 'gallery' }
  | { name: 'favorites' }
  | { name: 'wall' }
  | { name: 'capture' }
  | { name: 'detail'; id: number }
```

#### `app/src/theme.css`

```css
:root {
  --paper: #fffdf6;
  --cream: #fff6df;
  --ink: #1a1a1a;
  --yellow: #ffc93c;
  --coral: #ff6b4a;
  --blue: #4fb0e8;
  --green: #6bbf59;
  --pink: #ff9ec4;
  --purple: #a87bd8;
  --muted: #7a766c;
  --faint: #9a958a;
  --marker: 'Permanent Marker', cursive;
  --hand: 'Gaegu', cursive;
}

* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html,
body,
#root {
  margin: 0;
  height: 100%;
}

body {
  background: var(--paper);
  font-family: var(--hand);
  color: var(--ink);
  overscroll-behavior: none;
}

button {
  font-family: inherit;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  color: inherit;
}

input,
textarea {
  font-family: var(--hand);
  color: var(--ink);
}

.app {
  display: flex;
  height: 100%;
}

/* ---------- sidebar ---------- */
.sidebar {
  width: 232px;
  flex: none;
  background: var(--cream);
  border-right: 3px dashed var(--ink);
  display: flex;
  flex-direction: column;
  padding: max(18px, env(safe-area-inset-top)) 18px 18px;
  overflow-y: auto;
}

.sidebar .logo {
  font-family: var(--marker);
  font-size: 25px;
  line-height: 1.02;
}

.sidebar .logo-underline {
  height: 7px;
  width: 128px;
  background: var(--yellow);
  border-radius: 4px;
  margin-top: 5px;
  transform: rotate(-1.5deg);
}

.profile {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-top: 20px;
}

.profile .avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--blue);
  border: 3px solid var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--marker);
  font-size: 20px;
  color: #fff;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 22px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 13px;
  border-radius: 14px;
  font-size: 17px;
  text-align: left;
}

.nav-item.active {
  background: var(--yellow);
  border: 3px solid var(--ink);
  box-shadow: 0 4px 0 rgba(26, 26, 26, 0.16);
  padding: 7px 10px;
}

.new-art-btn {
  margin-top: 16px;
  background: var(--coral);
  border: 3px solid var(--ink);
  border-radius: 14px;
  padding: 12px;
  text-align: center;
  font-family: var(--marker);
  font-size: 17px;
  color: #fff;
  box-shadow: 0 4px 0 rgba(26, 26, 26, 0.2);
}

.new-art-btn:active {
  transform: translateY(3px);
  box-shadow: 0 1px 0 rgba(26, 26, 26, 0.2);
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 18px;
  font-size: 15px;
  color: var(--muted);
}

.grownups {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}

.grownups button {
  font-size: 13px;
  color: var(--faint);
  border: 2px solid #d8d3c5;
  border-radius: 10px;
  padding: 4px 9px;
  background: #fff;
}

/* ---------- main area ---------- */
.main {
  flex: 1;
  overflow-y: auto;
  padding: max(22px, env(safe-area-inset-top)) 28px 28px;
  min-width: 0;
}

.screen-title {
  font-family: var(--marker);
  font-size: 28px;
}

/* ---------- chips & buttons ---------- */
.chip {
  font-size: 15px;
  background: #fff;
  border: 2.5px solid var(--ink);
  border-radius: 13px;
  padding: 5px 14px;
}

.chip.active {
  background: var(--yellow);
}

.big-btn {
  border: 3px solid var(--ink);
  border-radius: 18px;
  padding: 14px;
  text-align: center;
  font-family: var(--marker);
  font-size: 19px;
  box-shadow: 0 6px 0 rgba(26, 26, 26, 0.2);
}

.big-btn:active {
  transform: translateY(4px);
  box-shadow: 0 2px 0 rgba(26, 26, 26, 0.2);
}

.big-btn:disabled {
  opacity: 0.45;
  box-shadow: none;
}

/* ---------- painting card ---------- */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 26px;
  margin-top: 24px;
  padding: 14px 4px 10px;
}

.p-card {
  background: #fff;
  border: 3px solid var(--ink);
  padding: 11px 11px 13px;
  box-shadow: 5px 6px 0 rgba(26, 26, 26, 0.13);
  position: relative;
  text-align: left;
  width: 100%;
}

.p-card .photo {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border: 2px solid var(--ink);
  border-radius: 7px;
  overflow: hidden;
  background: var(--cream);
}

.p-card .photo img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.p-card .card-title {
  font-size: 19px;
  margin-top: 8px;
}

.tape {
  position: absolute;
  top: -11px;
  left: 50%;
  width: 62px;
  height: 18px;
  border: 1px dashed rgba(0, 0, 0, 0.13);
}

.meta-line {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.meta-sub {
  font-size: 13px;
  color: #999;
  margin-top: 2px;
}

.pin {
  width: 12px;
  height: 12px;
  flex: none;
  background: var(--coral);
  border: 1.5px solid var(--ink);
  border-radius: 50% 50% 50% 0;
  transform: rotate(45deg);
}

.play-badge {
  margin-left: auto;
  flex: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--coral);
  border: 2px solid var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-badge::after {
  content: '';
  width: 0;
  height: 0;
  border-left: 8px solid #fff;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  margin-left: 2px;
}

/* ---------- panels ---------- */
.panel {
  background: #fff;
  border: 3px solid var(--ink);
  border-radius: 18px;
  padding: 16px;
  box-shadow: 4px 5px 0 rgba(26, 26, 26, 0.12);
}

.field-card {
  border: 3px solid var(--ink);
  border-radius: 16px;
  padding: 13px 14px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 5px;
  font-size: 13px;
  color: var(--muted);
}

.text-input {
  background: #fff;
  border: 3px solid var(--ink);
  border-radius: 16px;
  padding: 12px 16px;
  font-size: 20px;
  width: 100%;
  outline: none;
}

.round-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 3px solid var(--ink);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex: none;
}

/* ---------- waveform ---------- */
.wave {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.wave span {
  width: 5px;
  flex: none;
  background: var(--ink);
  border-radius: 2px;
}

/* ---------- wall ---------- */
.wall-rope {
  position: relative;
  margin-top: 60px;
}

.wall-rope .rope {
  position: absolute;
  top: -26px;
  left: -10px;
  right: -10px;
  height: 44px;
  border-bottom: 3px solid var(--ink);
  border-radius: 50%;
}

.wall-row {
  display: flex;
  gap: 34px;
  justify-content: center;
  flex-wrap: wrap;
}

.wall-item {
  position: relative;
  width: 168px;
  background: #fff;
  border: 3px solid var(--ink);
  padding: 8px 8px 10px;
  box-shadow: 4px 5px 0 rgba(26, 26, 26, 0.13);
}

.wall-item .clip {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 22px;
  background: var(--yellow);
  border: 2px solid var(--ink);
  border-radius: 4px;
}

.wall-item img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border: 2px solid var(--ink);
  border-radius: 5px;
  display: block;
}

.wall-item .wall-caption {
  font-size: 15px;
  margin-top: 6px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---------- empty state ---------- */
.empty-state {
  text-align: center;
  padding: 70px 20px;
  color: var(--muted);
}

.empty-state .doodle {
  font-size: 54px;
}

.empty-state .line1 {
  font-family: var(--marker);
  font-size: 22px;
  color: var(--ink);
  margin-top: 12px;
}

/* ---------- capture layout ---------- */
.capture-cols {
  display: flex;
  gap: 26px;
  margin-top: 20px;
  align-items: stretch;
}

.capture-cols > .col-photo {
  flex: 1.15;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.capture-cols > .col-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.viewfinder {
  position: relative;
  border: 3px solid var(--ink);
  border-radius: 20px;
  overflow: hidden;
  background: var(--cream);
  aspect-ratio: 4 / 3.4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewfinder img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

.corner {
  position: absolute;
  width: 26px;
  height: 26px;
  border-color: var(--ink);
  pointer-events: none;
}

.viewfinder.has-photo .corner {
  border-color: #fff;
}

.detail-cols {
  display: flex;
  gap: 30px;
  margin-top: 18px;
  align-items: flex-start;
}

.detail-cols > .col-hero {
  flex: 1.1;
  min-width: 0;
}

.detail-cols > .col-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* ---------- phone layout ---------- */
@media (max-width: 720px) {
  .app {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    border-right: none;
    border-bottom: 3px dashed var(--ink);
    padding: max(10px, env(safe-area-inset-top)) 12px 10px;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .sidebar .logo {
    font-size: 17px;
    white-space: nowrap;
  }

  .sidebar .logo-underline,
  .profile,
  .sidebar-footer .count {
    display: none;
  }

  .nav {
    flex-direction: row;
    margin-top: 0;
    flex: none;
  }

  .nav-item {
    padding: 6px 9px;
    font-size: 15px;
    white-space: nowrap;
  }

  .nav-item.active {
    padding: 3px 7px;
  }

  .new-art-btn {
    margin-top: 0;
    padding: 7px 11px;
    font-size: 14px;
    white-space: nowrap;
  }

  .sidebar-footer {
    margin-top: 0;
    padding-top: 0;
  }

  .grownups {
    margin-top: 0;
  }

  .main {
    padding: 18px 16px 28px;
  }

  .capture-cols,
  .detail-cols {
    flex-direction: column;
  }

  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
  }
}
```

#### `app/src/components/Sidebar.tsx`

```tsx
import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { exportBackup, importBackup } from '../lib/backup'
import { APP, AVATAR_INITIAL } from '../config'
import type { Screen } from '../nav'

interface Props {
  screen: Screen
  go: (s: Screen) => void
}

export function Sidebar({ screen, go }: Props) {
  const count = useLiveQuery(() => db.paintings.count(), [], 0)
  const importRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const doExport = async () => {
    setBusy(true)
    try {
      await exportBackup()
    } catch (e) {
      alert(`Backup failed: ${e instanceof Error ? e.message : e}`)
    } finally {
      setBusy(false)
    }
  }

  const doImport = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    try {
      const added = await importBackup(file)
      alert(added > 0 ? `Welcome back! ${added} paintings restored.` : 'Nothing new to restore.')
    } catch (e) {
      alert(`Restore failed: ${e instanceof Error ? e.message : e}`)
    } finally {
      setBusy(false)
      if (importRef.current) importRef.current.value = ''
    }
  }

  const navGrid = (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }} aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} style={{ width: 7, height: 7, background: 'var(--ink)' }} />
      ))}
    </div>
  )

  return (
    <nav className="sidebar">
      <div>
        <div className="logo">
          {APP.titleTop}
          <br />
          {APP.titleBottom}
        </div>
        <div className="logo-underline" />
      </div>

      <div className="profile">
        <div className="avatar">{AVATAR_INITIAL}</div>
        <div>
          <div style={{ fontSize: 18 }}>{APP.childName}</div>
          <div style={{ fontSize: 13, color: 'var(--faint)' }}>age {APP.childAge}</div>
        </div>
      </div>

      <div className="nav">
        <button
          className={`nav-item${screen.name === 'gallery' ? ' active' : ''}`}
          onClick={() => go({ name: 'gallery' })}
        >
          {navGrid}
          Gallery
        </button>
        <button
          className={`nav-item${screen.name === 'wall' ? ' active' : ''}`}
          onClick={() => go({ name: 'wall' })}
        >
          <span style={{ display: 'flex', gap: 3 }} aria-hidden>
            <span style={{ width: 8, height: 11, border: '2px solid var(--ink)' }} />
            <span style={{ width: 8, height: 11, border: '2px solid var(--ink)' }} />
          </span>
          Wall
        </button>
        <button
          className={`nav-item${screen.name === 'favorites' ? ' active' : ''}`}
          onClick={() => go({ name: 'favorites' })}
        >
          <span style={{ color: 'var(--coral)', fontSize: 17 }} aria-hidden>
            ♥
          </span>
          Favorites
        </button>
      </div>

      <button className="new-art-btn" onClick={() => go({ name: 'capture' })}>
        + New Art
      </button>

      <div className="sidebar-footer">
        <div className="count">{count} masterpieces ★</div>
        <div className="grownups">
          <button onClick={doExport} disabled={busy}>
            Backup
          </button>
          <button onClick={() => importRef.current?.click()} disabled={busy}>
            Restore
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".zip,application/zip"
            style={{ display: 'none' }}
            onChange={(e) => doImport(e.target.files?.[0])}
          />
        </div>
      </div>
    </nav>
  )
}
```

#### `app/src/components/PaintingCard.tsx`

```tsx
import type { Painting } from '../db'
import { decor, formatDateTime, useBufferUrl } from '../lib/ui'

interface Props {
  painting: Painting
  onOpen: (id: number) => void
}

export function PaintingCard({ painting, onOpen }: Props) {
  const url = useBufferUrl(painting.thumb, painting.thumbType)
  const d = decor(painting.id)

  return (
    <button
      className="p-card"
      style={{ transform: `rotate(${d.rot}deg)`, borderRadius: d.radius }}
      onClick={() => onOpen(painting.id)}
    >
      <div
        className="tape"
        style={{ background: d.tape, transform: `translateX(-50%) rotate(${d.tapeRot}deg)` }}
      />
      <div className="photo">{url && <img src={url} alt={painting.title} />}</div>
      <div className="card-title">
        {painting.title || 'Untitled masterpiece'}
        {painting.loved ? <span style={{ color: 'var(--coral)' }}> ♥</span> : null}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, marginTop: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {painting.place && (
            <div className="meta-line">
              <span className="pin" />
              <span
                style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {painting.place}
              </span>
            </div>
          )}
          <div className="meta-sub">{formatDateTime(painting.takenAt)}</div>
        </div>
        {painting.audio && <span className="play-badge" />}
      </div>
    </button>
  )
}
```

#### `app/src/components/Waveform.tsx`

```tsx
interface Props {
  seed?: number
  accent?: string
  bars?: number
  active?: boolean
}

/** Decorative hand-drawn waveform bars. */
export function Waveform({ seed = 7, accent = 'var(--coral)', bars = 14, active = false }: Props) {
  const heights = Array.from({ length: bars }, (_, i) => 30 + ((seed * (i + 3) * 31) % 70))
  return (
    <div className="wave" aria-hidden>
      {heights.map((h, i) => (
        <span
          key={i}
          style={{
            height: `${h}%`,
            background: i % 3 === 2 ? accent : 'var(--ink)',
            opacity: active ? 1 : 0.9,
          }}
        />
      ))}
    </div>
  )
}
```

#### `app/src/screens/Gallery.tsx`

```tsx
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { PaintingCard } from '../components/PaintingCard'
import type { Screen } from '../nav'

type Filter = 'all' | 'week' | 'loved'

interface Props {
  lovedOnly?: boolean
  go: (s: Screen) => void
}

export function Gallery({ lovedOnly = false, go }: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const effective: Filter = lovedOnly ? 'loved' : filter

  const paintings = useLiveQuery(async () => {
    const all = await db.paintings.orderBy('takenAt').reverse().toArray()
    if (effective === 'loved') return all.filter((p) => p.loved === 1)
    if (effective === 'week') {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      return all.filter((p) => p.takenAt >= weekAgo)
    }
    return all
  }, [effective])

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div className="screen-title">{lovedOnly ? 'Favorites' : 'My Gallery'}</div>
        {!lovedOnly && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className={`chip${filter === 'all' ? ' active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`chip${filter === 'week' ? ' active' : ''}`}
              onClick={() => setFilter('week')}
            >
              This week
            </button>
            <button
              className={`chip${filter === 'loved' ? ' active' : ''}`}
              onClick={() => setFilter('loved')}
            >
              ♥ Loved
            </button>
          </div>
        )}
      </div>

      {paintings && paintings.length === 0 ? (
        <div className="empty-state">
          <div className="doodle">🖍️</div>
          <div className="line1">
            {effective === 'loved' ? 'No loved paintings yet!' : 'The box is empty!'}
          </div>
          <div style={{ fontSize: 17, marginTop: 6 }}>
            {effective === 'loved'
              ? 'Tap the ♥ on a painting you really really like.'
              : 'Tap “+ New Art” to put your first masterpiece in the box.'}
          </div>
        </div>
      ) : (
        <div className="card-grid">
          {paintings?.map((p) => (
            <PaintingCard key={p.id} painting={p} onOpen={(id) => go({ name: 'detail', id })} />
          ))}
        </div>
      )}
    </div>
  )
}
```

#### `app/src/screens/Capture.tsx`

```tsx
import { useEffect, useRef, useState } from 'react'
import { db } from '../db'
import { processPhoto } from '../lib/image'
import { VoiceRecorder, formatDuration } from '../lib/audio'
import { detectPlace } from '../lib/geo'
import { useObjectUrl, formatDateTime } from '../lib/ui'
import { Waveform } from '../components/Waveform'
import type { Screen } from '../nav'

interface Props {
  go: (s: Screen) => void
}

export function Capture({ go }: Props) {
  const [photoFile, setPhotoFile] = useState<Blob | null>(null)
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0)
  const [title, setTitle] = useState('')
  const [place, setPlace] = useState('')
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  })
  const [locating, setLocating] = useState(true)
  const [takenAt] = useState(() => Date.now())

  const recorderRef = useRef(new VoiceRecorder())
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [audio, setAudio] = useState<{ blob: Blob; duration: number } | null>(null)
  const [saving, setSaving] = useState(false)

  const cameraRef = useRef<HTMLInputElement>(null)
  const albumRef = useRef<HTMLInputElement>(null)
  const photoUrl = useObjectUrl(photoFile)
  const audioUrl = useObjectUrl(audio?.blob ?? null)

  useEffect(() => {
    let cancelled = false
    detectPlace().then((d) => {
      if (cancelled) return
      setPlace((prev) => prev || d.place)
      setCoords({ lat: d.lat, lng: d.lng })
      setLocating(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!recording) return
    const t = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [recording])

  useEffect(() => {
    const rec = recorderRef.current
    return () => rec.cancel()
  }, [])

  const toggleRecording = async () => {
    if (recording) {
      const result = await recorderRef.current.stop()
      setAudio(result)
      setRecording(false)
    } else {
      try {
        setAudio(null)
        setElapsed(0)
        await recorderRef.current.start()
        setRecording(true)
      } catch {
        alert('Could not use the microphone. Check permissions and try again!')
      }
    }
  }

  const save = async () => {
    if (!photoFile || saving) return
    setSaving(true)
    try {
      const { photo, thumb } = await processPhoto(photoFile, rotation)
      const id = await db.paintings.add({
        title: title.trim(),
        story: '',
        place: place.trim(),
        lat: coords.lat,
        lng: coords.lng,
        takenAt,
        loved: 0,
        onWall: 0,
        createdAt: Date.now(),
        audioDuration: audio?.duration ?? null,
        photo: await photo.arrayBuffer(),
        photoType: 'image/jpeg',
        thumb: await thumb.arrayBuffer(),
        thumbType: 'image/jpeg',
        audio: audio ? await audio.blob.arrayBuffer() : null,
        audioType: audio?.blob.type ?? null,
        // Dexie fills in the auto-increment id
      } as Parameters<typeof db.paintings.add>[0])
      go({ name: 'detail', id: id as number })
    } catch (e) {
      alert(`Could not save: ${e instanceof Error ? e.message : e}`)
      setSaving(false)
    }
  }

  const onPickPhoto = (file: File | undefined) => {
    if (file) {
      setPhotoFile(file)
      setRotation(0)
    }
  }

  const corners = (
    <>
      <span className="corner" style={{ top: 12, left: 12, borderLeft: '3px solid', borderTop: '3px solid', borderRadius: '7px 0 0 0' }} />
      <span className="corner" style={{ top: 12, right: 12, borderRight: '3px solid', borderTop: '3px solid', borderRadius: '0 7px 0 0' }} />
      <span className="corner" style={{ bottom: 12, left: 12, borderLeft: '3px solid', borderBottom: '3px solid', borderRadius: '0 0 0 7px' }} />
      <span className="corner" style={{ bottom: 12, right: 12, borderRight: '3px solid', borderBottom: '3px solid', borderRadius: '0 0 7px 0' }} />
    </>
  )

  return (
    <div>
      <div className="screen-title">New Masterpiece!</div>

      <div className="capture-cols">
        <div className="col-photo">
          <div className={`viewfinder${photoUrl ? ' has-photo' : ''}`}>
            {photoUrl ? (
              <>
                <img
                  src={photoUrl}
                  alt="Your new masterpiece"
                  style={{
                    transform: `rotate(${rotation}deg)${rotation % 180 !== 0 ? ' scale(0.72)' : ''}`,
                    transition: 'transform .2s',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 14,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--green)',
                    color: '#fff',
                    fontSize: 15,
                    padding: '3px 14px',
                    borderRadius: 13,
                    border: '2px solid var(--ink)',
                  }}
                >
                  ✓ Snapped!
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 20 }}>
                <div style={{ fontSize: 46 }}>📷</div>
                <div style={{ fontFamily: 'var(--marker)', fontSize: 19, color: 'var(--ink)', marginTop: 8 }}>
                  Show me your painting!
                </div>
                <div style={{ fontSize: 15, marginTop: 4 }}>Snap a photo or pick one from the album</div>
              </div>
            )}
            {corners}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 26,
              padding: '16px 0 0',
            }}
          >
            <button
              style={{ fontSize: 16, color: 'var(--muted)' }}
              onClick={() => setPhotoFile(null)}
              disabled={!photoFile}
            >
              Retake
            </button>
            <button
              style={{ fontSize: 16, color: photoFile ? 'var(--ink)' : 'var(--muted)' }}
              onClick={() => setRotation((r) => ((r + 90) % 360) as 0 | 90 | 180 | 270)}
              disabled={!photoFile}
            >
              ↻ Rotate
            </button>
            <button
              aria-label="Take photo"
              onClick={() => cameraRef.current?.click()}
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#fff',
                border: '3px solid var(--ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  background: 'var(--yellow)',
                  border: '2px solid var(--ink)',
                }}
              />
            </button>
            <button style={{ fontSize: 16, color: 'var(--muted)' }} onClick={() => albumRef.current?.click()}>
              Album
            </button>
          </div>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={(e) => onPickPhoto(e.target.files?.[0])}
          />
          <input
            ref={albumRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => onPickPhoto(e.target.files?.[0])}
          />
        </div>

        <div className="col-form">
          <div className="panel">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 19 }}>Tell me the story!</span>
              <span style={{ fontSize: 16, color: 'var(--coral)' }}>
                {recording ? formatDuration(elapsed) : audio ? formatDuration(audio.duration) : ''}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                aria-label={recording ? 'Stop recording' : 'Start recording'}
                onClick={toggleRecording}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--coral)',
                  border: '3px solid var(--ink)',
                  flex: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 0 rgba(26,26,26,.2)',
                }}
              >
                {recording ? (
                  <span style={{ width: 18, height: 18, background: '#fff', borderRadius: 4 }} />
                ) : (
                  <span style={{ width: 20, height: 20, background: '#fff', borderRadius: '50%' }} />
                )}
              </button>
              {audio && audioUrl && !recording ? (
                <audio src={audioUrl} controls style={{ flex: 1, minWidth: 0, height: 40 }} />
              ) : (
                <Waveform seed={recording ? elapsed + 3 : 7} active={recording} />
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14 }}>
            <div className="field-card" style={{ flex: 1, background: '#EAF6FF' }}>
              <div className="field-label">
                <span className="pin" style={{ width: 14, height: 14 }} />
                Where
                {place && <span style={{ marginLeft: 'auto', color: 'var(--green)', fontSize: 15 }}>✓</span>}
              </div>
              <input
                value={place}
                placeholder={locating ? 'Finding you…' : 'Type a place'}
                onChange={(e) => setPlace(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: 16,
                  width: '100%',
                  outline: 'none',
                  padding: 0,
                }}
              />
            </div>
            <div className="field-card" style={{ flex: 1, background: '#FFF3D6' }}>
              <div className="field-label">
                🕐 When
                <span style={{ marginLeft: 'auto', color: 'var(--green)', fontSize: 15 }}>✓</span>
              </div>
              <div style={{ fontSize: 16, lineHeight: 1.1 }}>{formatDateTime(takenAt)}</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 7 }}>
              Name your masterpiece
            </div>
            <input
              className="text-input"
              value={title}
              placeholder="The Happy Flower"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <button
            className="big-btn"
            style={{ background: 'var(--yellow)', marginTop: 'auto' }}
            onClick={save}
            disabled={!photoFile || saving || recording}
          >
            {saving ? 'Putting it in…' : 'Put it in my box! ★'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

#### `app/src/screens/Detail.tsx`

```tsx
import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, blobOf } from '../db'
import { decor, formatDate, formatDateTime, useBufferUrl } from '../lib/ui'
import { formatDuration } from '../lib/audio'
import { processPhoto } from '../lib/image'
import { Waveform } from '../components/Waveform'
import { APP } from '../config'
import type { Screen } from '../nav'

interface Props {
  id: number
  go: (s: Screen) => void
}

export function Detail({ id, go }: Props) {
  const painting = useLiveQuery(() => db.paintings.get(id), [id])
  const photoUrl = useBufferUrl(painting?.photo, painting?.photoType)
  const audioUrl = useBufferUrl(painting?.audio, painting?.audioType)
  const [rotating, setRotating] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [editingStory, setEditingStory] = useState(false)
  const [storyDraft, setStoryDraft] = useState('')

  if (painting === undefined) return null
  if (painting === null) {
    return (
      <div className="empty-state">
        <div className="line1">This painting flew away!</div>
        <button className="chip" style={{ marginTop: 14 }} onClick={() => go({ name: 'gallery' })}>
          Back to gallery
        </button>
      </div>
    )
  }

  const d = decor(painting.id)

  const togglePlay = () => {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
    } else {
      el.play()
    }
  }

  const toggleLoved = () => db.paintings.update(id, { loved: painting.loved ? 0 : 1 })
  const toggleWall = () => db.paintings.update(id, { onWall: painting.onWall ? 0 : 1 })

  const rotate = async () => {
    if (rotating) return
    setRotating(true)
    try {
      const { photo, thumb } = await processPhoto(
        blobOf(painting.photo, painting.photoType),
        90,
      )
      await db.paintings.update(id, {
        photo: await photo.arrayBuffer(),
        photoType: 'image/jpeg',
        thumb: await thumb.arrayBuffer(),
        thumbType: 'image/jpeg',
      })
    } finally {
      setRotating(false)
    }
  }

  const share = async () => {
    const file = new File([painting.photo], `${painting.title || 'painting'}.jpg`, {
      type: 'image/jpeg',
    })
    const text = [
      painting.title || 'A masterpiece',
      `by ${APP.childName}${painting.place ? ` · ${painting.place}` : ''} · ${formatDate(painting.takenAt)}`,
    ].join('\n')
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text })
      } catch {
        /* user cancelled */
      }
    } else {
      const url = URL.createObjectURL(blobOf(painting.photo, painting.photoType))
      const a = document.createElement('a')
      a.href = url
      a.download = `${painting.title || 'painting'}.jpg`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    }
  }

  const remove = async () => {
    if (confirm(`Take "${painting.title || 'this painting'}" out of the box forever?`)) {
      await db.paintings.delete(id)
      go({ name: 'gallery' })
    }
  }

  const saveStory = async () => {
    await db.paintings.update(id, { story: storyDraft.trim() })
    setEditingStory(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          onClick={() => go({ name: 'gallery' })}
        >
          <span className="round-btn" style={{ paddingBottom: 4, fontSize: 24 }}>
            ‹
          </span>
          <span style={{ fontSize: 17, color: 'var(--muted)' }}>Back to gallery</span>
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="round-btn"
            aria-label="Love this painting"
            onClick={toggleLoved}
            style={{ color: painting.loved ? '#fff' : 'var(--coral)', background: painting.loved ? 'var(--coral)' : '#fff' }}
          >
            ♥
          </button>
          <button
            className="round-btn"
            aria-label="Rotate photo"
            onClick={rotate}
            style={{ opacity: rotating ? 0.4 : 1 }}
          >
            ↻
          </button>
          <button className="round-btn" aria-label="Share" onClick={share}>
            ↗
          </button>
        </div>
      </div>

      <div className="detail-cols">
        <div className="col-hero">
          <div style={{ position: 'relative', transform: 'rotate(-2deg)', margin: '20px auto 0', maxWidth: 560 }}>
            <div
              style={{
                position: 'absolute',
                top: -14,
                left: 30,
                width: 84,
                height: 26,
                background: 'rgba(255,201,60,.85)',
                border: '1px dashed rgba(0,0,0,.13)',
                transform: 'rotate(-8deg)',
                zIndex: 2,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: -14,
                right: 30,
                width: 84,
                height: 26,
                background: d.tape,
                border: '1px dashed rgba(0,0,0,.13)',
                transform: 'rotate(7deg)',
                zIndex: 2,
              }}
            />
            <div
              style={{
                background: '#fff',
                border: '3px solid var(--ink)',
                borderRadius: 10,
                padding: '14px 14px 18px',
                boxShadow: '7px 9px 0 rgba(26,26,26,.15)',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  border: '2px solid var(--ink)',
                  borderRadius: 5,
                  overflow: 'hidden',
                }}
              >
                {photoUrl && (
                  <img src={photoUrl} alt={painting.title} style={{ width: '100%', display: 'block' }} />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-info">
          <div style={{ fontFamily: 'var(--marker)', fontSize: 30 }}>
            {painting.title || 'Untitled masterpiece'}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            <span className="chip" style={{ background: '#FFF3D6' }}>
              🕐 {formatDate(painting.takenAt)}
            </span>
            {painting.place && (
              <span className="chip" style={{ background: '#EAF6FF', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <span className="pin" style={{ width: 13, height: 13 }} />
                {painting.place}
              </span>
            )}
          </div>

          {painting.audio && audioUrl && (
            <div className="panel" style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button
                  aria-label={playing ? 'Pause story' : 'Play story'}
                  onClick={togglePlay}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'var(--green)',
                    border: '3px solid var(--ink)',
                    flex: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 0 rgba(26,26,26,.2)',
                  }}
                >
                  {playing ? (
                    <span style={{ display: 'flex', gap: 4 }}>
                      <span style={{ width: 5, height: 18, background: '#fff' }} />
                      <span style={{ width: 5, height: 18, background: '#fff' }} />
                    </span>
                  ) : (
                    <span
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: '17px solid #fff',
                        borderTop: '11px solid transparent',
                        borderBottom: '11px solid transparent',
                        marginLeft: 4,
                      }}
                    />
                  )}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 17 }}>
                    {APP.childName}'s story
                    {painting.audioDuration ? ` · ${formatDuration(painting.audioDuration)}` : ''}
                  </div>
                  <Waveform seed={painting.id + 5} accent="var(--green)" active={playing} />
                </div>
              </div>
              <audio
                ref={audioRef}
                src={audioUrl}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
              />
            </div>
          )}

          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 13, color: 'var(--faint)', letterSpacing: '.05em', marginBottom: 5 }}>
              ABOUT THIS PAINTING
            </div>
            {editingStory ? (
              <div>
                <textarea
                  className="text-input"
                  style={{ fontSize: 18, minHeight: 80, resize: 'vertical' }}
                  value={storyDraft}
                  placeholder={`What did ${APP.childName} say about it?`}
                  onChange={(e) => setStoryDraft(e.target.value)}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button className="chip active" onClick={saveStory}>
                    Save
                  </button>
                  <button className="chip" onClick={() => setEditingStory(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                style={{ textAlign: 'left', fontSize: 18, lineHeight: 1.35, width: '100%' }}
                onClick={() => {
                  setStoryDraft(painting.story)
                  setEditingStory(true)
                }}
              >
                {painting.story ? (
                  `“${painting.story}”`
                ) : (
                  <span style={{ color: 'var(--faint)' }}>Tap to write what {APP.childName} said…</span>
                )}
              </button>
            )}
            <div style={{ fontSize: 15, color: 'var(--muted)', marginTop: 9, lineHeight: 1.4 }}>
              By {APP.childName} (age {APP.childAge}).
              <br />
              {painting.place ? `${painting.place} · ` : ''}
              {formatDateTime(painting.takenAt)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button
              className="chip"
              style={{ flex: 1, background: painting.loved ? 'var(--pink)' : '#fff', padding: '13px', fontSize: 16 }}
              onClick={toggleLoved}
            >
              ♥ {painting.loved ? 'Loved' : 'Love it'}
            </button>
            <button
              className="chip"
              style={{ flex: 1.3, background: painting.onWall ? 'var(--yellow)' : '#fff', padding: '13px', fontSize: 16 }}
              onClick={toggleWall}
            >
              {painting.onWall ? '★ On the Wall' : '+ Add to Wall'}
            </button>
            <button className="chip" style={{ flex: 1, padding: '13px', fontSize: 16 }} onClick={share}>
              ↗ Share
            </button>
          </div>

          <button
            style={{ marginTop: 18, fontSize: 14, color: 'var(--faint)', textAlign: 'left' }}
            onClick={remove}
          >
            🗑 Take it out of the box
          </button>
        </div>
      </div>
    </div>
  )
}
```

#### `app/src/screens/Wall.tsx`

```tsx
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Painting } from '../db'
import { decor, useBufferUrl } from '../lib/ui'
import type { Screen } from '../nav'

interface Props {
  go: (s: Screen) => void
}

function WallItem({ painting, onOpen }: { painting: Painting; onOpen: () => void }) {
  const url = useBufferUrl(painting.thumb, painting.thumbType)
  const d = decor(painting.id)
  return (
    <button className="wall-item" style={{ transform: `rotate(${d.rot * 1.4}deg)` }} onClick={onOpen}>
      <span className="clip" />
      {url && <img src={url} alt={painting.title} />}
      <div className="wall-caption">{painting.title || 'Untitled'}</div>
    </button>
  )
}

export function Wall({ go }: Props) {
  const paintings = useLiveQuery(
    () => db.paintings.where('onWall').equals(1).sortBy('takenAt'),
    [],
  )

  const rows: Painting[][] = []
  if (paintings) {
    for (let i = 0; i < paintings.length; i += 4) rows.push(paintings.slice(i, i + 4))
  }

  return (
    <div>
      <div className="screen-title">The Painting Wall</div>
      <div style={{ fontSize: 16, color: 'var(--muted)', marginTop: 4 }}>
        The best of the best, hanging on the line ★
      </div>

      {paintings && paintings.length === 0 ? (
        <div className="empty-state">
          <div className="doodle">🎨</div>
          <div className="line1">The wall is waiting!</div>
          <div style={{ fontSize: 17, marginTop: 6 }}>
            Open a painting and tap “+ Add to Wall” to hang it here.
          </div>
          <button className="chip active" style={{ marginTop: 16 }} onClick={() => go({ name: 'gallery' })}>
            Go to gallery
          </button>
        </div>
      ) : (
        rows.map((row, i) => (
          <div key={i} className="wall-rope">
            <div className="rope" />
            <div className="wall-row" style={{ paddingTop: 8 }}>
              {row.map((p) => (
                <WallItem key={p.id} painting={p} onOpen={() => go({ name: 'detail', id: p.id })} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
```

#### `app/src/lib/audio.ts`

```ts
function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  for (const t of ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm']) {
    if (MediaRecorder.isTypeSupported(t)) return t
  }
  return undefined
}

export class VoiceRecorder {
  private recorder: MediaRecorder | null = null
  private stream: MediaStream | null = null
  private chunks: BlobPart[] = []
  private startedAt = 0

  get supported(): boolean {
    return typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
  }

  async start(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mimeType = pickMimeType()
    this.recorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined)
    this.chunks = []
    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data)
    }
    this.recorder.start()
    this.startedAt = Date.now()
  }

  /** Stops recording and returns the audio blob plus duration in seconds. */
  stop(): Promise<{ blob: Blob; duration: number }> {
    return new Promise((resolve, reject) => {
      const rec = this.recorder
      if (!rec) return reject(new Error('not recording'))
      const duration = Math.round((Date.now() - this.startedAt) / 1000)
      rec.onstop = () => {
        const blob = new Blob(this.chunks, { type: rec.mimeType || 'audio/mp4' })
        this.cleanup()
        resolve({ blob, duration })
      }
      rec.stop()
    })
  }

  cancel(): void {
    try {
      this.recorder?.stop()
    } catch {
      /* already stopped */
    }
    this.cleanup()
  }

  private cleanup(): void {
    this.stream?.getTracks().forEach((t) => t.stop())
    this.stream = null
    this.recorder = null
  }
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
```

#### `app/src/lib/backup.ts`

```ts
import JSZip from 'jszip'
import { db, type Painting } from '../db'

interface BackupEntry {
  title: string
  story: string
  place: string
  lat: number | null
  lng: number | null
  takenAt: number
  loved: 0 | 1
  onWall: 0 | 1
  createdAt: number
  audioDuration: number | null
  photoFile: string
  thumbFile: string
  audioFile: string | null
  audioType: string | null
}

function audioExt(type: string): string {
  if (type.includes('mp4')) return 'm4a'
  if (type.includes('webm')) return 'webm'
  return 'bin'
}

export async function exportBackup(): Promise<void> {
  const paintings = await db.paintings.toArray()
  const zip = new JSZip()
  const entries: BackupEntry[] = []

  for (const p of paintings) {
    const photoFile = `photos/${p.id}.jpg`
    const thumbFile = `thumbs/${p.id}.jpg`
    zip.file(photoFile, p.photo)
    zip.file(thumbFile, p.thumb)
    let audioFile: string | null = null
    if (p.audio) {
      audioFile = `audio/${p.id}.${audioExt(p.audioType ?? '')}`
      zip.file(audioFile, p.audio)
    }
    entries.push({
      title: p.title,
      story: p.story,
      place: p.place,
      lat: p.lat,
      lng: p.lng,
      takenAt: p.takenAt,
      loved: p.loved,
      onWall: p.onWall,
      createdAt: p.createdAt,
      audioDuration: p.audioDuration,
      photoFile,
      thumbFile,
      audioFile,
      audioType: p.audioType,
    })
  }

  zip.file('metadata.json', JSON.stringify({ version: 2, exportedAt: Date.now(), entries }, null, 2))
  const blob = await zip.generateAsync({ type: 'blob' })
  const name = `art-box-backup-${new Date().toISOString().slice(0, 10)}.zip`

  const file = new File([blob], name, { type: 'application/zip' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name })
      return
    } catch {
      /* user cancelled share — fall through to download */
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

/** Imports a backup zip; returns how many paintings were added (deduped by createdAt+title). */
export async function importBackup(file: Blob): Promise<number> {
  const zip = await JSZip.loadAsync(file)
  const metaFile = zip.file('metadata.json')
  if (!metaFile) throw new Error('metadata.json missing — not an Art Box backup')
  const meta = JSON.parse(await metaFile.async('string')) as { entries: BackupEntry[] }

  const existing = await db.paintings.toArray()
  const seen = new Set(existing.map((p) => `${p.createdAt}|${p.title}`))
  let added = 0

  for (const e of meta.entries) {
    if (seen.has(`${e.createdAt}|${e.title}`)) continue
    const photoZip = zip.file(e.photoFile)
    const thumbZip = zip.file(e.thumbFile)
    if (!photoZip || !thumbZip) continue
    const photo = await photoZip.async('arraybuffer')
    const thumb = await thumbZip.async('arraybuffer')
    let audio: ArrayBuffer | null = null
    if (e.audioFile) {
      const audioZip = zip.file(e.audioFile)
      if (audioZip) audio = await audioZip.async('arraybuffer')
    }
    await db.paintings.add({
      title: e.title,
      story: e.story,
      place: e.place,
      lat: e.lat,
      lng: e.lng,
      takenAt: e.takenAt,
      loved: e.loved ? 1 : 0,
      onWall: e.onWall ? 1 : 0,
      createdAt: e.createdAt,
      audioDuration: e.audioDuration,
      photo,
      photoType: 'image/jpeg',
      thumb,
      thumbType: 'image/jpeg',
      audio,
      audioType: audio ? (e.audioType ?? 'audio/mp4') : null,
    } as Omit<Painting, 'id'> as Painting)
    added++
  }
  return added
}
```

#### `app/src/lib/geo.ts`

```ts
export interface DetectedPlace {
  place: string
  lat: number | null
  lng: number | null
}

const EMPTY: DetectedPlace = { place: '', lat: null, lng: null }

/** Best-effort location detection; resolves with empty values on any failure. */
export function detectPlace(): Promise<DetectedPlace> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(EMPTY)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        let place = ''
        try {
          const r = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          )
          const j = await r.json()
          place = j.city || j.locality || j.principalSubdivision || j.countryName || ''
        } catch {
          /* offline or API down — keep coordinates only */
        }
        resolve({ place, lat: latitude, lng: longitude })
      },
      () => resolve(EMPTY),
      { timeout: 8000, maximumAge: 10 * 60 * 1000 },
    )
  })
}
```

（这个文件调用了一个免费的反向地理编码 API 来把经纬度转成城市名，纯粹是 App 自身运行所需的技术依赖，不是需要用户点击的链接；离线或该服务不可用时会自动降级为只存经纬度。）

#### `app/src/lib/image.ts`

```ts
function loadImage(blob: Blob): Promise<HTMLImageElement> {
  // Uses onload instead of img.decode(): decode() can hang forever in hidden
  // tabs (Chromium) and misbehaves on some iOS Safari versions.
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      resolve(img)
      // revoke after the frame that draws it; pixels are already decoded
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('could not read this image'))
    }
    img.src = url
  })
}

function toJpeg(
  img: HTMLImageElement,
  maxSide: number,
  quality: number,
  rotate: 0 | 90 | 180 | 270,
): Promise<Blob> {
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
  const w = Math.round(img.naturalWidth * scale)
  const h = Math.round(img.naturalHeight * scale)
  const swap = rotate === 90 || rotate === 270
  const canvas = document.createElement('canvas')
  canvas.width = swap ? h : w
  canvas.height = swap ? w : h
  const ctx = canvas.getContext('2d')!
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((rotate * Math.PI) / 180)
  ctx.drawImage(img, -w / 2, -h / 2, w, h)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      quality,
    )
  })
}

/** Compress a camera/album photo into a full-size JPEG and a small thumbnail, optionally rotated. */
export async function processPhoto(
  file: Blob,
  rotate: 0 | 90 | 180 | 270 = 0,
): Promise<{ photo: Blob; thumb: Blob }> {
  const img = await loadImage(file)
  const photo = await toJpeg(img, 1600, 0.85, rotate)
  const thumb = await toJpeg(img, 400, 0.8, rotate)
  return { photo, thumb }
}
```

#### `app/src/lib/ui.ts`

```ts
import { useEffect, useState } from 'react'

/** Stable object URL for a blob, revoked on unmount / blob change. */
export function useObjectUrl(blob: Blob | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!blob) {
      setUrl(null)
      return
    }
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [blob])
  return url
}

/** Object URL for stored binary data (ArrayBuffer + mime type). */
export function useBufferUrl(
  buf: ArrayBuffer | null | undefined,
  type: string | null | undefined,
): string | null {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!buf || buf.byteLength === 0) {
      setUrl(null)
      return
    }
    const u = URL.createObjectURL(new Blob([buf], { type: type || 'application/octet-stream' }))
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [buf, type])
  return url
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateTime(ts: number): string {
  const d = new Date(ts)
  const date = formatDate(ts)
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${date} · ${time}`
}

const TAPE_COLORS = [
  'rgba(255,158,196,.82)',
  'rgba(79,176,232,.8)',
  'rgba(255,201,60,.85)',
  'rgba(107,191,89,.8)',
  'rgba(168,123,216,.8)',
]

/** Deterministic scrapbook decoration (tilt, tape color, corner radii) per painting. */
export function decor(id: number) {
  const rot = ((id * 37) % 5) - 2
  const tapeRot = ((id * 53) % 11) - 5
  const tape = TAPE_COLORS[id % TAPE_COLORS.length]
  const r = (n: number) => 11 + ((id * n) % 8)
  const radius = `${r(7)}px ${r(13)}px ${r(3)}px ${r(19)}px`
  return { rot, tapeRot, tape, radius }
}
```

### 第 3 步 · 本地跑起来给用户看

```bash
cd <项目文件夹>/app
npm install
npm run dev
```

打开终端里显示的地址（通常是 `http://localhost:5173/`；如果 5173 被占用，会自动换成 5174 等端口，看终端实际打印的地址），确认名字和标题显示正确。空画廊有引导文案，属正常状态。如果 `npm install` 慢或超时，换成国内镜像源重试。

浏览器里可以直接试用拍照（网页摄像头/文件选择）、录音（需要浏览器麦克风权限）、画廊筛选、备份导出这些功能——本地运行完全够用，不需要额外部署也能让家长在电脑上体验和使用。

### 第 4 步 · 交付

告诉用户：

1. **本地地址**：`http://localhost:5173/`，以后要用就在这个项目文件夹里 `npm run dev` 重新启动
2. **隐私**：照片录音只存这台设备的浏览器里，不上传到任何地方
3. **备份**：侧边栏底部 **Backup** 按钮导出 zip 备份包，**Restore** 可以在同一台设备恢复；建议隔一阵子备份一次

### （可选）想在手机/平板上单独使用

拍照和录音功能需要网页运行在 HTTPS 环境下（或者电脑本机的 `localhost`），所以要在手机/平板上脱离电脑单独使用，需要把 `npm run build` 生成的 `app/dist/` 目录部署到一个支持 HTTPS 的静态网页托管服务上——不限定用哪一个，用户已经有账号的任何平台都可以。这一步不是必需的，先把本地版本做好、让家长满意就是完整交付；如果用户后续问起怎么上线，再根据他们现有的托管条件具体处理即可。

## 注意事项

- 相机和麦克风 API 要求 HTTPS 或 localhost，本地开发用 `npm run dev` 天然满足
- 不要往模板里加登录、云存储、统计等功能，除非用户明确要求——本地优先、零账号是这个 App 的卖点
- 用户如果想改配色/字体/墙的样式，主题变量集中在 `app/src/theme.css` 的 `:root` 里

## 常见问题排查

- `npm install` 卡住或超时：换用国内镜像源重试
- 页面打开是空白 / 报错：检查 `app/src/config.ts` 是否原样保留了 `base: '/'`（除非确实需要部署到子路径）
- 拍照或录音没反应：确认是通过 `npm run dev` 用 `http://localhost:...` 打开的，不是通过局域网 IP（如 `192.168.x.x`）访问——非 localhost 的 HTTP 地址浏览器会禁用摄像头/麦克风
- 定位拿不到 / 地点是空的：正常降级行为，用户拒绝定位或超时后地点栏留空可手动输入，不影响保存
- 多个孩子：给每个孩子建一个独立的项目文件夹（重复第 2 步，换一次 `config.ts` 里的名字），数据天然隔离，互不影响
