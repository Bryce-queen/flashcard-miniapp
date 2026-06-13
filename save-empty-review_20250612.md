# D 收尾 — 保存流程修复 + 空状态引导 + 代码审阅

**时间**: 2025-06-12 16:45-16:48

---

## 保存流程：轮询 → 事件驱动

**旧**：onSaveToAlbum → onGenerate → setInterval 每 600ms 轮询 cardImagePath
**新**：onSaveToAlbum → onGenerate(callback) → Canvas 导出成功 → callback(saveImage)

实现：
- `onGenerate(afterGenerate)` 接受可选回调
- `drawCard(afterGenerate)` 在 `canvasToTempFilePath` success 中调用回调
- 消除 setInterval 轮询反模式

## 空状态引导

输入为空时展示 4 条示例文案（花叔风格）：
- "今天学了一个新词：反脆弱"
- "此刻 · 窗外下雨，我在听坂本龙一"
- "人生不是马拉松…"
- "完成 > 完美"

点击即填入输入框，含 markdown 标记（**粗体**、# 标题、空行分段）。

CSS：chip 式按钮，active 时黑底反白。

## 代码审阅：calcFontSize → fitFontSize

**旧**：calcFontSize + estimateLineCount
- estimateLineCount 用字符数近似 `Math.ceil(len / (maxW / (fs * 0.6)))`
- 0.6 是经验值，中日文混排不准

**新**：fitFontSize（合并字号计算 + 物理行展开）
- 逐级缩字（每次 -2px），每级调用 flattenLines 做真实 Canvas measureText
- 物理行 ≤ 14 即停止
- 返回 `{ fontSize, physLines }` 一并给下游用
- 消除「先算字号再展开」的两次遍历

## 文件最终状态

| 文件 | 行数 | 方法数 |
|------|------|--------|
| index.js | 515 | 17 |
| index.wxml | ~95 | 更新 |
| index.wxss | ~170 | 新增 .examples |

## 后续（需开发者工具）

1. Canvas 上粗体/标题渲染验证
2. 示例点击后 markdown 解析流程验证
3. 保存到相册授权流程
4. 分享图片实际路径
