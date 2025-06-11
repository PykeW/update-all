/**
 * 用户服务
 */
const User = require('../models/user.model');

/**
 * 根据钉钉ID查找用户
 * @param {string} dingtalkId 钉钉用户ID
 * @returns {Promise<User>} 用户对象
 */
exports.findByDingtalkId = async (dingtalkId) => {
  return await User.findOne({ dingtalkId });
};

/**
 * 根据用户名查找用户
 * @param {string} username 用户名
 * @returns {Promise<User>} 用户对象
 */
exports.findByUsername = async (username) => {
  return await User.findOne({ username });
};

/**
 * 根据ID查找用户
 * @param {string} id 用户ID
 * @returns {Promise<User>} 用户对象
 */
exports.findById = async (id) => {
  return await User.findById(id);
};

/**
 * 创建新用户
 * @param {Object} userData 用户数据
 * @returns {Promise<User>} 创建的用户对象
 */
exports.create = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

/**
 * 更新用户信息
 * @param {string} id 用户ID
 * @param {Object} updateData 更新的数据
 * @returns {Promise<User>} 更新后的用户对象
 */
exports.update = async (id, updateData) => {
  return await User.findByIdAndUpdate(id, updateData, { new: true });
};

/**
 * 删除用户
 * @param {string} id 用户ID
 * @returns {Promise<boolean>} 操作是否成功
 */
exports.delete = async (id) => {
  const result = await User.findByIdAndDelete(id);
  return !!result;
};

/**
 * 获取用户列表
 * @param {number} page 页码
 * @param {number} limit 每页数量
 * @returns {Promise<{users: User[], total: number, page: number, pages: number}>} 分页用户列表
 */
exports.getUsers = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const total = await User.countDocuments();
  const users = await User.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
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
 * @returns {Promise<User>} 更新后的用户对象
 */
exports.updateLastLogin = async (id) => {
  return await User.findByIdAndUpdate(
    id,
    { lastLogin: new Date() },
    { new: true }
  );
}; 