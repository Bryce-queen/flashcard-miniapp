/* ═══════════════════════════════════════════════════════
   云函数: generateCard
   AI 一句话生成卡片文案
   部署后需在云开发控制台配置环境变量 AI_API_KEY + AI_API_URL

   调用: wx.cloud.callFunction({ name: 'generateCard', data: { prompt } })
   返回: { text: "城市的灯一盏盏灭了，我的键盘还在发光" }

   支持 OpenAI 兼容 API（如 DeepSeek、Moonshot、通义千问）
   ═══════════════════════════════════════════════════════ */

const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

/* 配置：在云函数环境变量中设置，或直接写在这里（仅开发阶段） */
const API_KEY = process.env.AI_API_KEY || ''
const API_URL = process.env.AI_API_URL || 'https://api.deepseek.com/chat/completions'
const MODEL   = process.env.AI_MODEL   || 'deepseek-chat'

const SYSTEM_PROMPT = `你是一句话卡片生成器。用户给你一个话题或情绪，你返回一句话（10-30个汉字），适合放在分享卡片上。

规则：
1. 只返回这句话，不要任何其他内容
2. 文学化、有温度、适合分享
3. 不要用 emoji、不要加标签（#）、不要解释
4. 如果用户输入足够诗意，可以润色但保留原意
5. 风格参照：村上春树式的日常诗意、安妮宝贝式的情绪白描、短的、精确的

示例：
话题: 凌晨三点还在写代码
→ 月光落在键盘上，bug 和灵感一样多

话题: 周末的咖啡馆
→ 拿铁的奶泡慢慢塌下去，像这个下午

话题: 想家了
→ 妈妈发来一张晚饭照片，我看了十分钟`

exports.main = async (event) => {
  const { prompt } = event
  if (!prompt || !prompt.trim()) {
    return { text: '生活不在别处，就在此刻的呼吸间' }
  }

  if (!API_KEY) {
    // 无 API Key 时返回一条预设诗意文案
    return { text: fallbackText(prompt) }
  }

  try {
    const res = await cloud.request({
      url: API_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      timeout: 15000,
      data: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt.trim() }
        ],
        temperature: 0.9,
        max_tokens: 80
      })
    })

    const text = res.data.choices?.[0]?.message?.content?.trim()
    if (text) {
      return { text }
    }
    return { text: fallbackText(prompt) }
  } catch (err) {
    console.error('AI API 调用失败:', err)
    return { text: fallbackText(prompt) }
  }
}

/* 无 API 时的兜底文案库 */
const FALLBACKS = [
  '世界很大，此刻很小，刚好装下我',
  '窗外有风经过，像什么都没发生',
  '把今天过成一首短诗',
  '暂停一下，你不需要一直奔跑',
  '有些话不必说出口，写下来就好',
  '这一刻的安静，值一张卡片',
  '生活的褶皱里藏着光',
  '我在这里，时间刚好',
  '天空没有留下痕迹，但我已飞过',
  '留白是最高级的表达'
]

function fallbackText(prompt) {
  // 取 prompt 的前几个字做种子
  let seed = 0
  for (let i = 0; i < Math.min(prompt.length, 20); i++) {
    seed = ((seed << 5) - seed) + prompt.charCodeAt(i)
  }
  return FALLBACKS[Math.abs(seed) % FALLBACKS.length]
}
