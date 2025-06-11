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
 * @returns {Object} 包含令牌和刷新令牌的对象
 */
exports.generateTokens = (user) => {
  const payload = {
    id: user._id,
    username: user.username,
    role: user.role,
  };

  // 创建访问令牌
  const token = jwt.sign(payload, jwtConfig.SECRET, {
    expiresIn: jwtConfig.EXPIRE,
  });
  
  // 创建刷新令牌（过期时间更长）
  const refreshToken = jwt.sign({ id: user._id }, jwtConfig.REFRESH_SECRET || jwtConfig.SECRET, {
    expiresIn: jwtConfig.REFRESH_EXPIRE || '7d',
  });

  return {
    token,
    refreshToken,
    expiresIn: jwtConfig.EXPIRE
  };
};

/**
 * 创建JWT令牌（向后兼容）
 * @param {Object} user 用户对象
 * @returns {string} JWT令牌
 */
exports.generateToken = (user) => {
  const tokens = this.generateTokens(user);
  return tokens.token;
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
 * 刷新令牌
 * @param {string} refreshToken 刷新令牌
 * @returns {Promise<Object>} 新的令牌信息
 */
exports.refreshToken = async (refreshToken) => {
  try {
    // 验证刷新令牌
    const decoded = jwt.verify(refreshToken, jwtConfig.REFRESH_SECRET || jwtConfig.SECRET);
    
    // 获取用户信息
    const user = await userService.findById(decoded.id);
    
    if (!user) {
      throw new Error('用户不存在');
    }
    
    // 生成新的令牌
    return this.generateTokens(user);
  } catch (error) {
    throw new Error('无效的刷新令牌');
  }
};

/**
 * 通过钉钉授权码登录
 * @param {string} authCode 钉钉临时授权码
 * @returns {Promise<{ user: Object, token: string, refreshToken: string }>} 用户信息和JWT令牌
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
      const username = `dd_${dingtalkUserInfo.unionid.substring(0, 8)}`;
      
      user = await userService.create({
        dingtalkId: dingtalkUserInfo.unionid,
        username: username,
        displayName: dingtalkUserInfo.name || username,
        email: dingtalkUserInfo.email,
        mobile: dingtalkUserInfo.mobile,
        avatar: dingtalkUserInfo.avatar,
        isActive: true,
        role: 'user', // 默认角色
      });
    } else {
      // 更新用户信息
      await userService.update(user._id, {
        displayName: dingtalkUserInfo.name || user.displayName,
        avatar: dingtalkUserInfo.avatar || user.avatar,
        email: dingtalkUserInfo.email || user.email,
        mobile: dingtalkUserInfo.mobile || user.mobile
      });
      
      // 重新获取更新后的用户信息
      user = await userService.findById(user._id);
    }
    
    // 更新用户的最后登录时间
    await userService.updateLastLogin(user._id);
    
    // 生成JWT令牌
    const tokens = this.generateTokens(user);
    
    return {
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        role: user.role,
        email: user.email
      },
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn
    };
  } catch (error) {
    console.error('钉钉登录失败:', error);
    throw error;
  }
}; 