<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '../firebase'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'

const router = useRouter()
const levels = ref([])
const userProgress = ref({
  currentLevel: 1,
  completedLevels: []
})
const isLoading = ref(true)

// Fetch levels and user progress
onMounted(async () => {
  try {
    isLoading.value = true
    
    // Get levels from Firestore
    const levelsSnapshot = await getDocs(collection(db, 'levels'))
    const levelsData = levelsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Sort levels by number
    levels.value = levelsData.sort((a, b) => a.number - b.number)
    
    // Get user progress
    if (auth.currentUser) {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        userProgress.value = {
          currentLevel: userData.level || 1,
          completedLevels: userData.completedLevels || []
        }
      }
    }
  } catch (error) {
    console.error('Error fetching levels:', error)
  } finally {
    isLoading.value = false
  }
})

// Navigate to level detail
const goToLevel = (level) => {
  if (level.locked && !userProgress.value.completedLevels.includes(level.id)) {
    return
  }
  
  router.push({
    name: 'level-detail',
    params: { id: level.id }
  })
}

// Determine level status
const getLevelStatus = (level) => {
  if (userProgress.value.completedLevels.includes(level.id)) {
    return 'completed'
  }
  
  if (level.number <= userProgress.value.currentLevel) {
    return 'unlocked'
  }
  
  return 'locked'
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">Learning Paths</h1>
    
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
    
    <div v-else>
      <!-- Learning Paths -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div class="card border-t-4 border-primary hover:shadow-lg transition-shadow duration-300">
          <div class="flex items-center mb-4">
            <div class="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mr-4 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold">HTML Fundamentals</h3>
              <p class="text-text-secondary">Levels 1-5</p>
            </div>
          </div>
          <p class="text-text-secondary mb-4">Learn the building blocks of web pages with HTML tags, structure, and semantics.</p>
          <button @click="goToLevel({ id: 'level-1', number: 1 })" class="btn btn-primary w-full">Start Learning</button>
        </div>
        
        <div class="card border-t-4 border-secondary hover:shadow-lg transition-shadow duration-300">
          <div class="flex items-center mb-4">
            <div class="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center mr-4 text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold">CSS Styling</h3>
              <p class="text-text-secondary">Levels 6-10</p>
            </div>
          </div>
          <p class="text-text-secondary mb-4">Transform plain HTML into beautiful designs with CSS properties, layouts, and animations.</p>
          <button @click="goToLevel({ id: 'level-6', number: 6 })" class="btn btn-secondary w-full">Start Learning</button>
        </div>
        
        <div class="card border-t-4 border-accent hover:shadow-lg transition-shadow duration-300">
          <div class="flex items-center mb-4">
            <div class="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mr-4 text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold">JavaScript Basics</h3>
              <p class="text-text-secondary">Levels 11-15</p>
            </div>
          </div>
          <p class="text-text-secondary mb-4">Add interactivity to your websites with JavaScript variables, functions, and DOM manipulation.</p>
          <button @click="goToLevel({ id: 'level-11', number: 11 })" class="btn bg-accent text-white hover:bg-accent/90 w-full">Start Learning</button>
        </div>
      </div>
      
      <!-- Level Progress -->
      <h2 class="text-2xl font-bold mb-6">Your Learning Journey</h2>
      
      <!-- Levels grid -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div
          v-for="n in 15"
          :key="n"
          class="relative"
          @click="goToLevel({ id: `level-${n}`, number: n, locked: n > userProgress.currentLevel })"
        >
          <div 
            class="card p-4 text-center cursor-pointer hover:shadow-md transition-shadow duration-300"
            :class="{
              'bg-success/10 border-success': getLevelStatus({ id: `level-${n}`, number: n }) === 'completed',
              'bg-primary/10 border-primary': getLevelStatus({ id: `level-${n}`, number: n }) === 'unlocked',
              'bg-gray-100 border-gray-300': getLevelStatus({ id: `level-${n}`, number: n }) === 'locked'
            }"
          >
            <div 
              class="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
              :class="{
                'bg-success': getLevelStatus({ id: `level-${n}`, number: n }) === 'completed',
                'bg-primary': getLevelStatus({ id: `level-${n}`, number: n }) === 'unlocked',
                'bg-gray-400': getLevelStatus({ id: `level-${n}`, number: n }) === 'locked'
              }"
            >
              {{ n }}
            </div>
            <h3 class="font-semibold">Level {{ n }}</h3>
            <p class="text-xs text-text-secondary">
              {{ n <= 5 ? 'HTML' : n <= 10 ? 'CSS' : 'JavaScript' }}
            </p>
            
            <!-- Status indicator -->
            <span
              v-if="getLevelStatus({ id: `level-${n}`, number: n }) === 'completed'"
              class="absolute top-2 right-2 text-success"
              title="Completed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            
            <span
              v-if="getLevelStatus({ id: `level-${n}`, number: n }) === 'locked'"
              class="absolute top-2 right-2 text-gray-400"
              title="Locked"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
