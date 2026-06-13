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