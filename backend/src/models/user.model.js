/**
 * 用户模型
 */
const bcrypt = require('bcryptjs');
const db = require('./db');

/**
 * 根据ID查找用户
 * @param {string} id 用户ID
 * @returns {Promise<Object>} 用户对象
 */
exports.findById = async (id) => {
  return await db.users.findOneAsync({ _id: id });
};

/**
 * 根据钉钉ID查找用户
 * @param {string} dingtalkId 钉钉用户ID
 * @returns {Promise<Object>} 用户对象
 */
exports.findByDingtalkId = async (dingtalkId) => {
  return await db.users.findOneAsync({ dingtalkId });
};

/**
 * 根据用户名查找用户
 * @param {string} username 用户名
 * @returns {Promise<Object>} 用户对象
 */
exports.findByUsername = async (username) => {
  return await db.users.findOneAsync({ username });
};

/**
 * 创建新用户
 * @param {Object} userData 用户数据
 * @returns {Promise<Object>} 创建的用户对象
 */
exports.create = async (userData) => {
  // 如果提供了密码，则进行哈希处理
  if (userData.password) {
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);
  }
  
  return await db.users.insertAsync(userData);
};

/**
 * 更新用户信息
 * @param {string} id 用户ID
 * @param {Object} updateData 更新的数据
 * @returns {Promise<Object>} 更新后的用户对象
 */
exports.update = async (id, updateData) => {
  await db.users.updateAsync({ _id: id }, { $set: updateData });
  return await exports.findById(id);
};

/**
 * 删除用户
 * @param {string} id 用户ID
 * @returns {Promise<boolean>} 操作是否成功
 */
exports.delete = async (id) => {
  const result = await db.users.removeAsync({ _id: id });
  return result > 0;
};

/**
 * 获取用户列表
 * @param {number} page 页码
 * @param {number} limit 每页数量
 * @returns {Promise<{users: Object[], total: number, page: number, pages: number}>} 分页用户列表
 */
exports.getUsers = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const total = await db.users.countAsync({});
  const usersQuery = db.users.findAsync({});
  
  // 手动处理分页和排序（NeDB不支持MongoDB的skip/limit链式调用）
  const users = await new Promise((resolve, reject) => {
    usersQuery
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec((err, docs) => {
        if (err) return reject(err);
        resolve(docs);
      });
  });
  
  return {
    users,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

/**
 * 更新用户最后登录时间
 * @param {string} id 用户ID
 * @returns {Promise<Object>} 更新后的用户对象
 */
exports.updateLastLogin = async (id) => {
  await db.users.updateAsync(
    { _id: id },
    { $set: { lastLogin: new Date() } }
  );
  return await exports.findById(id);
};

/**
 * 验证密码
 * @param {Object} user 用户对象
 * @param {string} password 密码
 * @returns {Promise<boolean>} 密码是否正确
 */
exports.isValidPassword = async (user, password) => {
  return await bcrypt.compare(password, user.password);
}; 