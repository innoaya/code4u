<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'

const router = useRouter()
const route = useRoute()
const levelId = route.params.id
const level = ref(null)
const isLoading = ref(true)
const error = ref(null)

// Fetch level details
onMounted(async () => {
  try {
    isLoading.value = true
    error.value = null
    
    // Get level from Firestore
    const levelDoc = await getDoc(doc(db, 'levels', levelId))
    
    if (levelDoc.exists()) {
      level.value = {
        id: levelDoc.id,
        ...levelDoc.data()
      }
    } else {
      error.value = 'Level not found'
    }
  } catch (err) {
    console.error('Error fetching level:', err)
    error.value = 'Error loading level data'
  } finally {
    isLoading.value = false
  }
})

// Start the game
const startLevel = () => {
  router.push({
    name: 'game',
    params: { levelId }
  })
}

// Handle back navigation intelligently
const goBack = () => {
  // Check if the user came from a learning path levels view
  const pathId = localStorage.getItem('lastLearningPathId')
  
  if (pathId) {
    // Go back to the specific learning path levels
    router.push(`/learning-path/${pathId}/levels`)
  } else {
    // Go back to the general levels view
    router.push('/levels')
  }
}

// Mock data for development until Firestore is set up
const mockLevel = {
  id: levelId,
  number: parseInt(levelId.split('-')[1], 10) || 1,
  title: 'Building Your First HTML Page',
  description: 'Learn the basic structure of an HTML document and create your first web page from scratch.',
  objectives: [
    'Understand the basic HTML document structure',
    'Learn essential HTML tags like headings, paragraphs, and links',
    'Create a simple web page with proper HTML semantics'
  ],
  pointsToEarn: 100,
  estimatedTime: '30 minutes',
  difficulty: 'Beginner',
  category: 'HTML',
  prerequisites: ['Introduction to Web Development'],
  tags: ['HTML', 'Web Basics', 'Document Structure']
}

// If no data from Firestore, use mock data
if (!level.value && !isLoading.value) {
  level.value = mockLevel
}
</script>

<template>
  <div>
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
    
    <div v-else-if="error" class="card bg-danger/10 text-danger p-8 text-center">
      <h2 class="text-2xl font-bold mb-4">{{ error }}</h2>
      <p class="mb-6">The requested level could not be found or accessed.</p>
      <button @click="router.push('/levels')" class="btn btn-primary">
        Return to Levels
      </button>
    </div>
    
    <div v-else-if="level" class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Level Info -->
      <div class="md:col-span-2">
        <div class="flex items-center mb-6">
          <button @click="goBack()" class="btn bg-white border border-gray-300 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 class="text-3xl font-bold">Level {{ level.number }}: {{ level.title }}</h1>
        </div>
        
        <div class="card mb-8">
          <h2 class="text-xl font-bold mb-4">Level Overview</h2>
          <p class="text-text-secondary mb-6">{{ level.description }}</p>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-primary font-bold text-xl mb-1">{{ level.pointsToEarn }}</div>
              <div class="text-text-secondary text-sm">Points</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-primary font-bold text-xl mb-1">{{ level.estimatedTime }}</div>
              <div class="text-text-secondary text-sm">Duration</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-primary font-bold text-xl mb-1">{{ level.difficulty }}</div>
              <div class="text-text-secondary text-sm">Difficulty</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-primary font-bold text-xl mb-1">{{ level.category }}</div>
              <div class="text-text-secondary text-sm">Category</div>
            </div>
          </div>
          
          <h3 class="font-bold text-lg mb-2">Learning Objectives</h3>
          <ul class="list-disc list-inside space-y-2 mb-6">
            <li v-for="(objective, index) in level.learningObjectives" :key="index" class="text-text-secondary">
              {{ objective }}
            </li>
          </ul>
          
          <!-- Real-world Applications -->
          <h3 class="font-bold text-lg mb-2" v-if="level.realWorldApplications?.length">Real-world Applications</h3>
          <ul class="list-disc list-inside space-y-2 mb-6" v-if="level.realWorldApplications?.length">
            <li v-for="(application, index) in level.realWorldApplications" :key="index" class="text-text-secondary">
              {{ application }}
            </li>
          </ul>
          
          <h3 class="font-bold text-lg mb-2">Prerequisites</h3>
          <div class="flex flex-wrap gap-2 mb-6">
            <span 
              v-for="(prereq, index) in level.prerequisites" 
              :key="index"
              class="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
            >
              {{ prereq }}
            </span>
          </div>
          
          <h3 class="font-bold text-lg mb-2">Tags</h3>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="(tag, index) in level.tags" 
              :key="index"
              class="bg-gray-100 text-text-secondary px-3 py-1 rounded-full text-sm"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Level Actions -->
      <div class="md:col-span-1">
        <div class="card sticky top-4">
          <div class="mb-6 text-center">
            <div 
              class="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4"
            >
              <span class="text-3xl font-bold text-primary">{{ level.number }}</span>
            </div>
            <h2 class="text-xl font-bold">Ready to start?</h2>
            <p class="text-text-secondary mt-2">Begin this level and start your coding challenge</p>
          </div>
          
          <button @click="startLevel" class="btn btn-primary w-full text-lg py-3 mb-4">
            Start Level
          </button>
          
          <div class="border-t border-gray-200 pt-4 mt-4">
            <h3 class="font-semibold mb-2">What you'll need:</h3>
            <ul class="space-y-2">
              <li class="flex items-center text-text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                A modern web browser
              </li>
              <li class="flex items-center text-text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Basic computer skills
              </li>
              <li class="flex items-center text-text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Curiosity and creativity
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
