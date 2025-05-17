import { auth, db } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

// Keep track of auth state initialization
let authInitialized = false
let currentUser = null

// Initialize auth state tracking once
onAuthStateChanged(auth, (user) => {
  currentUser = user
  authInitialized = true
  console.log('Auth state changed in adminGuard:', user ? 'User logged in' : 'No user')
})

/**
 * Navigation guard to check if a user has admin role
 * This guard will redirect non-admin users to the home page
 */
export const requireAdmin = (to, from, next) => {
  console.log('Admin guard running, auth initialized:', authInitialized)
  
  // If auth isn't initialized yet, wait briefly before checking
  if (!authInitialized) {
    console.log('Auth not initialized, waiting...')
    // Create a function to wait for auth initialization
    const waitForAuthInit = () => {
      if (authInitialized) {
        checkAdminStatus(currentUser, to, next)
      } else {
        // Still not initialized, wait a bit longer
        setTimeout(waitForAuthInit, 50)
      }
    }
    // Start waiting
    waitForAuthInit()
    return
  }
  
  // Auth is already initialized, check admin status
  checkAdminStatus(currentUser, to, next)
}

/**
 * Navigation guard to check if a user has creator or admin role
 * This guard will redirect regular users to the home page
 */
export const requireCreatorOrAdmin = (to, from, next) => {
  console.log('Creator guard running, auth initialized:', authInitialized)
  
  // If auth isn't initialized yet, wait briefly before checking
  if (!authInitialized) {
    console.log('Auth not initialized, waiting...')
    // Create a function to wait for auth initialization
    const waitForAuthInit = () => {
      if (authInitialized) {
        checkCreatorOrAdminStatus(currentUser, to, next)
      } else {
        // Still not initialized, wait a bit longer
        setTimeout(waitForAuthInit, 50)
      }
    }
    // Start waiting
    waitForAuthInit()
    return
  }
  
  // Auth is already initialized, check creator status
  checkCreatorOrAdminStatus(currentUser, to, next)
}

/**
 * Helper function to check if user has admin role
 */
async function checkAdminStatus(user, to, next) {
  // First check if the user is authenticated
  if (!user) {
    console.log('No authenticated user, redirecting to login')
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }
  
  try {
    console.log('Checking admin status for user:', user.uid)
    // Get the user document and check for admin role
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    
    if (userDoc.exists() && userDoc.data().role === 'admin') {
      // User is an admin, allow access
      console.log('User is admin, allowing access')
      next()
    } else {
      // User is not an admin, redirect to home
      console.warn('Non-admin user attempted to access admin page')
      next({ name: 'home' })
    }
  } catch (error) {
    console.error('Error checking admin status:', error)
    next({ name: 'home' })
  }
}

/**
 * Helper function to check if user has creator or admin role
 */
async function checkCreatorOrAdminStatus(user, to, next) {
  // First check if the user is authenticated
  if (!user) {
    console.log('No authenticated user, redirecting to login')
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }
  
  try {
    console.log('Checking creator/admin status for user:', user.uid)
    // Get the user document and check for creator or admin role
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    
    if (userDoc.exists() && (userDoc.data().role === 'admin' || userDoc.data().role === 'creator')) {
      // User is a creator or admin, allow access
      console.log('User is creator or admin, allowing access')
      next()
    } else {
      // User is not a creator or admin, redirect to home
      console.warn('Non-creator/admin user attempted to access creator page')
      next({ name: 'home' })
    }
  } catch (error) {
    console.error('Error checking creator/admin status:', error)
    next({ name: 'home' })
  }
}
