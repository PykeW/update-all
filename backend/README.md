# 软件更新平台后端

## 功能介绍
- 钉钉扫码登录认证
- 用户管理
- JWT令牌身份验证
- 软件包管理与下载

## 项目配置说明

### 环境变量配置
在项目根目录创建 `.env` 文件，参考以下配置：

```
# 服务器配置
PORT=4000
NODE_ENV=development

# JWT配置
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# 钉钉应用配置
DINGTALK_APP_KEY=your_dingtalk_app_key
DINGTALK_APP_SECRET=your_dingtalk_app_secret
DINGTALK_REDIRECT_URI=http://localhost:3000/auth/dingtalk/callback

# 访问白名单
ALLOWED_DINGTALK_PHONES=13800138000,13900139000
ALLOWED_DINGTALK_EMAILS=user1@example.com,user2@example.com
STRICT_WHITELIST=false
```

### 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 生产部署
```bash
# 启动生产服务器
npm start
```

### 钉钉应用配置
在开发前，需要在钉钉开放平台创建应用并配置好以下信息：

1. 创建第三方企业应用
2. 配置应用首页地址为前端部署地址
3. 配置登录回调域名
4. 获取AppKey和AppSecret并设置到.env文件中

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