/**
 * 数据库配置
 */
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  // MongoDB URI
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/software-platform',
  
  // MongoDB 连接选项
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
}; 