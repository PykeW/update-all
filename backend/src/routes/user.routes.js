/**
 * 用户路由
 */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userService = require('../services/user.service');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @route   GET /api/users
 * @desc    获取所有用户
 * @access  管理员
 */
router.get('/', authMiddleware.authenticate, authMiddleware.isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await userService.getUsers(page, limit);
    
    res.json(result);
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    通过ID获取用户
 * @access  认证用户
 */
router.get('/:id', authMiddleware.authenticate, authMiddleware.isOwnerOrAdmin, async (req, res) => {
  try {
    const user = await userService.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 移除敏感字段
    const userResponse = {
      id: user._id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      department: user.department,
      position: user.position,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };
    
    res.json(userResponse);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    更新用户信息
 * @access  自己或管理员
 */
router.put(
  '/:id',
  [
    authMiddleware.authenticate,
    authMiddleware.isOwnerOrAdmin,
    body('displayName').optional().isString().withMessage('显示名称必须是字符串'),
    body('email').optional().isEmail().withMessage('邮箱格式不正确'),
    body('department').optional().isString().withMessage('部门必须是字符串'),
    body('position').optional().isString().withMessage('职位必须是字符串'),
  ],
  async (req, res) => {
    try {
      // 确保用户存在
      const user = await userService.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }
      
      // 仅允许更新特定字段
      const allowedUpdates = {
        displayName: req.body.displayName,
        email: req.body.email,
        department: req.body.department,
        position: req.body.position,
      };
      
      // 过滤掉未提供的字段
      const updates = Object.entries(allowedUpdates)
        .filter(([key, value]) => value !== undefined)
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});
      
      // 如果管理员更新角色
      if (req.user.role === 'admin' && req.body.role) {
        updates.role = req.body.role;
      }
      
      const updatedUser = await userService.update(req.params.id, updates);
      
      // 移除敏感字段
      const userResponse = {
        id: updatedUser._id,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        department: updatedUser.department,
        position: updatedUser.position,
        updatedAt: updatedUser.updatedAt,
      };
      
      res.json(userResponse);
    } catch (error) {
      console.error('更新用户信息错误:', error);
      res.status(500).json({ message: '服务器内部错误' });
    }
  }
);

/**
 * @route   DELETE /api/users/:id
 * @desc    删除用户
 * @access  管理员
 */
router.delete('/:id', authMiddleware.authenticate, authMiddleware.isAdmin, async (req, res) => {
  try {
    const result = await userService.delete(req.params.id);
    
    if (!result) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json({ message: '用户已成功删除' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

/**
 * @route   GET /api/users/profile
 * @desc    获取当前用户信息
 * @access  认证用户
 */
router.get('/profile/me', authMiddleware.authenticate, async (req, res) => {
  try {
    const user = await userService.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 移除敏感字段
    const userResponse = {
      id: user._id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      department: user.department,
      position: user.position,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };
    
    res.json(userResponse);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router; 