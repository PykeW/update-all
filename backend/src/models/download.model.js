/**
 * 下载记录模型
 */
const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema(
  {
    // 软件引用
    software: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Software',
      required: true,
    },
    
    // 下载用户引用
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // 下载时间
    downloadTime: {
      type: Date,
      default: Date.now,
    },
    
    // 下载IP
    ipAddress: {
      type: String,
    },
    
    // 浏览器/设备信息
    userAgent: {
      type: String,
    },
    
    // 下载状态
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },
  },
  { timestamps: true }
);

// 创建联合索引
downloadSchema.index({ software: 1, user: 1 });

const Download = mongoose.model('Download', downloadSchema);

module.exports = Download; 