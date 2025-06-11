/**
 * 钉钉服务
 */
const axios = require('axios');
const crypto = require('crypto');
const dingtalkConfig = require('../config/dingtalk');

/**
 * 生成签名
 * @param {string} secret 应用密钥
 * @param {number} timestamp 时间戳
 * @returns {string} 签名字符串
 */
const generateSignature = (secret, timestamp) => {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`${timestamp}`);
  return hmac.digest('base64');
};

/**
 * 获取钉钉访问令牌
 * @returns {Promise<string>} 访问令牌
 */
exports.getAccessToken = async () => {
  try {
    const response = await axios.get(`${dingtalkConfig.apiHost}/gettoken`, {
      params: {
        appkey: dingtalkConfig.appKey,
        appsecret: dingtalkConfig.appSecret,
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
 * 通过授权码获取用户访问令牌
 * @param {string} authCode 授权码
 * @returns {Promise<Object>} 用户访问令牌信息
 */
exports.getUserTokenByCode = async (authCode) => {
  try {
    const response = await axios.post(`${dingtalkConfig.apiHost}/v1.0/oauth2/userAccessToken`, {
      clientId: dingtalkConfig.appKey,
      clientSecret: dingtalkConfig.appSecret,
      code: authCode,
      grantType: 'authorization_code'
    });

    if (response.data && response.data.accessToken) {
      return response.data;
    } else {
      throw new Error('获取用户访问令牌失败');
    }
  } catch (error) {
    console.error('获取用户访问令牌出错:', error);
    throw new Error('获取用户访问令牌失败');
  }
};

/**
 * 获取用户信息
 * @param {string} accessToken 用户访问令牌
 * @returns {Promise<Object>} 钉钉用户信息
 */
exports.getUserInfo = async (accessToken) => {
  try {
    const response = await axios.get(dingtalkConfig.userInfoApi, {
      headers: {
        'x-acs-dingtalk-access-token': accessToken
      }
    });

    if (response.data) {
      return response.data;
    } else {
      throw new Error('获取钉钉用户信息失败');
    }
  } catch (error) {
    console.error('获取钉钉用户信息出错:', error);
    throw new Error('获取钉钉用户信息失败');
  }
};

/**
 * 获取临时授权码后获取钉钉用户信息
 * @param {string} tempCode 临时授权码
 * @returns {Promise<Object>} 钉钉用户信息
 */
exports.getUserInfoByCode = async (tempCode) => {
  try {
    // 1. 用授权码换取用户访问令牌
    const tokenInfo = await this.getUserTokenByCode(tempCode);
    
    // 2. 用访问令牌获取用户信息
    const userInfo = await this.getUserInfo(tokenInfo.accessToken);
    
    // 检查白名单
    if (dingtalkConfig.strictWhitelist && 
        (dingtalkConfig.allowedPhones.length > 0 || dingtalkConfig.allowedEmails.length > 0)) {
      const isAllowed = 
        (userInfo.mobile && dingtalkConfig.allowedPhones.includes(userInfo.mobile)) || 
        (userInfo.email && dingtalkConfig.allowedEmails.includes(userInfo.email));
        
      if (!isAllowed) {
        throw new Error('您没有权限登录系统');
      }
    }
    
    return {
      unionid: userInfo.unionId,
      userid: userInfo.userid,
      name: userInfo.nick || userInfo.name,
      nick: userInfo.nick,
      avatar: userInfo.avatar,
      mobile: userInfo.mobile,
      email: userInfo.email,
      accessToken: tokenInfo.accessToken,
      accessTokenExpireIn: tokenInfo.expireIn
    };
  } catch (error) {
    console.error('获取钉钉用户信息出错:', error);
    throw error;
  }
}; 