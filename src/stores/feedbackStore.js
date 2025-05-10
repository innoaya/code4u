import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFeedbackStore = defineStore('feedback', () => {
  // State
  const showFeedbackModal = ref(false)
  const feedbackLevel = ref(null)
  const feedbackCategory = ref('')
  const isAutoPrompt = ref(false)
  
  // Check if feedback should be requested for this level and category
  function shouldRequestFeedback(levelNum, category) {
    // Request feedback after completing second level of each category
    // We check the level is 2 for any category (HTML, CSS, JavaScript)
    return levelNum === 2 && ['HTML', 'CSS', 'JavaScript'].includes(category)
  }
  
  // Show feedback prompt for a level
  function showFeedbackFor(levelId, levelNum, category) {
    if (shouldRequestFeedback(levelNum, category)) {
      feedbackLevel.value = levelId
      feedbackCategory.value = category
      isAutoPrompt.value = true
      showFeedbackModal.value = true
      return true
    }
    return false
  }
  
  // Close feedback modal
  function closeFeedback() {
    showFeedbackModal.value = false
    isAutoPrompt.value = false
  }
  
  // Show feedback manually (from floating button)
  function showFeedbackManually() {
    isAutoPrompt.value = false
    showFeedbackModal.value = true
  }
  
  return {
    // State
    showFeedbackModal,
    feedbackLevel,
    feedbackCategory,
    isAutoPrompt,
    
    // Actions
    showFeedbackFor,
    closeFeedback,
    showFeedbackManually
  }
})
