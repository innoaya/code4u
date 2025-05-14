<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { onMounted, ref, computed } from 'vue'
import { auth, db } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import FloatingFeedbackButton from './components/FloatingFeedbackButton.vue'
import AutoFeedbackPrompt from './components/AutoFeedbackPrompt.vue'
import { initializeStores } from './stores/initStores'

const user = ref(null)
const userRole = ref(null)
const isLoading = ref(true)
const isMenuOpen = ref(false)

// Computed property to check if user is admin
const isAdmin = computed(() => userRole.value === 'admin')

async function fetchUserRole(userId) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      userRole.value = userDoc.data().role || null
    }
  } catch (error) {
    console.error('Error fetching user role:', error)
  }
}

onMounted(async () => {
  // Pre-load critical store data at application startup
  await initializeStores()

  onAuthStateChanged(auth, async (currentUser) => {
    user.value = currentUser

    if (currentUser) {
      // Fetch user role from Firestore
      await fetchUserRole(currentUser.uid)
    } else {
      userRole.value = null
    }

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
        <RouterLink to="/" class="flex items-center space-x-0 hover:opacity-90 transition-opacity">
          <div class="h-10 w-16 relative overflow-visible">
            <img alt="Code4U Logo" class="absolute -top-2 -left-1 h-16 w-16" src="@/assets/logo.svg" />
          </div>
          <span class="text-2xl font-bold text-primary -ml-1">Code4U</span>
        </RouterLink>

        <!-- Desktop Navigation - hidden on mobile -->
        <div class="hidden md:flex md:space-x-6">
          <RouterLink @click="closeMenu" to="/" class="text-text-primary hover:text-primary transition-colors duration-200">
            Home
          </RouterLink>
          <RouterLink @click="closeMenu" to="/learning-paths" class="text-text-primary hover:text-primary transition-colors duration-200">
            Journeys
          </RouterLink>
          <RouterLink @click="closeMenu" to="/leaderboard" class="text-text-primary hover:text-primary transition-colors duration-200">
            Leaderboard
          </RouterLink>
          <RouterLink @click="closeMenu" to="/activities" class="text-text-primary hover:text-primary transition-colors duration-200">
            Activities
          </RouterLink>
          <RouterLink v-if="!user" @click="closeMenu" to="/login" class="text-text-primary hover:text-primary transition-colors duration-200">
            Login
          </RouterLink>
          <RouterLink v-if="user" @click="closeMenu" to="/profile" class="text-text-primary hover:text-primary transition-colors duration-200">
            Profile
          </RouterLink>
          <!-- Admin Dropdown Menu for Desktop -->
          <div v-if="isAdmin" class="relative group">
            <button class="text-text-primary hover:text-primary transition-colors duration-200 flex items-center space-x-1 focus:outline-none">
              <span>Admin</span>
              <span class="ml-1 px-1.5 text-xs bg-primary text-white rounded">New</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform group-hover:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <div class="absolute right-0 mt-6 w-64 bg-white shadow-lg rounded-md py-1 z-50 transform opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 origin-top-right admin-dropdown">
              <!-- Feedback Management -->
              <RouterLink @click="closeMenu" to="/admin/feedback" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <span>Feedback Management</span>
                </div>
              </RouterLink>

              <!-- Placeholder for User Management (future feature) -->
              <div class="block px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>User Management</span>
                </div>
              </div>
            </div>
          </div>
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
          <RouterLink @click="closeMenu" to="/" class="block px-3 py-2 rounded-md text-base font-medium text-text-primary hover:bg-gray-50 hover:text-primary">
            Home
          </RouterLink>
          <RouterLink @click="closeMenu" to="/learning-paths" class="block px-3 py-2 rounded-md text-base font-medium text-text-primary hover:bg-gray-50 hover:text-primary">
            Journeys
          </RouterLink>
          <RouterLink
            @click="closeMenu"
            to="/leaderboard"
            class="block px-3 py-3 rounded-md text-base font-medium text-text-primary hover:text-primary hover:bg-gray-50"
          >
            Leaderboard
          </RouterLink>
          <RouterLink
            @click="closeMenu"
            to="/activities"
            class="block px-3 py-3 rounded-md text-base font-medium text-text-primary hover:text-primary hover:bg-gray-50"
          >
            Activities
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
          <!-- Admin Section (Mobile) -->
          <div v-if="isAdmin" class="px-3 py-2">
            <div class="flex items-center text-base font-medium text-gray-600 mb-1">
              <span>Admin</span>
              <span class="ml-1 px-1.5 text-xs bg-primary text-white rounded">New</span>
            </div>
            <!-- Admin submenu items -->
            <div class="ml-3 border-l-2 border-gray-200 pl-3 space-y-1">
              <!-- Feedback Management -->
              <RouterLink
                @click="closeMenu"
                to="/admin/feedback"
                class="block py-2 text-base font-medium text-text-primary hover:text-primary"
              >
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <span>Feedback Management</span>
                </div>
              </RouterLink>
              <!-- User Management (coming soon) -->
              <div class="block py-2 text-base font-medium text-gray-400 cursor-not-allowed">
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>User Management</span>
                </div>
              </div>
            </div>
          </div>
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
            {{ new Date().getFullYear() }} Code4U - Learn Coding Through Play
          </p>
          <div class="mt-2 flex justify-center space-x-4">
            <RouterLink to="/about" class="text-text-secondary hover:text-primary transition-colors duration-200">About</RouterLink>
            <RouterLink to="/terms" class="text-text-secondary hover:text-primary transition-colors duration-200">Terms of Service</RouterLink>
            <RouterLink to="/privacy" class="text-text-secondary hover:text-primary transition-colors duration-200">Privacy Policy</RouterLink>
            <a href="https://github.com/innoaya/code4u" target="_blank" rel="noopener" class="text-text-secondary hover:text-primary transition-colors duration-200 flex items-center">
              <svg class="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
    <!-- Feedback Components -->
    <FloatingFeedbackButton v-if="!isLoading" />
    <AutoFeedbackPrompt v-if="!isLoading" />
  </div>
</template>
