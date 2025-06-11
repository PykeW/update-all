const cron = require('node-cron');
const db = require('../models/db');
const ossUtil = require('./oss.util');

// 每天凌晨3点刷新即将过期的下载链接
const refreshDownloadUrls = cron.schedule('0 3 * * *', async () => {
  try {
    console.log('开始刷新下载链接...');
    
    // 查找3天内过期的链接
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    // 注意：NeDB不支持日期比较，所以使用时间戳
    const threeDaysFromNowTimestamp = threeDaysFromNow.getTime();
    
    // 使用原生方法执行查询
    db.software.find({
      ossKey: { $exists: true },
      downloadUrlExpires: { $lt: threeDaysFromNow }
    }, async (err, softwares) => {
      if (err) {
        console.error('查询软件失败:', err);
        return;
      }
      
      console.log(`找到 ${softwares.length} 个需要刷新的链接`);
      
      for (const software of softwares) {
        try {
          // 生成新的下载链接，有效期7天
          const expiresInSeconds = 7 * 24 * 60 * 60;
          const downloadUrl = await ossUtil.generateDownloadUrl(
            software.ossKey,
            expiresInSeconds
          );
          
          // 更新数据库
          const nextExpiry = new Date(Date.now() + expiresInSeconds * 1000);
          await db.software.updateAsync(
            { _id: software._id },
            { 
              $set: {
                downloadUrl: downloadUrl,
                downloadUrlExpires: nextExpiry
              }
            }
          );
          console.log(`更新了软件下载链接: ${software.name}`);
        } catch (updateErr) {
          console.error(`更新软件 ${software._id} 失败:`, updateErr);
        }
      }
      
      console.log('下载链接刷新完成');
    });
  } catch (error) {
    console.error('刷新下载链接失败:', error);
  }
});

// 定期压缩数据库文件 (每周一次)
const compactDatabases = cron.schedule('0 4 * * 0', () => {
  console.log('开始压缩数据库文件...');
  
  // 压缩所有数据库文件
  ['users', 'software', 'downloads'].forEach(collection => {
    db[collection].persistence.compactDatafile();
  });
  
  console.log('数据库文件压缩完成');
});

// 导出定时任务
module.exports = {
  refreshDownloadUrls,
  compactDatabases
};
