<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../firebase'

const router = useRouter()
const route = useRoute()
const redirectPath = computed(() => route.query.redirect || '/levels')

// Form data
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

// Form validation
const isFormValid = computed(() => {
  return email.value.includes('@') && password.value.length >= 6
})

// Login function
const login = async () => {
  if (!isFormValid.value) return
  
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    await signInWithEmailAndPassword(auth, email.value, password.value)
    router.push(redirectPath.value)
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = error.message || 'Failed to sign in. Please check your credentials.'
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
    await signInWithPopup(auth, provider)
    router.push(redirectPath.value)
  } catch (error) {
    console.error('Google Sign-in error:', error)
    errorMessage.value = error.message || 'Failed to sign in with Google. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// Navigate to register page
const goToRegister = () => {
  router.push({
    name: 'register',
    query: route.query
  })
}
</script>

<template>
  <div class="max-w-md mx-auto">
    <div class="card">
      <h1 class="text-2xl font-bold text-center mb-6">Welcome back, Coder!</h1>
      
      <form @submit.prevent="login" class="space-y-4">
        <!-- Error message -->
        <div v-if="errorMessage" class="bg-danger/10 border-l-4 border-danger p-4 text-danger">
          {{ errorMessage }}
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
        </div>
        
        <!-- Remember me & Forgot password -->
        <div class="flex justify-between items-center text-sm">
          <div class="flex items-center">
            <input id="remember" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <label for="remember" class="ml-2 text-text-secondary">Remember me</label>
          </div>
          <a href="#" class="text-primary hover:underline">Forgot password?</a>
        </div>
        
        <!-- Login button -->
        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="!isFormValid || isLoading"
        >
          <span v-if="isLoading" class="inline-block animate-spin mr-2">⟳</span>
          {{ isLoading ? 'Logging in...' : 'Log in' }}
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
        Sign in with Google
      </button>
      
      <!-- Register option -->
      <div class="mt-6 text-center">
        <p class="text-text-secondary">
          Don't have an account yet?
          <button @click="goToRegister" class="text-primary hover:underline ml-2">Register now</button>
        </p>
      </div>
    </div>
    
    <!-- Demo credentials info -->
    <div class="mt-6 p-4 bg-info/10 rounded-lg">
      <h3 class="font-medium text-info mb-2">Demo Credentials</h3>
      <p class="text-sm text-text-secondary mb-2">
        Feel free to use these demo credentials to explore the app:
      </p>
      <div class="bg-white p-2 rounded border border-info/20 text-sm">
        <div><strong>Email:</strong> demo@codequest.edu</div>
        <div><strong>Password:</strong> Demo123</div>
      </div>
      <p class="text-xs text-text-secondary mt-2">
        Note: This is for demonstration purposes only. In a real application, you should never expose credentials.
      </p>
    </div>
  </div>
</template>
