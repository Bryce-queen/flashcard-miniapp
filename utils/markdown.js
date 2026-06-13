/* ═══════════════════════════════════════════════════════
   utils/markdown.js
   Markdown 解析 · 纯函数 · 零依赖
   ═══════════════════════════════════════════════════════ */

/**
 * 解析 Markdown 文本为结构化行数组
 * 支持：#/##/### 标题、**粗体**、空行分段
 * 修复：标题内 **粗体** 也正确解析
 */
function parseMarkdown(text) {
  const rawLines = text.split('\n')
  const result = []

  for (let i = 0; i < rawLines.length; i++) {
    const raw = rawLines[i]
    const trimmed = raw.trim()

    if (!trimmed) {
      if (result.length > 0) result[result.length - 1].gapAfter = 1
      continue
    }

    const h = trimmed.match(/^(#{1,3})\s+(.+)$/)
    if (h) {
      const segs = parseBoldSegments(h[2])
      if (segs.length > 0) segs[0].scale = 1.5 - (h[1].length - 1) * 0.15
      result.push({
        segments: segs,
        headingLevel: h[1].length,
        gapBefore: result.length > 0 ? 0.4 : 0,
        gapAfter: 0.6,
        isHeading: true
      })
      continue
    }

    result.push({
      segments: parseBoldSegments(trimmed),
      headingLevel: 0,
      gapBefore: 0,
      gapAfter: 0,
      isHeading: false
    })
  }
  return result
}

/**
 * 解析 **粗体** 标记
 * 处理未闭合 **（退回为普通文本）
 */
function parseBoldSegments(text) {
  const segs = []
  let i = 0, cur = ''

  while (i < text.length) {
    if (text[i] === '*' && text[i + 1] === '*') {
      if (cur) segs.push({ text: cur, bold: false, scale: 1 })
      cur = ''
      i += 2
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '*')) {
        cur += text[i]
        i++
      }
      if (text[i] === '*' && text[i + 1] === '*') {
        if (cur) segs.push({ text: cur, bold: true, scale: 1 })
        i += 2
      } else {
        segs.push({ text: '**' + cur, bold: false, scale: 1 })
      }
      cur = ''
    } else {
      cur += text[i]
      i++
    }
  }
  if (cur) segs.push({ text: cur, bold: false, scale: 1 })
  return segs
}

/**
 * 剥离 Markdown 标记 → 预览用纯文本
 */
function stripMarkdown(text) {
  return text
    .replace(/^#{1,3}\s/gm, '')
    .replace(/\*{2}/g, '')
}

/**
 * 检测文本是否包含 Markdown 标记
 */
function hasMarkdown(text) {
  return text.includes('**') || /^#{1,3}\s/m.test(text)
}

module.exports = { parseMarkdown, parseBoldSegments, stripMarkdown, hasMarkdown }
