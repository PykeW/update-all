/**
 * 钉钉服务
 */
const axios = require('axios');
const dingtalkConfig = require('../config/dingtalk.config');

/**
 * 获取钉钉访问令牌
 * @returns {Promise<string>} 访问令牌
 */
exports.getAccessToken = async () => {
  try {
    const response = await axios.get(dingtalkConfig.GET_TOKEN_URL, {
      params: {
        appkey: dingtalkConfig.DINGTALK_APP_ID,
        appsecret: dingtalkConfig.DINGTALK_APP_SECRET,
      },
    });

    if (response.data && response.data.errcode === 0) {
      return response.data.access_token;
    } else {
      throw new Error(`获取钉钉访问令牌失败: ${response.data.errmsg}`);
    }
  } catch (error) {
    console.error('获取钉钉访问令牌出错:', error);
    throw new Error('获取钉钉访问令牌失败');
  }
};

/**
 * 获取临时授权码后获取钉钉用户信息
 * @param {string} tempCode 临时授权码
 * @returns {Promise<Object>} 钉钉用户信息
 */
exports.getUserInfoByCode = async (tempCode) => {
  try {
    const timestamp = Date.now();
    const signature = generateSignature(
      dingtalkConfig.DINGTALK_APP_SECRET,
      timestamp
    );
    
    const response = await axios.post(
      dingtalkConfig.GET_USER_INFO_URL,
      {
        tmp_auth_code: tempCode,
      },
      {
        params: {
          accessKey: dingtalkConfig.DINGTALK_APP_ID,
          timestamp,
          signature,
        },
      }
    );

    if (response.data && response.data.errcode === 0) {
      return response.data.user_info;
    } else {
      throw new Error(`获取钉钉用户信息失败: ${response.data.errmsg}`);
    }
  } catch (error) {
    console.error('获取钉钉用户信息出错:', error);
    throw new Error('获取钉钉用户信息失败');
  }
};

/**
 * 生成签名
 * @param {string} appSecret 应用密钥
 * @param {number} timestamp 时间戳
 * @returns {string} 签名
 */
function generateSignature(appSecret, timestamp) {
  const crypto = require('crypto');
  const signString = timestamp + '\\n' + appSecret;
  
  const hmac = crypto.createHmac('sha256', appSecret);
  hmac.update(signString);
  
  return hmac.digest('base64');
} 