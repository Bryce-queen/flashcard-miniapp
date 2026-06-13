# 全量自检报告 2025-06-13 18:14

## 已修复本次

### 🔴 history[].text 空值崩点
- **位置**：index.wxml `{{item.text.slice(0, 12)}}` + index.js `stripMarkdown(h.text)`
- **触发**：存储损坏或旧版本数据缺少 text 字段
- **修复**：WXML 加 `(item.text || '')` 安全访问；JS 加 `h.text` 判空

## 基线检查（全绿）

### 数据流
- ✅ getApp().globalData.templates 引用传递 → onLaunch 合并后可见
- ✅ JSON.parse 全 try-catch 包裹
- ✅ history 上限 8 条、保存/恢复全量护
- ✅ ratioIndex 已存入历史并恢复

### 绘制管线
- ✅ fitFontSize maxLines 已改为 H/52 动态计算
- ✅ 截断 line + … 正确处理空 segments
- ✅ wideSpacing 逐字测量循环 O(n²) — n≤200 可接受
- ✅ colophon 三种风格坐标均基于 H 动态计算
- ✅ Canvas 宽高=Dpr，destWidth/H正确

### UI 事件
- ✅ onGenerate 入口 typeof 'function' 过滤器
- ✅ success 回调内双重 typeof 'function' 守卫
- ✅ generating 标志在 export 完成后才清
- ✅ 按钮 disabled="{{generating}}" 防连点

### 兼容性
- ✅ wx.getWindowInfo() 替代 getSystemInfoSync（2.24.0+）
- ✅ Canvas 2D type="2d" API（基础库 2.9.0+）
- ✅ aspect-ratio CSS（Chrome 88+，对应基础库 2.19+）

## 未修的已知项（≤低风险）

| 项 | 风险 | 说明 |
|----|------|------|
| wx.env.USER_DATA_PATH | 低 | 已标记废弃但 3.16.1 仍可用 |
| 水印双色叠坐标 | 低 | 最终效果为黑 0.04 α，需真机确认 |
| setTimeout 360ms | 低 | 经验值，非零风险但 MVP 够用 |
| onCloseResult 竞态 | 极低 | 生成中关弹窗会重新弹出，不会丢数据 |
| 分享卡片无缓存图 | 极低 | 微信降级显示小程序图标 |

## 结论

**0 个阻塞级 bug。代码可上真机。**
