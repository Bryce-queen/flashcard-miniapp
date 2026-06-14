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
    loading: false,
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
    skipModal: false,
    cardImagePath: '',
    cardReady: false,
    truncated: false,
    showDrafts: false,
    draftVariants: [],
    canvasDisplayW: 540,
    canvasDisplayH: 720,
    history: []
  },

  // 小程序码本地缓存路径（懒加载）
  _qrCodePath: '',

  onLoad() { this.loadHistory() },
  onShow() { this.loadHistory() },

  /* ── 小程序码 · 懒加载 + 5min 缓存 ── */
  fetchQRCode(callback) {
    if (this._qrCodePath) {
      // 检查缓存是否 ≤5min 有效
      const fs = wx.getFileSystemManager()
      try {
        const stat = fs.statSync(this._qrCodePath)
        if (Date.now() - stat.lastModifiedTime < 300000) {
          callback(this._qrCodePath)
          return
        }
      } catch (_) {}
    }
    // 云函数取码
    try {
      if (wx.cloud && typeof wx.cloud.callFunction === 'function') {
        wx.cloud.callFunction({
          name: 'getQRCode',
          success: res => {
            if (res.result && res.result.code === 0 && res.result.buffer) {
              try {
                const fs = wx.getFileSystemManager()
                const path = `${wx.env.USER_DATA_PATH}/qr_${Date.now()}.png`
                fs.writeFileSync(path, res.result.buffer, 'base64')
                this._qrCodePath = path
                callback(path)
              } catch (_) { callback('') }
            } else { callback('') }
          },
          fail: () => callback('')
        })
        return
      }
    } catch (_) {}
    callback('')
  },

  /* ── 草案选择 ── */
  onPickDraft(e) {
    const v = this.data.draftVariants[e.currentTarget.dataset.index]
    if (!v) return
    const ratio = this.data.ratios[v.ratioIdx]
    const tpl = getApp().globalData.templates[v.tplIdx]
    this.setData({
      currentTemplate: v.tplIdx, activeTemplate: tpl,
      currentRatio: v.ratioIdx, activeRatio: ratio,
      canvasDisplayW: ratio.w, canvasDisplayH: ratio.h,
      showDrafts: false, loading: true, generating: true
    })
    setTimeout(() => this.runDrawPipe(), 200)
  },

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
  onGenerate(afterGenerate, opts) {
    const skipModal = !!(opts && opts.skipModal)
    const callback = typeof afterGenerate === 'function' ? afterGenerate : null
    const text = this.data.inputText.trim()
    if (!text) {
      wx.showToast({ title: '先写点文字', icon: 'none' })
      return
    }
    this.setData({
      showResult: !skipModal, skipModal,
      showDrafts: !skipModal,
      cardImagePath: '', cardReady: false, truncated: false,
      generating: true, loading: false
    })

    if (!skipModal) {
      // 准备 3 种草案变体
      const templates = getApp().globalData.templates
      const tplIdx = this.data.currentTemplate
      const t2 = (tplIdx + 1) % templates.length
      const t3 = (tplIdx + 2) % templates.length
      const rIdx = this.data.currentRatio
      const r2 = this.data.ratios[(rIdx + 1) % this.data.ratios.length]
      this.setData({
        draftVariants: [
          { label: `「${templates[tplIdx].name}」${this.data.activeRatio.label}`, tplIdx, ratioIdx: rIdx },
          { label: `「${templates[t2].name}」${this.data.activeRatio.label}`, tplIdx: t2, ratioIdx: rIdx },
          { label: `「${templates[tplIdx].name}」${r2.label}`, tplIdx, ratioIdx: this.data.ratios.indexOf(r2) }
        ]
      })
      return
    }
    setTimeout(() => this.runDrawPipe(callback), 360)
  },

  runDrawPipe(afterGenerate) {
    // 异步获取小程序码（缓存 ≤5min）
    this.fetchQRCode(qrPath => {
      this._runDrawPipeCore(afterGenerate, qrPath)
    })
  },

  _runDrawPipeCore(afterGenerate, qrCodePath) {
    const query = wx.createSelectorQuery()
    query.select('#cardCanvas')
      .fields({ node: true, size: true })
      .exec(res => {
        if (!res || !res[0] || !res[0].node) {
          this.setData({ generating: false, loading: false })
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
          canvas, ctx, W, H, dpr, tpl, rawText, mdLines, qrCodePath,
          onDone: truncated => {
            wx.canvasToTempFilePath({
              canvas,
              x: 0, y: 0, width: W, height: H,
              destWidth: W * dpr,
              destHeight: H * dpr,
              success: res => {
                this.setData({ generating: false, loading: false })
                const fs = wx.getFileSystemManager()
                const persistentPath = `http://usr/flashcard_${Date.now()}.png`
                let finalPath = res.tempFilePath
                try {
                  fs.saveFileSync(res.tempFilePath, persistentPath)
                  finalPath = persistentPath
                } catch (_) {}
                this.setData({ cardImagePath: finalPath, cardReady: true, truncated })
                this.saveToHistory({ path: finalPath, text: rawText, templateIndex: this.data.currentTemplate, ratioIndex: this.data.currentRatio, time: Date.now() })
                if (typeof afterGenerate === 'function') afterGenerate()
              },
              fail: err => {
                this.setData({ generating: false, loading: false })
                console.error('Canvas 导出失败', err)
                const errMsg = err.errMsg || ''
                const hint = errMsg.includes('memory') || errMsg.includes('MEMORY')
                  ? '内存不足，试试更短的文字'
                  : errMsg.includes('timeout') || errMsg.includes('TIMEOUT')
                    ? '设备处理超时，请降低比例重试'
                    : '生成失败，请重试'
                wx.showToast({ title: hint, icon: 'none', duration: 2800 })
              }
            })
          }
        })
      })
  },

  /* ── 保存 ── */
  onSaveToAlbum() {
    // 一步到位：绘制 → 保存到相册 → toast，不弹窗口
    this.onGenerate(() => this.saveImage(), { skipModal: true })
  },
  onDownloadImage() { this.saveImage() },

  saveImage() {
    const path = this.data.cardImagePath
    if (!path) return
    const skipModal = this.data.skipModal
    wx.saveImageToPhotosAlbum({
      filePath: path,
      success: () => {
        wx.showToast({ title: '已保存到相册', icon: 'success' })
        if (skipModal) this.setData({ skipModal: false, cardImagePath: '', cardReady: false })
      },
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
        if (skipModal) this.setData({ skipModal: false })
      }
    })
  },

  /* ── 分享 ── */
  onCloseResult() { this.setData({ showResult: false, cardReady: false, showDrafts: false, draftVariants: [] }) },

  onShareAppMessage() {
    const text = this.data.inputText
    const snippet = text
      ? md.stripMarkdown(text).slice(0, 16) + (text.length > 16 ? '…' : '')
      : '一句话记录此刻'
    const result = {
      title: `闪卡 · ${snippet}`,
      path: '/pages/index/index'
    }
    if (this.data.cardImagePath) {
      result.imageUrl = this.data.cardImagePath
    }
    return result
  }
})
