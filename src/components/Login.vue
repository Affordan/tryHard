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
                  {{ showPassword ? '隐藏' : '显示' }}
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
              <span v-if="!isLoading">
                {{ isLogin ? '开始游戏' : '加入冒险' }}
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
              >
                {{ social.name }}
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/composables/useUserStore'

// 路由和用户状态管理
const router = useRouter()
const route = useRoute()
const { login, register } = useUserStore()

const isLogin = ref(true)
const isLoading = ref(false)
const showPassword = ref(false)
const focusedField = ref('')
const formVisible = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  rememberMe: false
})

// 简化的社交登录选项
const socialLogins = [
  { name: 'Google' },
  { name: 'Discord' },
  { name: 'Steam' }
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
      alert('欢迎回来，' + form.username + '！')
    } else {
      // 注册逻辑
      register({
        username: form.username,
        email: form.email
      })
      alert('账户创建成功，欢迎 ' + form.username + '！')
    }

    // 登录/注册成功后跳转到原来想访问的页面或主页
    const redirectPath = (route.query.redirect && typeof route.query.redirect === 'string')
      ? route.query.redirect
      : '/'
    router.push(redirectPath)

  } catch (error) {
    console.error('登录/注册失败:', error)
    alert('操作失败，请重试！')
  } finally {
    isLoading.value = false
  }
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
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #334155 70%, #475569 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  overflow: hidden;
}

/* 添加背景装饰元素 */
.login-container::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.login-container::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

.login-wrapper {
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
}

.login-card {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 16px;
  padding: 40px 35px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
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
  font-size: 14px;
  font-weight: 500;
  color: #cbd5e1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-container {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 14px 18px;
  border: 1px solid rgba(71, 85, 105, 0.4);
  border-radius: 10px;
  font-size: 14px;
  background: rgba(15, 23, 42, 0.5);
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
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
  background: rgba(15, 23, 42, 0.7);
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
  font-size: 12px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.password-toggle:hover {
  background-color: rgba(71, 85, 105, 0.3);
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
  gap: 10px;
}

.social-btn {
  flex: 1;
  padding: 14px 16px;
  border: 1px solid rgba(71, 85, 105, 0.4);
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.5);
  color: #cbd5e1;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.social-btn:hover {
  border-color: #8b5cf6;
  color: #a78bfa;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.2);
  background: rgba(15, 23, 42, 0.7);
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