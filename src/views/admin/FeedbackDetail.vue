<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { db, auth } from '../../firebase'
import AdminBreadcrumbs from '../../components/AdminBreadcrumbs.vue'
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, query, where, orderBy, getDocs } from 'firebase/firestore'

const router = useRouter()
const route = useRoute()
const feedbackId = route.params.id

const feedback = ref(null)
const userDetails = ref(null)
const comments = ref([])
const newComment = ref('')
const newStatus = ref('')
const isLoading = ref(true)
const isSaving = ref(false)
const error = ref(null)
const saveSuccess = ref(false)

// Load feedback and related data
onMounted(async () => {
  await loadFeedbackData()
})

// Fetch feedback, user details, and comments
async function loadFeedbackData() {
  try {
    isLoading.value = true
    error.value = null
    
    // Get feedback document
    const feedbackDoc = await getDoc(doc(db, 'feedback', feedbackId))
    
    if (!feedbackDoc.exists()) {
      error.value = 'Feedback not found'
      return
    }
    
    // Set feedback data
    feedback.value = {
      id: feedbackDoc.id,
      ...feedbackDoc.data()
    }
    
    // Set initial status for form
    newStatus.value = feedback.value.status || 'new'
    
    // Get user details if userId exists
    if (feedback.value.userId) {
      try {
        const userDoc = await getDoc(doc(db, 'users', feedback.value.userId))
        if (userDoc.exists()) {
          userDetails.value = {
            id: userDoc.id,
            ...userDoc.data()
          }
        }
      } catch (err) {
        console.error('Error fetching user details:', err)
      }
    }
    
    // Get comments
    try {
      // Make sure feedback_comments collection exists, create it if needed
      const commentsQuery = query(
        collection(db, 'feedback_comments'),
        where('feedbackId', '==', feedbackId),
        orderBy('timestamp', 'asc')
      )
      
      const commentsSnapshot = await getDocs(commentsQuery)
      
      comments.value = commentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      console.log(`Loaded ${comments.value.length} comments for feedback ${feedbackId}`)
    } catch (err) {
      console.error('Error fetching comments:', err)
    }
  } catch (err) {
    console.error('Error loading feedback:', err)
    error.value = 'Error loading feedback data'
  } finally {
    isLoading.value = false
  }
}

// Update feedback status
async function updateStatus() {
  if (!feedback.value || !newStatus.value) return
  
  try {
    isSaving.value = true
    saveSuccess.value = false
    error.value = null
    
    // Update the feedback document
    await updateDoc(doc(db, 'feedback', feedbackId), {
      status: newStatus.value,
      updatedAt: serverTimestamp()
    })
    
    // Add a comment about the status change
    await addComment(`Status changed to: ${newStatus.value}`, true)
    
    // Update local state
    feedback.value.status = newStatus.value
    saveSuccess.value = true
    
    // Reload data to get the updated timestamps
    await loadFeedbackData()
  } catch (err) {
    console.error('Error updating status:', err)
    error.value = 'Failed to update status'
  } finally {
    isSaving.value = false
  }
}

// Add a new comment
async function addComment(commentText = null, isSystem = false) {
  const text = commentText || newComment.value
  
  if (!text.trim()) return
  
  try {
    // Add comment to Firestore
    await addDoc(collection(db, 'feedback_comments'), {
      feedbackId,
      text,
      isSystem,
      authorId: isSystem ? null : auth.currentUser.uid,
      authorName: isSystem ? 'System' : auth.currentUser.displayName || auth.currentUser.email,
      timestamp: serverTimestamp()
    })
    
    // Clear comment input if not a system comment
    if (!isSystem) {
      newComment.value = ''
    }
    
    // Reload comments
    await loadFeedbackData()
  } catch (err) {
    console.error('Error adding comment:', err)
    error.value = 'Failed to add comment'
  }
}

// Format date for display
function formatDate(timestamp) {
  if (!timestamp) return 'N/A'
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Get status color for UI display
function getStatusColor(status) {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'in-progress':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    case 'resolved':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'closed':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
}

// Return to feedback list
function goBack() {
  router.push({ name: 'admin-feedback-list' })
}
</script>

<template>
  <div>
    <!-- Breadcrumb Navigation -->
    <AdminBreadcrumbs 
      :feedbackId="feedbackId" 
      :feedbackTitle="feedback?.type ? `${feedback.type} Feedback` : 'Feedback Details'" 
    />
    
    <!-- Top navigation bar -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center">
        <button @click="goBack" class="mr-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 class="text-2xl font-bold">Feedback Details</h1>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
      {{ error }}
    </div>
    
    <!-- Feedback details -->
    <div v-else-if="feedback" class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Left column: Feedback details -->
      <div class="md:col-span-2">
        <div class="card mb-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h2 class="text-xl font-semibold mb-1">{{ feedback.type || 'General Feedback' }}</h2>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Submitted on {{ formatDate(feedback.timestamp) }}
              </div>
            </div>
            <span :class="['px-2 py-1 text-xs font-semibold rounded-full', getStatusColor(feedback.status)]">
              {{ feedback.status || 'New' }}
            </span>
          </div>
          
          <!-- Feedback content -->
          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4 whitespace-pre-wrap">
            {{ feedback.text }}
          </div>
          
          <!-- Rating if available -->
          <div v-if="feedback.rating" class="mt-2 mb-4">
            <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Rating:</div>
            <div class="flex items-center">
              <template v-for="i in 5" :key="i">
                <svg xmlns="http://www.w3.org/2000/svg" 
                  :class="[i <= feedback.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600', 'h-5 w-5']" 
                  viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </template>
              <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">{{ feedback.rating }} / 5</span>
            </div>
          </div>
          
          <!-- Source information -->
          <div v-if="feedback.source" class="mt-2 mb-4">
            <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Source:</div>
            <div class="text-sm text-gray-900 dark:text-gray-300">
              {{ feedback.source === 'level_completion' ? 'Level Completion Survey' : 'Feedback Button' }}
            </div>
          </div>
          
          <!-- Level information if available -->
          <div v-if="feedback.levelId || feedback.category" class="mt-4">
            <h3 class="text-md font-medium mb-2">Level Information</h3>
            <dl class="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              <div v-if="feedback.levelId" class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Level ID</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-gray-300">{{ feedback.levelId }}</dd>
              </div>
              <div v-if="feedback.category" class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Category</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-gray-300">{{ feedback.category }}</dd>
              </div>
            </dl>
          </div>
          
          <!-- Screenshots if available -->
          <div v-if="feedback.screenshotUrls && feedback.screenshotUrls.length > 0" class="mt-6">
            <h3 class="text-md font-medium mb-2">Screenshots</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-for="(url, index) in feedback.screenshotUrls" :key="index" class="border rounded-lg overflow-hidden">
                <img :src="url" :alt="`Screenshot ${index + 1}`" class="w-full h-auto" />
                <div class="p-2 bg-gray-50 dark:bg-gray-800">
                  <a :href="url" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary-dark text-sm">
                    Open in new tab
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <!-- User information if available -->
          <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 class="text-md font-medium mb-2">User Information</h3>
            
            <!-- If full user details are available from Firestore -->
            <div v-if="userDetails" class="flex items-center">
              <div v-if="userDetails.photoURL" class="mr-3">
                <img :src="userDetails.photoURL" alt="User avatar" class="h-10 w-10 rounded-full" />
              </div>
              <div>
                <div class="font-medium">{{ userDetails.displayName || 'N/A' }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">{{ userDetails.email }}</div>
              </div>
            </div>
            
            <!-- If only basic user data from feedback is available -->
            <div v-else-if="feedback.userEmail || feedback.userId" class="flex items-center">
              <div class="mr-3 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <div v-if="feedback.userEmail !== 'anonymous'" class="text-sm text-gray-600 dark:text-gray-400">
                  {{ feedback.userEmail }}
                </div>
                <div v-if="feedback.userId !== 'anonymous'" class="text-xs text-gray-500 dark:text-gray-500">
                  ID: {{ feedback.userId }}
                </div>
                <div v-if="feedback.userEmail === 'anonymous' && feedback.userId === 'anonymous'" class="text-sm text-gray-600 dark:text-gray-400 italic">
                  Anonymous feedback
                </div>
              </div>
            </div>
            
            <!-- If no user information at all -->
            <div v-else class="text-sm text-gray-600 dark:text-gray-400 italic">
              No user information available
            </div>
          </div>
        </div>
        
        <!-- Comments section -->
        <div class="card">
          <h3 class="text-lg font-medium mb-4">Comments</h3>
          
          <!-- Comments list -->
          <div v-if="comments.length" class="mb-6 space-y-4">
            <div v-for="comment in comments" :key="comment.id" 
              :class="['p-3 rounded-lg', comment.isSystem ? 'bg-gray-50 dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/20']"
            >
              <div class="flex justify-between items-center mb-1">
                <div class="font-medium">{{ comment.authorName }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(comment.timestamp) }}
                </div>
              </div>
              <div class="text-sm">{{ comment.text }}</div>
            </div>
          </div>
          
          <!-- No comments placeholder -->
          <div v-else class="text-center text-gray-500 dark:text-gray-400 py-4">
            No comments yet
          </div>
          
          <!-- Add comment form -->
          <div class="mt-4">
            <div class="flex">
              <input 
                v-model="newComment" 
                type="text" 
                class="flex-grow rounded-l-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="Add a comment..." 
              />
              <button 
                @click="addComment()" 
                class="px-4 py-2 bg-primary text-white rounded-r-lg hover:bg-primary-dark transition-colors duration-150"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right column: Admin actions -->
      <div class="md:col-span-1">
        <div class="card sticky top-4">
          <h3 class="text-lg font-medium mb-4">Admin Actions</h3>
          
          <!-- Status update form -->
          <div class="mb-6">
            <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Update Status
            </label>
            <div class="relative">
              <div 
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                aria-hidden="true"
              >
                <span 
                  :class="[
                    'inline-block w-3 h-3 rounded-full',
                    newStatus === 'new' ? 'bg-blue-500' : '',
                    newStatus === 'in-progress' ? 'bg-yellow-500' : '',
                    newStatus === 'resolved' ? 'bg-green-500' : '',
                    newStatus === 'closed' ? 'bg-gray-500' : ''
                  ]"
                ></span>
              </div>
              <select 
                v-model="newStatus" 
                id="status" 
                class="appearance-none w-full pl-10 pr-10 py-2 rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              >
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <!-- Status description -->
            <div class="mt-2 text-sm">
              <span v-if="newStatus === 'new'" class="text-blue-600 dark:text-blue-400">New feedback awaiting review</span>
              <span v-else-if="newStatus === 'in-progress'" class="text-yellow-600 dark:text-yellow-400">Being actively worked on</span>
              <span v-else-if="newStatus === 'resolved'" class="text-green-600 dark:text-green-400">Issue has been addressed</span>
              <span v-else-if="newStatus === 'closed'" class="text-gray-600 dark:text-gray-400">No further action needed</span>
            </div>
          </div>
          
          <!-- Update button -->
          <button 
            @click="updateStatus" 
            class="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-150 flex justify-center items-center"
            :disabled="isSaving"
          >
            <span v-if="isSaving" class="mr-2">
              <div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            </span>
            <span>{{ isSaving ? 'Updating...' : 'Update Status' }}</span>
          </button>
          
          <!-- Success message -->
          <div v-if="saveSuccess" class="mt-4 p-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-lg text-sm text-center">
            Successfully updated!
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
