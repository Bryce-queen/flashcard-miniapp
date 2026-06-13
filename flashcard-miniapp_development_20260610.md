# 闪卡小程序开发记录

## 任务
用户要求按花叔（Alchain/B站花叔v）的思路，做一个微信小程序。

## 花叔核心方法论
- **AI Native 开发**：用 AI 工具快速交付，不纠结技术细节
- **一个功能做到极致**：小猫补光灯 = 一个屏幕变色功能 → App Store 第一
- **3 步完成核心流程**：打开 → 操作 → 分享
- **极简 MVP**：1 小时能搞定绝不拖 1 周
- **裂变基因**：产品本身自带传播属性

## 选定产品：⚡闪卡
一句话 → 一张卡片 → 一次分享

## 已交付文件
位于 `C:\Users\hjl15\.qclaw\workspace\flashcard-miniapp\`

| 文件 | 用途 |
|------|------|
| app.js | 全局配置、6 套模板定义 |
| app.json | 页面路由、窗口样式 |
| app.wxss | 全局样式 |
| pages/index/index.wxml | 主页界面（输入+模板+预览+生成） |
| pages/index/index.wxss | 主页样式（暗色主题） |
| pages/index/index.js | 核心逻辑（文字换行、Canvas 2D 绘制、保存相册、分享） |
| project.config.json | 微信开发者工具配置 |

## 技术要点
- Canvas 2D API 高清渲染卡片
- 自动换行算法
- 6 套模板（极简/暗夜/暖阳/深海/森林/玫瑰）
- dpr 适配保证清晰度
- 保存相册 + 分享给朋友

## 待办
- 用户需在 project.config.json 填入自己的 AppID
- 用微信开发者工具打开即可预览
- 后续可接入 AI 文案润色、更多模板