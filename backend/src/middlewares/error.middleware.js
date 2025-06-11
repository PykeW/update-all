/**
 * 错误处理中间件
 */

/**
 * 捕获未处理的错误
 */
exports.notFound = (req, res, next) => {
  const error = new Error(`找不到 - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * 自定义错误处理程序
 */
exports.errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

/**
 * 验证错误处理程序
 */
exports.validationErrorHandler = (err, req, res, next) => {
  if (err && err.error && err.error.isJoi) {
    // 处理Joi验证错误
    res.status(400).json({
      message: '验证错误',
      errors: err.error.details.map((detail) => ({
        field: detail.context.key,
        message: detail.message,
      })),
    });
  } else {
    // 传递给默认错误处理程序
    next(err);
  }
}; 