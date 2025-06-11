/**
 * JWT配置
 */
module.exports = {
  // JWT 密钥
  secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  
  // JWT 刷新令牌密钥
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key',
  
  // 访问令牌过期时间
  expiresIn: process.env.JWT_EXPIRE || '24h',
  
  // 刷新令牌过期时间
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
}; 