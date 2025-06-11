/**
 * 钉钉应用配置
 */
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  // 钉钉应用ID
  DINGTALK_APP_ID: process.env.DINGTALK_APP_ID || '',
  
  // 钉钉应用密钥
  DINGTALK_APP_SECRET: process.env.DINGTALK_APP_SECRET || '',
  
  // 钉钉回调地址
  DINGTALK_REDIRECT_URI: process.env.DINGTALK_REDIRECT_URI || 'http://localhost:5000/api/auth/dingtalk/callback',
  
  // 前端URL
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:8080',
  
  // 钉钉API接口地址
  API_BASE_URL: 'https://oapi.dingtalk.com',
  
  // 获取钉钉用户信息的接口
  GET_USER_INFO_URL: 'https://oapi.dingtalk.com/sns/getuserinfo_bycode',
  
  // 获取钉钉访问令牌的接口
  GET_TOKEN_URL: 'https://oapi.dingtalk.com/gettoken',
}; 