<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth, db } from '../firebase'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { uploadProfilePictureFromUrl } from '../firebase/storage-utils'
import { trackLogin, trackSignUp } from '../firebase/analytics-utils'

const router = useRouter()
const route = useRoute()
const isLoading = ref(false)
const errorMessage = ref('')
const agreedToTerms = ref(true)

// Compute the redirect path from query or default to homepage
const redirectPath = computed(() => {
  return route.query.redirect || '/'
})

// Sign in with Google
const signInWithGoogle = async () => {
  if (!agreedToTerms.value) {
    errorMessage.value = 'Please agree to the Terms of Service and Privacy Policy before continuing.'
    return
  }

  try {
    isLoading.value = true
    errorMessage.value = ''

    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const user = result.user

    let photoURL = user.photoURL

    // If user has a Google profile picture, upload it to Firebase Storage
    if (photoURL) {
      try {
        // Upload the profile picture to Firebase Storage
        photoURL = await uploadProfilePictureFromUrl(user.uid, photoURL)
      } catch (uploadError) {
        console.error('Error uploading Google profile picture:', uploadError)
        // Continue with Google sign-in even if image upload fails
      }
    }

    // Check if user document already exists
    const userDoc = await getDoc(doc(db, 'users', user.uid))

    // If user document doesn't exist, create it (this is registration)
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        displayName: user.displayName || 'Code4U User',
        email: user.email,
        photoURL: photoURL, // Include the Firebase Storage URL or original Google URL
        createdAt: serverTimestamp(),
        level: 1,
        points: 0,
        badges: [],
        completedLevels: []
      })

      // Track new user sign up with analytics
      trackSignUp('google')
    } else {
      // Update the existing user's last login time
      await updateDoc(doc(db, 'users', user.uid), {
        lastLogin: serverTimestamp()
      })

      // Track returning user login with analytics
      trackLogin('google')
    }

    router.push(redirectPath.value)
  } catch (error) {
    console.error('Google Sign-in error:', error)
    errorMessage.value = error.message || 'Failed to sign in with Google. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto">
    <div class="card">
      <h1 class="text-2xl font-bold text-center mb-6">Welcome to Code4U!</h1>

      <!-- Error message -->
      <div v-if="errorMessage" class="bg-danger/10 border-l-4 border-danger p-4 text-danger mb-4">
        {{ errorMessage }}
      </div>

      <!-- License Agreement Checkbox -->
      <div class="mb-6">
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <input
              id="terms"
              v-model="agreedToTerms"
              name="terms"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              required
            />
          </div>
          <div class="ml-3 text-sm">
            <label for="terms" class="text-text-secondary">
              I agree to the <router-link to="/terms" class="text-primary hover:underline">Terms of Service</router-link> and
              <router-link to="/privacy" class="text-primary hover:underline">Privacy Policy</router-link>
            </label>
          </div>
        </div>
      </div>

      <!-- Google sign-in button -->
      <button
        @click="signInWithGoogle"
        type="button"
        class="w-full flex justify-center items-center gap-2 bg-white border border-gray-300 rounded-md py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        :disabled="isLoading"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
          </g>
        </svg>
        <span v-if="!isLoading">Sign in with Google</span>
        <span v-else class="flex items-center">
          <span class="inline-block animate-spin mr-2">⟳</span>
          Signing in...
        </span>
      </button>

      <p class="text-sm text-center text-text-secondary mt-4">
        By signing in, you'll create an account if you don't already have one.
      </p>
    </div>
  </div>
</template>
