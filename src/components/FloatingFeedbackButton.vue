<script setup>
import { ref } from 'vue'
import FeedbackPanel from './FeedbackPanel.vue'

const showFeedbackPanel = ref(false)

function openFeedback() {
  showFeedbackPanel.value = true
}

function closeFeedback() {
  showFeedbackPanel.value = false
}
</script>

<template>
  <div>
    <!-- Floating Button -->
    <button 
      @click="openFeedback"
      class="fixed bottom-6 right-6 bg-primary hover:bg-primary-dark text-white rounded-full p-3 shadow-lg transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary z-40"
      aria-label="Give Feedback"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    </button>
    
    <!-- Feedback Panel -->
    <FeedbackPanel 
      v-if="showFeedbackPanel" 
      :isOpen="showFeedbackPanel" 
      @close="closeFeedback" 
    />
  </div>
</template>
