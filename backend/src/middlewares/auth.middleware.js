/**
 * 认证中间件
 */
const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');
const jwtConfig = require('../config/jwt.config');

/**
 * 验证用户是否已登录
 */
exports.authenticate = async (req, res, next) => {
  try {
    // 从请求头获取令牌
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // 验证令牌
      const decoded = await authService.verifyToken(token);
      
      // 将用户信息添加到请求对象
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: '无效的认证令牌' });
    }
  } catch (error) {
    console.error('认证中间件错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
};

/**
 * 验证用户是否为管理员
 */
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: '权限不足，需要管理员权限' });
  }
};

/**
 * 验证用户是否为自己或管理员
 */
exports.isOwnerOrAdmin = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === 'admin' || req.user.id === req.params.id)
  ) {
    next();
  } else {
    res.status(403).json({ message: '权限不足，无法访问此资源' });
  }
}; 