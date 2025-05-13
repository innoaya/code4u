<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../../firebase'
import AdminBreadcrumbs from '../../components/AdminBreadcrumbs.vue'
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  getDoc,
  doc,
} from 'firebase/firestore'

const router = useRouter()
const feedbacks = ref([])
const isLoading = ref(true)
const error = ref(null)
const lastVisible = ref(null)
const hasMore = ref(true)
const totalCount = ref(0)
const pageSize = 5

// Search and filters
const searchTerm = ref('')
const selectedStatus = ref('new')
const isFiltering = ref(false)

// Status options for filter
const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'new', label: 'New' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

// Filtered feedbacks
const filteredFeedbacks = computed(() => {
  if (!searchTerm.value && selectedStatus.value === 'all') {
    return feedbacks.value
  }

  return feedbacks.value.filter((feedback) => {
    // Status filter
    const statusMatch =
      selectedStatus.value === 'all' ||
      feedback.status === selectedStatus.value ||
      (!feedback.status && selectedStatus.value === 'new') // Treat undefined status as 'new'

    // Search term filter
    const searchLower = searchTerm.value.toLowerCase()
    const textMatch = feedback.text && feedback.text.toLowerCase().includes(searchLower)
    const emailMatch = feedback.userEmail && feedback.userEmail.toLowerCase().includes(searchLower)
    const userNameMatch =
      feedback.user &&
      feedback.user.displayName &&
      feedback.user.displayName.toLowerCase().includes(searchLower)
    const typeMatch = feedback.type && feedback.type.toLowerCase().includes(searchLower)

    return (
      statusMatch &&
      (searchTerm.value === '' || textMatch || emailMatch || userNameMatch || typeMatch)
    )
  })
})

// Load initial feedback data
onMounted(async () => {
  await loadFeedbacks()
})

// Reset pagination when filters change
watch([searchTerm, selectedStatus], () => {
  isFiltering.value = true
  // If we're doing client-side filtering, we don't need to reload from server
  // But we would reset pagination if we were doing server-side filtering
})

// Fetch feedback data from Firestore
async function loadFeedbacks(loadMore = false) {
  try {
    isLoading.value = true
    error.value = null
    isFiltering.value = false

    // Always reset if it's not a loadMore operation
    if (!loadMore) {
      feedbacks.value = []
      lastVisible.value = null
      hasMore.value = true

      // Get total count of feedback items (only on initial load)
      try {
        const countSnapshot = await getDocs(query(collection(db, 'feedback')))
        totalCount.value = countSnapshot.size
      } catch (countErr) {
        console.error('Error getting total count:', countErr)
        // Don't fail the whole operation if only the count fails
      }
    }

    let q
    if (loadMore && lastVisible.value) {
      // Paginated query
      q = query(
        collection(db, 'feedback'),
        orderBy('timestamp', 'desc'),
        startAfter(lastVisible.value),
        limit(pageSize),
      )
    } else {
      // Initial query
      q = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'), limit(pageSize))
    }

    const querySnapshot = await getDocs(q)

    // Update pagination state
    if (querySnapshot.docs.length < pageSize) {
      hasMore.value = false
    }

    if (querySnapshot.docs.length > 0) {
      lastVisible.value = querySnapshot.docs[querySnapshot.docs.length - 1]
    }

    // Process feedback documents
    const feedbackData = []
    for (const docSnapshot of querySnapshot.docs) {
      const feedback = {
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }

      // Get user details if userId is available
      if (feedback.userId) {
        try {
          // Use doc() function to get a direct reference to the user document
          const userDoc = await getDoc(doc(db, 'users', feedback.userId))
          if (userDoc.exists()) {
            feedback.user = {
              email: userDoc.data().email,
              displayName: userDoc.data().displayName,
            }
          }
        } catch (err) {
          console.error(`Error fetching user details for feedback ${feedback.id}:`, err)
        }
      }

      feedbackData.push(feedback)
    }

    // Update feedback list
    if (loadMore) {
      feedbacks.value.push(...feedbackData)
    } else {
      feedbacks.value = feedbackData
    }
  } catch (err) {
    console.error('Error fetching feedback:', err)
    error.value = 'Error loading feedback data'
  } finally {
    isLoading.value = false
  }
}

// Load more feedback items
async function loadMore() {
  if (hasMore.value && !isLoading.value) {
    await loadFeedbacks(true)
  }
}

// View feedback details
function viewFeedback(id) {
  router.push({ name: 'admin-feedback-detail', params: { id } })
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
    minute: '2-digit',
  }).format(date)
}

// Status color utilities are now handled inline with the new status UI implementation
</script>

<template>
  <div>
    <!-- Breadcrumb Navigation -->
    <AdminBreadcrumbs />

    <div class="mb-6">
      <h1 class="text-2xl font-bold">Feedback Management</h1>
      <p class="text-gray-600 dark:text-gray-400">Admin access only</p>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <div class="md:col-span-2">
          <label
            for="search"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >Search</label
          >
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                class="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <input
              v-model="searchTerm"
              type="text"
              id="search"
              class="pl-10 focus:ring-primary focus:border-primary block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              placeholder="Search by email, content, or type"
            />
          </div>
        </div>

        <!-- Status Filter -->
        <div>
          <label
            for="status"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >Status</label
          >
          <div class="relative">
            <select
              v-model="selectedStatus"
              id="status"
              class="appearance-none w-full pl-10 pr-10 py-2 rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                class="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>

            <!-- Status indicator dot -->
            <div
              v-if="selectedStatus !== 'all'"
              class="absolute inset-y-0 left-2 flex items-center"
            >
              <span
                :class="[
                  'inline-block w-2 h-2 rounded-full mr-2',
                  selectedStatus === 'new' ? 'bg-blue-500' : '',
                  selectedStatus === 'in-progress' ? 'bg-yellow-500' : '',
                  selectedStatus === 'resolved' ? 'bg-green-500' : '',
                  selectedStatus === 'closed' ? 'bg-gray-500' : '',
                ]"
              ></span>
            </div>
          </div>
        </div>

        <!-- Reset Filters -->
        <div class="flex items-end">
          <button
            @click="
              () => {
                searchTerm = ''
                selectedStatus = 'all'
                loadFeedbacks()
              }
            "
            class="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300 transition-colors duration-150"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading && !feedbacks.length" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
      {{ error }}
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!feedbacks.length"
      class="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-12 w-12 mx-auto text-gray-400 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
      <h3 class="text-lg font-medium mb-2">No feedback submissions</h3>
      <p class="text-gray-600 dark:text-gray-400">
        There are no feedback submissions to review yet.
      </p>
    </div>

    <!-- Feedback list -->
    <div v-else>
      <!-- Results count -->
      <div class="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {{ isFiltering ? filteredFeedbacks.length : feedbacks.length }} feedback items found
      </div>

      <div class="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                User
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Type
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="feedback in isFiltering ? filteredFeedbacks : feedbacks"
              :key="feedback.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                {{ formatDate(feedback.timestamp) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div
                  v-if="feedback.user"
                  class="text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  {{ feedback.user.displayName || feedback.user.email }}
                </div>
                <div v-else-if="feedback.userId" class="text-sm text-gray-500 dark:text-gray-400">
                  {{ feedback.userId }}
                </div>
                <div v-else class="text-sm text-gray-500 dark:text-gray-400 italic">Anonymous</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  {{ feedback.type || 'General' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span
                    :class="[
                      'inline-block w-2.5 h-2.5 rounded-full mr-2',
                      !feedback.status || feedback.status === 'new' ? 'bg-blue-500' : '',
                      feedback.status === 'in-progress' ? 'bg-yellow-500' : '',
                      feedback.status === 'resolved' ? 'bg-green-500' : '',
                      feedback.status === 'closed' ? 'bg-gray-500' : '',
                    ]"
                  ></span>
                  <span class="text-sm">
                    {{
                      !feedback.status
                        ? 'New'
                        : feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)
                    }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="viewFeedback(feedback.id)"
                  class="text-primary hover:text-primary-dark transition-colors duration-150"
                >
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination controls -->
      <div class="flex justify-between items-center mt-6">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          <span v-if="isFiltering">
            Showing {{ filteredFeedbacks.length }} filtered items
          </span>
          <span v-else>
            Showing {{ feedbacks.length }} of {{ totalCount }} items
          </span>
        </div>

        <div class="flex gap-2">
          <button
            v-if="hasMore && !isFiltering"
            @click="loadMore"
            class="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
            :disabled="isLoading"
          >
            <span v-if="isLoading">Loading...</span>
            <span v-else>Load More</span>
          </button>

          <button
            v-if="feedbacks.length > 0"
            @click="loadFeedbacks()"
            class="px-4 py-2 bg-primary text-white rounded-md shadow-sm text-sm font-medium hover:bg-primary-dark focus:outline-none"
            :disabled="isLoading"
          >
            <span v-if="isLoading">Refreshing...</span>
            <span v-else>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
