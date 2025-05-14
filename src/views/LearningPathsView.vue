`<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLearningPathStore } from '../stores/learningPathStore'
import { useGameStore } from '../stores/gameStore'
import { auth } from '../firebase'

const router = useRouter()
const learningPathStore = useLearningPathStore()
const gameStore = useGameStore()

// State
const isLoading = ref(true)
const selectedPath = ref(null)

// Computed properties
const availablePaths = computed(() => {
  // Make sure we show all learning paths regardless of login state
  if (!learningPathStore.learningPaths || !Array.isArray(learningPathStore.learningPaths)) {
    return []; // Return empty array if no paths are loaded yet
  }
  
  // Always return all learning paths
  return learningPathStore.learningPaths;
})
const inProgressPaths = computed(() => learningPathStore.inProgressPaths)
const completedPaths = computed(() => learningPathStore.completedPaths)
const isLoggedIn = computed(() => !!auth.currentUser)

// Load all learning paths and user progress
onMounted(async () => {
  isLoading.value = true

  // Fetch user progress if logged in
  if (isLoggedIn.value) {
    await gameStore.fetchUserProgress()
    await learningPathStore.fetchUserPathProgress()
  }

  // Fetch all learning paths
  await learningPathStore.fetchAllPaths()

  isLoading.value = false
})

// View path details - redirect to levels view
function viewPathDetails(path) {
  // Instead of showing modal, navigate to the path levels view
  router.push(`/learning-path/${path.id}/levels`)
}

// Start a learning path
async function startLearningPath(pathId) {
  if (!isLoggedIn.value) {
    router.push('/login?redirect=/learning-paths')
    return
  }

  const success = await learningPathStore.startLearningPath(pathId)
  if (success) {
    // Navigate to the learning path levels view
    router.push(`/learning-path/${pathId}/levels`)
  }
}

// Continue a learning path
function continueLearningPath(path) {
  // Find the next incomplete level
  if (!path.levelIds || !path.levelIds.length) return

  const progress = learningPathStore.userPathProgress[path.id] || {}
  const completedLevels = progress.completedLevels || []

  // Find the first level that hasn't been completed
  for (const levelId of path.levelIds) {
    if (!completedLevels.includes(levelId)) {
      router.push(`/level/${levelId}`)
      return
    }
  }

  // If all levels are completed, go to the first level
  router.push(`/level/${path.levelIds[0]}`)
}

// Get difficulty class
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

// Calculate the button state for each path
function getPathButtonState(path) {
  // If not logged in, all paths show "Start Learning"
  if (!isLoggedIn.value) {
    return { text: 'Start Learning', action: () => startLearningPath(path.id) }
  }

  // Make sure userPathProgress exists before accessing it
  if (!learningPathStore.userPathProgress) {
    return { text: 'Start Learning', action: () => startLearningPath(path.id) }
  }

  const progress = learningPathStore.userPathProgress[path.id]

  // If path is completed
  if (progress?.completed) {
    return {
      text: 'Review Path',
      action: () => router.push(`/learning-path/${path.id}`),
      class: 'bg-secondary hover:bg-secondary-dark'
    }
  }

  // If path is in progress
  if (progress?.startedAt) {
    return {
      text: 'Continue Learning',
      action: () => continueLearningPath(path),
      class: 'bg-primary hover:bg-primary-dark'
    }
  }

  // Check if prerequisites are met
  if (path.prerequisites?.length) {
    const allPrereqsMet = path.prerequisites.every(prereqId => {
      // Safely check prerequisites with proper null checks
      return learningPathStore.userPathProgress?.[prereqId]?.completed || false
    })

    if (!allPrereqsMet) {
      return {
        text: 'Prerequisites Needed',
        action: () => viewPathDetails(path),
        class: 'bg-gray-300 text-gray-700 cursor-not-allowed'
      }
    }
  }

  // Default: path is available to start
  return {
    text: 'Start Learning',
    action: () => startLearningPath(path.id)
  }
}

// Check if path has all prerequisites completed
function hasPrerequisitesMet(path) {
  if (!path.prerequisites?.length) return true

  // Check if userPathProgress exists first
  if (!learningPathStore.userPathProgress) {
    return false
  }

  return path.prerequisites.every(prereqId =>
    learningPathStore.userPathProgress[prereqId]?.completed || false
  )
}

// Close path details modal
function closePathDetails() {
  selectedPath.value = null
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Coding Journeys</h1>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>

    <div v-else>
      <!-- In Progress Paths -->
      <div v-if="inProgressPaths.length > 0" class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Continue Learning</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="path in inProgressPaths" :key="path.id"
               class="card border-2 border-primary/20 hover:border-primary/50 transition-all">
            <div class="p-6">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-xl font-bold">{{ path.title }}</h3>
                  <div class="text-5xl my-2">{{ path.icon }}</div>
                </div>
                <span class="text-xs px-2 py-1 rounded-full" :class="getDifficultyClass(path.difficulty)">
                  {{ path.difficulty }}
                </span>
              </div>

              <p class="text-gray-600 mb-4">{{ path.description }}</p>

              <!-- Progress bar -->
              <div class="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div class="bg-primary h-2.5 rounded-full" :style="{ width: `${path.progress}%` }"></div>
              </div>
              <p class="text-sm text-gray-500 mb-4">
                {{ path.completedLevels }} of {{ path.levelIds?.length || 0 }} levels completed ({{ path.progress }}%)
              </p>

              <div class="flex justify-between items-center">
                <button @click="viewPathDetails(path)"
                        class="text-sm text-primary hover:text-primary-dark">
                  View Details
                </button>
                <button @click="getPathButtonState(path).action"
                        class="btn btn-primary">
                  {{ getPathButtonState(path).text }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Available Paths -->
      <div class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Available Journeys</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="path in availablePaths"
               :key="path.id"
               class="card hover:shadow-lg transition-all"
               :class="{ 'opacity-50': !hasPrerequisitesMet(path) && isLoggedIn }">
            <div class="p-6">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-xl font-bold">{{ path.title }}</h3>
                  <div class="text-5xl my-2">{{ path.icon }}</div>
                </div>
                <span class="text-xs px-2 py-1 rounded-full" :class="getDifficultyClass(path.difficulty)">
                  {{ path.difficulty }}
                </span>
              </div>

              <p class="text-gray-600 mb-4">{{ path.description }}</p>

              <div class="mb-4">
                <div class="flex items-center">
                  <span class="text-gray-500 text-sm mr-2">
                    <i class="fas fa-clock"></i>
                  </span>
                  <span class="text-sm text-gray-500">{{ path.estimatedHours }} hours</span>
                </div>
                <div class="flex flex-wrap mt-2">
                  <span v-for="category in path.categories"
                        :key="category"
                        class="text-xs mr-2 mb-1 px-2 py-1 bg-gray-100 rounded-full">
                    {{ category }}
                  </span>
                </div>
              </div>

              <div class="flex justify-between items-center">
                <button @click="viewPathDetails(path)"
                        class="text-sm text-primary hover:text-primary-dark">
                  View Details
                </button>
                <button @click="getPathButtonState(path).action"
                        :class="getPathButtonState(path).class || 'btn-primary'"
                        class="btn">
                  {{ getPathButtonState(path).text }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Completed Paths -->
      <div v-if="completedPaths.length > 0">
        <h2 class="text-2xl font-bold mb-4">Completed Paths</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="path in completedPaths" :key="path.id"
               class="card border-2 border-green-300 hover:border-green-500 transition-all">
            <div class="p-6">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-xl font-bold">{{ path.title }}</h3>
                  <div class="text-5xl my-2">{{ path.icon }}</div>
                </div>
                <div class="flex items-center">
                  <span class="text-xl text-green-500 mr-2">✓</span>
                  <span class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    Completed
                  </span>
                </div>
              </div>

              <p class="text-gray-600 mb-4">{{ path.description }}</p>

              <div class="flex justify-between items-center">
                <button @click="viewPathDetails(path)"
                        class="text-sm text-primary hover:text-primary-dark">
                  View Details
                </button>
                <button @click="getPathButtonState(path).action"
                        class="btn btn-secondary">
                  {{ getPathButtonState(path).text }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No paths available message -->
      <div v-if="availablePaths.length === 0 && inProgressPaths.length === 0 && completedPaths.length === 0"
           class="text-center py-12">
        <p class="text-gray-500 text-lg">No journeys available at the moment. Please check back later.</p>
      </div>
    </div>

    <!-- Path Details Modal -->
    <div v-if="selectedPath" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-2xl font-bold">{{ selectedPath.title }}</h2>
              <div class="flex items-center mt-2">
                <div class="text-4xl mr-4">{{ selectedPath.icon }}</div>
                <span class="text-sm px-2 py-1 rounded-full"
                      :class="getDifficultyClass(selectedPath.difficulty)">
                  {{ selectedPath.difficulty }}
                </span>
              </div>
            </div>
            <button @click="closePathDetails" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>

          <p class="text-gray-700 mb-6">{{ selectedPath.description }}</p>

          <!-- Path details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 class="text-lg font-semibold mb-2">Path Information</h3>
              <div class="space-y-2">
                <div class="flex items-center">
                  <span class="text-gray-500 w-32">Difficulty:</span>
                  <span>{{ selectedPath.difficulty }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-gray-500 w-32">Estimated Time:</span>
                  <span>{{ selectedPath.estimatedHours }} hours</span>
                </div>
                <div class="flex items-center">
                  <span class="text-gray-500 w-32">Categories:</span>
                  <div class="flex flex-wrap">
                    <span v-for="category in selectedPath.categories"
                          :key="category"
                          class="text-xs mr-2 mb-1 px-2 py-1 bg-gray-100 rounded-full">
                      {{ category }}
                    </span>
                  </div>
                </div>
                <div v-if="selectedPath.tags?.length" class="flex items-center">
                  <span class="text-gray-500 w-32">Tags:</span>
                  <div class="flex flex-wrap">
                    <span v-for="tag in selectedPath.tags"
                          :key="tag"
                          class="text-xs mr-2 mb-1 px-2 py-1 bg-gray-100 rounded-full">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="selectedPath.prerequisites?.length">
              <h3 class="text-lg font-semibold mb-2">Prerequisites</h3>
              <ul class="space-y-2">
                <li v-for="prereqId in selectedPath.prerequisites" :key="prereqId" class="flex items-center">
                  <span v-if="learningPathStore.userPathProgress[prereqId]?.completed"
                        class="text-green-500 mr-2">✓</span>
                  <span v-else class="text-red-500 mr-2">✗</span>
                  <span>{{ learningPathStore.learningPaths.find(p => p.id === prereqId)?.title || prereqId }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Completion badge -->
          <div v-if="selectedPath.badgeId" class="mb-6">
            <h3 class="text-lg font-semibold mb-2">Completion Badge</h3>
            <div class="flex items-center p-4 bg-gray-50 rounded-lg">
              <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4 text-2xl">
                🏆
              </div>
              <div>
                <div class="font-semibold">Path Completion Badge</div>
                <div class="text-sm text-gray-500">Complete all levels to earn this special badge!</div>
              </div>
            </div>
          </div>

          <!-- Action button -->
          <div class="flex justify-end mt-6">
            <button @click="closePathDetails" class="btn btn-secondary mr-2">
              Close
            </button>
            <button @click="getPathButtonState(selectedPath).action"
                    :class="getPathButtonState(selectedPath).class || 'btn-primary'"
                    class="btn">
              {{ getPathButtonState(selectedPath).text }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>`
