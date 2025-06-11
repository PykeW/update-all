<template>
  <div class="container">
    <el-card>
      <template #header>
        <div class="header">
          <h1>软件更新平台</h1>
          <el-button type="danger" @click="handleLogout">退出登录</el-button>
        </div>
      </template>
      
      <div class="welcome-content">
        <h2>欢迎，{{ userInfo.name }}</h2>
        <p>您已成功登录系统</p>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export default {
  name: 'Home',
  
  setup() {
    const router = useRouter()
    const userInfo = ref({
      name: '用户',
      avatar: '',
      role: ''
    })
    
    onMounted(() => {
      const storedUserInfo = localStorage.getItem('userInfo')
      if (storedUserInfo) {
        try {
          userInfo.value = JSON.parse(storedUserInfo)
        } catch (error) {
          console.error('用户信息解析失败:', error)
        }
      }
    })
    
    const handleLogout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      ElMessage.success('已退出登录')
      router.push({ name: 'Login' })
    }
    
    return {
      userInfo,
      handleLogout
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-content {
  text-align: center;
  padding: 40px 0;
}
</style> 