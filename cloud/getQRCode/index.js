// 云函数：生成小程序码，用于卡片右下角水印
const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async () => {
  try {
    const result = await cloud.openapi.wxacode.getUnlimited({
      scene: 'f',
      page: 'pages/index/index',
      width: 280,
      autoColor: false,
      lineColor: { r: 0, g: 0, b: 0 },
      isHyaline: true
    })
    return {
      code: 0,
      buffer: result.buffer.toString('base64'),
      contentType: result.contentType
    }
  } catch (err) {
    console.error('getUnlimitedQRCode failed', err)
    return { code: -1, errMsg: err.message }
  }
}
