import { ref, computed, watch } from 'vue'

// 用户接口定义
export interface User {
  username: string
  email?: string
  avatar?: string
  level?: number
  totalGamesPlayed?: number
  totalHoursPlayed?: number
  joinDate?: string
}

// 本地存储键名
const STORAGE_KEY = 'jubensha_user'

// 全局用户状态
const isLoggedIn = ref<boolean>(false)
const currentUser = ref<User | null>(null)

// 从本地存储加载用户数据
const loadUserFromStorage = (): User | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const userData = JSON.parse(stored)
      return userData
    }
  } catch (error) {
    console.error('Failed to load user data from localStorage:', error)
  }
  return null
}

// 保存用户数据到本地存储
const saveUserToStorage = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch (error) {
    console.error('Failed to save user data to localStorage:', error)
  }
}

// 初始化用户状态
const initializeUserState = () => {
  const storedUser = loadUserFromStorage()
  if (storedUser) {
    currentUser.value = storedUser
    isLoggedIn.value = true
  }
}

// 用户状态管理 composable
export function useUserStore() {
  // 监听用户状态变化，自动保存到本地存储
  watch(
    currentUser,
    (newUser) => {
      saveUserToStorage(newUser)
    },
    { deep: true }
  )

  // 登录函数
  const login = (userData: { username: string; email?: string }) => {
    const user: User = {
      username: userData.username,
      email: userData.email,
      avatar: `/placeholder.svg?height=80&width=80`,
      level: 1,
      totalGamesPlayed: 0,
      totalHoursPlayed: 0,
      joinDate: new Date().toISOString().split('T')[0]
    }
    
    currentUser.value = user
    isLoggedIn.value = true
    
    console.log('User logged in:', user)
  }

  // 注册函数
  const register = (userData: { username: string; email: string }) => {
    const user: User = {
      username: userData.username,
      email: userData.email,
      avatar: `/placeholder.svg?height=80&width=80`,
      level: 1,
      totalGamesPlayed: 0,
      totalHoursPlayed: 0,
      joinDate: new Date().toISOString().split('T')[0]
    }
    
    currentUser.value = user
    isLoggedIn.value = true
    
    console.log('User registered:', user)
  }

  // 登出函数
  const logout = () => {
    currentUser.value = null
    isLoggedIn.value = false
    saveUserToStorage(null)
    console.log('User logged out')
  }

  // 更新用户信息
  const updateUser = (updates: Partial<User>) => {
    if (currentUser.value) {
      currentUser.value = { ...currentUser.value, ...updates }
    }
  }

  // 计算属性
  const username = computed(() => currentUser.value?.username || '')
  const userEmail = computed(() => currentUser.value?.email || '')
  const userAvatar = computed(() => currentUser.value?.avatar || '/placeholder.svg?height=80&width=80')
  const userLevel = computed(() => currentUser.value?.level || 1)
  const displayName = computed(() => {
    if (currentUser.value?.username) {
      return currentUser.value.username
    }
    return '神秘玩家'
  })

  return {
    // 状态
    isLoggedIn: computed(() => isLoggedIn.value),
    currentUser: computed(() => currentUser.value),
    
    // 计算属性
    username,
    userEmail,
    userAvatar,
    userLevel,
    displayName,
    
    // 方法
    login,
    register,
    logout,
    updateUser,
    initializeUserState
  }
}

// 在模块加载时初始化用户状态
initializeUserState()
