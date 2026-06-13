# 防御性补强 2025-06-13

## 四项修复

### ③ 生成失败后按钮永久 disabled（Bug）
- 原因：canvasToTempFilePath fail 回调未清 `generating`，按钮 `disabled="{{generating}}"` 永远为 true
- 修复：fail 中加 `this.setData({ generating: false })`

### ① 历史缩略图裂图（容错）
- 原因：wxfile 路径在缓存清理后失效，`<image>` 显示空白/裂图标记
- 修复：
  - WXML: image 加 `binderror="onHistoryThumbError"` + `wx:if="{{!item.thumbBroken}}"`
  - 裂图时显示模板底色方块 + "已失效" 文字占位
  - JS: `onHistoryThumbError` → 设置 `history[idx].thumbBroken = true`
  - WXSS: `.history-thumb-fallback` + `.thumb-fallback-text`

### ⑤ 云函数未初始化时 try-catch 失效（Bug）
- 原因：`if (wx.cloud)` 只检测对象存在，未验 `callFunction` 方法可用性。catch-less 模式下同步抛异常会静默失效
- 修复：
  - 条件改为 `wx.cloud && typeof wx.cloud.callFunction === 'function'`
  - 外层 `try {} catch {}` 兜底 → 任何异常都进 fallback

### ② 历史恢复无反馈（UX）
- 修复：`onHistoryTap` 末尾加 `wx.showToast({ title: '已恢复，点击生成卡片', duration: 1500 })`

## 文件变更
- pages/index/index.js: +8 行
- pages/index/index.wxml: +3 行（image condition + fallback view）
- pages/index/index.wxss: +13 行（fallback 样式）
