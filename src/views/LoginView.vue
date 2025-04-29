<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
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
