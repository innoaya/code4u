import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { auth } from '../firebase'

// Navigation guard to check authentication
const requireAuth = (to, from, next) => {
  const user = auth.currentUser
  if (!user) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/levels',
      name: 'levels',
      component: () => import('../views/LevelsView.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/level/:id',
      name: 'level-detail',
      component: () => import('../views/LevelDetailView.vue'),
      beforeEnter: requireAuth,
      props: true
    },
    {
      path: '/game/:levelId',
      name: 'game',
      component: () => import('../views/GameView.vue'),
      beforeEnter: requireAuth,
      props: true
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: () => import('../views/LeaderboardView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
