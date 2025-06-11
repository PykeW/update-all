<template>
  <div class="login-container">
    <div class="card login-card">
      <h1>软件更新平台</h1>
      <p class="mt-20">使用钉钉扫码登录</p>
      
      <div class="qrcode-container">
        <div v-if="loading" class="loading">
          <el-loading></el-loading>
        </div>
        <div v-else-if="errorMessage" class="text-center">
          <p class="error-message">{{ errorMessage }}</p>
          <el-button type="primary" class="mt-20" @click="initDingTalkLogin">刷新二维码</el-button>
        </div>
        <div v-else>
          <div id="dingtalk-login-container"></div>
        </div>
      </div>
      
      <p class="mt-20">请使用钉钉App扫描二维码登录</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElLoading, ElMessage } from 'element-plus'
import api from '../utils/api'

export default {
  name: 'Login',
  
  setup() {
    const router = useRouter()
    const loading = ref(true)
    const errorMessage = ref('')
    
    // 初始化钉钉登录
    const initDingTalkLogin = async () => {
      loading.value = true
      errorMessage.value = ''
      
      try {
        // 获取钉钉登录所需配置
        const config = await api.getDingTalkConfig()
        
        // 确保全局变量 DDLogin 可用
        if (typeof window.DDLogin !== 'function') {
          throw new Error('钉钉登录SDK加载失败')
        }

        // 清空容器内容
        const container = document.getElementById('dingtalk-login-container')
        if (container) container.innerHTML = ''
        
        // 初始化钉钉扫码登录
        const ddObj = new window.DDLogin({
          id: 'dingtalk-login-container',
          goto: config.goto,
          style: 'border:none;background-color:#FFFFFF;',
          width: '300',
          height: '300'
        })
        
        // 监听扫码事件
        const handleMessage = (event) => {
          const origin = event.origin
          if (origin === 'https://login.dingtalk.com') {
            const loginTmpCode = event.data
            if (loginTmpCode && loginTmpCode.loginTmpCode) {
              verifyLogin(loginTmpCode.loginTmpCode)
            }
          }
        }
        
        if (typeof window.addEventListener !== 'undefined') {
          window.addEventListener('message', handleMessage, false)
        } else if (typeof window.attachEvent !== 'undefined') {
          window.attachEvent('onmessage', handleMessage)
        }
        
        loading.value = false
      } catch (error) {
        errorMessage.value = '二维码加载失败，请刷新重试'
        loading.value = false
        console.error('初始化钉钉登录失败:', error)
      }
    }
    
    // 验证登录
    const verifyLogin = async (code) => {
      const loadingInstance = ElLoading.service({
        target: '.login-card',
        text: '登录验证中...'
      })
      
      try {
        const result = await api.checkLoginStatus(code)
        
        if (result.token) {
          // 保存token和用户信息
          localStorage.setItem('token', result.token)
          localStorage.setItem('userInfo', JSON.stringify(result.user))
          
          ElMessage.success('登录成功')
          router.push({ name: 'Home' })
        } else {
          throw new Error('登录失败，请重试')
        }
      } catch (error) {
        ElMessage.error(error.message || '登录验证失败，请重试')
      } finally {
        loadingInstance.close()
      }
    }
    
    // 页面加载时初始化钉钉登录
    onMounted(() => {
      initDingTalkLogin()
    })
    
    return {
      loading,
      errorMessage,
      initDingTalkLogin
    }
  }
}
</script>

<style scoped>
.error-message {
  color: #f56c6c;
  margin-bottom: 10px;
}
</style> 