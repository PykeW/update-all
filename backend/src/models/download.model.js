/**
 * 下载记录模型
 */
const db = require('./db');

/**
 * 创建下载记录
 * @param {Object} downloadData 下载记录数据
 * @returns {Promise<Object>} 创建的下载记录对象
 */
exports.create = async (downloadData) => {
  return await db.downloads.insertAsync(downloadData);
};

/**
 * 根据ID查找下载记录
 * @param {string} id 下载记录ID
 * @returns {Promise<Object>} 下载记录对象
 */
exports.findById = async (id) => {
  return await db.downloads.findOneAsync({ _id: id });
};

/**
 * 获取软件的下载记录
 * @param {string} softwareId 软件ID
 * @param {number} page 页码
 * @param {number} limit 每页数量
 * @returns {Promise<{downloads: Object[], total: number, page: number, pages: number}>} 分页下载记录列表
 */
exports.getBySoftwareId = async (softwareId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const total = await db.downloads.countAsync({ software: softwareId });
  
  // 查询下载记录列表
  const downloadsQuery = db.downloads.findAsync({ software: softwareId });
  
  // 手动处理分页和排序
  const downloads = await new Promise((resolve, reject) => {
    downloadsQuery
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(async (err, docs) => {
        if (err) return reject(err);
        
        // 手动获取用户信息
        for (let i = 0; i < docs.length; i++) {
          if (docs[i].user) {
            const user = await db.users.findOneAsync({ _id: docs[i].user });
            if (user) {
              docs[i].user = {
                _id: user._id,
                username: user.username,
                displayName: user.displayName
              };
            }
          }
        }
        
        resolve(docs);
      });
  });
  
  return {
    downloads,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

/**
 * 获取用户的下载记录
 * @param {string} userId 用户ID
 * @param {number} page 页码
 * @param {number} limit 每页数量
 * @returns {Promise<{downloads: Object[], total: number, page: number, pages: number}>} 分页下载记录列表
 */
exports.getByUserId = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const total = await db.downloads.countAsync({ user: userId });
  
  // 查询下载记录列表
  const downloadsQuery = db.downloads.findAsync({ user: userId });
  
  // 手动处理分页和排序
  const downloads = await new Promise((resolve, reject) => {
    downloadsQuery
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(async (err, docs) => {
        if (err) return reject(err);
        
        // 手动获取软件信息
        for (let i = 0; i < docs.length; i++) {
          if (docs[i].software) {
            const software = await db.software.findOneAsync({ _id: docs[i].software });
            if (software) {
              docs[i].software = {
                _id: software._id,
                name: software.name,
                version: software.version,
                icon: software.icon
              };
            }
          }
        }
        
        resolve(docs);
      });
  });
  
  return {
    downloads,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

/**
 * 获取下载统计
 * @param {string} softwareId 可选，软件ID
 * @returns {Promise<Object>} 统计数据
 */
exports.getStats = async (softwareId = null) => {
  let query = {};
  if (softwareId) {
    query.software = softwareId;
  }
  
  // 获取总下载次数
  const total = await db.downloads.countAsync(query);
  
  // 获取今日下载次数
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayDownloads = await db.downloads.countAsync({
    ...query,
    createdAt: { $gte: today }
  });
  
  return {
    total,
    today: todayDownloads
  };
}; 