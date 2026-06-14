# AI 云函数部署指南

## 前置条件
1. 微信开发者工具 → 云开发 → 开通（免费额度够用）
2. 一个 OpenAI 兼容 API Key（DeepSeek 最便宜，¥1/百万 tokens）

## 部署步骤

### 1. 上传云函数
微信开发者工具 → 云开发 → 云函数 → 新建 Node.js 云函数 `generateCard`
→ 把 `cloud/functions/generateCard/index.js` 和 `package.json` 复制进去
→ 右键 `generateCard` → 上传并部署：云端安装依赖

### 2. 配置环境变量
云开发控制台 → 云函数 → generateCard → 配置 → 环境变量：

| 变量 | 值 | 说明 |
|------|-----|------|
| AI_API_KEY | sk-xxxxxxxx | DeepSeek/OpenAI 的 API Key |
| AI_API_URL | https://api.deepseek.com/chat/completions | 或其他兼容 API |
| AI_MODEL | deepseek-chat | 模型名 |

### 3. 初始化云开发
在 `app.js` 的 `onLaunch` 里加一行：
```javascript
wx.cloud.init({ env: '你的环境ID' })
```

### 4. 测试
在小程序里切换到 "AI 写" → 输入 "今天好累" → 点 "AI 写一句话"
→ 应该拿到一句话回到输入区

## 备用方案（无云开发）
可直接在 `pages/index/index.js` 的 `fallbackAiGenerate` 里改 `wx.request`：
```javascript
wx.request({
  url: 'https://your-api.com/generate',
  method: 'POST',
  data: { prompt },
  success: res => { ... }
})
```
需在微信后台配置 request 合法域名。

---

## getQRCode · 小程序码云函数

### 部署
微信开发者工具 → 云函数 → 新建 `getQRCode`
→ 把 `cloud/getQRCode/index.js` 和 `cloud/getQRCode/config.json` 复制进去
→ 右键 `getQRCode` → 上传并部署

### 说明
- 每次生成卡片时自动获取小程序码，画在右下角水印位
- 本地缓存 5 分钟，过期自动刷新
- 需在云函数权限配置中开启 `wxacode.getUnlimited`
- 无云开发时自动降级为文字水印「闪卡」
