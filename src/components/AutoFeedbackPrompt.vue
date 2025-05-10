<script setup>
import { computed } from 'vue'
import { useFeedbackStore } from '../stores/feedbackStore'
import FeedbackPanel from './FeedbackPanel.vue'

const feedbackStore = useFeedbackStore()

// Computed properties to access the store state
const isOpen = computed(() => feedbackStore.showFeedbackModal)
const levelId = computed(() => feedbackStore.feedbackLevel)
const category = computed(() => feedbackStore.feedbackCategory)
const isAutomatic = computed(() => feedbackStore.isAutoPrompt)

// Handle closing the feedback panel
function handleClose() {
  feedbackStore.closeFeedback()
}
</script>

<template>
  <FeedbackPanel 
    v-if="isOpen" 
    :isOpen="isOpen"
    :levelId="levelId"
    :category="category"
    :isAutomatic="isAutomatic"
    @close="handleClose"
  />
</template>
