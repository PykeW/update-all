import axios from 'axios'
import { ElMessage } from 'element-plus'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          ElMessage.error('身份验证失败，请重新登录')
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          window.location.href = '/'
          break
        case 403:
          ElMessage.error('没有权限访问该资源')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(error.response.data.message || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查您的网络连接')
    }
    return Promise.reject(error)
  }
)

export default {
  // 获取钉钉登录配置
  getDingTalkConfig() {
    return api.get('/auth/dingtalk/config')
  },
  
  // 获取登录二维码
  getLoginQRCode() {
    return api.get('/auth/dingtalk/qrcode')
  },
  
  // 检查登录状态
  checkLoginStatus(code) {
    return api.post('/auth/dingtalk/login', { code })
  },
  
  // 获取用户信息
  getUserInfo() {
    return api.get('/users/me')
  }
} 