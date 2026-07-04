/**
 * 每个孩子专属的配置 — 想给自己的孩子做一个，只改这个文件即可。
 * Per-child configuration — to make this app for your own kid, edit this file only.
 */
export const APP = {
  /** 孩子的名字（画作署名、语音故事标签用） */
  childName: 'Jasper',
  /** 年龄（侧边栏和署名里显示） */
  childAge: 6,
  /** 侧边栏 logo 第一行 */
  titleTop: "Jasper's",
  /** 侧边栏 logo 第二行 */
  titleBottom: 'Art Box',
  /** 完整应用名（浏览器标签页、PWA 安装名） */
  title: "Jasper's Art Box",
  /** PWA 短名（主屏幕图标下的文字，别超过 12 字符） */
  shortName: 'Art Box',
  /** 部署路径：GitHub Pages 项目页必须是 '/<仓库名>/' */
  base: '/jasper-artbox/',
}

export const AVATAR_INITIAL = APP.childName.trim().charAt(0).toUpperCase() || 'A'
