/**
 * 认证路由
 */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authService = require('../services/auth.service');
const dingtalkConfig = require('../config/dingtalk.config');
const authController = require('../controllers/auth.controller');

/**
 * @route   GET /api/auth/dingtalk/config
 * @desc    获取钉钉登录配置
 * @access  公开
 */
router.get('/dingtalk/config', authController.getDingTalkConfig);

/**
 * @route   GET /api/auth/dingtalk/qrcode
 * @desc    生成钉钉登录二维码所需信息
 * @access  公开
 */
router.get('/dingtalk/qrcode', authController.getLoginQRCode);

/**
 * @route   POST /api/auth/dingtalk/login
 * @desc    处理钉钉登录
 * @access  公开
 */
router.post('/dingtalk/login', authController.handleDingTalkLogin);

/**
 * @route   POST /api/auth/refresh
 * @desc    刷新令牌
 * @access  公开
 */
router.post('/refresh', authController.refreshToken);

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