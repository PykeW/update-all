/**
 * JWT配置
 */
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  // JWT密钥
  SECRET: process.env.JWT_SECRET || 'software-platform-jwt-secret',
  
  // JWT过期时间（默认24小时）
  EXPIRE: process.env.JWT_EXPIRE || 86400000,
}; 