<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { auth, db } from '../firebase'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { trackPathSelected, trackLevelStarted } from '../firebase/analytics-utils'
import { useLearningPathStore } from '../stores/learningPathStore'

const router = useRouter()
const route = useRoute()
const learningPathStore = useLearningPathStore()
const levels = ref([])
const userProgress = ref({
  currentLevel: 1,
  completedLevels: []
})
const isLoading = ref(true)
const currentPath = ref(null)

// Fetch levels and user progress
onMounted(async () => {
  try {
    isLoading.value = true

    // Get path ID from route
    const pathId = route.params.pathId

    // If a path ID was provided, fetch that specific path
    if (pathId) {
      await learningPathStore.fetchAllPaths()
      currentPath.value = learningPathStore.learningPaths.find(p => p.id === pathId)

      if (currentPath.value) {
        // Get levels for this path
        const pathLevels = await learningPathStore.fetchPathLevels(pathId)
        levels.value = pathLevels
        trackPathSelected(pathId)
      }
    } else {
      // No path ID, get all levels
      const levelsSnapshot = await getDocs(collection(db, 'levels'))
      const levelsData = levelsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Sort levels by number
      levels.value = levelsData.sort((a, b) => a.number - b.number)
    }

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

  // If we're in a learning path, store the path ID for back navigation
  const pathId = route.params.pathId
  if (pathId) {
    localStorage.setItem('lastLearningPathId', pathId)
  } else {
    // Clear any previously stored path ID if we're in the general levels view
    localStorage.removeItem('lastLearningPathId')
  }

  // Track level start in analytics
  const levelCategory = level.number <= 5 ? 'HTML' : level.number <= 10 ? 'CSS' : 'JavaScript';
  trackLevelStarted(level.id, level.number, levelCategory);

  router.push({
    name: 'level-detail',
    params: { id: level.id }
  })
}

// Determine level status
const getLevelStatus = (level) => {
  // If level is already completed, mark as completed
  if (userProgress.value.completedLevels.includes(level.id)) {
    return 'completed'
  }

  // For learning path levels, check if previous levels are completed
  if (currentPath.value) {
    // Sort levels by number to ensure proper order
    const sortedLevels = [...levels.value].sort((a, b) => a.number - b.number)

    // Find the index of the current level
    const currentLevelIndex = sortedLevels.findIndex(l => l.id === level.id)

    // If this is the first level, it's always unlocked
    if (currentLevelIndex === 0) {
      return 'unlocked'
    }

    // Check if the previous level is completed
    const previousLevel = sortedLevels[currentLevelIndex - 1]
    if (previousLevel && userProgress.value.completedLevels.includes(previousLevel.id)) {
      return 'unlocked'
    }

    // Otherwise, it's locked
    return 'locked'
  } else {
    // For regular levels view, use the current level from user progress
    if (level.number <= userProgress.value.currentLevel) {
      return 'unlocked'
    }

    return 'locked'
  }
}
</script>

<template>
  <div>
    <!-- Show learning path context if available -->
    <div v-if="currentPath" class="mb-8">
      <div class="flex items-center mb-4">
        <button @click="router.push('/learning-paths')" class="mr-3 text-gray-500 hover:text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        <h1 class="text-3xl font-bold">{{ currentPath.title }}</h1>
        <div class="ml-3 text-2xl">{{ currentPath.icon }}</div>
      </div>
      <p class="text-gray-600 mb-4">{{ currentPath.description }}</p>
      <div class="flex items-center text-sm text-gray-500 mb-6">
        <span>{{ currentPath.estimatedHours }} hours</span>
        <span class="mx-2">•</span>
        <span>{{ levels.length }} levels</span>
        <span class="mx-2">•</span>
        <span class="px-2 py-1 rounded-full"
              :class="{
                'bg-green-100 text-green-800': currentPath.difficulty === 'Beginner',
                'bg-blue-100 text-blue-800': currentPath.difficulty === 'Intermediate',
                'bg-purple-100 text-purple-800': currentPath.difficulty === 'Advanced'
              }">
          {{ currentPath.difficulty }}
        </span>
      </div>
    </div>

    <h1 v-else class="text-3xl font-bold mb-8">Learning Levels</h1>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>

    <div v-else>
      <!-- If we have a current path, show its levels -->
      <div v-if="currentPath" class="mb-10">
        <div class="flex items-center mb-6">
          <div class="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mr-4 text-primary">
            <span class="text-2xl">{{ currentPath.icon }}</span>
          </div>
          <div>
            <h2 class="text-2xl font-bold">Your Journey</h2>
            <p class="text-gray-600">{{ levels.length }} levels • {{ currentPath.estimatedHours }} hours journey</p>
          </div>
        </div>

        <!-- Levels grid - matching the style at line 279 -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div
            v-for="level in levels"
            :key="level.id"
            class="relative"
            @click="getLevelStatus(level) !== 'locked' && goToLevel(level)"
          >
            <div
              class="card p-4 text-center cursor-pointer hover:shadow-md transition-shadow duration-300"
              :class="{
                'bg-success/10 border-success': userProgress.completedLevels.includes(level.id),
                'bg-primary/10 border-primary': getLevelStatus(level) === 'unlocked' && !userProgress.completedLevels.includes(level.id),
                'bg-gray-100 border-gray-300': getLevelStatus(level) === 'locked'
              }"
            >
              <div
                class="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                :class="{
                  'bg-success': userProgress.completedLevels.includes(level.id),
                  'bg-primary': getLevelStatus(level) === 'unlocked' && !userProgress.completedLevels.includes(level.id),
                  'bg-gray-400': getLevelStatus(level) === 'locked'
                }"
              >
                {{ level.number }}
              </div>
              <h3 class="font-semibold">Level {{ level.number }}</h3>
              <p class="text-xs text-text-secondary">
                {{ level.category }}
              </p>

              <!-- Status indicator -->
              <span
                v-if="userProgress.completedLevels.includes(level.id)"
                class="absolute top-2 right-2 text-success"
                title="Completed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>

              <!-- Lock indicator -->
              <span
                v-if="getLevelStatus(level) === 'locked'"
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
  </div>
</template>
