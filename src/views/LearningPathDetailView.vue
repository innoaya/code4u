<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLearningPathStore } from '../stores/learningPathStore'
import { useGameStore } from '../stores/gameStore'
import { auth } from '../firebase'

const router = useRouter()
const route = useRoute()
const learningPathStore = useLearningPathStore()
const gameStore = useGameStore()

// State
const isLoading = ref(true)
const pathId = ref(route.params.id)
const levels = ref([])

// Computed
const currentPath = computed(() => learningPathStore.currentPath)
const pathProgress = computed(() => {
  if (!auth.currentUser) return null
  return learningPathStore.userPathProgress[pathId.value] || null
})
const isLoggedIn = computed(() => !!auth.currentUser)
const isPathStarted = computed(() => !!pathProgress.value?.startedAt)
const isPathCompleted = computed(() => !!pathProgress.value?.completed)

// Fetch path details on mount
onMounted(async () => {
  isLoading.value = true

  // Fetch user progress if logged in
  if (isLoggedIn.value) {
    await gameStore.fetchUserProgress()
    await learningPathStore.fetchUserPathProgress()
  }

  // Fetch path details
  const { path, levels: pathLevels } = await learningPathStore.fetchPathDetails(pathId.value)
  if (!path) {
    // Path not found, redirect to main learning paths page
    router.push('/learning-paths')
    return
  }

  levels.value = pathLevels
  isLoading.value = false
})

// Start the learning path
async function startPath() {
  if (!isLoggedIn.value) {
    router.push(`/login?redirect=/learning-path/${pathId.value}`)
    return
  }

  const success = await learningPathStore.startLearningPath(pathId.value)
  if (success && levels.value.length > 0) {
    router.push(`/level/${levels.value[0].id}`)
  }
}

// Continue the learning path
function continuePath() {
  if (!isPathStarted.value || !pathProgress.value.completedLevels) {
    return startPath()
  }

  // Find the next incomplete level
  const completedLevels = pathProgress.value.completedLevels
  for (const level of levels.value) {
    if (!completedLevels.includes(level.id)) {
      router.push(`/level/${level.id}`)
      return
    }
  }

  // If all levels are completed, go to the first level
  if (levels.value.length > 0) {
    router.push(`/level/${levels.value[0].id}`)
  }
}

// Go to a specific level
function goToLevel(level) {
  router.push(`/level/${level.id}`)
}

// Check if a level is completed
function isLevelCompleted(levelId) {
  if (!isPathStarted.value || !pathProgress.value.completedLevels) return false
  return pathProgress.value.completedLevels.includes(levelId)
}

// Get level difficulty class
function getDifficultyClass(difficulty) {
  switch (difficulty?.toLowerCase()) {
    case 'beginner':
      return 'bg-green-100 text-green-800'
    case 'intermediate':
      return 'bg-blue-100 text-blue-800'
    case 'advanced':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="currentPath">
      <!-- Path header -->
      <div class="mb-8">
        <div class="flex items-center mb-2">
          <button @click="router.push('/learning-paths')" class="mr-2 text-gray-500 hover:text-gray-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </button>
          <h1 class="text-3xl font-bold">{{ currentPath.title }}</h1>
        </div>

        <div class="flex items-center mb-4">
          <span class="text-4xl mr-4">{{ currentPath.icon }}</span>
          <span class="text-sm px-2 py-1 rounded-full" :class="getDifficultyClass(currentPath.difficulty)">
            {{ currentPath.difficulty }}
          </span>
          <span v-if="isPathCompleted" class="ml-3 text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
            Completed
          </span>
        </div>

        <p class="text-gray-700 mb-4">{{ currentPath.description }}</p>

        <!-- Path metadata -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-gray-500 text-sm mb-1">Difficulty</div>
            <div class="font-medium">{{ currentPath.difficulty }}</div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-gray-500 text-sm mb-1">Estimated Time</div>
            <div class="font-medium">{{ currentPath.estimatedHours }} hours</div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-gray-500 text-sm mb-1">Levels</div>
            <div class="font-medium">{{ levels.length }} levels</div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-gray-500 text-sm mb-1">Categories</div>
            <div class="flex flex-wrap">
              <span v-for="category in currentPath.categories"
                    :key="category"
                    class="text-xs mr-1 mb-1 px-2 py-1 bg-gray-200 rounded-full">
                {{ category }}
              </span>
            </div>
          </div>
        </div>

        <!-- Path progress -->
        <div v-if="isPathStarted" class="mb-6">
          <h3 class="text-lg font-semibold mb-2">Your Progress</h3>
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div class="bg-primary h-2.5 rounded-full"
                   :style="{ width: `${pathProgress.completedLevels?.length / levels.length * 100}%` }"></div>
            </div>
            <div class="flex justify-between text-sm">
              <span>{{ pathProgress.completedLevels?.length || 0 }} of {{ levels.length }} levels completed</span>
              <span>{{ Math.round((pathProgress.completedLevels?.length || 0) / levels.length * 100) }}%</span>
            </div>
          </div>
        </div>

        <!-- Action button -->
        <div class="flex justify-center mb-8">
          <button v-if="!isPathStarted"
                  @click="startPath"
                  class="btn btn-primary btn-lg">
            Start Learning Path
          </button>
          <button v-else-if="isPathCompleted"
                  @click="continuePath"
                  class="btn btn-secondary btn-lg">
            Review Path
          </button>
          <button v-else
                  @click="continuePath"
                  class="btn btn-primary btn-lg">
            Continue Learning
          </button>
        </div>
      </div>

      <!-- Level list -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Levels in This Path</h2>

        <div class="space-y-4">
          <div v-for="(level, index) in levels"
               :key="level.id"
               class="card hover:shadow-md transition-all p-6"
               :class="{
                 'border-2 border-green-300': isLevelCompleted(level.id),
                 'border border-gray-200': !isLevelCompleted(level.id)
               }">
            <div class="flex justify-between items-start">
              <div class="flex items-start">
                <!-- Level number -->
                <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4 font-bold">
                  {{ index + 1 }}
                </div>

                <!-- Level information -->
                <div>
                  <h3 class="text-lg font-semibold">{{ level.title }}</h3>
                  <p class="text-gray-600 mt-1">{{ level.description }}</p>

                  <div class="flex flex-wrap mt-2">
                    <span class="text-xs mr-2 mb-1 px-2 py-1 rounded-full"
                          :class="getDifficultyClass(level.difficulty)">
                      {{ level.difficulty }}
                    </span>
                    <span class="text-xs mr-2 mb-1 px-2 py-1 bg-gray-100 rounded-full">
                      Est. {{ level.estimatedTime }}
                    </span>
                    <span class="text-xs mr-2 mb-1 px-2 py-1 bg-gray-100 rounded-full">
                      {{ level.pointsToEarn }} points
                    </span>
                  </div>
                </div>
              </div>

              <!-- Status indicator and button -->
              <div class="flex flex-col items-end">
                <span v-if="isLevelCompleted(level.id)" class="text-sm text-green-500 mb-2">
                  ✓ Completed
                </span>
                <button @click="goToLevel(level)"
                        class="btn"
                        :class="isLevelCompleted(level.id) ? 'btn-secondary' : 'btn-primary'">
                  {{ isLevelCompleted(level.id) ? 'Review' : 'Start' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Path completion badge -->
      <div v-if="currentPath.badgeId" class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Path Completion Badge</h2>

        <div class="card p-6 flex items-center">
          <div class="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center text-3xl mr-6">
            🏆
          </div>
          <div>
            <h3 class="text-lg font-semibold">Path Completion Achievement</h3>
            <p class="text-gray-600">
              Complete all levels in this learning path to earn a special achievement badge!
            </p>
            <div v-if="isPathCompleted" class="mt-2 text-sm text-green-500">
              ✓ You've earned this badge!
            </div>
          </div>
        </div>
      </div>

      <!-- Prerequisites -->
      <div v-if="currentPath.prerequisites?.length" class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Prerequisites</h2>

        <div class="card p-6">
          <p class="text-gray-600 mb-4">
            Before starting this learning path, you should complete these prerequisite paths:
          </p>

          <ul class="space-y-4">
            <li v-for="prereqId in currentPath.prerequisites"
                :key="prereqId"
                class="flex items-start">
              <span v-if="learningPathStore.userPathProgress[prereqId]?.completed"
                    class="text-green-500 mr-2 mt-1">✓</span>
              <span v-else class="text-red-500 mr-2 mt-1">✗</span>
              <div>
                <div class="font-semibold">
                  {{ learningPathStore.learningPaths.find(p => p.id === prereqId)?.title || prereqId }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ learningPathStore.userPathProgress[prereqId]?.completed ? 'Completed' : 'Not completed' }}
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else class="text-center py-12">
      <h2 class="text-2xl font-bold text-gray-700 mb-4">Learning Path Not Found</h2>
      <p class="text-gray-500 mb-6">The learning path you're looking for doesn't exist or has been removed.</p>
      <button @click="router.push('/learning-paths')" class="btn btn-primary">
        Browse Learning Paths
      </button>
    </div>
  </div>
</template>
