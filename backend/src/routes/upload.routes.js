const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/upload/software
 * @desc    上传软件文件到OSS
 * @access  仅限管理员
 */
router.post(
  '/software',
  [authMiddleware.authenticate, authMiddleware.isAdmin],
  uploadController.softwareUpload,
  uploadController.uploadSoftwarePackage
);

module.exports = router;
