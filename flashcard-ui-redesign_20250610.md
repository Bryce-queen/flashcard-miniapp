# 闪卡 UI 重设计（花叔风格）

**时间**: 2025-06-10 12:40  
**目标**: 按照花叔（Alchain）huashu-design 设计哲学完全重写闪卡小程序 UI

## 变更背景

用户对上一版 UI 不满意。经分析花叔开源项目（huashu-design 17.8k ⭐、huashu-md-html、img2046）的设计系统后，发现原版充斥 AI slop 元素：
- 深蓝背景 #0f0f1a （#0D1117 禁区）
- 渐变按钮 linear-gradient
- emoji 装饰（⚡、✨）
- 圆角卡片 + 左侧彩色 accent bar
- glow 阴影效果
- 模板仅简单换色

## 设计决策

采用花叔 Warm Editorial 风格为主基调，融合 Swiss Monochrome：

### 色彩系统
- 底色：奶油纸 #fbf7ee（代替深蓝）
- 正文：墨黑 #1a1612
- 强调：赤陶橙 #b04a1a（代替粉色渐变）
- 规则线：暖灰 #d9d2c0

### 排版系统
- 按钮改为 Rams 式：直角 2rpx 圆角，2px 实线边框，反转 hover
- 模板选择改为 Chip 式（色块 + 文字）
- 刊头使用发丝线分隔（30% 宽，左靠）
- 输入区使用上下细线框而非圆角卡片

### 6 套模板（基于 40 种风格库）
1. **暖白** — Warm Editorial · 奶油纸+赤陶橙
2. **瑞士** — Swiss Monochrome · 纯黑白 Vercel 风
3. **暗调** — Dark Editorial · 暖暗色（非 GitHub 蓝）
4. **星空** — Cosmic · 近黑+奶油黄+钴蓝
5. **森林** — Humanist Rounded · 米白+森林绿
6. **宣言** — Mono-Brand · 满版赤陶+反白文字

### Canvas 绘制
- 顶部发丝线 + 底部发丝线
- 左侧竖线装饰（30% 屏高，低透明度）
- 正文 PingFang SC Semibold
- 底部签注格式：装饰线（30% 宽）+ 品牌文字右对齐

## 修改文件
- `app.js`：全新模板配色
- `app.json`：导航栏改为暖白系
- `app.wxss`：全局暖白底色
- `pages/index/index.wxml`：重构 UI 结构
- `pages/index/index.wxss`：完全重写
- `pages/index/index.js`：Canvas 绘制逻辑优化