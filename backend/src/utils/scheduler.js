const cron = require('node-cron');
const Software = require('../models/software.model');
const ossUtil = require('./oss.util');

// 每天凌晨3点刷新即将过期的下载链接
const refreshDownloadUrls = cron.schedule('0 3 * * *', async () => {
  try {
    console.log('开始刷新下载链接...');
    
    // 查找3天内过期的链接
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const softwaresToUpdate = await Software.find({
      ossKey: { $exists: true, $ne: '' },
      downloadUrlExpires: { $lt: threeDaysFromNow }
    });
    
    console.log(`找到 ${softwaresToUpdate.length} 个需要刷新的链接`);
    
    for (const software of softwaresToUpdate) {
      // 生成新的下载链接，有效期7天
      const expiresInSeconds = 7 * 24 * 60 * 60;
      const downloadUrl = await ossUtil.generateDownloadUrl(
        software.ossKey,
        expiresInSeconds
      );
      
      // 更新数据库
      software.downloadUrl = downloadUrl;
      software.downloadUrlExpires = new Date(Date.now() + expiresInSeconds * 1000);
      await software.save();
    }
    
    console.log('下载链接刷新完成');
  } catch (error) {
    console.error('刷新下载链接失败:', error);
  }
});

// 导出定时任务
module.exports = {
  refreshDownloadUrls,
};
