<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import GameEngine from '../components/GameEngine.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const levelId = route.params.levelId
const gameEngine = ref(null)
const feedback = ref('')

// Game methods
const runCode = () => {
  // Use the gameStore to run the code
  const success = gameStore.runCode(gameStore.userCode)
  
  if (success) {
    feedback.value = 'Great job! Your code works correctly.'
    
    // Show success animation in game engine
    if (gameEngine.value) {
      gameEngine.value.completeTask()
    }
    
    // Check if there are more tasks
    setTimeout(() => {
      const hasMoreTasks = gameStore.nextTask()
      if (!hasMoreTasks) {
        // Complete the level if there are no more tasks
        completeLevel()
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
  // Show completion animation in game engine
  if (gameEngine.value) {
    gameEngine.value.completeGame()
  }
  
  // Update progress in the store
  await gameStore.completeLevel(levelId)
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
  
  // Then load the level data
  await gameStore.loadLevel(levelId)
  
  // Start the game
  gameStore.startGame()
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
      <button @click="goToLevels" class="btn btn-primary">
        Return to Levels
      </button>
    </div>
    
    <!-- Game completed state -->
    <div v-else-if="gameStore.gameCompleted" class="card p-8 text-center">
      <div class="w-20 h-20 bg-success/20 text-success rounded-full mx-auto mb-6 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h2 class="text-3xl font-bold mb-4">Level Completed!</h2>
      <p class="text-xl text-text-secondary mb-6">
        Congratulations! You've completed Level {{ gameStore.currentLevel?.number || '1' }}.
      </p>
      
      <div class="bg-gray-50 p-6 rounded-lg mb-8">
        <div class="text-3xl font-bold text-primary mb-2">+{{ gameStore.currentLevel?.pointsToEarn || 100 }} points</div>
        <p class="text-text-secondary">added to your score</p>
      </div>
      
      <div class="flex flex-col md:flex-row gap-4 justify-center">
        <button @click="goToNextLevel" class="btn btn-primary">
          Continue to Next Level
        </button>
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
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="mb-6">
            <h3 class="font-bold text-lg mb-2">
              {{ gameStore.currentLevel?.tasks?.[gameStore.currentTask]?.title }}
            </h3>
            <p class="text-text-secondary">
              {{ gameStore.currentLevel?.tasks?.[gameStore.currentTask]?.description }}
            </p>
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
          
          <div v-if="feedback" class="mb-6 p-4 rounded-lg" :class="{
            'bg-success/10 text-success': feedback.includes('Great'),
            'bg-danger/10 text-danger': feedback.includes('issues')
          }">
            {{ feedback }}
          </div>
          
          <button @click="runCode" class="btn btn-primary w-full">
            Run Code
          </button>
        </div>
      </div>
      
      <!-- Game and Coding interface -->
      <div class="lg:col-span-2">
        <!-- GDevelop Game Engine -->
        <GameEngine 
          ref="gameEngine" 
          :levelId="levelId"
          @game-loaded="gameStore.isLoading = false"
          @task-completed="feedback = 'Great job! Moving to next task...'"
          @game-completed="gameStore.gameCompleted = true"
          class="mb-6"
        />
        
        <!-- Code Editor -->
        <div class="card mb-6">
          <h3 class="font-bold mb-3">Code Editor</h3>
          <div class="bg-gray-900 text-white p-4 rounded-lg font-mono text-sm">
            <textarea
              v-model="gameStore.userCode"
              class="w-full bg-transparent outline-none resize-y min-h-[300px]"
              spellcheck="false"
            ></textarea>
          </div>
        </div>
        
        <!-- Output -->
        <div class="card">
          <h3 class="font-bold mb-3">Output</h3>
          <div class="bg-gray-900 text-white p-4 rounded-lg font-mono text-sm min-h-[100px]">
            <pre>{{ gameStore.codeOutput || 'Your output will appear here...' }}</pre>
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
