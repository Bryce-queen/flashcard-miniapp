# 架构重构 + AI 管线 2025-06-13

## 三步做完

### 1. Bug 修复（4 项）
- # **title** 内粗体解析：标题文本也走 parseBoldSegments
- wrapPlainText 单词边界：含拉丁字符时在最后一个空格处断行
- 冗余 draw 配置：DEFAULT_DRAW + Object.assign 合并，模板只声明 diff
- 加 loading 状态：`generating` 数据控制按钮禁用和文案

### 2. 文件拆分
| 文件 | 行 | 职责 |
|------|-----|------|
| utils/markdown.js | 98 | parseMarkdown / parseBoldSegments / stripMarkdown / hasMarkdown |
| utils/typography.js | 90 | fitFontSize / flattenLines / wrapPlainText（含单词边界） |
| utils/renderer.js | 210 | drawCard 完整管线 + 9 个装饰元件 |
| pages/index/index.js | 240 | 瘦身到状态管理 + 事件胶水（从 588 行 × 42%） |

### 3. AI 管线
- **云函数**: `cloud/functions/generateCard/index.js`（OpenAI 兼容 API，含 fallback 兜底文案库）
- **前端**: 模式切换（自己写 / AI 写）、AI 输入框、生成按钮、loading 状态
- 部署：需开通微信云开发 + 配置 AI_API_KEY 环境变量
- 无云开发下 `fallbackAiGenerate` 可改为直接 `wx.request`

## 代码量对比

```
重构前:  index.js 588行 + app.js 142行 = 730行业务代码
重构后:  index.js 240行 + app.js 97行 + utils 398行 = 735行
         (相同总量，但拆成了 3 个可复用模块)
```
