<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../firebase'

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
  <div class="py-12">
    <!-- Hero Section -->
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold text-primary mb-4">Welcome to Code Quest</h1>
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
      <h2 class="text-3xl font-bold text-center mb-8">How Code Quest Works</h2>
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

    <!-- Testimonials Section -->
    <div class="mb-16">
      <h2 class="text-3xl font-bold text-center mb-8">What Our Students Say</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="card">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
              <span class="text-primary font-bold">JD</span>
            </div>
            <div>
              <h4 class="font-semibold">Jake Davis</h4>
              <p class="text-sm text-text-secondary">8th Grade Student</p>
            </div>
          </div>
          <p class="text-text-secondary italic">
            "Code Quest made learning HTML and CSS so much fun! I built my first website in just a week!"
          </p>
        </div>
        <div class="card">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mr-4">
              <span class="text-secondary font-bold">SM</span>
            </div>
            <div>
              <h4 class="font-semibold">Sarah Miller</h4>
              <p class="text-sm text-text-secondary">10th Grade Student</p>
            </div>
          </div>
          <p class="text-text-secondary italic">
            "I never thought I'd enjoy coding, but the game-based approach made it easy to understand JavaScript concepts."
          </p>
        </div>
      </div>
    </div>

    <!-- Call to Action -->
    <div class="text-center">
      <h2 class="text-3xl font-bold mb-4">Ready to Start Your Coding Journey?</h2>
      <p class="text-xl text-text-secondary max-w-2xl mx-auto mb-8">
        Join thousands of students who are learning to code while having fun!
      </p>
      <button @click="startLearning" class="btn btn-primary text-lg px-8 py-3">
        Begin Your Adventure
      </button>
    </div>
  </div>
</template>
