/**
 * 软件模型
 */
const mongoose = require('mongoose');

const softwareSchema = new mongoose.Schema(
  {
    // 软件名称
    name: {
      type: String,
      required: true,
      trim: true,
    },
    
    // 版本号
    version: {
      type: String,
      required: true,
    },
    
    // 描述
    description: {
      type: String,
      required: true,
    },
    
    // 软件类型/分类
    category: {
      type: String,
      required: true,
    },
    
    // 软件图标URL
    icon: {
      type: String,
    },
    
    // 软件安装包URL
    downloadUrl: {
      type: String,
      required: true,
    },
    
    // 软件大小（字节）
    size: {
      type: Number,
      required: true,
    },
    
    // 平台支持 (windows, mac, linux)
    platforms: {
      type: [String],
      enum: ['windows', 'mac', 'linux', 'android', 'ios'],
      default: ['windows'],
    },
    
    // 发布日期
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    
    // 下载次数
    downloads: {
      type: Number,
      default: 0,
    },
    
    // 是否发布
    isPublished: {
      type: Boolean,
      default: true,
    },
    
    // 是否为推荐软件
    isRecommended: {
      type: Boolean,
      default: false,
    },
    
    // 安装说明
    installInstructions: {
      type: String,
    },
    
    // 发布人
    publisher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // OSS对象键
    ossKey: {
      type: String,
    },
    
    // 文件的ETag (用于标识文件版本)
    fileETag: {
      type: String,
    },
    
    // 文件的MIME类型
    contentType: {
      type: String,
    },
    
    // 下载URL过期时间
    downloadUrlExpires: {
      type: Date,
    }
  },
  { timestamps: true }
);

// 创建索引以支持搜索
softwareSchema.index({ name: 'text', description: 'text', category: 'text' });

const Software = mongoose.model('Software', softwareSchema);

module.exports = Software; 