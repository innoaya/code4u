<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useJourneyStore } from '../stores/journeyStore'
// We'll use gameStore later when implementing badge checks
import { auth } from '../firebase'

const router = useRouter()
const journeyStore = useJourneyStore()
// Removed unused gameStore

// State
const isLoading = ref(true)

// Computed properties
const availableJourneys = computed(() => {
  // Make sure we show all journeys regardless of login state
  if (!journeyStore.journeys || !Array.isArray(journeyStore.journeys)) {
    return []; // Return empty array if no journeys are loaded yet
  }
  
  // Always return all journeys
  return journeyStore.journeys;
})
const inProgressJourneys = computed(() => journeyStore.inProgressJourneys)
const completedJourneys = computed(() => journeyStore.completedJourneys)
const isLoggedIn = computed(() => !!auth.currentUser)

// Load all journeys and user progress
onMounted(async () => {
  isLoading.value = true
  
  try {
    // Fetch all journeys
    await journeyStore.fetchAllJourneys()
    
    // If user is logged in, fetch their progress
    if (isLoggedIn.value) {
      await journeyStore.fetchUserJourneyProgress()
    }
  } catch (error) {
    console.error('Error loading journeys:', error)
  } finally {
    isLoading.value = false
  }
})

// Methods
const startJourney = async (journey) => {
  if (!isLoggedIn.value) {
    // If not logged in, redirect to login with return path
    router.push(`/login?redirect=/journey/${journey.id}/levels`)
    return
  }
  
  try {
    // Start the journey and navigate to its levels
    await journeyStore.startJourney(journey.id)
    router.push(`/journey/${journey.id}/levels`)
  } catch (error) {
    console.error('Error starting journey:', error)
    // Show error message to user (could use a toast notification)
  }
}

// Helper to view journey details (levels)
const viewJourney = (journey) => {
  router.push(`/journey/${journey.id}/levels`)
}

// Check if a journey has prerequisites
const hasPrerequisites = (journey) => {
  return journey.prerequisites && journey.prerequisites.length > 0
}

// Check if a journey's prerequisites are met
const prerequisitesMet = (journey) => {
  if (!hasPrerequisites(journey)) return true
  if (!isLoggedIn.value) return false
  
  return journey.prerequisites.every(prereqId => 
    journeyStore.userJourneyProgress.value?.[prereqId]?.completed
  )
}

// Get prerequisite names for display
const getPrerequisiteNames = (journey) => {
  if (!hasPrerequisites(journey)) return []
  
  return journey.prerequisites.map(prereqId => {
    const prereq = journeyStore.journeys.value.find(p => p.id === prereqId)
    return prereq ? prereq.title : prereqId
  })
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Learning Journeys</h1>
    
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
    
    <div v-else>
      <!-- User's Journeys (In-Progress & Completed) -->
      <div v-if="isLoggedIn && (inProgressJourneys.length > 0 || completedJourneys.length > 0)" class="mb-12">
        <h2 class="text-2xl font-semibold mb-6">Your Learning Journeys</h2>
        
        <!-- In Progress Journeys -->
        <div v-if="inProgressJourneys.length > 0" class="mb-8">
          <h3 class="text-xl font-medium mb-4">In Progress</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="journey in inProgressJourneys" :key="journey.id" 
                class="card hover:shadow-lg transition-all p-6">
              <div class="flex items-start mb-4">
                <div class="text-4xl mr-4">{{ journey.icon }}</div>
                <div>
                  <h4 class="text-lg font-medium">{{ journey.title }}</h4>
                  <p class="text-sm text-gray-600">{{ journey.difficulty }} • {{ journey.estimatedHours }} hours</p>
                </div>
              </div>
              
              <div class="mb-4">
                <!-- Progress bar -->
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div class="bg-primary h-2.5 rounded-full" 
                      :style="`width: ${journey.progress.completionPercentage}%`"></div>
                </div>
                <p class="text-sm text-right mt-1">{{ journey.progress.completionPercentage }}% complete</p>
              </div>
              
              <button @click="viewJourney(journey)" class="btn btn-primary w-full">
                Continue Journey
              </button>
            </div>
          </div>
        </div>
        
        <!-- Completed Journeys -->
        <div v-if="completedJourneys.length > 0">
          <h3 class="text-xl font-medium mb-4">Completed</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="journey in completedJourneys" :key="journey.id" 
                class="card hover:shadow-lg transition-all p-6">
              <div class="flex items-start mb-4">
                <div class="text-4xl mr-4">{{ journey.icon }}</div>
                <div>
                  <h4 class="text-lg font-medium">{{ journey.title }}</h4>
                  <p class="text-sm text-gray-600">{{ journey.difficulty }} • {{ journey.estimatedHours }} hours</p>
                </div>
              </div>
              
              <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-medium text-green-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  Completed
                </span>
                <span v-if="journey.badgeId" class="text-lg" :title="`Earned: ${journey.badgeId} badge`">🏆</span>
              </div>
              
              <button @click="viewJourney(journey)" class="btn btn-secondary w-full">
                Review Journey
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- All Available Journeys -->
      <h2 class="text-2xl font-semibold mb-6">Available Journeys</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="journey in availableJourneys" :key="journey.id" 
            class="card hover:shadow-lg transition-all p-6">
          <div class="text-4xl mb-4">{{ journey.icon }}</div>
          <h3 class="text-xl font-semibold mb-2">{{ journey.title }}</h3>
          <p class="text-gray-600 mb-4">{{ journey.description }}</p>
          
          <div class="flex flex-wrap gap-2 mb-4">
            <span v-for="category in journey.categories" :key="category"
                class="text-xs px-2 py-1 bg-gray-100 rounded-full">
              {{ category }}
            </span>
          </div>
          
          <div class="flex justify-between items-center mb-4">
            <span class="text-sm text-gray-500">{{ journey.difficulty }}</span>
            <span class="text-sm text-gray-500">{{ journey.estimatedHours }} hours</span>
          </div>
          
          <!-- Prerequisites warning -->
          <div v-if="hasPrerequisites(journey) && !prerequisitesMet(journey)" 
               class="mb-4 p-2 bg-amber-50 border border-amber-200 rounded-md text-sm">
            <p class="text-amber-700 font-medium">Prerequisites needed:</p>
            <ul class="list-disc pl-5 text-amber-600">
              <li v-for="(name, index) in getPrerequisiteNames(journey)" :key="index">
                {{ name }}
              </li>
            </ul>
          </div>
          
          <button @click="startJourney(journey)" 
                 :class="[
                   'w-full',
                   hasPrerequisites(journey) && !prerequisitesMet(journey) 
                     ? 'btn btn-disabled' 
                     : 'btn btn-primary'
                 ]">
            Start Journey
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
