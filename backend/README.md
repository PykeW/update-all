# 软件下载平台后端服务

这是一个基于Node.js + Express + MongoDB开发的软件下载平台后端服务，提供钉钉扫码登录、软件管理和下载功能。

## 功能特性

- 钉钉扫码登录
- JWT身份认证
- 用户管理
- 软件管理
- 软件下载与统计
- RESTful API

## 技术栈

- Node.js
- Express
- MongoDB/Mongoose
- JWT认证
- 钉钉OAuth2.0集成

## 项目结构

```
backend/
  ├── src/
  │   ├── app.js           # 应用入口
  │   ├── config/          # 配置文件
  │   ├── controllers/     # 控制器
  │   ├── middlewares/     # 中间件
  │   ├── models/          # 数据模型
  │   ├── routes/          # 路由
  │   ├── services/        # 服务
  │   └── utils/           # 工具函数
  ├── .env                 # 环境变量
  ├── package.json
  └── README.md
```

## 安装与使用

### 前提条件

- Node.js (v14+)
- MongoDB
- 钉钉开发者账号和应用

### 安装步骤

1. 克隆代码库

```bash
git clone <repository-url>
cd backend
```

2. 安装依赖

```bash
npm install
```

3. 配置环境变量

复制`.env.example`文件并重命名为`.env`，然后填写相应的配置：

```
# 服务器配置
PORT=5000
NODE_ENV=development

# MongoDB 数据库配置
MONGODB_URI=mongodb://localhost:27017/software-platform

# JWT配置
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=86400000

# 钉钉应用配置
DINGTALK_APP_ID=your_dingtalk_app_id
DINGTALK_APP_SECRET=your_dingtalk_app_secret
DINGTALK_REDIRECT_URI=http://localhost:5000/api/auth/dingtalk/callback

# 前端URL
FRONTEND_URL=http://localhost:8080
```

4. 启动服务

开发模式：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

## API文档

### 认证相关

- `GET /api/auth/dingtalk/config` - 获取钉钉登录配置
- `POST /api/auth/dingtalk` - 使用钉钉临时授权码登录
- `GET /api/auth/dingtalk/callback` - 钉钉授权回调接口

### 用户相关

- `GET /api/users` - 获取所有用户（管理员）
- `GET /api/users/:id` - 获取指定用户信息
- `PUT /api/users/:id` - 更新用户信息
- `DELETE /api/users/:id` - 删除用户（管理员）
- `GET /api/users/profile/me` - 获取当前登录用户信息

### 软件相关

- `GET /api/software` - 获取所有软件
- `GET /api/software/search` - 搜索软件
- `GET /api/software/:id` - 获取指定软件信息
- `POST /api/software` - 创建新软件（管理员）
- `PUT /api/software/:id` - 更新软件信息（管理员）
- `DELETE /api/software/:id` - 删除软件（管理员）
- `GET /api/software/recommended/list` - 获取推荐软件
- `POST /api/software/:id/download` - 下载软件并记录信息 