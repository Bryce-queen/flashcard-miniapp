# 审计修复 2025-06-13

## 已修复

### bug: 生成中按钮可重复点击
- 原因：onDone 回调在 canvasToTempFilePath 前清 generating，导出期间按钮已亮
- 修复：generating:false 移入 export 的 success/fail 回调内

### bug: 1:1 比例字号漏损
- 原因：fitFontSize 硬编码 maxLines=14，1:1 实际显示 10 行
- 修复：传 Math.floor(H/52) → 3:4→13, 1:1→10

### 修复: 历史恢复丢失比例
- 原因：saveToHistory 未存 ratioIndex
- 修复：saveToHistory 加 ratioIndex，onHistoryTap 恢复 currentRatio/activeRatio/canvasDisplay

## 其余审计未触发的问题（记录不修）

| 项 | 描述 | 不修原因 |
|----|------|----------|
| onSaveToAlbum 会弹 modal | 隐藏 Canvas 在小程序限制较多，弹窗是务实方案 | MVP 可接受 |
| 水印双色叠在同一坐标 | 白底上黑 0.04 几乎不可见，设计意图是微压印 | 需真机验证后微调 |
| setTimeout 360ms 等 DOM | 依赖经验值，无 nextTick/mutationObserver | MVP 够用 |
