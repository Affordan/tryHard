import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/components/HomePage.vue'
import GalgameInterface from '@/components/GalgameInterface.vue'

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
    path: '/game/:scriptId?',
    name: 'game',
    component: GalgameInterface,
    meta: {
      title: '游戏中 - 迷雾剧场'
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

// 路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }
  next()
})

export default router
