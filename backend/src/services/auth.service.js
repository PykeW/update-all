/**
 * 认证服务
 */
const jwt = require('jsonwebtoken');
const userService = require('./user.service');
const dingtalkService = require('./dingtalk.service');
const jwtConfig = require('../config/jwt.config');

/**
 * 创建JWT令牌
 * @param {Object} user 用户对象
 * @returns {string} JWT令牌
 */
exports.generateToken = (user) => {
  const payload = {
    id: user._id,
    username: user.username,
    role: user.role,
  };

  return jwt.sign(payload, jwtConfig.SECRET, {
    expiresIn: jwtConfig.EXPIRE,
  });
};

/**
 * 验证JWT令牌
 * @param {string} token JWT令牌
 * @returns {Promise<Object>} 解码后的用户信息
 */
exports.verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, jwtConfig.SECRET);
    const user = await userService.findById(decoded.id);
    
    if (!user) {
      throw new Error('用户不存在');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('无效的令牌');
  }
};

/**
 * 通过钉钉授权码登录
 * @param {string} authCode 钉钉临时授权码
 * @returns {Promise<{ user: Object, token: string }>} 用户信息和JWT令牌
 */
exports.loginWithDingtalk = async (authCode) => {
  try {
    // 获取钉钉用户信息
    const dingtalkUserInfo = await dingtalkService.getUserInfoByCode(authCode);
    
    if (!dingtalkUserInfo || !dingtalkUserInfo.unionid) {
      throw new Error('获取钉钉用户信息失败');
    }
    
    // 查找用户是否存在
    let user = await userService.findByDingtalkId(dingtalkUserInfo.unionid);
    
    if (!user) {
      // 如果用户不存在，创建新用户
      const username = `dingtalk_${dingtalkUserInfo.unionid.substring(0, 8)}`;
      
      user = await userService.create({
        dingtalkId: dingtalkUserInfo.unionid,
        username: username,
        displayName: dingtalkUserInfo.nick || username,
        avatar: dingtalkUserInfo.avatar,
        isActive: true,
      });
    }
    
    // 更新用户的最后登录时间
    await userService.updateLastLogin(user._id);
    
    // 生成JWT令牌
    const token = this.generateToken(user);
    
    return {
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        role: user.role,
      },
      token,
    };
  } catch (error) {
    console.error('钉钉登录失败:', error);
    throw new Error('钉钉登录失败');
  }
}; 