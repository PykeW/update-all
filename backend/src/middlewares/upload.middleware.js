/**
 * 处理文件上传错误
 */
exports.handleUploadError = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: '文件大小超出限制',
    });
  }
  
  if (err.message === '不支持的文件类型') {
    return res.status(415).json({
      success: false,
      message: '不支持的文件类型',
    });
  }
  
  return res.status(500).json({
    success: false,
    message: '文件上传失败: ' + err.message,
  });
};
