<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../firebase'
import ActivityFeed from '../components/ActivityFeed.vue'

const router = useRouter()
const isLoggedIn = ref(!!auth.currentUser)

const startLearning = () => {
  if (isLoggedIn.value) {
    router.push('/levels')
  } else {
    router.push('/login')
  }
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
        Embark on an exciting journey to master HTML, CSS, and JavaScript through interactive
        challenges and fun coding games!
      </p>
      <button @click="startLearning" class="btn btn-primary text-lg px-8 py-3">
        Start Your Coding Adventure
      </button>
    </div>

    <!-- Features Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
      <div class="card text-center hover:shadow-lg transition-shadow duration-300">
        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-2">Learn HTML</h3>
        <p class="text-text-secondary">
          Master the building blocks of web pages with interactive HTML lessons and challenges.
        </p>
      </div>

      <div class="card text-center hover:shadow-lg transition-shadow duration-300">
        <div class="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-2">Style with CSS</h3>
        <p class="text-text-secondary">
          Transform bland web pages into beautiful designs with CSS styling games and puzzles.
        </p>
      </div>

      <div class="card text-center hover:shadow-lg transition-shadow duration-300">
        <div class="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-2">JavaScript Magic</h3>
        <p class="text-text-secondary">
          Bring your websites to life with JavaScript, creating interactive elements and games.
        </p>
      </div>
    </div>

    <!-- How It Works Section -->
    <div class="mb-16">
      <h2 class="text-3xl font-bold text-center mb-8">How Code4U Works</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="text-center">
          <div class="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
          <h3 class="text-lg font-semibold mb-2">Choose a Path</h3>
          <p class="text-text-secondary">Select your learning path: HTML, CSS, or JavaScript</p>
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
