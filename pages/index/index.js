/* ═══════════════════════════════════════════════════════
   闪卡 · 主页逻辑
   瘦身后只做：状态管理 + UI 事件 + 胶水代码
   排版引擎 → utils/typography
   Markdown  → utils/markdown
   绘制引擎 → utils/renderer
   ═══════════════════════════════════════════════════════ */

const md = require('../../utils/markdown')
const renderer = require('../../utils/renderer')

const HISTORY_KEY = 'flashcard_history'
const HISTORY_MAX = 8

Page({
  data: {
    // 双模式：'write' 手写 | 'ai' AI 生成
    mode: 'write',
    aiPrompt: '',
    inputText: '',
    previewText: '',
    generating: false,
    templates: getApp().globalData.templates,
    currentTemplate: 0,
    activeTemplate: getApp().globalData.templates[0],
    ratios: [
      { id: '3:4', label: '竖版 3:4', w: 540, h: 720 },
      { id: '1:1', label: '方卡 1:1', w: 540, h: 540 }
    ],
    currentRatio: 0,
    activeRatio: { id: '3:4', label: '竖版 3:4', w: 540, h: 720 },
    showResult: false,
    cardImagePath: '',
    cardReady: false,
    truncated: false,
    canvasDisplayW: 540,
    canvasDisplayH: 720,
    history: []
  },

  onLoad() { this.loadHistory() },
  onShow() { this.loadHistory() },

  /* ── 模式切换 ── */
  onSwitchMode(e) {
    const m = e.currentTarget.dataset.mode
    this.setData({ mode: m })
  },

  /* ── 卡片历史 ── */

  loadHistory() {
    try {
      const raw = wx.getStorageSync(HISTORY_KEY)
      if (raw) this.setData({ history: JSON.parse(raw).slice(0, HISTORY_MAX) })
    } catch (_) { this.setData({ history: [] }) }
  },

  saveToHistory(card) {
    try {
      let list = []
      const raw = wx.getStorageSync(HISTORY_KEY)
      if (raw) list = JSON.parse(raw)
      list.unshift(card)
      if (list.length > HISTORY_MAX) list = list.slice(0, HISTORY_MAX)
      wx.setStorageSync(HISTORY_KEY, JSON.stringify(list))
      this.setData({ history: list })
    } catch (_) {}
  },

  onHistoryTap(e) {
    const h = this.data.history[e.currentTarget.dataset.index]
    if (h && h.text) {
      const templ = getApp().globalData.templates[h.templateIndex]
      const ratioIdx = h.ratioIndex != null ? h.ratioIndex : 0
      const ratio = this.data.ratios[ratioIdx]
      this.setData({
        inputText: h.text,
        previewText: md.stripMarkdown(h.text),
        currentTemplate: h.templateIndex,
        activeTemplate: templ,
        currentRatio: ratioIdx,
        activeRatio: ratio,
        canvasDisplayW: ratio.w,
        canvasDisplayH: ratio.h
      })
      wx.showToast({ title: '已恢复，点击生成卡片', icon: 'none', duration: 1500 })
    }
  },

  onHistoryThumbError(e) {
    // 裂图容错：路径失效时隐藏 image，用纯色占位
    const idx = e.currentTarget.dataset.index
    const key = `history[${idx}].thumbBroken`
    this.setData({ [key]: true })
  },

  onClearHistory() {
    wx.showModal({
      title: '清空历史',
      content: '确认删除所有卡片记录？',
      success: r => {
        if (r.confirm) {
          try { wx.removeStorageSync(HISTORY_KEY) } catch (_) {}
          this.setData({ history: [] })
          wx.showToast({ title: '已清空', icon: 'none' })
        }
      }
    })
  },

  /* ── 输入 ── */

  onTextInput(e) {
    const raw = e.detail.value
    this.setData({ inputText: raw, previewText: md.stripMarkdown(raw) })
  },

  onAiPromptInput(e) {
    this.setData({ aiPrompt: e.detail.value })
  },

  onExampleTap(e) {
    const text = e.currentTarget.dataset.text
    this.setData({ inputText: text, previewText: md.stripMarkdown(text) })
  },

  onSelectTemplate(e) {
    const idx = e.currentTarget.dataset.index
    this.setData({
      currentTemplate: idx,
      activeTemplate: getApp().globalData.templates[idx]
    })
  },

  onSelectRatio(e) {
    const idx = e.currentTarget.dataset.index
    const r = this.data.ratios[idx]
    if (!r) return
    this.setData({
      currentRatio: idx,
      activeRatio: r,
      canvasDisplayW: r.w,
      canvasDisplayH: r.h
    })
  },

  /* ── AI 生成文案 ── */
  onAiGenerate() {
    const prompt = this.data.aiPrompt.trim()
    if (!prompt) {
      wx.showToast({ title: '输入一个话题或心情', icon: 'none' })
      return
    }
    this.setData({ generating: true })

    // 尝试云函数，fail/try-catch 都进 fallback
    try {
      if (wx.cloud && typeof wx.cloud.callFunction === 'function') {
        wx.cloud.callFunction({
          name: 'generateCard',
          data: { prompt },
          success: res => {
            this.setData({ generating: false })
            if (res.result && res.result.text) {
              this.setData({
                inputText: res.result.text,
                previewText: md.stripMarkdown(res.result.text),
                mode: 'write'
              })
            }
          },
          fail: () => this.fallbackAiGenerate(prompt)
        })
        return
      }
    } catch (_) {}
    this.fallbackAiGenerate(prompt)
  },

  fallbackAiGenerate(prompt) {
    wx.showToast({ title: 'AI 生成需要配置云开发', icon: 'none', duration: 2500 })
    this.setData({ generating: false })
  },

  /* ── 生成卡片 ── */
  onGenerate(afterGenerate) {
    const callback = typeof afterGenerate === 'function' ? afterGenerate : null
    const text = this.data.inputText.trim()
    if (!text) {
      wx.showToast({ title: '先写点文字', icon: 'none' })
      return
    }
    this.setData({ showResult: true, cardImagePath: '', cardReady: false, truncated: false, generating: true })
    setTimeout(() => this.runDrawPipe(callback), 360)
  },

  runDrawPipe(afterGenerate) {
    const query = wx.createSelectorQuery()
    query.select('#cardCanvas')
      .fields({ node: true, size: true })
      .exec(res => {
        if (!res || !res[0] || !res[0].node) {
          this.setData({ generating: false })
          wx.showToast({ title: '画布初始化失败', icon: 'none' })
          return
        }
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = wx.getWindowInfo().pixelRatio || 2
        const ratio = this.data.activeRatio
        const W = ratio.w, H = ratio.h

        const tpl = this.data.activeTemplate
        const rawText = this.data.inputText

        const mdLines = md.hasMarkdown(rawText)
          ? md.parseMarkdown(rawText)
          : [{ segments: [{ text: rawText, bold: false, scale: 1 }], headingLevel: 0, gapBefore: 0, gapAfter: 0, isHeading: false }]

        renderer.drawCard({
          canvas, ctx, W, H, dpr, tpl, rawText, mdLines,
          onDone: truncated => {
            wx.canvasToTempFilePath({
              canvas,
              x: 0, y: 0, width: W, height: H,
              destWidth: W * dpr,
              destHeight: H * dpr,
              success: res => {
                this.setData({ generating: false })
                const fs = wx.getFileSystemManager()
                const persistentPath = `${wx.env.USER_DATA_PATH}/flashcard_${Date.now()}.png`
                try {
                  fs.saveFileSync(res.tempFilePath, persistentPath)
                  this.setData({ cardImagePath: persistentPath, cardReady: true, truncated })
                  this.saveToHistory({ path: persistentPath, text: rawText, templateIndex: this.data.currentTemplate, ratioIndex: this.data.currentRatio, time: Date.now() })
                } catch (_) {
                  this.setData({ cardImagePath: res.tempFilePath, cardReady: true, truncated })
                  this.saveToHistory({ path: res.tempFilePath, text: rawText, templateIndex: this.data.currentTemplate, ratioIndex: this.data.currentRatio, time: Date.now() })
                }
                if (typeof afterGenerate === 'function') afterGenerate()
              },
              fail: err => {
                this.setData({ generating: false })
                console.error('Canvas 导出失败', err)
                wx.showToast({ title: '生成失败，请重试', icon: 'none' })
              }
            })
          }
        })
      })
  },

  /* ── 保存 ── */
  onSaveToAlbum() { this.onGenerate(() => this.saveImage()) },
  onDownloadImage() { this.saveImage() },

  saveImage() {
    const path = this.data.cardImagePath
    if (!path) return
    wx.saveImageToPhotosAlbum({
      filePath: path,
      success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
      fail: err => {
        if (err.errMsg && err.errMsg.indexOf('auth deny') > -1) {
          wx.showModal({
            title: '授权提示',
            content: '请在设置中允许保存图片到相册',
            success: r => r.confirm && wx.openSetting()
          })
        } else {
          wx.showToast({ title: '保存失败', icon: 'none' })
        }
      }
    })
  },

  /* ── 分享 ── */
  onCloseResult() { this.setData({ showResult: false, cardReady: false }) },

  onShareAppMessage() {
    const text = this.data.inputText
    const snippet = text
      ? md.stripMarkdown(text).slice(0, 16) + (text.length > 16 ? '…' : '')
      : '一句话记录此刻'
    return {
      title: `闪卡 · ${snippet}`,
      path: '/pages/index/index',
      imageUrl: this.data.cardImagePath || ''
    }
  }
})
