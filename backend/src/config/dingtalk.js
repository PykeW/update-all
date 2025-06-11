/**
 * 钉钉应用配置
 */
module.exports = {
  // 钉钉开放平台应用的 AppKey
  appKey: process.env.DINGTALK_APP_KEY || 'your_dingtalk_app_key',
  
  // 钉钉开放平台应用的 AppSecret
  appSecret: process.env.DINGTALK_APP_SECRET || 'your_dingtalk_app_secret',
  
  // 钉钉扫码登录跳转的地址，需要在钉钉开放平台配置
  redirectUri: process.env.DINGTALK_REDIRECT_URI || 'http://localhost:3000/auth/dingtalk/callback',
  
  // 钉钉接口地址
  apiHost: 'https://oapi.dingtalk.com',
  
  // 用户信息接口
  userInfoApi: 'https://api.dingtalk.com/v1.0/contact/users/me',
  
  // 钉钉扫码登录页面
  qrcodeUrl: 'https://login.dingtalk.com/login/qrcode.htm',
  
  // 允许登录的钉钉用户手机号白名单（为空则不限制）
  allowedPhones: (process.env.ALLOWED_DINGTALK_PHONES || '').split(',').filter(Boolean),
  
  // 允许登录的钉钉用户邮箱白名单（为空则不限制）
  allowedEmails: (process.env.ALLOWED_DINGTALK_EMAILS || '').split(',').filter(Boolean),
  
  // 是否严格检查白名单（true: 必须在白名单中才能登录，false: 白名单为空时不检查）
  strictWhitelist: process.env.STRICT_WHITELIST === 'true' || false
} 