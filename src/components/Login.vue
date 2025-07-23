<template>
  <div class="login-container">
    <!-- Main Content -->
    <div class="login-wrapper">
      <div class="login-card">
        <!-- Logo Section -->
        <div class="logo-section">
          <div class="logo-container">
            <div class="logo-icon">
              <span>剧</span>
            </div>
            <div class="logo-text">
              <h1>剧本杀游戏</h1>
              <p>Gaming Platform</p>
            </div>
          </div>
          <p class="welcome-text">
            {{ isLogin ? '欢迎回来，准备好冒险了吗？' : '加入社区，开始你的旅程' }}
          </p>
        </div>

        <!-- Main Form Container -->
        <div class="form-container">
          <!-- Mode Toggle -->
          <div class="mode-toggle">
            <div class="toggle-buttons">
              <div class="toggle-slider" :class="{ 'active-register': !isLogin }"></div>
              <button
                @click="switchMode(true)"
                :class="['toggle-btn', { 'active': isLogin }]"
              >
                登录
              </button>
              <button
                @click="switchMode(false)"
                :class="['toggle-btn', { 'active': !isLogin }]"
              >
                注册
              </button>
            </div>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="login-form">
            <!-- Username Field -->
            <div class="form-group">
              <label class="form-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"/>
                </svg>
                <span>用户名</span>
              </label>
              <div class="input-container">
                <input
                  v-model="form.username"
                  type="text"
                  required
                  class="form-input"
                  placeholder="请输入用户名"
                  @focus="focusedField = 'username'"
                  @blur="focusedField = ''"
                >
                <div v-if="form.username" class="input-indicator"></div>
              </div>
            </div>

            <!-- Email Field (Registration Only) -->
            <div v-if="!isLogin" class="form-group">
              <label class="form-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2 2a2 2 0 0 0-2 2v8.01A2 2 0 0 0 2 14h5.5a.5.5 0 0 0 0-1H2a1 1 0 0 1-.966-.741l5.64-3.471L8 9.583l7-4.2V8.5a.5.5 0 0 0 1 0V4a2 2 0 0 0-2-2H2Zm3.708 6.208L1 11.105V5.383l4.708 2.825ZM1 4.217V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.217l-7 4.2-7-4.2Z"/>
                  <path d="M14.247 14.269c1.01 0 1.587-.857 1.587-2.025v-.21C15.834 10.43 14.64 9 12.52 9h-.035C10.42 9 9 10.36 9 12.432v.214C9 14.82 10.438 16 12.358 16h.044c.594 0 1.018-.074 1.237-.175v-.73c-.245.11-.673.18-1.18.18h-.044c-1.334 0-2.571-.788-2.571-2.655v-.157c0-1.657 1.058-2.724 2.64-2.724h.04c1.535 0 2.484 1.05 2.484 2.326v.118c0 .975-.324 1.39-.639 1.39-.232 0-.41-.148-.41-.42v-2.19h-.906v.569h-.03c-.084-.298-.368-.63-.954-.63-.778 0-1.259.555-1.259 1.4v.528c0 .892.49 1.434 1.26 1.434.471 0 .896-.227 1.014-.643h.043c.118.42.617.648 1.12.648Zm-2.453-1.588v-.227c0-.546.227-.791.573-.791.297 0 .572.192.572.708v.367c0 .573-.253.744-.564.744-.354 0-.581-.215-.581-.8Z"/>
                </svg>
                <span>邮箱</span>
              </label>
              <div class="input-container">
                <input
                  v-model="form.email"
                  type="email"
                  required
                  class="form-input"
                  placeholder="请输入邮箱地址"
                  @focus="focusedField = 'email'"
                  @blur="focusedField = ''"
                >
                <div v-if="form.email && isValidEmail(form.email)" class="input-indicator valid"></div>
              </div>
            </div>

            <!-- Password Field -->
            <div class="form-group">
              <label class="form-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                </svg>
                <span>密码</span>
              </label>
              <div class="input-container">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="form-input password-input"
                  placeholder="请输入密码"
                  @focus="focusedField = 'password'"
                  @blur="focusedField = ''"
                >
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="password-toggle"
                >
                  <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                    <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.708zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                  </svg>
                </button>
              </div>
              <!-- Password Strength Indicator -->
              <div v-if="!isLogin && form.password" class="password-strength">
                <div class="strength-bars">
                  <div
                    v-for="i in 4"
                    :key="i"
                    class="strength-bar"
                    :class="{ 'active': i <= passwordStrength }"
                  ></div>
                </div>
                <p class="strength-text">
                  密码强度: {{ ['弱', '一般', '良好', '强'][passwordStrength - 1] || '很弱' }}
                </p>
              </div>
            </div>

            <!-- Confirm Password (Registration Only) -->
            <div v-if="!isLogin" class="form-group">
              <label class="form-label">
                <span>确认密码</span>
              </label>
              <div class="input-container">
                <input
                  v-model="form.confirmPassword"
                  type="password"
                  required
                  class="form-input"
                  placeholder="请再次输入密码"
                  @focus="focusedField = 'confirmPassword'"
                  @blur="focusedField = ''"
                >
                <div v-if="form.confirmPassword && form.password === form.confirmPassword" class="input-indicator valid"></div>
                <div v-else-if="form.confirmPassword && form.password !== form.confirmPassword" class="input-indicator invalid"></div>
              </div>
            </div>

            <!-- Remember Me / Forgot Password -->
            <div v-if="isLogin" class="form-options">
              <label class="checkbox-container">
                <input
                  v-model="form.rememberMe"
                  type="checkbox"
                  class="checkbox-input"
                >
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">记住我</span>
              </label>
              <a href="#" class="forgot-password">
                忘记密码？
              </a>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="isLoading"
              class="submit-btn"
              :class="{ 'loading': isLoading }"
            >
              <span v-if="!isLoading" class="submit-btn-content">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                </svg>
                <span>{{ isLogin ? '开始游戏' : '加入冒险' }}</span>
              </span>
              <span v-else class="loading-content">
                <span class="loading-spinner"></span>
                {{ isLogin ? '启动中...' : '创建账户中...' }}
              </span>
            </button>
          </form>

          <!-- Social Login -->
          <div class="social-login">
            <div class="divider">
              <span>或者使用以下方式</span>
            </div>
            <div class="social-buttons">
              <button
                v-for="social in socialLogins"
                :key="social.name"
                type="button"
                class="social-btn"
                :title="social.name"
              >
                <div v-html="social.icon"></div>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>继续使用即表示您同意我们的
            <a href="#" class="footer-link">服务条款</a>
            和
            <a href="#" class="footer-link">隐私政策</a>
          </p>
        </div>
      </div>
    </div>

    <!-- SystemModal for welcome message -->
    <SystemModal
      :visible="showWelcomeModal"
      type="welcome"
      title="欢迎回来！"
      message="登录成功！准备好开始一场新的冒险了吗？"
      confirm-text="开始游戏"
      @confirm="handleWelcomeConfirm"
      @cancel="handleWelcomeConfirm"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/composables/useUserStore'
import SystemModal from './SystemModal.vue'

// 路由和用户状态管理
const router = useRouter()
const route = useRoute()
const { login, register } = useUserStore()

const isLogin = ref(true)
const isLoading = ref(false)
const showPassword = ref(false)
const focusedField = ref('')
const formVisible = ref(false)
const showWelcomeModal = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  rememberMe: false
})

// 简化的社交登录选项
const socialLogins = [
  {
    name: 'Google',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>`
  },
  {
    name: 'Discord',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#5865F2">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>`
  },
  {
    name: 'Steam',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#000000">
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.624 0 11.999-5.375 11.999-12S18.603.001 11.979.001zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm8.397-8.122c0 1.662-1.353 3.015-3.015 3.015s-3.015-1.353-3.015-3.015 1.353-3.015 3.015-3.015 3.015 1.353 3.015 3.015zm-5.273-.005c0 1.252 1.013 2.266 2.265 2.266 1.252 0 2.266-1.014 2.266-2.266 0-1.251-1.014-2.265-2.266-2.265-1.252 0-2.265 1.014-2.265 2.265z"/>
    </svg>`
  }
]

const passwordStrength = computed(() => {
  const password = form.password
  if (!password) return 0
  
  let strength = 0
  if (password.length >= 8) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++
  
  return strength
})

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const switchMode = (loginMode) => {
  isLogin.value = loginMode
  formVisible.value = false
  setTimeout(() => {
    formVisible.value = true
  }, 100)
}

const handleSubmit = async () => {
  if (!isLogin.value && form.password !== form.confirmPassword) {
    alert('密码不匹配！')
    return
  }

  if (!form.username.trim()) {
    alert('请输入用户名！')
    return
  }

  if (!isLogin.value && !form.email.trim()) {
    alert('请输入邮箱地址！')
    return
  }

  isLoading.value = true

  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    if (isLogin.value) {
      // 登录逻辑
      login({
        username: form.username,
        email: form.email || undefined
      })
      // 显示欢迎弹窗而不是alert
      showWelcomeModal.value = true
    } else {
      // 注册逻辑
      register({
        username: form.username,
        email: form.email
      })
      alert('账户创建成功，欢迎 ' + form.username + '！')

      // 注册成功后跳转
      const redirectPath = (route.query.redirect && typeof route.query.redirect === 'string')
        ? route.query.redirect
        : '/'
      router.push(redirectPath)
    }

  } catch (error) {
    console.error('登录/注册失败:', error)
    alert('操作失败，请重试！')
  } finally {
    isLoading.value = false
  }
}

const handleWelcomeConfirm = () => {
  showWelcomeModal.value = false
  // 登录成功后跳转到原来想访问的页面或主页
  const redirectPath = (route.query.redirect && typeof route.query.redirect === 'string')
    ? route.query.redirect
    : '/'
  router.push(redirectPath)
}

onMounted(() => {
  formVisible.value = true
})
</script>

<style scoped>
/* 基础样式重置 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 主容器 */
.login-container {
  min-height: 100vh;
  /* 调整为更接近参考图的蓝紫色渐变 */
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  overflow: hidden; /* 保持隐藏溢出 */
}

/* 调整背景装饰元素 - 添加动画 */
.login-container::before {
  content: '';
  position: absolute;
  /* 调整位置和大小以匹配参考图左上角 */
  top: -10%;
  left: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, transparent 60%);
  border-radius: 50%;
  /* 添加呼吸动画 */
  animation: breathe-primary 8s ease-in-out infinite;
}

.login-container::after {
  content: '';
  position: absolute;
  /* 调整位置和大小以匹配参考图右下角 */
  bottom: -15%;
  right: -15%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 65%);
  border-radius: 50%;
  /* 添加呼吸动画 - 反向 */
  animation: breathe-secondary 10s ease-in-out infinite reverse;
}

/* 呼吸动画关键帧 */
@keyframes breathe-primary {
  0%, 100% {
    transform: scale(1) translate(0, 0);
    opacity: 0.25;
  }
  25% {
    transform: scale(1.1) translate(-10px, 5px);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.05) translate(5px, -10px);
    opacity: 0.2;
  }
  75% {
    transform: scale(1.15) translate(-5px, 8px);
    opacity: 0.35;
  }
}

@keyframes breathe-secondary {
  0%, 100% {
    transform: scale(1) translate(0, 0);
    opacity: 0.2;
  }
  30% {
    transform: scale(0.95) translate(8px, -5px);
    opacity: 0.15;
  }
  60% {
    transform: scale(1.08) translate(-12px, 10px);
    opacity: 0.25;
  }
  80% {
    transform: scale(1.02) translate(6px, -8px);
    opacity: 0.18;
  }
}

.login-wrapper {
  width: 100%;
  max-width: 580px;
  position: relative;
  z-index: 1;
}

/* 添加额外的浮动光点效果 */
.login-container::before {
  /* 在现有样式基础上添加额外的光晕效果 */
  box-shadow:
    0 0 100px rgba(79, 70, 229, 0.1),
    0 0 200px rgba(79, 70, 229, 0.05);
}

.login-container::after {
  /* 在现有样式基础上添加额外的光晕效果 */
  box-shadow:
    0 0 120px rgba(139, 92, 246, 0.1),
    0 0 240px rgba(139, 92, 246, 0.05);
}

.login-card {
  background: rgba(30, 41, 59, 0.75); /* 可以稍微降低不透明度 */
  border: 1px solid rgba(255, 255, 255, 0.1); /* 使用半透明白色边框更亮眼 */
  border-radius: 24px; /* 更大的圆角 */
  padding: 48px; /* 增加内边距 */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); /* 更柔和、弥散的阴影 */
  backdrop-filter: blur(20px);
}

/* Logo 部分 */
.logo-section {
  text-align: center;
  margin-bottom: 35px;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.logo-icon {
  width: 55px;
  height: 55px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 26px;
  font-weight: bold;
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
  position: relative;
}

.logo-icon::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  border-radius: 16px;
  z-index: -1;
  opacity: 0.3;
  filter: blur(8px);
}

.logo-text h1 {
  font-size: 32px;
  color: #f8fafc;
  margin: 0;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.logo-text p {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
  font-weight: 500;
}

.welcome-text {
  color: #94a3b8;
  font-size: 15px;
  line-height: 1.6;
  font-weight: 400;
}

/* 表单容器 */
.form-container {
  width: 100%;
}

/* 模式切换 */
.mode-toggle {
  margin-bottom: 30px;
}

.toggle-buttons {
  position: relative;
  display: flex;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 10px;
  padding: 6px;
}

.toggle-slider {
  position: absolute;
  top: 6px;
  left: 6px;
  width: calc(50% - 6px);
  height: calc(100% - 12px);
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  border-radius: 8px;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.toggle-slider.active-register {
  transform: translateX(100%);
}

.toggle-btn {
  flex: 1;
  padding: 14px 20px;
  background: none;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  color: #94a3b8;
}

.toggle-btn.active {
  color: white;
}

.toggle-btn:hover:not(.active) {
  color: #cbd5e1;
  background: rgba(71, 85, 105, 0.3);
}

/* 表单样式 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px; /* 图标和文字的间距 */
  font-size: 14px;
  font-weight: 500;
  color: #cbd5e1;
}

.form-label svg {
  color: #94a3b8;
}

.input-container {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 14px 18px;
  border: 1px solid #475569;
  border-radius: 10px;
  font-size: 14px;
  background: #1e293b; /* 使用更深的背景色 */
  color: #f8fafc;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.form-input::placeholder {
  color: #64748b;
}

.form-input:focus {
  outline: none;
  border-color: #8b5cf6;
  background: #1e293b;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.4); /* 聚焦时的紫色光晕 */
}

.password-input {
  padding-right: 60px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 0; /* 隐藏原始文字 */
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.password-toggle svg {
  width: 18px;
  height: 18px;
  color: #94a3b8;
}

.password-toggle:hover {
  background-color: rgba(71, 85, 105, 0.3);
  color: #cbd5e1;
}

.password-toggle:hover svg {
  color: #cbd5e1;
}

.input-indicator {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
}

.input-indicator.valid {
  background: #10b981;
}

.input-indicator.invalid {
  background: #ef4444;
}

/* 密码强度指示器 */
.password-strength {
  margin-top: 8px;
}

.strength-bars {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}

.strength-bar {
  flex: 1;
  height: 3px;
  background: rgba(71, 85, 105, 0.3);
  border-radius: 2px;
  transition: background-color 0.3s ease;
}

.strength-bar.active {
  background: linear-gradient(90deg, #8b5cf6, #6366f1);
}

.strength-text {
  font-size: 12px;
  color: #94a3b8;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(71, 85, 105, 0.5);
  border-radius: 5px;
  position: relative;
  transition: all 0.3s ease;
  background: rgba(15, 23, 42, 0.3);
}

.checkbox-input:checked + .checkbox-custom {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  border-color: #8b5cf6;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-label {
  font-size: 14px;
  color: #cbd5e1;
}

.forgot-password {
  font-size: 14px;
  color: #a78bfa;
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #8b5cf6;
  text-decoration: underline;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  padding: 16px 20px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
}

.submit-btn:hover:not(.loading) {
  background: linear-gradient(135deg, #7c3aed, #5b5bd6);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
}

.submit-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.submit-btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 社交登录 */
.social-login {
  margin-top: 25px;
}

.divider {
  position: relative;
  text-align: center;
  margin-bottom: 20px;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(71, 85, 105, 0.3);
}

.divider span {
  background: rgba(30, 41, 59, 0.8);
  padding: 0 15px;
  font-size: 14px;
  color: #94a3b8;
}

.social-buttons {
  display: flex;
  gap: 20px; /* 增加按钮间距 */
  justify-content: center; /* 居中显示 */
}

.social-btn {
  /* 移除 flex: 1; */
  width: 52px; /* 设置固定宽高 */
  height: 52px;
  padding: 0; /* 移除内边距 */
  border: 1px solid #475569;
  border-radius: 50%; /* 关键：设置为圆形 */
  background: #1e293b;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-btn:hover {
  border-color: #8b5cf6;
  transform: translateY(-3px) scale(1.05); /* 增加悬浮动效 */
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
  background: #312e81;
}

/* 页脚 */
.footer {
  text-align: center;
  margin-top: 30px;
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.6;
}

.footer-link {
  color: #a78bfa;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #8b5cf6;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: 15px;
  }

  .login-card {
    padding: 30px 20px;
  }

  .logo-container {
    flex-direction: column;
    gap: 10px;
  }

  .social-buttons {
    flex-direction: column;
  }
}
</style>