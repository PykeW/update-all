/**
 * 用户模型
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // 钉钉用户ID
    dingtalkId: {
      type: String,
      unique: true,
      sparse: true,
    },
    
    // 用户名
    username: {
      type: String,
      required: true,
      unique: true,
    },
    
    // 昵称（显示名称）
    displayName: {
      type: String,
      required: true,
    },
    
    // 电子邮件
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
    },
    
    // 密码（如果需要密码登录）
    password: {
      type: String,
    },
    
    // 头像URL
    avatar: {
      type: String,
    },
    
    // 角色
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    
    // 部门
    department: {
      type: String,
    },
    
    // 职位
    position: {
      type: String,
    },
    
    // 是否启用
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // 上次登录时间
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

// 添加密码哈希方法
userSchema.methods.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(password, salt);
};

// 验证密码方法
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 