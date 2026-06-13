# 真机首跑修复 2025-06-13

## 环境
- WeChatLib: 3.16.1
- 基础库: 3.16.1（灰度）

## 报错 & 修复

### TypeError: afterGenerate is not a function
- 根因：`bindtap="onGenerate"` 传 event 对象作为首参，`if (afterGenerate)` 放行 truthy 对象
- 修复1：onGenerate 入口 `typeof afterGenerate === 'function'` 过滤，存为 `callback`
- 修复2：success 回调内同样用 `typeof afterGenerate === 'function'` 双保险

### wx.getSystemInfoSync is deprecated
- 根因：3.16 库废弃旧 API
- 修复：`wx.getWindowInfo().pixelRatio`

## 非代码警告（忽略）
- SharedArrayBuffer deprecation → Chrome DevTools M92 起的要求，不影响小程序
- Launch timeout 31453ms → 开发工具首次启动慢，非代码问题
