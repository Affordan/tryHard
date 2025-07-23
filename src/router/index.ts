import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/components/HomePage.vue'
import GalgameInterface from '@/components/GalgameInterface.vue'
import UserProfile from '@/components/UserProfile.vue'
import GameWait from '@/components/GameWait.vue'
import LoginPage from '@/components/Login.vue'
import { useUserStore } from '@/composables/useUserStore'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: {
      title: '迷雾剧场 - 剧本杀游戏'
    }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: {
      title: '登录 - 迷雾剧场'
    }
  },
  {
    path: '/wait/:scriptId?',
    name: 'wait',
    component: GameWait,
    meta: {
      title: '等待匹配 - 迷雾剧场'
    }
  },
  {
    path: '/game/:scriptId?',
    name: 'game',
    component: GalgameInterface,
    meta: {
      title: '游戏中 - 迷雾剧场'
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: UserProfile,
    meta: {
      title: '个人中心 - 迷雾剧场',
      requiresAuth: true
    }
  },
  {
    // 重定向所有未匹配的路由到主页
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 设置页面标题和登录检查
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }

  // 检查是否需要登录
  if (to.meta?.requiresAuth) {
    const { isLoggedIn } = useUserStore()
    if (!isLoggedIn.value) {
      // 未登录，重定向到登录页面
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
  }

  next()
})

export default router
