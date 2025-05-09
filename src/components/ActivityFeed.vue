<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { db, auth } from '../firebase'
import { collection, query, orderBy, limit, onSnapshot, getDoc, doc } from 'firebase/firestore'
import { trackFeatureUsed } from '../firebase/analytics-utils'

const props = defineProps({
  maxItems: {
    type: Number,
    default: 8
  },
  showTitle: {
    type: Boolean,
    default: true
  }
})

const activities = ref([])
const isLoading = ref(true)
const error = ref(null)
let unsubscribe = null
const userCache = ref({}) // Cache for user display names

// Check if user is authenticated
const isAuthenticated = computed(() => !!auth.currentUser)

onMounted(() => {
  fetchRecentActivities()
  trackFeatureUsed('activity_feed_view')
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})

async function fetchRecentActivities() {
  try {
    isLoading.value = true
    error.value = null

    // Create query for all public activities
    const activitiesQuery = query(
      collection(db, 'user_activities'),
      orderBy('timestamp', 'desc'),
      limit(props.maxItems)
    )

    // Set up real-time listener
    unsubscribe = onSnapshot(activitiesQuery, (snapshot) => {
      activities.value = snapshot.docs.map(doc => {
        const data = doc.data()

        // Format timestamp
        let formattedTime = ''
        if (data.timestamp) {
          const date = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp)
          formattedTime = formatTimeAgo(date)
        }

        // Enhance activity with user display info for older records
        return {
          id: doc.id,
          ...data,
          formattedTime,
          // Add this field if it doesn't exist in older activities
          userDisplayName: data.userDisplayName || data.details?.displayName || null
        }
      })

      isLoading.value = false
    }, (err) => {
      console.error('Error fetching activities:', err)
      error.value = 'Failed to load activity feed'
      isLoading.value = false
    })

  } catch (err) {
    console.error('Error setting up activity feed:', err)
    error.value = 'Failed to load activity feed'
    isLoading.value = false
  }
}

// Format time relative to now (e.g. "2 min ago", "1 hour ago")
function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000)

  let interval = Math.floor(seconds / 31536000) // years
  if (interval >= 1) {
    return interval === 1 ? '1 year ago' : `${interval} years ago`
  }

  interval = Math.floor(seconds / 2592000) // months
  if (interval >= 1) {
    return interval === 1 ? '1 month ago' : `${interval} months ago`
  }

  interval = Math.floor(seconds / 86400) // days
  if (interval >= 1) {
    return interval === 1 ? '1 day ago' : `${interval} days ago`
  }

  interval = Math.floor(seconds / 3600) // hours
  if (interval >= 1) {
    return interval === 1 ? '1 hour ago' : `${interval} hours ago`
  }

  interval = Math.floor(seconds / 60) // minutes
  if (interval >= 1) {
    return interval === 1 ? '1 minute ago' : `${interval} minutes ago`
  }

  return 'just now'
}

// Helper function to get activity icon based on type
function getActivityIcon(type) {
  switch (type) {
    case 'level_completed':
      return '🏆'
    case 'badge_earned':
      return '🎖️'
    case 'login':
      return '👋'
    case 'profile_update':
      return '👤'
    default:
      return '✨'
  }
}

// Helper function to get activity text based on type and details
function getActivityText(activity) {
  const { type, details } = activity

  switch (type) {
    case 'level_completed':
      return `completed level ${details?.levelNumber || '?'}: ${details?.levelTitle || ''}`
    case 'badge_earned':
      return `earned the "${details?.badgeName || 'achievement'}" badge`
    case 'login':
      return 'logged in'
    case 'profile_update':
      return 'updated their profile'
    default:
      return type.replace(/_/g, ' ')
  }
}

// Fetch user display name from Firestore (for authenticated users)
async function fetchUserDisplayName(userId) {
  // Skip if already in cache
  if (userCache.value[userId]) {
    return userCache.value[userId]
  }

  try {
    // Only proceed if user is authenticated (for security rules)
    if (!isAuthenticated.value) {
      return null
    }

    // Get user doc from Firestore
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      // Store in cache
      userCache.value[userId] = userData.displayName || 'Code4U Student'
      return userCache.value[userId]
    }
    return null
  } catch (err) {
    console.error('Error fetching user data:', err)
    return null
  }
}

// Helper function to determine the user's display name from various activity formats - non-async for template compatibility
function getUserName(activity) {
  // For new activities after our update (has userDisplayName field)
  if (activity.userDisplayName) {
    return activity.userDisplayName
  }

  // For older activities that stored name in details
  if (activity.details && activity.details.displayName) {
    return activity.details.displayName
  }

  // If we've already looked up this user and cached the result
  if (activity.userId && userCache.value[activity.userId]) {
    return userCache.value[activity.userId]
  }

  // If we have a display name loaded already (from async call)
  if (activity.loadedDisplayName) {
    return activity.loadedDisplayName
  }

  // For activities with userId - initiate async lookup if authenticated
  if (activity.userId && isAuthenticated.value) {
    // Initiate lookup but don't wait for it - Vue's reactivity will update the display when ready
    if (userCache.value[activity.userId] === undefined) {
      // Mark as loading to avoid duplicate requests
      userCache.value[activity.userId] = null

      // Async lookup
      fetchUserDisplayName(activity.userId).then(name => {
        if (name) {
          userCache.value[activity.userId] = name
          activity.loadedDisplayName = name
        }
      })
    }

    // While loading, show temporary name
    return 'A Coder'
  }

  // Fallback for non-authenticated users or missing userId
  return 'A Coder'
}
</script>

<template>
  <div class="activity-feed">
    <h2 v-if="showTitle" class="text-2xl font-bold mb-4">Recent Activity</h2>

    <div v-if="isLoading" class="flex justify-center py-6">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="text-center py-4 text-danger">
      {{ error }}
    </div>

    <div v-else-if="activities.length === 0" class="text-center py-4 text-text-secondary">
      No activities to display yet
    </div>

    <ul v-else class="space-y-3">
      <li v-for="activity in activities" :key="activity.id" 
          class="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-primary/30">
        <div class="flex">
          <!-- Activity icon -->
          <div class="mr-3 text-lg" aria-hidden="true">
            {{ getActivityIcon(activity.type) }}
          </div>

          <div class="flex-grow">
            <!-- User info and activity -->
            <div class="flex items-start justify-between">
              <div>
                <span class="font-medium">{{ getUserName(activity) }}</span>
                <span class="text-text-secondary">&nbsp;{{ getActivityText(activity) }}</span>
              </div>
              <span class="text-xs text-text-secondary whitespace-nowrap ml-2">{{ activity.formattedTime }}</span>
            </div>

            <!-- Category badge for levels -->
            <div v-if="activity.type === 'level_completed' && activity.details?.category" class="mt-1">
              <span :class="{
                'px-2 py-1 text-xs rounded-full': true,
                'bg-primary/10 text-primary': activity.details.category === 'HTML',
                'bg-secondary/10 text-secondary': activity.details.category === 'CSS',
                'bg-accent/10 text-accent': activity.details.category === 'JavaScript'
              }">
                {{ activity.details.category }}
              </span>
              <span v-if="activity.details.pointsEarned" class="ml-2 text-xs text-text-secondary">
                +{{ activity.details.pointsEarned }} points
              </span>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
