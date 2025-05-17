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
      path: '/journeys',
      name: 'journeys',
      component: () => import('../views/JourneysView.vue'),
      meta: {
        title: 'Journeys - Code4U'
      }
    },
    {
      path: '/learning-paths',
      redirect: '/journeys'
    },
    {
      path: '/journey/:id',
      name: 'journey-detail',
      component: () => import('../views/JourneyDetailView.vue'),
      props: true,
      //beforeEnter: requireAuth,
      meta: {
        title: 'Journey Details - Code4U'
      }
    },
    {
      path: '/learning-path/:id',
      redirect: to => {
        // Redirect old path format to new format
        return { path: `/journey/${to.params.id}/levels` }
      }
    },
    {
      path: '/levels',
      name: 'levels',
      component: () => import('../views/LevelsView.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/journey/:pathId/levels',
      name: 'journey-levels',
      component: () => import('../views/LevelsView.vue'),
      props: true,
      beforeEnter: requireAuth,
      meta: {
        title: 'Journey Levels - Code4U'
      }
    },
    {
      path: '/learning-path/:pathId/levels',
      redirect: to => {
        return { path: `/journey/${to.params.pathId}/levels` }
      }
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
      path: '/admin',
      name: 'admin-dashboard',
      component: () => import('../views/admin/AdminDashboard.vue'),
      beforeEnter: requireAdmin,
      meta: {
        title: 'Admin Dashboard - Code4U'
      }
    },
    {
      path: '/admin/journeys',
      name: 'admin-journey-list',
      component: () => import('../views/admin/journeys/JourneyList.vue'),
      beforeEnter: requireAdmin,
      meta: {
        title: 'Journey Management - Code4U Admin'
      }
    },
    {
      path: '/admin/badges',
      name: 'admin-badge-list',
      component: () => import('../views/admin/badges/BadgeList.vue'),
      beforeEnter: requireAdmin,
      meta: {
        title: 'Badge Management - Code4U Admin'
      }
    },
    {
      path: '/admin/badges/new',
      name: 'admin-create-badge',
      component: () => import('../views/admin/badges/BadgeForm.vue'),
      beforeEnter: requireAdmin,
      meta: {
        title: 'Create Badge - Code4U Admin'
      }
    },
    {
      path: '/admin/badges/:id/edit',
      name: 'admin-edit-badge',
      component: () => import('../views/admin/badges/BadgeForm.vue'),
      props: true,
      beforeEnter: requireAdmin,
      meta: {
        title: 'Edit Badge - Code4U Admin'
      }
    },
    {
      path: '/admin/journeys/new',
      name: 'admin-journey-create',
      component: () => import('../views/admin/journeys/JourneyForm.vue'),
      beforeEnter: requireAdmin,
      meta: {
        title: 'Create Journey - Code4U Admin'
      }
    },
    {
      path: '/admin/journeys/:id/edit',
      name: 'admin-journey-edit',
      component: () => import('../views/admin/journeys/JourneyForm.vue'),
      props: true,
      beforeEnter: requireAdmin,
      meta: {
        title: 'Edit Journey - Code4U Admin'
      }
    },
    {
      path: '/admin/levels',
      name: 'admin-level-list',
      component: () => import('../views/admin/journeys/LevelList.vue'),
      beforeEnter: requireAdmin,
      meta: {
        title: 'Level Management - Code4U Admin'
      }
    },
    {
      path: '/admin/levels/new',
      name: 'admin-level-create',
      component: () => import('../views/admin/journeys/LevelForm.vue'),
      beforeEnter: requireAdmin,
      meta: {
        title: 'Create Level - Code4U Admin'
      }
    },
    {
      path: '/admin/levels/:id/edit',
      name: 'admin-level-edit',
      component: () => import('../views/admin/journeys/LevelForm.vue'),
      props: true,
      beforeEnter: requireAdmin,
      meta: {
        title: 'Edit Level - Code4U Admin'
      }
    },
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
