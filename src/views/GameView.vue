<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import CodePreview from '../components/CodePreview.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const levelId = route.params.levelId

// Since we removed GameEngine, all levels use the same view now
const feedback = ref('')

// Determine the code language based on the level category
const codeLanguage = computed(() => {
  const category = gameStore.currentLevel?.category?.toLowerCase() || ''
  if (category.includes('html')) return 'html'
  if (category.includes('css')) return 'css'
  if (category.includes('javascript') || category.includes('js')) return 'javascript'
  return 'html' // Default to HTML
})

// Game methods
const runCode = () => {
  // Use the gameStore to run the code
  const success = gameStore.runCode(gameStore.userCode)

  if (success) {
    feedback.value = 'Great job! Your code works correctly.'

    // Check if there are more tasks
    setTimeout(() => {
      const hasMoreTasks = gameStore.nextTask()
      if (!hasMoreTasks) {
        // Complete the level if there are no more tasks
        completeLevel()
        
        // Set game completed state
        gameStore.gameCompleted = true
      } else {
        feedback.value = ''
      }
    }, 1500)
  } else {
    feedback.value = 'Your code has some issues. Try again!'
  }
}

// Complete the level
const completeLevel = async () => {
  // Display success feedback
  feedback.value = 'Level completed! Great job!'
  
  // Update progress in the store if levelId exists
  if (levelId) {
    await gameStore.completeLevel(levelId)
  }
}

// Go to next level
const goToNextLevel = () => {
  const nextLevelNum = (gameStore.currentLevel?.number || 1) + 1
  router.push({
    name: 'level-detail',
    params: { id: `level-${nextLevelNum}` }
  })
}

// Return to levels list
const goToLevels = () => {
  router.push({ name: 'levels' })
}

// Load the level data
onMounted(async () => {
  // Load user progress first
  await gameStore.fetchUserProgress()

  // Then load the level data if levelId exists
  if (levelId) {
    await gameStore.loadLevel(levelId)

    // Start the game
    gameStore.startGame()
    
    // Mark loading as complete
    gameStore.isLoading = false
  } else {
    console.error('No level ID found in route parameters')
    gameStore.error = 'Level not found'
    gameStore.isLoading = false
  }
})

// Clean up resources when leaving the page
onUnmounted(() => {
  // Any cleanup could go here
})
</script>

<template>
  <div>
    <!-- Loading state -->
    <div v-if="gameStore.isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="gameStore.error" class="card bg-danger/10 text-danger p-8 text-center">
      <h2 class="text-2xl font-bold mb-4">{{ gameStore.error }}</h2>
      <p class="mb-6">There was a problem loading the game.</p>
      <button @click="goToLevels" class="btn btn-primary">Return to Levels</button>
    </div>

    <!-- Game completed state -->
    <div v-else-if="gameStore.gameCompleted" class="card p-8 text-center">
      <div
        class="w-20 h-20 bg-success/20 text-success rounded-full mx-auto mb-6 flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 class="text-3xl font-bold mb-4">Level Completed!</h2>
      <p class="text-xl text-text-secondary mb-6">
        Congratulations! You've completed Level {{ gameStore.currentLevel?.number || '1' }}.
      </p>

      <div class="bg-gray-50 p-6 rounded-lg mb-8">
        <div class="text-3xl font-bold text-primary mb-2">
          +{{ gameStore.currentLevel?.pointsToEarn || 100 }} points
        </div>
        <p class="text-text-secondary">added to your score</p>
      </div>

      <div class="flex flex-col md:flex-row gap-4 justify-center">
        <button @click="goToNextLevel" class="btn btn-primary">Continue to Next Level</button>
        <button @click="goToLevels" class="btn bg-white border border-gray-300">
          Back to Level Selection
        </button>
      </div>
    </div>

    <!-- Game interface -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Game instructions -->
      <div class="lg:col-span-1">
        <div class="card sticky top-4">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold">Level {{ gameStore.currentLevel?.number || '1' }}</h2>
            <button @click="goToLevels" class="text-text-secondary hover:text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="mb-6">
            <h3 class="font-bold text-lg mb-2">
              {{ gameStore.currentLevel?.tasks?.[gameStore.currentTask]?.title }}
            </h3>
            <p class="text-text-secondary mb-4">
              {{ gameStore.currentLevel?.tasks?.[gameStore.currentTask]?.description }}
            </p>

            <!-- Level description (shown only on first task) -->
            <div v-if="gameStore.currentTask === 0" class="bg-gray-50 p-3 rounded mb-4 text-sm">
              <p>{{ gameStore.currentLevel?.description }}</p>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 class="font-semibold mb-2">Task Progress</h4>
            <div class="flex items-center">
              <div class="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-primary rounded-full"
                  :style="`width: ${((gameStore.currentTask + 1) / (gameStore.currentLevel?.tasks?.length || 1)) * 100}%`"
                ></div>
              </div>
              <span class="ml-3 text-sm text-text-secondary">
                {{ gameStore.currentTask + 1 }}/{{ gameStore.currentLevel?.tasks?.length || 0 }}
              </span>
            </div>
          </div>

          <div
            v-if="feedback"
            class="mb-6 p-4 rounded-lg"
            :class="{
              'bg-success/10 text-success': feedback.includes('Great'),
              'bg-danger/10 text-danger': feedback.includes('issues'),
            }"
          >
            {{ feedback }}
          </div>

          <!-- References section -->
          <div v-if="gameStore.currentLevel?.references?.length" class="mb-6">
            <h4 class="font-semibold mb-2">Helpful Resources</h4>
            <ul class="space-y-2">
              <li
                v-for="reference in gameStore.currentLevel.references"
                :key="reference.title"
                class="text-sm"
              >
                <a
                  :href="reference.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary hover:underline flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  {{ reference.title }}
                </a>
              </li>
            </ul>
          </div>

          <button @click="runCode" class="btn btn-primary w-full">Run Code</button>
        </div>
      </div>

      <!-- Game and Coding interface -->
      <div class="lg:col-span-2">
        <!-- Learning activity card -->
        <div class="card mb-6 p-4 bg-primary/10 rounded-lg">
          <h3 class="font-bold mb-3">Learning Activity</h3>
          <p class="mb-4">{{ gameStore.currentLevel?.title }}</p>

          <!-- Learning objectives -->
          <div class="mb-4">
            <h4 class="font-semibold text-sm uppercase tracking-wide text-text-secondary mb-2">
              Learning Objectives
            </h4>
            
            <ul class="list-disc pl-5 space-y-1">
              <template v-if="gameStore.currentLevel && Array.isArray(gameStore.currentLevel.learningObjectives)">
                <li
                  v-for="(objective, index) in gameStore.currentLevel.learningObjectives"
                  :key="index"
                  class="text-sm"
                >
                  {{ objective }}
                </li>
              </template>
              <li v-else class="text-sm text-red-500">
                Loading learning objectives...
              </li>
            </ul>
          </div>

          <!-- Real-world applications -->
          <div v-if="gameStore.currentLevel?.realWorldApplications?.length" class="mb-4">
            <h4 class="font-semibold text-sm uppercase tracking-wide text-text-secondary mb-2">
              Real-World Applications
            </h4>
            <ul class="list-disc pl-5 space-y-1">
              <li
                v-for="application in gameStore.currentLevel?.realWorldApplications"
                :key="application"
                class="text-sm"
              >
                {{ application }}
              </li>
            </ul>
          </div>

          <!-- Category and difficulty badge -->
          <div class="flex flex-wrap gap-2 mt-3">
            <span class="badge bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded-full">
              {{ gameStore.currentLevel?.category }}
            </span>
            <span class="badge bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded-full">
              {{ gameStore.currentLevel?.difficulty }}
            </span>
            <span class="badge bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full">
              {{ gameStore.currentLevel?.estimatedTime }}
            </span>
          </div>
        </div>

        <!-- Code Editor and Preview Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Code Editor -->
          <div class="card">
            <h3 class="font-bold mb-3">Code Editor</h3>
            <div class="bg-gray-900 text-white p-4 rounded-lg font-mono text-sm">
              <textarea
                v-model="gameStore.userCode"
                class="w-full bg-transparent outline-none resize-y min-h-[300px]"
                spellcheck="false"
                :placeholder="`Write your ${codeLanguage} code here...`"
              ></textarea>
            </div>
          </div>

          <!-- Code Preview -->
          <div class="card">
            <h3 class="font-bold mb-3">Live Preview</h3>
            <div class="bg-white rounded-lg overflow-hidden border border-gray-200">
              <CodePreview :code="gameStore.userCode" :language="codeLanguage" />
            </div>
          </div>
        </div>

        <!-- Output -->
        <div class="card">
          <h3 class="font-bold mb-3">Console Output</h3>
          <div class="bg-gray-900 text-white p-4 rounded-lg font-mono text-sm min-h-[100px]">
            <pre>{{ gameStore.codeOutput || 'Your console output will appear here...' }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
textarea {
  font-family: 'Courier New', monospace;
  line-height: 1.5;
  tab-size: 2;
}
</style>
