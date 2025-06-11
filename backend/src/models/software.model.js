/**
 * 软件模型
 */
const db = require('./db');

/**
 * 创建新软件
 * @param {Object} softwareData 软件数据
 * @returns {Promise<Object>} 创建的软件对象
 */
exports.create = async (softwareData) => {
  return await db.software.insertAsync(softwareData);
};

/**
 * 更新软件信息
 * @param {string} id 软件ID
 * @param {Object} updateData 更新的数据
 * @returns {Promise<Object>} 更新后的软件对象
 */
exports.update = async (id, updateData) => {
  await db.software.updateAsync({ _id: id }, { $set: updateData });
  return await exports.findById(id);
};

/**
 * 删除软件
 * @param {string} id 软件ID
 * @returns {Promise<boolean>} 操作是否成功
 */
exports.delete = async (id) => {
  const result = await db.software.removeAsync({ _id: id });
  return result > 0;
};

/**
 * 根据ID查找软件
 * @param {string} id 软件ID
 * @returns {Promise<Object>} 软件对象
 */
exports.findById = async (id) => {
  const software = await db.software.findOneAsync({ _id: id });
  if (software && software.publisher) {
    // 手动执行联接查询，获取发布者信息
    const publisher = await db.users.findOneAsync({ _id: software.publisher });
    if (publisher) {
      software.publisher = {
        _id: publisher._id,
        username: publisher.username,
        displayName: publisher.displayName
      };
    }
  }
  return software;
};

/**
 * 获取所有软件列表
 * @param {number} page 页码
 * @param {number} limit 每页数量
 * @param {Object} filter 过滤条件
 * @returns {Promise<{softwares: Object[], total: number, page: number, pages: number}>} 分页软件列表
 */
exports.getSoftwareList = async (page = 1, limit = 10, filter = {}) => {
  const skip = (page - 1) * limit;
  
  // 默认只显示已发布的软件
  if (filter.isPublished === undefined) {
    filter.isPublished = true;
  }
  
  const total = await db.software.countAsync(filter);
  
  // 查询软件列表
  const softwaresQuery = db.software.findAsync(filter);
  
  // 手动处理分页和排序
  const softwares = await new Promise((resolve, reject) => {
    softwaresQuery
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(async (err, docs) => {
        if (err) return reject(err);
        
        // 手动获取发布者信息
        for (let i = 0; i < docs.length; i++) {
          if (docs[i].publisher) {
            const publisher = await db.users.findOneAsync({ _id: docs[i].publisher });
            if (publisher) {
              docs[i].publisher = {
                _id: publisher._id,
                username: publisher.username,
                displayName: publisher.displayName
              };
            }
          }
        }
        
        resolve(docs);
      });
  });
  
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
 * @returns {Promise<{softwares: Object[], total: number, page: number, pages: number}>} 分页软件列表
 */
exports.searchSoftware = async (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  // NeDB不支持MongoDB的$text搜索，实现简单的关键词搜索
  const filter = {
    isPublished: true,
    $or: [
      { name: new RegExp(query, 'i') },
      { description: new RegExp(query, 'i') },
      { category: new RegExp(query, 'i') }
    ]
  };
  
  const total = await db.software.countAsync(filter);
  
  // 查询软件列表
  const softwaresQuery = db.software.findAsync(filter);
  
  // 手动处理分页和排序
  const softwares = await new Promise((resolve, reject) => {
    softwaresQuery
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(async (err, docs) => {
        if (err) return reject(err);
        
        // 手动获取发布者信息
        for (let i = 0; i < docs.length; i++) {
          if (docs[i].publisher) {
            const publisher = await db.users.findOneAsync({ _id: docs[i].publisher });
            if (publisher) {
              docs[i].publisher = {
                _id: publisher._id,
                username: publisher.username,
                displayName: publisher.displayName
              };
            }
          }
        }
        
        resolve(docs);
      });
  });
  
  return {
    softwares,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

/**
 * 获取推荐软件
 * @param {number} limit 数量限制
 * @returns {Promise<Object[]>} 推荐软件列表
 */
exports.getRecommendedSoftware = async (limit = 5) => {
  // 查询推荐软件列表
  const filter = { isPublished: true, isRecommended: true };
  const recommendedQuery = db.software.findAsync(filter);
  
  // 手动处理排序和限制
  const software = await new Promise((resolve, reject) => {
    recommendedQuery
      .sort({ downloads: -1 })
      .limit(limit)
      .exec(async (err, docs) => {
        if (err) return reject(err);
        
        // 手动获取发布者信息
        for (let i = 0; i < docs.length; i++) {
          if (docs[i].publisher) {
            const publisher = await db.users.findOneAsync({ _id: docs[i].publisher });
            if (publisher) {
              docs[i].publisher = {
                _id: publisher._id,
                username: publisher.username,
                displayName: publisher.displayName
              };
            }
          }
        }
        
        resolve(docs);
      });
  });
  
  return software;
}; 