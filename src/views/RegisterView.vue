<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { uploadProfilePictureFromUrl } from '../firebase/storage-utils'

const router = useRouter()
const route = useRoute()
const redirectPath = computed(() => route.query.redirect || '/levels')

// Form data
const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

// Form validation
const isFormValid = computed(() => {
  return (
    displayName.value.length >= 3 &&
    email.value.includes('@') &&
    password.value.length >= 6 &&
    password.value === confirmPassword.value
  )
})

// Register function
const register = async () => {
  if (!isFormValid.value) return

  try {
    isLoading.value = true
    errorMessage.value = ''

    // Create user
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user

    // Update profile
    await updateProfile(user, {
      displayName: displayName.value
    })

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      displayName: displayName.value,
      email: email.value,
      createdAt: new Date(),
      level: 1,
      points: 0,
      completedLevels: [],
      badges: []
    })

    router.push(redirectPath.value)
  } catch (error) {
    console.error('Registration error:', error)
    errorMessage.value = error.message || 'Failed to register. Please try again later.'
  } finally {
    isLoading.value = false
  }
}

// Sign in with Google
const signInWithGoogle = async () => {
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

    // If user document doesn't exist, create it
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        displayName: user.displayName || 'code4u User',
        email: user.email,
        photoURL: photoURL, // Include the Firebase Storage URL or original Google URL
        createdAt: serverTimestamp(),
        level: 1,
        points: 0,
        completedLevels: [],
        badges: []
      })
    } else if (photoURL) {
      // Update the existing user document with the new photo URL
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: photoURL
      })
    }

    router.push(redirectPath.value)
  } catch (error) {
    console.error('Google Sign-in error:', error)
    errorMessage.value = error.message || 'Failed to sign in with Google. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// Navigate to login page
const goToLogin = () => {
  router.push({
    name: 'login',
    query: route.query
  })
}
</script>

<template>
  <div class="max-w-md mx-auto">
    <div class="card">
      <h1 class="text-2xl font-bold text-center mb-6">Join code4u</h1>

      <form @submit.prevent="register" class="space-y-4">
        <!-- Error message -->
        <div v-if="errorMessage" class="bg-danger/10 border-l-4 border-danger p-4 text-danger">
          {{ errorMessage }}
        </div>

        <!-- Display name field -->
        <div>
          <label for="displayName" class="block text-sm font-medium text-text-primary mb-1">
            Display Name
          </label>
          <input
            id="displayName"
            v-model="displayName"
            type="text"
            placeholder="Your name"
            class="input"
            required
          />
          <p v-if="displayName && displayName.length < 3" class="mt-1 text-xs text-danger">
            Display name must be at least 3 characters
          </p>
        </div>

        <!-- Email field -->
        <div>
          <label for="email" class="block text-sm font-medium text-text-primary mb-1">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="your@email.com"
            class="input"
            required
          />
        </div>

        <!-- Password field -->
        <div>
          <label for="password" class="block text-sm font-medium text-text-primary mb-1">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="input"
            required
          />
          <p v-if="password && password.length < 6" class="mt-1 text-xs text-danger">
            Password must be at least 6 characters
          </p>
        </div>

        <!-- Confirm password field -->
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-text-primary mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="••••••••"
            class="input"
            required
          />
          <p v-if="confirmPassword && password !== confirmPassword" class="mt-1 text-xs text-danger">
            Passwords don't match
          </p>
        </div>

        <!-- Terms acceptance -->
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <input
              id="terms"
              type="checkbox"
              required
              class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </div>
          <label for="terms" class="ml-2 text-sm text-text-secondary">
            I agree to the
            <a href="#" class="text-primary hover:underline">Terms of Service</a>
            and
            <a href="#" class="text-primary hover:underline">Privacy Policy</a>
          </label>
        </div>

        <!-- Register button -->
        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="!isFormValid || isLoading"
        >
          <span v-if="isLoading" class="inline-block animate-spin mr-2">⟳</span>
          {{ isLoading ? 'Creating account...' : 'Create account' }}
        </button>
      </form>

      <!-- OR divider -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <!-- Google sign-in button -->
      <button
        @click="signInWithGoogle"
        type="button"
        class="w-full flex justify-center items-center gap-2 bg-white border border-gray-300 rounded-md py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
        Sign up with Google
      </button>

      <!-- Login option -->
      <div class="mt-6 text-center">
        <p class="text-text-secondary">
          Already have an account?
          <button @click="goToLogin" class="text-primary hover:underline ml-2">Log in</button>
        </p>
      </div>
    </div>
  </div>
</template>
