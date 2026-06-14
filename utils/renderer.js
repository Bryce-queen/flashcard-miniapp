/* ═══════════════════════════════════════════════════════
   utils/renderer.js
   Canvas 2D 绘制引擎 · 纯渲染 · 不绑定 Page/WX
   所有依赖通过 opts 注入
   ═══════════════════════════════════════════════════════ */

const typo = require('./typography')

/**
 * 主绘制入口
 * opts: { canvas, ctx, W, H, dpr, tpl, rawText, mdLines, onDone(path, truncated) }
 */
function drawCard(opts) {
  const { canvas, ctx, W, H, dpr, tpl, rawText, mdLines, onDone, qrCodePath } = opts

  canvas.width = W * dpr
  canvas.height = H * dpr
  ctx.scale(dpr, dpr)

  const d = tpl.draw

  // ── 字号 + 行展开 ──
  const maxW = W - d.marginX * 2
  const { fontSize, physLines: rawLines } = typo.fitFontSize(ctx, mdLines, maxW, d.fontSizeBase, d.fontWeight, Math.floor(H / 52))

  // ── 溢出截断 · 按高度自适应 (3:4→14行, 1:1→10行) ──
  const maxPhysLines = Math.floor(H / 52)
  let truncated = false
  let physLines = rawLines
  if (physLines.length > maxPhysLines) {
    truncated = true
    physLines = physLines.slice(0, maxPhysLines)
    const lastSegs = physLines[maxPhysLines - 1].segments
    if (lastSegs.length > 0) {
      const last = lastSegs[lastSegs.length - 1]
      last.text = last.text.replace(/…+$/, '') + '…'
    }
  }

  // ═══════ 1. 铺底 ═══════
  ctx.fillStyle = tpl.bg
  ctx.fillRect(0, 0, W, H)

  // ═══════ 2. 装饰 ═══════
  if (d.hairlineTop) drawHairline(ctx, W, 0, d.accentHairlines ? tpl.accent : tpl.rule)
  if (d.hairlineBottom) drawHairline(ctx, W, H - 1, d.accentHairlines ? tpl.accent : tpl.rule)
  if (d.leftAccent) drawLeftBar(ctx, tpl.accent, H)
  if (d.gridLines) drawSwissGrid(ctx, W, H, tpl.rule)
  if (d.starDots) drawStarDots(ctx, W, H, tpl.accent, rawText)

  // ═══════ 3. 富文本排印 ═══════
  const lh = fontSize * 1.52
  let y = d.hairlineTop ? 110 : 90

  for (const pl of physLines) {
    y += pl.gapBefore * lh

    let segFontSize = fontSize
    const firstSeg = pl.segments[0]
    if (firstSeg && firstSeg.scale > 1) segFontSize = fontSize * firstSeg.scale

    if (d.wideSpacing) {
      drawWideSegments(ctx, pl, d.marginX, y, segFontSize, d.fontWeight, d.textAlign, W, tpl.text)
    } else {
      let totalW = 0
      for (const seg of pl.segments) {
        const weight = seg.bold ? '700' : String(d.fontWeight)
        const sfs = seg.scale > 1 ? segFontSize : fontSize
        ctx.font = `${weight} ${sfs}px -apple-system, "PingFang SC", sans-serif`
        totalW += ctx.measureText(seg.text).width
      }
      let cx = d.textAlign === 'center' ? W / 2 - totalW / 2 : d.marginX
      for (const seg of pl.segments) {
        const weight = seg.bold ? '700' : String(d.fontWeight)
        const sfs = seg.scale > 1 ? segFontSize : fontSize
        ctx.font = `${weight} ${sfs}px -apple-system, "PingFang SC", sans-serif`
        ctx.fillStyle = tpl.text
        ctx.textBaseline = 'top'
        ctx.textAlign = 'left'
        ctx.fillText(seg.text, cx, y)
        cx += ctx.measureText(seg.text).width
      }
    }

    y += lh
    y += pl.gapAfter * lh
  }

  // ═══════ 4. 签注 ═══════
  drawColophon(ctx, W, H, tpl, d)

  // ═══════ 5. 水印 ═══════
  drawWatermark(ctx, W, H, tpl.bg, qrCodePath, () => {
    onDone(truncated)
  })

  onDone(truncated)
}

/* ── 装饰元件 ── */

function drawHairline(ctx, W, y, color) {
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(48, y)
  ctx.lineTo(W - 48, y)
  ctx.stroke()
}

function drawLeftBar(ctx, color, H) {
  ctx.strokeStyle = color
  ctx.globalAlpha = 0.22
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(48, 110)
  ctx.lineTo(48, 110 + H * 0.3)
  ctx.stroke()
  ctx.globalAlpha = 1
}

function drawSwissGrid(ctx, W, H, color) {
  const top = 110, bottom = H - 72
  const h = bottom - top
  const y1 = top + h * 0.33
  const y2 = top + h * 0.66
  ctx.strokeStyle = color
  ctx.globalAlpha = 0.18
  ctx.lineWidth = 0.5
  ;[y1, y2].forEach(y => {
    ctx.beginPath()
    ctx.moveTo(48, y)
    ctx.lineTo(W - 48, y)
    ctx.stroke()
  })
  ctx.globalAlpha = 1
  ctx.lineWidth = 1
}

function drawStarDots(ctx, W, H, color, text) {
  const seed = hashText(text)
  const count = 3 + (seed % 3)
  const rng = seededRng(seed)
  ctx.fillStyle = color
  const zones = [
    { x: W * 0.12, y: H * 0.08, rx: W * 0.18, ry: H * 0.10 },
    { x: W * 0.82, y: H * 0.12, rx: W * 0.15, ry: H * 0.12 },
    { x: W * 0.08, y: H * 0.88, rx: W * 0.14, ry: H * 0.10 },
    { x: W * 0.90, y: H * 0.85, rx: W * 0.10, ry: H * 0.10 },
    { x: W * 0.15, y: H * 0.50, rx: W * 0.08, ry: H * 0.06 }
  ]
  for (let i = 0; i < count; i++) {
    const z = zones[i % zones.length]
    const cx = z.x + rng() * z.rx
    const cy = z.y + rng() * z.ry
    const r = 1 + rng() * 2
    ctx.globalAlpha = 0.28
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
    if (rng() < 0.35) {
      const arm = r * 3
      ctx.strokeStyle = color
      ctx.globalAlpha = 0.12
      ctx.lineWidth = 0.5
      ctx.beginPath(); ctx.moveTo(cx - arm, cy); ctx.lineTo(cx + arm, cy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx, cy - arm); ctx.lineTo(cx, cy + arm); ctx.stroke()
    }
  }
  ctx.globalAlpha = 1
  ctx.lineWidth = 1
}

function drawWideSegments(ctx, pl, marginX, y, fontSize, fontWeight, textAlign, W, textColor) {
  const extraSpacing = 5
  let allChars = []
  let ci = 0
  ctx.fillStyle = textColor
  for (const seg of pl.segments) {
    const weight = seg.bold ? '700' : String(fontWeight)
    const fs = seg.scale > 1 ? fontSize * seg.scale : fontSize
    ctx.font = `${weight} ${fs}px -apple-system, "PingFang SC", sans-serif`
    for (const ch of seg.text) {
      allChars.push({ ch, segIdx: ci, w: ctx.measureText(ch).width + extraSpacing })
    }
    ci++
  }
  let totalW = 0
  allChars.forEach(c => totalW += c.w)
  totalW -= extraSpacing
  let cx = textAlign === 'center' ? W / 2 - totalW / 2 : marginX
  let charIdx = 0
  for (const seg of pl.segments) {
    const weight = seg.bold ? '700' : String(fontWeight)
    const fs = seg.scale > 1 ? fontSize * seg.scale : fontSize
    ctx.font = `${weight} ${fs}px -apple-system, "PingFang SC", sans-serif`
    for (const ch of seg.text) {
      ctx.fillText(ch, cx, y)
      cx += allChars[charIdx].w
      charIdx++
    }
  }
}

function drawColophon(ctx, W, H, tpl, d) {
  const colophonY = d.hairlineBottom ? H - 72 : H - 56
  if (d.colophonStyle === 'rule') {
    ctx.strokeStyle = tpl.accent
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(48, colophonY)
    ctx.lineTo(48 + W * 0.3, colophonY)
    ctx.stroke()
    ctx.fillStyle = tpl.text2
    ctx.globalAlpha = 0.45
    ctx.font = '400 18px -apple-system, "PingFang SC", sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('闪卡', W - 48, colophonY + 28)
    ctx.globalAlpha = 1
  } else if (d.colophonStyle === 'centered') {
    ctx.fillStyle = tpl.text2
    ctx.globalAlpha = 0.4
    ctx.font = '400 16px -apple-system, "PingFang SC", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('闪卡', W / 2, colophonY + 16)
    ctx.globalAlpha = 1
  } else if (d.colophonStyle === 'box') {
    // Brutalist: 实心色块 + 反白文字
    const bw = 72, bh = 28
    ctx.fillStyle = tpl.accent
    ctx.fillRect(W - 48 - bw, colophonY - 8, bw, bh)
    ctx.fillStyle = tpl.bg
    ctx.font = '700 16px -apple-system, "PingFang SC", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('闪卡', W - 48 - bw / 2, colophonY + 11)
    ctx.globalAlpha = 1
  } else if (d.colophonStyle === 'prompt') {
    // Terminal: `$ ` 前缀 + 正文
    ctx.fillStyle = tpl.text2
    ctx.globalAlpha = 0.5
    ctx.font = '400 16px "Courier New", monospace'
    ctx.textAlign = 'right'
    ctx.fillText('$ 闪卡', W - 48, colophonY + 16)
    ctx.globalAlpha = 1
  } else {
    ctx.fillStyle = tpl.text2
    ctx.globalAlpha = 0.35
    ctx.font = '400 16px -apple-system, "PingFang SC", sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('闪卡', W - 48, colophonY + 16)
    ctx.globalAlpha = 1
  }
  ctx.textAlign = 'left'
}

function drawWatermark(ctx, W, H, bg, qrCodePath, onReady) {
  ctx.save()
  // 小程序码（右下角 68×68 rpx → px 按比例缩放）
  const qrSize = Math.round(W * 0.12)
  const qrX = W - qrSize - 16
  const qrY = H - qrSize - 12

  if (qrCodePath) {
    const img = ctx.createImage()
    img.onload = () => {
      // 半透明底衬
      ctx.fillStyle = getLuminance(bg) > 0.45 ? '#000000' : '#ffffff'
      ctx.globalAlpha = 0.06
      ctx.fillRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8)
      ctx.globalAlpha = 0.88
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize)
      ctx.restore()
      if (onReady) onReady()
    }
    img.onerror = () => {
      drawWatermarkText(ctx, W, H, bg)
      ctx.restore()
      if (onReady) onReady()
    }
    img.src = qrCodePath
  } else {
    drawWatermarkText(ctx, W, H, bg)
    ctx.restore()
    if (onReady) onReady()
  }
}

function drawWatermarkText(ctx, W, H, bg) {
  const text = '闪 卡'
  const fs = 14
  ctx.fillStyle = getLuminance(bg) > 0.45 ? '#000000' : '#ffffff'
  ctx.globalAlpha = 0.08
  ctx.font = `${fs}px -apple-system, "PingFang SC", sans-serif`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillText(text, W - 20, H - 14)
}

function getLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return 0.299 * r + 0.587 * g + 0.114 * b
}

function hashText(text) {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function seededRng(seed) {
  let s = seed
  return function () {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

module.exports = { drawCard }
