<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../firebase'
import ActivityFeed from '../components/ActivityFeed.vue'
import { useJourneyStore } from '../stores/journeyStore'

const router = useRouter()
const journeyStore = useJourneyStore()
const isLoggedIn = ref(!!auth.currentUser)
const featuredJourneys = ref([])
const isLoading = ref(true)

onMounted(async () => {
  // Fetch featured journeys
  isLoading.value = true
  try {
    await journeyStore.fetchAllJourneys()
    // Make sure journeys exists before filtering
    if (journeyStore.journeys) {
      featuredJourneys.value = journeyStore.journeys
        .filter(journey => journey.featured)
        .slice(0, 3) // Show only the top 3 featured journeys
    } else {
      console.warn('Journeys not available yet')
      featuredJourneys.value = []
    }
  } catch (error) {
    console.error('Error fetching journeys:', error)
    featuredJourneys.value = []
  } finally {
    isLoading.value = false
  }
})

const startLearning = () => {
  if (isLoggedIn.value) {
    router.push('/journeys')
  } else {
    router.push('/login?redirect=/journeys')
  }
}

const viewJourney = (journeyId) => {
  router.push(`/journey/${journeyId}`)
}
</script>

<template>
  <div class="py-0">
    <!-- Hero Section -->
    <div class="text-center mb-12">
      <div class="flex justify-center mb-6">
        <img src="@/assets/logo.svg" alt="Code4U Logo" class="w-64 h-64" />
      </div>
      <h1 class="text-4xl md:text-5xl font-bold text-primary mb-4">Welcome to Code4U</h1>
      <p class="text-xl text-text-secondary max-w-2xl mx-auto mb-8">
        Embark on an exciting adventure through multiple coding journeys! Master web development
        fundamentals, responsive design, and much more through interactive challenges.
      </p>
      <button @click="startLearning" class="btn btn-primary text-lg px-8 py-3">
        Explore Journeys
      </button>
    </div>

    <!-- Journeys Section -->
    <h2 class="text-2xl font-bold mb-6 text-center">Featured Journeys</h2>
    
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
      <!-- Featured Journeys -->
      <div v-for="journey in featuredJourneys" :key="journey.id" 
           class="card hover:shadow-lg transition-all p-6 flex flex-col justify-between">
        <div>
          <div class="text-4xl mb-4">{{ journey.icon }}</div>
          <h3 class="text-xl font-semibold mb-2">{{ journey.title }}</h3>
          <p class="text-text-secondary mb-4">
            {{ journey.description }}
          </p>
          <div class="flex flex-wrap gap-2 mb-4">
            <span v-for="category in journey.categories" :key="category"
                  class="text-xs px-2 py-1 bg-gray-100 rounded-full">
              {{ category }}
            </span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500">{{ journey.estimatedHours }} hours</span>
          <button @click="viewJourney(journey.id)" class="btn btn-primary">
            View Journey
          </button>
        </div>
      </div>
      
      <!-- View All Journeys Card -->
      <div v-if="featuredJourneys.length < 3" 
           class="card hover:shadow-lg transition-all p-6 flex flex-col justify-between bg-gray-50 border-dashed border-2 border-gray-200">
        <div class="flex flex-col items-center justify-center h-full">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <h3 class="text-xl font-semibold mb-2 text-center">Discover More</h3>
          <p class="text-text-secondary mb-6 text-center">
            Explore all our journeys and find the perfect fit for your coding adventure
          </p>
          <button @click="router.push('/journeys')" class="btn btn-secondary">
            View All Journeys
          </button>
        </div>
      </div>
    </div>

    <!-- How It Works Section -->
    <div class="mb-16">
      <h2 class="text-3xl font-bold text-center mb-8">How Code4U Works</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="text-center">
          <div class="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
          <h3 class="text-lg font-semibold mb-2">Choose a Path</h3>
          <p class="text-text-secondary">Select your journey: HTML, CSS, or JavaScript</p>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
          <h3 class="text-lg font-semibold mb-2">Complete Challenges</h3>
          <p class="text-text-secondary">Solve coding puzzles and interactive exercises</p>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
          <h3 class="text-lg font-semibold mb-2">Build Projects</h3>
          <p class="text-text-secondary">Apply your skills to create real working websites</p>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
          <h3 class="text-lg font-semibold mb-2">Earn Badges</h3>
          <p class="text-text-secondary">Collect badges and climb the leaderboard</p>
        </div>
      </div>
    </div>

    <!-- Activity Feed Section -->
    <div class="mb-16 bg-white/50 py-10 -mx-4">
      <div class="max-w-6xl mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- CTA Column -->
          <div class="lg:col-span-1">
            <div class="text-center lg:text-left">
              <h2 class="text-3xl font-bold mb-4">Join Code4U</h2>
              <p class="text-text-secondary mb-6">See who’s learning to code and having fun! Maybe your friends are here too — or you can make new ones. Let’s learn and play together!</p>
              <button @click="startLearning" class="btn btn-primary text-lg px-6 py-3">
                Let’s Go!
              </button>
            </div>
          </div>

          <!-- Activity Feed Column -->
          <div class="lg:col-span-2">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-bold">Latest Activity</h3>
              <router-link to="/activities" class="text-primary hover:text-primary-dark text-sm flex items-center">
                View All Activities
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </router-link>
            </div>
            <ActivityFeed :maxItems="6" :showTitle="false" />
          </div>
        </div>
      </div>
    </div>

    <!-- Call to Action -->
    <div class="text-center bg-gray-50 py-12 -mx-4 px-4 rounded-lg">
      <h2 class="text-3xl font-bold mb-4">Ready to Start Your Coding Journey?</h2>
      <p class="text-xl text-text-secondary max-w-2xl mx-auto mb-8">
        Join thousands of buddies who are learning to code while having fun!
      </p>
      <button @click="startLearning" class="btn btn-primary text-lg px-8 py-3">
        Jump In!
      </button>
    </div>
  </div>
</template>
