<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { onMounted, ref } from 'vue'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'

const user = ref(null)
const isLoading = ref(true)
const isMenuOpen = ref(false)

onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser
    isLoading.value = false
  })
})

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

// Close mobile menu when route changes
function closeMenu() {
  isMenuOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Navigation Bar -->
    <nav class="bg-white shadow-md relative z-10">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <!-- Logo - visible on all screens -->
        <div class="flex items-center space-x-2">
          <img alt="Code Quest Logo" class="h-10 w-10" src="@/assets/logo.svg" />
          <span class="text-xl font-bold text-primary">Code Quest</span>
        </div>
        
        <!-- Desktop Navigation - hidden on mobile -->
        <div class="hidden md:flex md:space-x-6">
          <RouterLink @click="closeMenu" to="/" class="text-text-primary hover:text-primary transition-colors duration-200">
            Home
          </RouterLink>
          <RouterLink @click="closeMenu" to="/levels" class="text-text-primary hover:text-primary transition-colors duration-200">
            Levels
          </RouterLink>
          <RouterLink @click="closeMenu" to="/leaderboard" class="text-text-primary hover:text-primary transition-colors duration-200">
            Leaderboard
          </RouterLink>
          <RouterLink v-if="!user" @click="closeMenu" to="/login" class="text-text-primary hover:text-primary transition-colors duration-200">
            Login
          </RouterLink>
          <RouterLink v-if="user" @click="closeMenu" to="/profile" class="text-text-primary hover:text-primary transition-colors duration-200">
            Profile
          </RouterLink>
        </div>
        
        <!-- Mobile Menu Button - visible only on mobile -->
        <button 
          @click="toggleMenu" 
          class="md:hidden flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary focus:outline-none"
          aria-expanded="false"
        >
          <span class="sr-only">Open main menu</span>
          <!-- Icon when menu is closed -->
          <svg 
            v-if="!isMenuOpen" 
            class="block h-6 w-6" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <!-- Icon when menu is open -->
          <svg 
            v-if="isMenuOpen" 
            class="block h-6 w-6" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Mobile Menu Panel -->
      <div 
        v-if="isMenuOpen" 
        class="md:hidden absolute w-full bg-white shadow-md border-t border-gray-100 z-20"
      >
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <RouterLink 
            @click="closeMenu" 
            to="/" 
            class="block px-3 py-3 rounded-md text-base font-medium text-text-primary hover:text-primary hover:bg-gray-50"
          >
            Home
          </RouterLink>
          <RouterLink 
            @click="closeMenu" 
            to="/levels" 
            class="block px-3 py-3 rounded-md text-base font-medium text-text-primary hover:text-primary hover:bg-gray-50"
          >
            Levels
          </RouterLink>
          <RouterLink 
            @click="closeMenu" 
            to="/leaderboard" 
            class="block px-3 py-3 rounded-md text-base font-medium text-text-primary hover:text-primary hover:bg-gray-50"
          >
            Leaderboard
          </RouterLink>
          <RouterLink 
            v-if="!user" 
            @click="closeMenu" 
            to="/login" 
            class="block px-3 py-3 rounded-md text-base font-medium text-text-primary hover:text-primary hover:bg-gray-50"
          >
            Login
          </RouterLink>
          <RouterLink 
            v-if="user" 
            @click="closeMenu" 
            to="/profile" 
            class="block px-3 py-3 rounded-md text-base font-medium text-text-primary hover:text-primary hover:bg-gray-50"
          >
            Profile
          </RouterLink>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
      <RouterView v-else />
    </main>

    <!-- Footer -->
    <footer class="bg-white shadow-inner py-6 mt-12">
      <div class="container mx-auto px-4">
        <div class="text-center">
          <p class="text-sm text-text-secondary">
            © {{ new Date().getFullYear() }} Code Quest - Learn Web Development Through Play
          </p>
          <div class="mt-2 flex justify-center space-x-4">
            <a href="#" class="text-text-secondary hover:text-primary transition-colors duration-200">About</a>
            <a href="#" class="text-text-secondary hover:text-primary transition-colors duration-200">Privacy</a>
            <a href="#" class="text-text-secondary hover:text-primary transition-colors duration-200">Terms</a>
            <a href="#" class="text-text-secondary hover:text-primary transition-colors duration-200">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
