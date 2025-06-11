const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');
const dingtalkConfig = require('../config/dingtalk');

/**
 * 获取钉钉登录配置
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
exports.getDingTalkConfig = (req, res) => {
  try {
    // 只返回前端需要的配置信息
    const config = {
      appKey: dingtalkConfig.appKey,
      redirectUri: dingtalkConfig.redirectUri,
      qrcodeUrl: dingtalkConfig.qrcodeUrl,
      goto: encodeURIComponent(`${dingtalkConfig.apiHost}/connect/oauth2/sns_authorize?appid=${dingtalkConfig.appKey}&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=${encodeURIComponent(dingtalkConfig.redirectUri)}`)
    };
    
    res.json(config);
  } catch (error) {
    console.error('获取钉钉配置失败:', error);
    res.status(500).json({ message: '获取钉钉配置失败' });
  }
};

/**
 * 获取钉钉登录二维码
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
exports.getLoginQRCode = (req, res) => {
  try {
    const qrcodeConfig = {
      goto: encodeURIComponent(`${dingtalkConfig.apiHost}/connect/oauth2/sns_authorize?appid=${dingtalkConfig.appKey}&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=${encodeURIComponent(dingtalkConfig.redirectUri)}`),
      qrcodeUrl: dingtalkConfig.qrcodeUrl
    };
    
    res.json(qrcodeConfig);
  } catch (error) {
    console.error('获取二维码配置失败:', error);
    res.status(500).json({ message: '获取二维码配置失败' });
  }
};

/**
 * 处理钉钉登录
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
exports.handleDingTalkLogin = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: '临时授权码不能为空' });
    }
    
    // 通过钉钉临时授权码登录
    const result = await authService.loginWithDingtalk(code);
    
    res.json(result);
  } catch (error) {
    console.error('钉钉登录错误:', error);
    res.status(401).json({ message: error.message || '登录失败' });
  }
};

/**
 * 刷新令牌
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: '刷新令牌不能为空' });
    }
    
    const result = await authService.refreshToken(refreshToken);
    
    res.json(result);
  } catch (error) {
    console.error('刷新令牌错误:', error);
    res.status(401).json({ message: error.message || '刷新令牌失败' });
  }
}; 