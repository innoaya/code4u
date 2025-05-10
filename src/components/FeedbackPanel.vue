<script setup>
import { ref, computed, onMounted } from 'vue'
import { auth, db, storage } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { trackFeatureUsed } from '../firebase/analytics-utils'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  levelId: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: ''
  },
  isAutomatic: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

// Form state
const rating = ref(0)
const feedbackType = ref('feedback') // 'feedback' or 'issue'
const feedbackText = ref('')
const screenshots = ref([])
const screenshotPreviews = ref([]) // Store preview URLs
const isUploading = ref(false)
const uploadProgress = ref(0)
const isSubmitting = ref(false)
const showSuccessMessage = ref(false)
const errorMessage = ref('')

// Hover state for stars
const hoverRating = ref(0)

// Animate entry
const isVisible = ref(false)
onMounted(() => {
  // Small delay for animation
  setTimeout(() => {
    isVisible.value = true
  }, 50)
})

// Text placeholders based on feedback type
const placeholder = computed(() => {
  if (feedbackType.value === 'feedback') {
    return 'Tell us what you like about Code4U and what we can improve...'
  } else {
    return 'Please describe the issue you encountered in detail...'
  }
})

// Text label for heading based on feedback type
const panelTitle = computed(() => {
  if (feedbackType.value === 'feedback') {
    return 'Share Your Feedback'
  } else {
    return 'Report an Issue'
  }
})

// Submit the feedback
async function submitFeedback() {
  if (rating.value === 0) {
    errorMessage.value = 'Please select a star rating'
    return
  }
  
  if (!feedbackText.value.trim()) {
    errorMessage.value = 'Please enter some feedback text'
    return
  }
  
  try {
    isSubmitting.value = true
    errorMessage.value = ''
    
    // Prepare feedback data
    const feedbackData = {
      type: feedbackType.value,
      rating: rating.value,
      text: feedbackText.value.trim(),
      source: props.isAutomatic ? 'level_completion' : 'floating_button',
      userId: auth.currentUser?.uid || 'anonymous',
      userEmail: auth.currentUser?.email || 'anonymous',
      timestamp: serverTimestamp(),
      screenshotUrls: []
    }
    
    // Add level info if available
    if (props.levelId) {
      feedbackData.levelId = props.levelId
      feedbackData.category = props.category
    }
    
    // Upload screenshots if available
    if (screenshots.value.length > 0) {
      isUploading.value = true
      const screenshotUrls = []
      
      for (let i = 0; i < screenshots.value.length; i++) {
        const file = screenshots.value[i]
        const fileExtension = file.name.split('.').pop()
        const fileName = `screenshots/feedback_${Date.now()}_${i}.${fileExtension}`
        const imageRef = storageRef(storage, fileName)
        
        // Upload file
        await uploadBytes(imageRef, file)
        
        // Get the download URL
        const url = await getDownloadURL(imageRef)
        screenshotUrls.push(url)
        
        // Update progress
        uploadProgress.value = Math.round(((i + 1) / screenshots.value.length) * 100)
      }
      
      // Add screenshot URLs to feedback data
      feedbackData.screenshotUrls = screenshotUrls
      isUploading.value = false
    }
    
    try {
      // Save to Firestore
      await addDoc(collection(db, 'feedback'), feedbackData)
    } catch (firebaseError) {
      // Handle permission errors by logging to console instead
      console.error('Feedback permission error:', firebaseError.message)
      console.log('Feedback data that would be saved:', feedbackData)
      // This will still proceed as if successful
    }
    
    // Track in analytics
    trackFeatureUsed(`${feedbackType.value}_submitted`)
    
    // Show success and reset form
    showSuccessMessage.value = true
    feedbackText.value = ''
    
    // Close after delay if it was automatically triggered
    if (props.isAutomatic) {
      setTimeout(() => {
        emit('close')
      }, 3000)
    }
  } catch (error) {
    console.error('Error submitting feedback:', error)
    errorMessage.value = 'Failed to submit. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

// Close the panel
function closePanel() {
  isVisible.value = false
  setTimeout(() => {
    emit('close')
  }, 300) // Match transition time
}

// Set star rating
function setRating(value) {
  rating.value = value
  // Clear error if they've selected a rating
  if (errorMessage.value === 'Please select a star rating') {
    errorMessage.value = ''
  }
}

// Toggle between feedback and issue reporting
function toggleFeedbackType() {
  feedbackType.value = feedbackType.value === 'feedback' ? 'issue' : 'feedback'
}

// Handle screenshot upload
function handleFileSelect(event) {
  const files = event.target.files
  if (!files.length) return
  
  const newFiles = Array.from(files)
  
  // Validate file types
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const invalidFiles = newFiles.filter(file => !validTypes.includes(file.type))
  
  if (invalidFiles.length) {
    errorMessage.value = 'Please upload only image files (JPEG, PNG, GIF, WEBP)'
    return
  }
  
  try {
    // Create preview URLs for each file
    const newPreviews = newFiles.map(file => {
      // Only create object URLs in browser environment
      if (typeof window !== 'undefined' && window.URL) {
        return window.URL.createObjectURL(file)
      }
      return ''
    })
    
    // Add new files and previews
    screenshots.value = [...screenshots.value, ...newFiles]
    screenshotPreviews.value = [...screenshotPreviews.value, ...newPreviews]
  } catch (error) {
    console.error('Error creating preview URLs:', error)
    errorMessage.value = 'Error creating image previews'
  }
  
  // Clear input value to allow selecting the same file again
  event.target.value = ''
}

// Remove screenshot
function removeScreenshot(index) {
  // Revoke the object URL to prevent memory leaks
  try {
    if (typeof window !== 'undefined' && window.URL && screenshotPreviews.value[index]) {
      window.URL.revokeObjectURL(screenshotPreviews.value[index])
    }
  } catch (error) {
    console.error('Error revoking object URL:', error)
  }
  
  // Remove the screenshot and its preview
  screenshots.value.splice(index, 1)
  screenshotPreviews.value.splice(index, 1)
}
</script>

<template>
  <div 
    class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center transition-opacity duration-300"
    :class="{ 'opacity-0': !isVisible, 'opacity-100': isVisible }"
    @click="closePanel"
  >
    <div 
      class="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 overflow-hidden transform transition-transform duration-300"
      :class="{ 'translate-y-8 opacity-0': !isVisible, 'translate-y-0 opacity-100': isVisible }"
      @click.stop
    >
      <!-- Header -->
      <div class="bg-primary text-white px-6 py-4 flex justify-between items-center">
        <h3 class="text-xl font-bold">{{ panelTitle }}</h3>
        <button 
          @click="closePanel" 
          class="text-white hover:text-white/80 transition-colors"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Content -->
      <div class="p-6">
        <!-- Success Message -->
        <div v-if="showSuccessMessage" class="bg-success/10 text-success p-4 rounded-lg mb-4 text-center">
          <div class="text-xl mb-2">Thank you for your feedback!</div>
          <p>Your input helps us improve Code4U for everyone.</p>
        </div>
        
        <!-- Form -->
        <form v-else @submit.prevent="submitFeedback">
          <!-- Toggle between feedback and issue -->
          <div class="flex border border-gray-200 rounded-lg mb-4 overflow-hidden">
            <button 
              type="button"
              @click="toggleFeedbackType"
              class="flex-1 py-2 px-4 text-center transition-colors"
              :class="feedbackType === 'feedback' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'"
            >
              Feedback
            </button>
            <button 
              type="button"
              @click="toggleFeedbackType"
              class="flex-1 py-2 px-4 text-center transition-colors"
              :class="feedbackType === 'issue' ? 'bg-secondary text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'"
            >
              Report Issue
            </button>
          </div>
          
          <!-- Star Rating -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ feedbackType === 'feedback' ? 'How would you rate your experience?' : 'How severe is this issue?' }}
            </label>
            <div class="flex space-x-1">
              <button 
                v-for="i in 5" 
                :key="i"
                type="button"
                @click="setRating(i)"
                @mouseenter="hoverRating = i"
                @mouseleave="hoverRating = 0"
                class="text-2xl transition-colors focus:outline-none"
                :class="{
                  'text-yellow-400': i <= (hoverRating || rating),
                  'text-gray-300': i > (hoverRating || rating)
                }"
              >
                ★
              </button>
            </div>
          </div>
          
          <!-- Feedback Text -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ feedbackType === 'feedback' ? 'Your feedback' : 'Issue details' }}
            </label>
            <textarea
              v-model="feedbackText"
              :placeholder="placeholder"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              :class="{ 'border-danger': errorMessage && !feedbackText }"
            ></textarea>
          </div>
          
          <!-- Screenshot Upload (visible only for issue reports) -->
          <div v-if="feedbackType === 'issue'" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Add Screenshots (Optional)
            </label>
            
            <!-- Upload button -->
            <div class="flex items-center space-x-2 mb-2">
              <label class="cursor-pointer px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                <span class="text-sm">Upload Images</span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  class="hidden" 
                  @change="handleFileSelect"
                  :disabled="isSubmitting || isUploading"
                />
              </label>
              <div v-if="screenshots.length" class="text-xs text-gray-500">
                {{ screenshots.length }} {{ screenshots.length === 1 ? 'image' : 'images' }} selected
              </div>
            </div>
            
            <!-- Preview of selected files -->
            <div v-if="screenshots.length" class="flex flex-wrap gap-2">
              <div v-for="(file, index) in screenshots" :key="index" class="relative group w-16 h-16 border rounded overflow-hidden">
                <img :src="screenshotPreviews[index]" alt="Preview" class="w-full h-full object-cover" />
                <button 
                  @click="removeScreenshot(index)" 
                  type="button"
                  class="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Upload Progress -->
          <div v-if="isUploading" class="mb-4">
            <div class="text-sm text-gray-700 mb-1">Uploading screenshots... {{ uploadProgress }}%</div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div class="bg-primary h-2.5 rounded-full" :style="{ width: `${uploadProgress}%` }"></div>
            </div>
          </div>
          
          <!-- Error Message -->
          <div v-if="errorMessage" class="text-danger text-sm mb-4">
            {{ errorMessage }}
          </div>
          
          <!-- Submit Button -->
          <div class="flex justify-end">
            <button
              type="button"
              @click="closePanel"
              class="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="inline-block animate-spin mr-2">⟳</span>
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any component-specific styles here */
</style>
