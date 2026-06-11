import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'lobby',
    component: () => import('@/views/LobbyView.vue'),
    meta: { transition: 'pop-in' },
  },
  {
    path: '/game/:id/info',
    name: 'game-info',
    component: () => import('@/views/GameInfoView.vue'),
    props: true,
    meta: { transition: 'slide-up' },
  },
  {
    path: '/game/:id/play',
    name: 'game-play',
    component: () => import('@/views/GamePlayView.vue'),
    props: true,
    meta: { transition: 'pop-in' },
  },
  {
    path: '/game/:id/result',
    name: 'game-result',
    component: () => import('@/views/GameResultView.vue'),
    props: true,
    meta: { transition: 'confetti-fade' },
  },
  {
    path: '/shop',
    name: 'shop',
    component: () => import('@/views/ShopView.vue'),
    meta: { transition: 'page-flip' },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    // Restore scroll position if navigating back
    if (savedPosition) {
      return savedPosition
    }
    // Scroll to top on forward navigation
    return { top: 0 }
  },
})

export default router
