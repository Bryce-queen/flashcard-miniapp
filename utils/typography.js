/* ═══════════════════════════════════════════════════════
   utils/typography.js
   排版引擎 · 字号计算 · 换行 · 行展开
   ctx 作为首参数注入，不从外部绑定
   ═══════════════════════════════════════════════════════ */

/**
 * 逐级缩字：从 preferredSize 开始，真实测量物理行数，直到 ≤maxLines
 * 最坏情况迭代 13 轮（54→22，步长 2），每轮测量 500 字符，
 * 低端 Android 约 100-200ms，可接受
 */
function fitFontSize(ctx, mdLines, maxW, preferredSize, fontWeight, maxLines) {
  let fs = preferredSize
  let physLines
  const minSize = 22
  while (fs >= minSize) {
    physLines = flattenLines(ctx, mdLines, maxW, fs, fontWeight)
    if (physLines.length <= maxLines) break
    fs -= 2
  }
  return { fontSize: Math.max(fs, minSize), physLines }
}

/**
 * 将 Markdown 结构化行展开为排版物理行
 * 含粗体/标题的行不换行，纯文本行按宽度换行
 */
function flattenLines(ctx, mdLines, maxW, fontSize, fontWeight) {
  const result = []
  for (const ml of mdLines) {
    if (ml.isHeading || ml.segments.some(s => s.bold)) {
      result.push({
        segments: ml.segments,
        gapBefore: ml.gapBefore,
        gapAfter: ml.gapAfter
      })
      continue
    }
    const plainText = ml.segments.map(s => s.text).join('')
    if (!plainText) continue
    ctx.font = `${fontWeight} ${fontSize}px -apple-system, "PingFang SC", sans-serif`
    const wrapped = wrapPlainText(ctx, plainText, maxW)
    wrapped.forEach((w, wi) => {
      result.push({
        segments: [{ text: w, bold: false, scale: 1 }],
        gapBefore: wi === 0 ? ml.gapBefore : 0,
        gapAfter: 0
      })
    })
  }
  return result
}

/**
 * 按可用宽度换行
 * CJK 文本逐字换行；含拉丁字符时尝试在单词边界换行
 * 含避头标点：行首不出现 。，、；：！？）】》」』
 */
function wrapPlainText(ctx, text, maxWidth) {
  const lines = []
  let cur = ''

  // 不可在行首出现的标点
  const NO_LEAD = /^[。，、；：！？）」』】》>\.,;:!?\]\)}»›%]/
  // 不可在行尾出现的标点
  const NO_TRAIL = /[（「『【《<\[\({$]$/

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '\n') { lines.push(cur); cur = ''; continue }

    const test = cur + ch
    if (ctx.measureText(test).width > maxWidth && cur.length > 0) {
      // 尝试空格断行（拉丁文本）
      const hasLatin = /[a-zA-Z]/.test(cur)
      if (hasLatin) {
        const lastSpace = cur.lastIndexOf(' ')
        if (lastSpace > 0) {
          lines.push(cur.slice(0, lastSpace))
          cur = cur.slice(lastSpace + 1) + ch
          continue
        }
      }
      // 避头：如果 ch 是标点，回退 cur 最后一个字到下一行
      if (NO_LEAD.test(ch) && cur.length >= 2) {
        lines.push(cur.slice(0, -1))
        cur = cur.slice(-1) + ch
        continue
      }
      // 避尾：如果 cur 末字是开括号，提前带到下一行
      if (NO_TRAIL.test(cur) && cur.length >= 2) {
        lines.push(cur.slice(0, -1))
        cur = cur.slice(-1) + ch
        continue
      }
      lines.push(cur)
      cur = ch
    } else {
      cur = test
    }
  }
  if (cur) lines.push(cur)
  return lines
}

module.exports = { fitFontSize, flattenLines, wrapPlainText }
