const OSS = require('ali-oss');
const dotenv = require('dotenv');

dotenv.config();

// OSS客户端配置
const ossConfig = {
  region: process.env.OSS_REGION,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET,
  timeout: 60000, // 60秒超时
};

// 创建OSS客户端
const client = new OSS(ossConfig);

/**
 * 上传文件到OSS
 * @param {Buffer|Stream} fileBuffer 文件内容
 * @param {string} objectName OSS中的对象名
 * @returns {Promise<Object>} 上传结果
 */
exports.uploadFile = async (fileBuffer, objectName) => {
  try {
    // 设置存储类型为标准存储
    const options = {
      storageClass: 'Standard',
      meta: {
        uploadTime: new Date().toISOString(),
      },
    };

    // 上传文件到OSS
    const result = await client.put(objectName, fileBuffer, options);
    return {
      success: true,
      url: result.url,
      ossKey: objectName,
      etag: result.etag,
    };
  } catch (error) {
    console.error('OSS上传失败:', error);
    throw new Error(`文件上传到OSS失败: ${error.message}`);
  }
};

/**
 * 生成文件下载URL
 * @param {string} objectName OSS中的对象名
 * @param {number} expires URL有效期(秒)，默认1小时
 * @returns {string} 下载链接
 */
exports.generateDownloadUrl = async (objectName, expires = 3600) => {
  try {
    // 指定下载时的文件名
    const filename = objectName.split('/').pop();
    const options = {
      expires,
      response: {
        'content-disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    };

    return client.signatureUrl(objectName, options);
  } catch (error) {
    console.error('生成下载链接失败:', error);
    throw new Error(`生成下载链接失败: ${error.message}`);
  }
};

/**
 * 删除OSS中的文件
 * @param {string} objectName OSS中的对象名
 * @returns {Promise<Object>} 删除结果
 */
exports.deleteFile = async (objectName) => {
  try {
    const result = await client.delete(objectName);
    return {
      success: true,
      res: result.res,
    };
  } catch (error) {
    console.error('OSS文件删除失败:', error);
    throw new Error(`删除OSS文件失败: ${error.message}`);
  }
};
