/**
 * 认证路由
 */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authService = require('../services/auth.service');
const dingtalkConfig = require('../config/dingtalk.config');

/**
 * @route   GET /api/auth/dingtalk/config
 * @desc    获取钉钉登录配置
 * @access  公开
 */
router.get('/dingtalk/config', (req, res) => {
  res.json({
    appId: dingtalkConfig.DINGTALK_APP_ID,
    redirectUri: dingtalkConfig.DINGTALK_REDIRECT_URI,
  });
});

/**
 * @route   POST /api/auth/dingtalk
 * @desc    使用钉钉临时授权码登录
 * @access  公开
 */
router.post(
  '/dingtalk',
  [body('code').notEmpty().withMessage('临时授权码不能为空')],
  async (req, res) => {
    try {
      const { code } = req.body;
      
      // 通过钉钉临时授权码登录
      const result = await authService.loginWithDingtalk(code);
      
      res.json(result);
    } catch (error) {
      console.error('钉钉登录错误:', error);
      res.status(401).json({ message: error.message || '登录失败' });
    }
  }
);

/**
 * @route   GET /api/auth/dingtalk/callback
 * @desc    钉钉授权回调接口
 * @access  公开
 */
router.get('/dingtalk/callback', (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ message: '缺少临时授权码' });
    }
    
    // 重定向到前端登录页面，并传递授权码
    res.redirect(`${dingtalkConfig.FRONTEND_URL}/login/callback?code=${code}`);
  } catch (error) {
    console.error('钉钉回调错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router; 