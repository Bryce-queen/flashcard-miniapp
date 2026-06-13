# E 分享闭环 — 水印 + 历史 + 分享标题

**时间**: 2025-06-12 16:49-16:58

---

## 1. 品牌水印

- Canvas 右下角叠加 "闪 卡" 文字
- 白 7% + 黑 4% 双色叠加，浅/深底均可见
- ctx.save/restore 隔离，不影响其他绘制

## 2. 卡片历史

**存储**: wx.setStorageSync('flashcard_history')
- 每次生成后自动保存：{ path, text, templateIndex, time }
- 最多 8 条，FIFO

**UI**: 操作按钮下方出现 "最近" 区域
- 横向滚动 160×214rpx 缩略图
- 显示前 12 字标题
- 点击 → 恢复文案和模板 → 重新输入区
- 右上角 "清空" 按钮（确认弹窗）

**生命周期**: 
- onLoad/onShow 读取存储
- 临时路径在会话内有效，退出后利用 text + template 恢复文案（图片需重新生成）

## 3. 分享标题

- 自动提取卡片前 16 字作为分享标题
- 格式：`闪卡 · 今天学了一个新词…`
- 剥离 ** 和 # 标记

## 文件变更

| 文件 | 变更 |
|------|------|
| index.js | +drawWatermark, +saveToHistory/loadHistory/onHistoryTap/onClearHistory, onShareAppMessage 优化, onLoad/onShow 新增 |
| index.wxml | +history-section（缩略图列表 + 清空按钮） |
| index.wxss | +60 行 history 样式 |

## TODO
- 历史缩略图使用 wx.saveFile 持久化（当前用临时路径，退出后失效）
- 历史卡片长按菜单（删除单张/重新分享）
