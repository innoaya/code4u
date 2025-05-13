import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { requireAdmin } from './adminGuard'

// Keep track of the auth initialization state
let authInitialized = false
let currentUser = null

// Initialize auth state tracking
onAuthStateChanged(auth, (user) => {
  currentUser = user
  authInitialized = true
})

// Navigation guard to check authentication - waits for initialization
const requireAuth = (to, from, next) => {
  // If auth isn't initialized yet, wait briefly before checking
  if (!authInitialized) {
    const waitForAuthInit = () => {
      // Check again after a small delay
      if (authInitialized) {
        // Now we can properly check the auth state
        if (currentUser) {
          next() // User is logged in, proceed
        } else {
          next({ name: 'login', query: { redirect: to.fullPath } }) // Not logged in, redirect
        }
      } else {
        // Still not initialized, wait a bit longer
        setTimeout(waitForAuthInit, 50)
      }
    }
    // Start the waiting process
    waitForAuthInit()
  } else {
    // Auth is already initialized, check current state
    if (currentUser) {
      next() // User is logged in, proceed
    } else {
      next({ name: 'login', query: { redirect: to.fullPath } }) // Not logged in, redirect
    }
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
    // Register route removed - using Google SSO only
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/profile/edit',
      name: 'edit-profile',
      component: () => import('../views/EditProfileView.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('../views/TermsOfServiceView.vue'),
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('../views/PrivacyPolicyView.vue'),
    },
    {
      path: '/activities',
      name: 'activities',
      component: () => import('../views/ActivitiesView.vue'),
    },
    // Admin routes
    {
      path: '/admin/feedback',
      name: 'admin-feedback-list',
      component: () => import('../views/admin/FeedbackListView.vue'),
      beforeEnter: requireAdmin,
      meta: {
        title: 'Feedback Management - Code4U Admin'
      }
    },
    {
      path: '/admin/feedback/:id',
      name: 'admin-feedback-detail',
      component: () => import('../views/admin/FeedbackDetailView.vue'),
      beforeEnter: requireAdmin,
      props: true,
      meta: {
        title: 'Feedback Details - Code4U Admin'
      }
    },
  ],
})

export default router
