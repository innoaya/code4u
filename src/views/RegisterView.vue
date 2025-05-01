<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

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
      <h1 class="text-2xl font-bold text-center mb-6">Join Code4U</h1>
      
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
