const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 根路由
app.get('/', (req, res) => {
  res.json({ message: '欢迎使用软件下载平台 API' });
});

// 引入路由
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const softwareRoutes = require('./routes/software.routes');
const uploadRoutes = require('./routes/upload.routes');

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/software', softwareRoutes);
app.use('/api/upload', uploadRoutes);

// 捕获404错误
app.use((req, res) => {
  res.status(404).json({ message: '找不到请求的资源' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || '服务器内部错误',
  });
});

// 数据库连接
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/software-platform';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('成功连接到MongoDB数据库');
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('无法连接到MongoDB数据库:', err);
    process.exit(1);
  });

// 启动定时任务
const scheduler = require('./utils/scheduler');
// 定时任务在应用启动时自动启动 