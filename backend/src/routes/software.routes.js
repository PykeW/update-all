/**
 * 软件路由
 */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const softwareService = require('../services/software.service');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @route   GET /api/software
 * @desc    获取所有软件
 * @access  公开
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const platform = req.query.platform;
    
    const filter = {};
    
    // 只有管理员可以查看未发布的软件
    if (req.user && req.user.role === 'admin') {
      if (req.query.isPublished !== undefined) {
        filter.isPublished = req.query.isPublished === 'true';
      }
    } else {
      filter.isPublished = true;
    }
    
    // 按分类筛选
    if (category) {
      filter.category = category;
    }
    
    // 按平台筛选
    if (platform) {
      filter.platforms = platform;
    }
    
    const result = await softwareService.getSoftwareList(page, limit, filter);
    
    res.json(result);
  } catch (error) {
    console.error('获取软件列表错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

/**
 * @route   GET /api/software/search
 * @desc    搜索软件
 * @access  公开
 */
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    if (!query) {
      return res.status(400).json({ message: '搜索关键词不能为空' });
    }
    
    const result = await softwareService.searchSoftware(query, page, limit);
    
    res.json(result);
  } catch (error) {
    console.error('搜索软件错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

/**
 * @route   GET /api/software/:id
 * @desc    通过ID获取软件
 * @access  公开
 */
router.get('/:id', async (req, res) => {
  try {
    const software = await softwareService.findById(req.params.id);
    
    if (!software) {
      return res.status(404).json({ message: '软件不存在' });
    }
    
    // 如果软件未发布且用户不是管理员，则拒绝访问
    if (!software.isPublished && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ message: '该软件尚未发布' });
    }
    
    res.json(software);
  } catch (error) {
    console.error('获取软件信息错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

/**
 * @route   POST /api/software
 * @desc    创建新软件
 * @access  管理员
 */
router.post(
  '/',
  [
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    body('name').notEmpty().withMessage('软件名称不能为空'),
    body('version').notEmpty().withMessage('版本号不能为空'),
    body('description').notEmpty().withMessage('描述不能为空'),
    body('category').notEmpty().withMessage('分类不能为空'),
    body('downloadUrl').notEmpty().withMessage('下载链接不能为空'),
    body('size').isNumeric().withMessage('软件大小必须是数字'),
  ],
  async (req, res) => {
    try {
      const softwareData = {
        ...req.body,
        publisher: req.user.id,
      };
      
      const software = await softwareService.create(softwareData);
      
      res.status(201).json(software);
    } catch (error) {
      console.error('创建软件错误:', error);
      res.status(500).json({ message: '服务器内部错误' });
    }
  }
);

/**
 * @route   PUT /api/software/:id
 * @desc    更新软件信息
 * @access  管理员
 */
router.put('/:id', authMiddleware.authenticate, authMiddleware.isAdmin, async (req, res) => {
  try {
    // 确保软件存在
    const software = await softwareService.findById(req.params.id);
    
    if (!software) {
      return res.status(404).json({ message: '软件不存在' });
    }
    
    const updatedSoftware = await softwareService.update(req.params.id, req.body);
    
    res.json(updatedSoftware);
  } catch (error) {
    console.error('更新软件信息错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

/**
 * @route   DELETE /api/software/:id
 * @desc    删除软件
 * @access  管理员
 */
router.delete('/:id', authMiddleware.authenticate, authMiddleware.isAdmin, async (req, res) => {
  try {
    const result = await softwareService.delete(req.params.id);
    
    if (!result) {
      return res.status(404).json({ message: '软件不存在' });
    }
    
    res.json({ message: '软件已成功删除' });
  } catch (error) {
    console.error('删除软件错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

/**
 * @route   GET /api/software/recommended
 * @desc    获取推荐软件
 * @access  公开
 */
router.get('/recommended/list', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const recommendedSoftware = await softwareService.getRecommendedSoftware(limit);
    
    res.json(recommendedSoftware);
  } catch (error) {
    console.error('获取推荐软件错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

/**
 * @route   GET /api/software/:id/download
 * @desc    获取软件下载链接
 * @access  认证用户
 */
router.get('/:id/download', authMiddleware.authenticate, async (req, res) => {
  try {
    const softwareId = req.params.id;
    
    // 检查软件是否存在
    const software = await softwareService.findById(softwareId);
    if (!software) {
      return res.status(404).json({ message: '软件不存在' });
    }
    
    // 检查软件是否发布
    if (!software.isPublished && req.user.role !== 'admin') {
      return res.status(403).json({ message: '该软件尚未发布' });
    }
    
    // 获取最新的下载URL
    const downloadUrl = await softwareService.getDownloadUrl(softwareId);
    
    // 记录下载信息
    await softwareService.recordDownload(
      softwareId,
      req.user.id,
      req.ip,
      req.headers['user-agent']
    );
    
    // 返回下载链接
    res.json({
      success: true,
      downloadUrl,
      filename: software.name,
      expires: software.downloadUrlExpires
    });
  } catch (error) {
    console.error('获取下载链接失败:', error);
    res.status(500).json({ message: error.message || '获取下载链接失败' });
  }
});

module.exports = router; 