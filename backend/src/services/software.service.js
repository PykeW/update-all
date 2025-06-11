/**
 * 软件服务
 */
const Software = require('../models/software.model');
const Download = require('../models/download.model');
const ossUtil = require('../utils/oss.util');

/**
 * 创建新软件
 * @param {Object} softwareData 软件数据
 * @returns {Promise<Software>} 创建的软件对象
 */
exports.create = async (softwareData) => {
  // 检查是否通过OSS上传了文件
  if (softwareData.ossKey) {
    // 生成初始下载链接，有效期7天
    const expiresInSeconds = 7 * 24 * 60 * 60; // 7天
    softwareData.downloadUrl = await ossUtil.generateDownloadUrl(
      softwareData.ossKey, 
      expiresInSeconds
    );
    
    // 设置URL过期时间
    softwareData.downloadUrlExpires = new Date(Date.now() + expiresInSeconds * 1000);
  }
  
  const software = new Software(softwareData);
  return await software.save();
};

/**
 * 更新软件信息
 * @param {string} id 软件ID
 * @param {Object} updateData 更新的数据
 * @returns {Promise<Software>} 更新后的软件对象
 */
exports.update = async (id, updateData) => {
  return await Software.findByIdAndUpdate(id, updateData, { new: true });
};

/**
 * 删除软件
 * @param {string} id 软件ID
 * @returns {Promise<boolean>} 操作是否成功
 */
exports.delete = async (id) => {
  const software = await Software.findById(id);
  
  if (software && software.ossKey) {
    try {
      // 先删除OSS中的文件
      await ossUtil.deleteFile(software.ossKey);
    } catch (error) {
      console.error('删除OSS文件失败:', error);
      // 即使OSS删除失败，也继续删除数据库中的记录
    }
  }
  
  const result = await Software.findByIdAndDelete(id);
  return !!result;
};

/**
 * 根据ID查找软件
 * @param {string} id 软件ID
 * @returns {Promise<Software>} 软件对象
 */
exports.findById = async (id) => {
  return await Software.findById(id).populate('publisher', 'username displayName');
};

/**
 * 获取所有软件列表
 * @param {number} page 页码
 * @param {number} limit 每页数量
 * @param {Object} filter 过滤条件
 * @returns {Promise<{softwares: Software[], total: number, page: number, pages: number}>} 分页软件列表
 */
exports.getSoftwareList = async (page = 1, limit = 10, filter = {}) => {
  const skip = (page - 1) * limit;
  
  // 默认只显示已发布的软件
  if (filter.isPublished === undefined) {
    filter.isPublished = true;
  }
  
  const total = await Software.countDocuments(filter);
  const softwares = await Software.find(filter)
    .sort({ createdAt: -1 })
    .populate('publisher', 'username displayName')
    .skip(skip)
    .limit(limit);
  
  return {
    softwares,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

/**
 * 搜索软件
 * @param {string} query 搜索关键词
 * @param {number} page 页码
 * @param {number} limit 每页数量
 * @returns {Promise<{softwares: Software[], total: number, page: number, pages: number}>} 分页软件列表
 */
exports.searchSoftware = async (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const filter = {
    isPublished: true,
    $text: { $search: query },
  };
  
  const total = await Software.countDocuments(filter);
  const softwares = await Software.find(filter, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .populate('publisher', 'username displayName')
    .skip(skip)
    .limit(limit);
  
  return {
    softwares,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

/**
 * 记录软件下载
 * @param {string} softwareId 软件ID
 * @param {string} userId 用户ID
 * @param {string} ipAddress IP地址
 * @param {string} userAgent 浏览器/设备信息
 * @returns {Promise<Download>} 下载记录对象
 */
exports.recordDownload = async (softwareId, userId, ipAddress, userAgent) => {
  // 递增软件的下载次数
  await Software.findByIdAndUpdate(softwareId, { $inc: { downloads: 1 } });
  
  // 创建下载记录
  const downloadRecord = new Download({
    software: softwareId,
    user: userId,
    ipAddress,
    userAgent,
    status: 'success',
  });
  
  return await downloadRecord.save();
};

/**
 * 获取推荐软件
 * @param {number} limit 数量限制
 * @returns {Promise<Software[]>} 推荐软件列表
 */
exports.getRecommendedSoftware = async (limit = 5) => {
  return await Software.find({ isPublished: true, isRecommended: true })
    .sort({ downloads: -1 })
    .limit(limit)
    .populate('publisher', 'username displayName');
};

/**
 * 获取软件下载链接
 * @param {string} softwareId 软件ID
 * @returns {Promise<string>} 下载链接
 */
exports.getDownloadUrl = async (softwareId) => {
  const software = await Software.findById(softwareId);
  
  if (!software) {
    throw new Error('软件不存在');
  }
  
  if (!software.ossKey) {
    throw new Error('软件文件不可用');
  }
  
  // 检查下载URL是否已过期，如果过期重新生成
  const now = new Date();
  if (!software.downloadUrlExpires || now > software.downloadUrlExpires) {
    // 生成新的下载链接，有效期1小时
    const expiresInSeconds = 60 * 60; // 1小时
    const downloadUrl = await ossUtil.generateDownloadUrl(
      software.ossKey,
      expiresInSeconds
    );
    
    // 更新数据库
    software.downloadUrl = downloadUrl;
    software.downloadUrlExpires = new Date(Date.now() + expiresInSeconds * 1000);
    await software.save();
  }
  
  return software.downloadUrl;
}; 