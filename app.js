App({
  globalData: {
    DEFAULT_DRAW: {
      hairlineTop: true,
      hairlineBottom: true,
      leftAccent: false,
      textAlign: 'left',
      fontWeight: 600,
      fontSizeBase: 44,
      colophonStyle: 'rule',
      gridLines: false,
      starDots: false,
      accentHairlines: false,
      wideSpacing: false,
      marginX: 80
    },

    // 设计系统 · 基于花叔 huashu-design 40 种风格库
    // 原则：反 AI slop · 每种风格有独立排版语言 · 不纯换色
    // draw 配置自动合并 DEFAULT_DRAW，模板只需声明 diff
    templates: [
      {
        id: 'editorial',
        name: '暖白',
        bg: '#fbf7ee',
        bg2: '#f3ecd9',
        text: '#1a1612',
        text2: '#4a4338',
        accent: '#b04a1a',
        accent2: '#d97342',
        rule: '#d9d2c0',
        draw: {
          leftAccent: true,
          fontWeight: 600,
          fontSizeBase: 46,
          colophonStyle: 'rule'
        }
      },
      {
        id: 'swiss',
        name: '瑞士',
        bg: '#ffffff',
        bg2: '#f5f5f5',
        text: '#000000',
        text2: '#555555',
        accent: '#b04a1a',
        accent2: '#d97342',
        rule: '#e5e5e5',
        draw: {
          fontWeight: 700,
          gridLines: true
        }
      },
      {
        id: 'dark',
        name: '暗调',
        bg: '#1a1610',
        bg2: '#221d14',
        text: '#ece4d2',
        text2: '#c0b89f',
        accent: '#e08560',
        accent2: '#f0a07d',
        rule: '#3a3326',
        draw: {
          fontSizeBase: 48,
          colophonStyle: 'minimal',
          accentHairlines: true,
          marginX: 72
        }
      },
      {
        id: 'cosmic',
        name: '星空',
        bg: '#0a0a0a',
        bg2: '#1a1a1a',
        text: '#f0ead8',
        text2: '#a09880',
        accent: '#4a7cb5',
        accent2: '#6a9cd5',
        rule: '#2a2a2a',
        draw: {
          textAlign: 'center',
          fontWeight: 400,
          colophonStyle: 'centered',
          starDots: true,
          wideSpacing: true,
          marginX: 72
        }
      },
      {
        id: 'forest',
        name: '森林',
        bg: '#f7faf6',
        bg2: '#e8f0e4',
        text: '#1a2a1a',
        text2: '#4a5a4a',
        accent: '#0a5c4b',
        accent2: '#148a70',
        rule: '#d8e2d4',
        draw: {
          hairlineTop: false,
          leftAccent: true,
          fontWeight: 500
        }
      },
      {
        id: 'mono',
        name: '宣言',
        bg: '#b04a1a',
        bg2: '#8a3512',
        text: '#ffffff',
        text2: '#f5e0d0',
        accent: '#f5e0d0',
        accent2: '#ffffff',
        rule: '#d97342',
        draw: {
          hairlineTop: false,
          hairlineBottom: false,
          textAlign: 'center',
          fontWeight: 800,
          fontSizeBase: 56,
          colophonStyle: 'minimal',
          marginX: 60
        }
      },
      {
        id: 'paper',
        name: '纸页',
        bg: '#f4f0e6',
        bg2: '#e8e2d0',
        text: '#2a2216',
        text2: '#6a5d4a',
        accent: '#8b4513',
        accent2: '#a0622e',
        rule: '#d4c8b4',
        draw: {
          fontWeight: 400,
          fontSizeBase: 42,
          colophonStyle: 'rule',
          marginX: 88,
          wideSpacing: true
        }
      },
      {
        id: 'typewriter',
        name: '打字机',
        bg: '#faf8f2',
        bg2: '#f0ece0',
        text: '#1a1612',
        text2: '#5a544a',
        accent: '#c0392b',
        accent2: '#e74c3c',
        rule: '#d8d4c8',
        draw: {
          fontWeight: 400,
          fontSizeBase: 36,
          colophonStyle: 'minimal',
          hairlineTop: false,
          marginX: 72
        }
      },
      {
        id: 'brutalist',
        name: '粗野',
        bg: '#ff6b00',
        bg2: '#e05000',
        text: '#000000',
        text2: '#1a1a1a',
        accent: '#000000',
        accent2: '#000000',
        rule: '#cc5500',
        draw: {
          fontWeight: 900,
          fontSizeBase: 60,
          colophonStyle: 'box',
          textAlign: 'center',
          hairlineTop: false,
          hairlineBottom: false,
          gridLines: true,
          marginX: 36
        }
      },
      {
        id: 'terminal',
        name: '终端',
        bg: '#0c0c0c',
        bg2: '#141414',
        text: '#00ff41',
        text2: '#009933',
        accent: '#00ff41',
        accent2: '#00cc33',
        rule: '#1a3a1a',
        draw: {
          fontWeight: 400,
          fontSizeBase: 40,
          colophonStyle: 'prompt',
          leftAccent: true,
          marginX: 68
        }
      }
    ],
    currentTemplateIndex: 0
  },

  onLaunch() {
    // 启动时自动合并 draw 默认值
    const dfl = this.globalData.DEFAULT_DRAW
    this.globalData.templates.forEach(t => {
      t.draw = Object.assign({}, dfl, t.draw)
    })
  }
})