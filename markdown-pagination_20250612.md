# B 功能补齐 — Markdown + 溢出 + 分享就绪

**时间**: 2025-06-12 16:37-16:45

---

## B1：Markdown 输入

### 支持语法
- `**粗体文字**` → 行内粗体渲染（fontWeight 700）
- `# 标题` / `## 副标题` / `### 三级` → 行首标题，字号缩放 1.5x/1.35x/1.2x
- 空行 → 段落间距（0.6x 行高 gap）
- 纯文本（无 markdown）→ 走原有管线，零性能损耗

### 实现
新增 4 个方法：
- `parseMarkdown(text)` → `{ segments, headingLevel, gapBefore, gapAfter, isHeading }`
- `parseBoldSegments(text)` → `[{ text, bold, scale }]`
- `flattenLines(ctx, mdLines, maxW, fontSize, fontWeight)` → 物理行展开（纯文本行按宽度换行，富文本行保持原样）
- `drawWideSegments()` → 宽字距分段渲染（星空模板专用）

### 架构决策
- 智能检测：无 markdown 时走旧管线
- 富文本行不自动换行（MV P，用户自己断行）
- calcFontSize 基于纯文本版本估算

---

## B2：溢出截断

- 物理行 > 14 → 截断，末尾 `…`
- `truncated` 标志 → WXML 显示 "文字较长已截断"（赤陶色）

---

## B3：分享就绪态

- 新增 `cardReady` 状态
- onGenerate 重置 → `cardReady: false`
- Canvas 导出成功 → `cardReady: true`
- 分享/下载按钮 `disabled="{{!cardReady}}"` 防止未生成就点击
- onCloseResult 重置 `cardReady: false`

---

## 文件变更

| 文件 | 变更 |
|------|------|
| `index.js` | +4 方法 + 溢出逻辑 + cardReady 状态 |
| `index.wxml` | placeholder 改 Markdown 提示 + 按钮 disabled + 截断提示 |
| `index.wxss` | 新增 `.editor-hint` 样式 |

---

## 后续
- C：微信开发者工具实测
- 字体粗细（bold/700）在 Canvas 上的实际效果待确认
- 标题字号缩放与实际视觉比例待验证
