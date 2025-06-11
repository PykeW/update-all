/**
 * API响应工具函数
 */

/**
 * 成功响应
 * @param {Object} res Express响应对象
 * @param {any} data 响应数据
 * @param {number} statusCode HTTP状态码
 * @returns {Object} 响应对象
 */
exports.success = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

/**
 * 错误响应
 * @param {Object} res Express响应对象
 * @param {string} message 错误消息
 * @param {number} statusCode HTTP状态码
 * @returns {Object} 响应对象
 */
exports.error = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

/**
 * 分页数据响应
 * @param {Object} res Express响应对象
 * @param {Array} items 数据项数组
 * @param {number} page 当前页码
 * @param {number} limit 每页数量
 * @param {number} total 总数量
 * @returns {Object} 响应对象
 */
exports.paginate = (res, items, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return res.json({
    success: true,
    data: {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
}; 