# 闪卡 · FlashCard

> 一句话记录此刻，生成精美分享卡片。

微信小程序 · 纯 Canvas 2D 渲染 · 花叔设计系统 · Markdown 原生支持

---

## 快速开始

```
微信开发者工具 → 导入项目 → 选此目录 → 编译运行
AppID: wx17634b15075ee433
基础库要求: ≥ 3.3.4
```

无需 `npm install`，零外部依赖，开箱即跑。

---

## 功能

### 输入
- **手写** — 直接打字，支持 `**粗体**`、`#/##/###` 标题、空行分段，最高 500 字
- **AI 写** — 输入话题，AI 返回一句话 → 自动填入编辑区（需配置云函数）

### 排版
- **动态字号** — Canvas `measureText` 实测迭代，短句 56px 起、长文逐级缩至 22px
- **富文本** — 粗体/标题/正文混排，每段独立字重和字号
- **溢出保护** — 超出行数自动截断并标记「…」，弹窗标注

### 输出
- **保存相册** — 一键写入系统相册，含授权引导
- **分享朋友** — `onShareAppMessage` 标题自动截取前 16 字 + 卡片图片
- **本地历史** — 最近 8 张卡片存储，点击即恢复（含模板/比例/tag）

### 比例
- **3:4 竖版** 540×720 — 小红书/朋友圈竖图首选
- **1:1 方卡** 540×540 — Instagram/头像/贴纸风

---

## 6 套模板

每套模板拥有独立排版语言，不纯换色。

| 模板 | 底色 | 装饰 | 适用 |
|------|------|------|------|
| **暖白** Editorial | `#fbf7ee` 奶油纸 | 左竖线 · 发丝线 · 签注横线 | 日常记录、读书笔记 |
| **瑞士** Swiss | `#ffffff` 纯白 | 1/3·2/3 水平参考线 | 名言、金句、准则 |
| **暗调** Dark | `#1a1610` 暖黑 | 暖橙发丝线 · 大字留白 | 深夜感悟、电影台词 |
| **星空** Cosmic | `#0a0a0a` 深黑 | 随机星点 · 居中宽字距 | 浪漫、诗句、歌词 |
| **森林** Forest | `#f7faf6` 淡绿 | 绿竖线 · 开放无顶线 | 自然、环保、心境 |
| **宣言** Mono | `#b04a1a` 赤陶 | 零装饰 · 56px 白字满版 | 态度、口号、一句话 |

配色体系（模板间共享的色阶）：

| token | 暖白 | 瑞士 | 暗调 | 星空 | 森林 | 宣言 |
|-------|------|------|------|------|------|------|
| `bg` | `#fbf7ee` | `#fff` | `#1a1610` | `#0a0a0a` | `#f7faf6` | `#b04a1a` |
| `text` | `#1a1612` | `#000` | `#ece4d2` | `#f0ead8` | `#1a2a1a` | `#fff` |
| `accent` | `#b04a1a` | `#b04a1a` | `#e08560` | `#4a7cb5` | `#0a5c4b` | `#f5e0d0` |
| `rule` | `#d9d2c0` | `#e5e5e5` | `#3a3326` | `#2a2a2a` | `#d8e2d4` | `#d97342` |

---

## 架构

三层分离 — 排版、解析、绘制互不渗漏：

```
pages/index/
    index.js         ← 状态管理 + UI 事件 + 胶水层（~200 行）
    index.wxml/.wxss  ← 视图

utils/
    markdown.js      ← 纯函数：parseMarkdown / stripMarkdown / hasMarkdown
    typography.js    ← 字号迭代 + CJK/拉丁智能换行 + 富文本展开
    renderer.js      ← Canvas 2D 绘制管线：底 → 装饰 → 排印 → 签注 → 水印

cloud/functions/
    generateCard/    ← 可选 AI 文案云函数（DeepSeek + 兜底文案库）

app.js               ← 模板定义 + DEFAULT_DRAW 默认合并
```

### 绘制管线

```
输入文本
  → markdown.parseMarkdown()      # 结构化行数组
  → typography.fitFontSize()      # 动态字号 + 物理行展开
  → renderer.drawCard()
      1. 铺底色
      2. 绘制装饰（发丝线/竖线/网格/星点）
      3. 逐段逐字排印（粗体/标题缩放/宽字距）
      4. 签注「闪卡」+ 横线
      5. 品牌水印
  → canvasToTempFilePath()        # 导出 PNG
  → saveFileSync()                # 持久化
  → saveImageToPhotosAlbum()      # 存入相册
```

---

## AI 模式（可选）

### 1. 开通云开发

微信开发者工具 → 云开发 → 开通 → 创建环境

### 2. 部署云函数

```
右键 cloud/functions/generateCard → 上传并部署
```

### 3. 初始化

`app.js` 的 `onLaunch` 中取消注释：

```js
wx.cloud.init({ env: '你的环境ID' })
```

### Fallback

未配置时 AI 按钮降级为 toast 提示，不影响手写模式完整功能。

---

## 设计原则

基于花叔（陈云飞 / alchaincyf）的 huashu-design 设计系统：

- **反 AI slop** — 0 渐变 · 0 发光 · 0 emoji · 0 圆角阴影
- **发丝线** — 1px 实线代替一切分割器
- **Warm Editorial** — `#fbf7ee` 奶油纸底色 + `#b04a1a` 赤陶橙强调
- **材质优先** — 颜色来自纸/墨/陶/木，拒绝纯 RGB 色
- **排版差异** — 每套模板在字号、字重、对齐、字距上有独立决策
- **从需求长出** — 风格库是弹药，好设计从具体场景长出来

---

## 路线图

- [x] 6 套模板排版语言
- [x] Markdown 解析（粗体 + 标题 + 分段）
- [x] 3:4 + 1:1 双比例
- [x] 卡片历史 + 本地持久化
- [x] AI 文案云函数骨架
- [x] 品牌水印 + 分享闭环
- [ ] 真机编译验证
- [ ] 更多模板（4-6 套）
- [ ] 9:16 全屏比例
- [ ] 自定义字号/字距
- [ ] 卡片收藏夹
- [ ] 订阅消息提醒

---

## 文件清单

| 文件 | 行 | 说明 |
|------|----|------|
| `app.js` | 140 | 6 模板定义 + draw 合并 |
| `pages/index/index.js` | 226 | 页面逻辑 + 历史 + AI |
| `pages/index/index.wxml` | 173 | 选择器 + 输入 + 弹窗 |
| `pages/index/index.wxss` | 320+ | Warm Editorial 样式 |
| `utils/renderer.js` | 215 | Canvas 2D 绘制引擎 |
| `utils/typography.js` | 82 | 字号计算 + 换行 |
| `utils/markdown.js` | 95 | Markdown 解析 |
| `cloud/functions/generateCard/` | 44 | AI 云函数 |

---

## 鸣谢

- 花叔 / 陈云飞 ([@alchaincyf](https://github.com/alchaincyf)) — huashu-design 设计系统
- 微信小程序 Canvas 2D API
