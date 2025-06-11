const multer = require('multer');
const ossUtil = require('../utils/oss.util');
const crypto = require('crypto');
const path = require('path');

// 配置内存存储，文件暂存内存中，不写入磁盘
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  // 检查文件类型
  const allowedTypes = ['.exe', '.zip', '.msi', '.dmg', '.deb', '.rpm', '.pkg', '.appimage'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'));
  }
};

// 最大文件大小限制：2GB
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024,
  }
});

/**
 * 处理软件包上传
 */
exports.uploadSoftwarePackage = async (req, res) => {
  try {
    // 生成唯一对象名
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const filename = req.file.originalname;
    const ext = path.extname(filename);
    const objectName = `software/${timestamp}-${randomString}${ext}`;
    
    // 上传文件到OSS
    const result = await ossUtil.uploadFile(req.file.buffer, objectName);
    
    res.status(200).json({
      success: true,
      message: '文件上传成功',
      data: {
        filename: req.file.originalname,
        size: req.file.size,
        ossKey: result.ossKey,
        etag: result.etag,
        contentType: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error('软件包上传失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '上传失败',
    });
  }
};

// Multer中间件单例
exports.softwareUpload = upload.single('file');
