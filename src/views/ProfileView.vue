<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '../firebase'
import { signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

const router = useRouter()
const user = ref(null)
const userProgress = ref(null)
const isLoading = ref(true)
const badges = ref([])

// Fetch user data
onMounted(async () => {
  if (!auth.currentUser) {
    router.push('/login')
    return
  }
  
  try {
    isLoading.value = true
    
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
    if (userDoc.exists()) {
      userProgress.value = userDoc.data()
      
      // Set user info
      user.value = {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName || userProgress.value.displayName,
        photoURL: auth.currentUser.photoURL,
        ...userProgress.value
      }
      
      // Set badges (mock data for now)
      badges.value = mockBadges.filter(badge => 
        userProgress.value.badges?.includes(badge.id)
      )
    } else {
      user.value = {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        photoURL: auth.currentUser.photoURL
      }
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
  } finally {
    isLoading.value = false
  }
})

// Sign out
const handleSignOut = async () => {
  try {
    await signOut(auth)
    router.push('/')
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

// Mock badges data
const mockBadges = [
  {
    id: 'html-basics',
    name: 'HTML Apprentice',
    description: 'Completed the HTML basics level',
    icon: '🏆',
    color: 'bg-primary'
  },
  {
    id: 'css-basics',
    name: 'CSS Stylist',
    description: 'Mastered the fundamentals of CSS',
    icon: '🎨',
    color: 'bg-secondary'
  },
  {
    id: 'js-basics',
    name: 'JavaScript Rookie',
    description: 'Wrote your first JavaScript code',
    icon: '⚡',
    color: 'bg-accent'
  },
  {
    id: 'first-project',
    name: 'Project Maker',
    description: 'Built your first complete web project',
    icon: '🚀',
    color: 'bg-success'
  }
]
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">Your Profile</h1>
    
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
    
    <div v-else-if="user" class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- User profile card -->
      <div class="md:col-span-1">
        <div class="card text-center">
          <div class="mb-6">
            <div class="w-24 h-24 rounded-full bg-primary/20 mx-auto flex items-center justify-center">
              <span v-if="!user.photoURL" class="text-3xl font-bold text-primary">
                {{ user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U' }}
              </span>
              <img
                v-else
                :src="user.photoURL"
                :alt="user.displayName"
                class="w-full h-full rounded-full object-cover"
              />
            </div>
            <h2 class="text-xl font-bold mt-4">{{ user.displayName || 'Coder' }}</h2>
            <p class="text-text-secondary">{{ user.email }}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="text-center p-4 bg-primary/10 rounded-lg">
              <div class="text-primary font-bold text-2xl">{{ user.level || 1 }}</div>
              <div class="text-text-secondary text-sm">Level</div>
            </div>
            <div class="text-center p-4 bg-secondary/10 rounded-lg">
              <div class="text-secondary font-bold text-2xl">{{ user.points || 0 }}</div>
              <div class="text-text-secondary text-sm">Points</div>
            </div>
          </div>
          
          <button @click="handleSignOut" class="btn bg-white border border-gray-300 hover:bg-gray-100 w-full">
            Sign Out
          </button>
        </div>
      </div>
      
      <!-- Progress and stats -->
      <div class="md:col-span-2">
        <!-- Badges -->
        <div class="card mb-8">
          <h2 class="text-xl font-bold mb-4">Your Badges</h2>
          
          <div v-if="badges.length" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              v-for="badge in badges"
              :key="badge.id"
              class="text-center p-4 rounded-lg"
              :class="`${badge.color}/10`"
            >
              <div class="text-3xl mb-2">{{ badge.icon }}</div>
              <div class="font-bold">{{ badge.name }}</div>
              <div class="text-xs text-text-secondary">{{ badge.description }}</div>
            </div>
          </div>
          
          <div v-else class="text-center p-8 bg-gray-50 rounded-lg">
            <p class="text-text-secondary">
              Complete levels and challenges to earn badges!
            </p>
          </div>
        </div>
        
        <!-- Learning Progress -->
        <div class="card mb-8">
          <h2 class="text-xl font-bold mb-4">Learning Progress</h2>
          
          <div class="space-y-4">
            <div>
              <div class="flex justify-between mb-1">
                <span class="font-medium">HTML</span>
                <span class="text-text-secondary">60%</span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full">
                <div class="h-full bg-primary rounded-full" style="width: 60%"></div>
              </div>
            </div>
            
            <div>
              <div class="flex justify-between mb-1">
                <span class="font-medium">CSS</span>
                <span class="text-text-secondary">40%</span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full">
                <div class="h-full bg-secondary rounded-full" style="width: 40%"></div>
              </div>
            </div>
            
            <div>
              <div class="flex justify-between mb-1">
                <span class="font-medium">JavaScript</span>
                <span class="text-text-secondary">25%</span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full">
                <div class="h-full bg-accent rounded-full" style="width: 25%"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recent Activity -->
        <div class="card">
          <h2 class="text-xl font-bold mb-4">Recent Activity</h2>
          
          <div class="space-y-4">
            <div class="flex items-start">
              <div class="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold">Completed Level 2: HTML Elements</h3>
                <p class="text-sm text-text-secondary">2 days ago</p>
              </div>
            </div>
            
            <div class="flex items-start">
              <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold">Updated Profile Information</h3>
                <p class="text-sm text-text-secondary">1 week ago</p>
              </div>
            </div>
            
            <div class="flex items-start">
              <div class="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold">Started Learning Journey</h3>
                <p class="text-sm text-text-secondary">2 weeks ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
