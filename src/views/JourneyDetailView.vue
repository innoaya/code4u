<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useJourneyStore } from '../stores/journeyStore'
// We'll use gameStore when implementing badges and achievements
import { auth } from '../firebase'

const router = useRouter()
const route = useRoute()
const journeyStore = useJourneyStore()

// State
const isLoading = ref(true)
const journeyId = ref(route.params.id)
const levels = ref([])

// Computed
const currentJourney = computed(() => journeyStore.currentJourney)
const journeyProgress = computed(() => {
  if (!auth.currentUser) return null
  return journeyStore.userJourneyProgress[journeyId.value] || null
})
const isLoggedIn = computed(() => !!auth.currentUser)
const isJourneyStarted = computed(() => !!journeyProgress.value?.startedAt)
const isJourneyCompleted = computed(() => !!journeyProgress.value?.completed)

// Fetch journey details on mount
onMounted(async () => {
  isLoading.value = true
  
  try {
    // If user is logged in, fetch their progress first
    if (isLoggedIn.value) {
      await journeyStore.fetchUserJourneyProgress()
    }
    
    // Fetch journey details (includes the journey and its levels)
    const { journey, levels: journeyLevels } = await journeyStore.fetchJourneyDetails(journeyId.value)
    
    if (!journey) {
      // Journey not found, redirect to main journeys page
      router.push('/journeys')
      return
    }
    
    levels.value = journeyLevels
  } catch (error) {
    console.error('Error loading journey details:', error)
  } finally {
    isLoading.value = false
  }
})

// Start this journey
const startJourney = async () => {
  if (!isLoggedIn.value) {
    router.push(`/login?redirect=/journey/${journeyId.value}`)
    return
  }
  
  try {
    isLoading.value = true
    await journeyStore.startJourney(journeyId.value)
    // Redirect to levels view
    router.push(`/journey/${journeyId.value}/levels`)
  } catch (error) {
    console.error('Error starting journey:', error)
  } finally {
    isLoading.value = false
  }
}

// Continue journey or view levels
const continueJourney = () => {
  router.push(`/journey/${journeyId.value}/levels`)
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
    
    <div v-else-if="currentJourney">
      <!-- Journey Header -->
      <div class="mb-8">
        <div class="flex items-center mb-4">
          <button @click="router.push('/journeys')" class="mr-3 text-gray-500 hover:text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          <h1 class="text-3xl font-bold">{{ currentJourney.title }}</h1>
          <div class="ml-3 text-2xl">{{ currentJourney.icon }}</div>
        </div>
        
        <p class="text-gray-600 mb-4">{{ currentJourney.description }}</p>
        
        <div class="flex items-center text-sm text-gray-500 mb-6">
          <span>{{ currentJourney.estimatedHours }} hours</span>
          <span class="mx-2">•</span>
          <span>{{ levels.length }} levels</span>
          <span class="mx-2">•</span>
          <span class="px-2 py-1 rounded-full"
                :class="{
                  'bg-green-100 text-green-800': currentJourney.difficulty === 'Beginner',
                  'bg-blue-100 text-blue-800': currentJourney.difficulty === 'Intermediate',
                  'bg-purple-100 text-purple-800': currentJourney.difficulty === 'Advanced'
                }">
            {{ currentJourney.difficulty }}
          </span>
        </div>
        
        <!-- Categories & Tags -->
        <div class="mb-6">
          <div class="flex flex-wrap gap-2">
            <span v-for="category in currentJourney.categories" :key="category"
                  class="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
              {{ category }}
            </span>
            <span v-for="tag in currentJourney.tags" :key="tag"
                  class="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {{ tag }}
            </span>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="mb-8">
          <button v-if="!isJourneyStarted" 
                  @click="startJourney" 
                  class="btn btn-primary mr-4">
            Start Journey
          </button>
          
          <button v-else-if="isJourneyCompleted"
                  @click="continueJourney"
                  class="btn btn-secondary mr-4">
            Review Journey
          </button>
          
          <button v-else
                  @click="continueJourney"
                  class="btn btn-primary mr-4">
            Continue Journey
          </button>
        </div>
      </div>
      
      <!-- Journey Levels -->
      <h2 class="text-2xl font-bold mb-6">Journey Levels</h2>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="level in levels" :key="level.id" 
            class="card p-6 hover:shadow-lg transition-all">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-semibold">{{ level.title }}</h3>
            <span class="text-2xl">{{ level.number }}</span>
          </div>
          
          <p class="text-gray-600 mb-4">{{ level.description }}</p>
          
          <div class="flex justify-between items-center text-sm text-gray-500 mb-6">
            <span>{{ level.estimatedTime }}</span>
            <span>{{ level.pointsToEarn }} points</span>
          </div>
          
          <button :disabled="!isJourneyStarted"
                  @click="router.push(`/level/${level.id}`)"
                  :class="[
                    'w-full', 
                    isJourneyStarted ? 'btn btn-primary' : 'btn btn-disabled'
                  ]">
            {{ isJourneyStarted ? 'Start Level' : 'Start Journey First' }}
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-16">
      <h2 class="text-2xl font-bold mb-4">Journey Not Found</h2>
      <p class="text-gray-600 mb-6">The journey you're looking for doesn't exist or has been removed.</p>
      <button @click="router.push('/journeys')" class="btn btn-primary">
        Explore All Journeys
      </button>
    </div>
  </div>
</template>
