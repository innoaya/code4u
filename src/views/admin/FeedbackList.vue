<template>
  <div>
    <!-- Breadcrumb Navigation -->
    <AdminBreadcrumbs />

    <div class="mb-6">
      <h1 class="text-2xl font-bold">Feedback Management</h1>
    </div>

    <!-- Search & Filter -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search -->
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              id="search"
              v-model="searchTerm"
              placeholder="Search feedback content, user..."
              class="block w-full pl-10 sm:text-sm py-2 px-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        <!-- Status Filter -->
        <div>
          <label for="status-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select
            id="status-filter"
            v-model="selectedStatus"
            class="block w-full sm:text-sm py-2 px-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-primary focus:border-primary"
          >
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <!-- Clear Filters -->
        <div class="flex items-end">
          <button
            @click="clearFilters"
            class="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Filter info -->
      <div v-if="isFiltering" class="mt-4 flex justify-between text-sm text-gray-600">
        <div>
          <span v-if="filteredFeedbacks.length === 0">No feedback matches your filters</span>
          <span v-else>Found {{ filteredFeedbacks.length }} matching feedback items</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Loading feedback...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Failed to load feedback</h3>
      <p class="text-gray-600 dark:text-gray-400">{{ error }}</p>
      <button
        @click="loadFeedbacks"
        class="mt-4 px-4 py-2 bg-primary text-white rounded-md shadow-sm text-sm font-medium hover:bg-primary-dark focus:outline-none"
      >
        Try Again
      </button>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="(isFiltering ? filteredFeedbacks.length : feedbacks.length) === 0"
      class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center"
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
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No feedback found</h3>
      <p class="text-gray-600 dark:text-gray-400">
        {{ isFiltering ? 'Try adjusting your filters to see more results.' : 'There are no feedback submissions yet.' }}
      </p>
    </div>

    <!-- Data Table -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Submitted By
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Feedback
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="feedback in feedbacks" :key="feedback.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <!-- User -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {{ feedback.user?.displayName || 'Anonymous' }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ feedback.userEmail || feedback.user?.email || 'No email' }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Feedback content -->
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                  {{ feedback.text || 'No feedback text' }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ feedback.type || 'General' }} Feedback
                </div>
              </td>

              <!-- Date -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(feedback.timestamp) }}
              </td>

              <!-- Status -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': !feedback.status || feedback.status === 'new',
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': feedback.status === 'in-progress',
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': feedback.status === 'resolved',
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': feedback.status === 'closed'
                  }"
                >
                  {{ feedback.status ? feedback.status.replace('-', ' ') : 'New' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="viewFeedback(feedback.id)"
                  class="text-primary hover:text-primary-dark"
                >
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div v-if="feedbacks.length > 0" class="flex justify-center mt-6 space-x-2">
        <!-- Previous page button -->
        <button
          @click="loadPreviousPage()"
          :disabled="currentPage === 1 || isLoading"
          class="px-3 py-1 rounded-md border border-gray-300 text-sm"
          :class="currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'"
        >
          Previous
        </button>

        <!-- Page numbers -->
        <template v-for="pageNumber in totalPages" :key="pageNumber">
          <!-- For smaller page sets, show all pages -->
          <button
            v-if="totalPages <= 7 ||
              (pageNumber <= 3) ||
              (pageNumber >= totalPages - 2) ||
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)"
            @click="goToPage(pageNumber)"
            :disabled="isLoading"
            class="px-3 py-1 rounded-md text-sm"
            :class="currentPage === pageNumber ?
              'bg-blue-600 text-white' :
              'border border-gray-300 text-gray-700 hover:bg-gray-50'"
          >
            {{ pageNumber }}
          </button>

          <!-- Ellipsis for skipped pages -->
          <span
            v-else-if="(pageNumber === 4 && currentPage > 4) ||
              (pageNumber === totalPages - 3 && currentPage < totalPages - 3)"
            class="px-2 py-1 text-gray-500"
          >
            ...
          </span>
        </template>

        <!-- Next page button -->
        <button
          @click="loadNextPage()"
          :disabled="currentPage === totalPages || totalPages === 0 || isLoading"
          class="px-3 py-1 rounded-md border border-gray-300 text-sm"
          :class="currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'"
        >
          Next
        </button>
      </div>

      <!-- Page information -->
      <div v-if="feedbacks.length > 0" class="text-center text-sm text-gray-500 mt-2 mb-6">
        Showing {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalCount) }} of {{ totalCount }} feedbacks
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '@/firebase'
import AdminBreadcrumbs from '@/components/AdminBreadcrumbs.vue'
import {
  collection,
  getDocs,
  query,
  orderBy,
  getDoc,
  doc,
  limit,
  where,
  getCountFromServer
} from 'firebase/firestore'

const router = useRouter()
const feedbacks = ref([])
const filteredFeedbacks = ref([])
const allFeedbacksCache = ref([])
const isLoading = ref(true)
const error = ref(null)
const totalCount = ref(0)

// Pagination variables
const currentPage = ref(1)
const itemsPerPage = 5
const firstVisible = ref(null)
const lastVisible = ref(null)
const pageSnapshots = ref({})

// Search and filters
const searchTerm = ref('')
const selectedStatus = ref('all')

// Status options for filter
const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'new', label: 'New' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

// Helper to filter feedbacks by search term (client-side)
function filterFeedbacksBySearch(feedbacksArray, searchText) {
  if (!searchText) {
    return feedbacksArray // Return all feedbacks if no search term
  }

  const searchLower = searchText.toLowerCase()

  // Filter feedbacks by text, email, user name, or type
  return feedbacksArray.filter(feedback => {
    const textMatch = feedback.text && feedback.text.toLowerCase().includes(searchLower)
    const emailMatch = feedback.userEmail && feedback.userEmail.toLowerCase().includes(searchLower)
    const userNameMatch =
      feedback.user &&
      feedback.user.displayName &&
      feedback.user.displayName.toLowerCase().includes(searchLower)
    const typeMatch = feedback.type && feedback.type.toLowerCase().includes(searchLower)

    return textMatch || emailMatch || userNameMatch || typeMatch
  })
}

// Helper to filter feedbacks by status
function filterFeedbacksByStatus(feedbacksArray, status) {
  if (status === 'all') {
    return feedbacksArray
  }

  return feedbacksArray.filter(feedback => {
    return status === 'new'
      ? (feedback.status === status || !feedback.status) // Treat undefined status as 'new'
      : feedback.status === status
  })
}

// Helper to apply all filters (search and status) to feedbacks
function applyFilters(feedbacksArray) {
  let filteredResults = feedbacksArray

  // Apply search filter if applicable
  if (searchTerm.value.trim()) {
    filteredResults = filterFeedbacksBySearch(filteredResults, searchTerm.value.trim())
  }

  // Apply status filter if applicable
  if (selectedStatus.value !== 'all') {
    filteredResults = filterFeedbacksByStatus(filteredResults, selectedStatus.value)
  }

  return filteredResults
}

// Computed property for total pages
const totalPages = computed(() => {
  return Math.ceil(totalCount.value / itemsPerPage)
})

// Check if we have active filters
const isFiltering = computed(() => {
  return searchTerm.value.trim() !== '' || selectedStatus.value !== 'all'
})

// Reset pagination when status filter changes
watch([selectedStatus], () => {
  // Only trigger a reload if the component is already mounted
  if (!isLoading.value) {
    currentPage.value = 1
    firstVisible.value = null
    lastVisible.value = null
    // Use loadAllFeedbacks as it handles both client and server-side filtering
    loadAllFeedbacks()
  }
})

// Handle search term changes separately to use client-side filtering
watch(searchTerm, () => {
  // Only trigger a reload if the component is already mounted
  if (!isLoading.value) {
    currentPage.value = 1
    firstVisible.value = null
    lastVisible.value = null

    // If we have cached data, use client-side filtering
    if (allFeedbacksCache.value.length > 0) {
      if (searchTerm.value.trim() === '' && selectedStatus.value === 'all') {
        // If no search term and no status filter, revert to paginated results
        loadFeedbacksPaginated()
      } else {
        // Apply filters to cached data
        let filtered = allFeedbacksCache.value

        // Apply status filter
        if (selectedStatus.value !== 'all') {
          filtered = filterFeedbacksByStatus(filtered, selectedStatus.value)
        }

        // Apply search filter
        if (searchTerm.value.trim()) {
          filtered = filterFeedbacksBySearch(filtered, searchTerm.value)
        }

        // Update the UI
        feedbacks.value = filtered
        filteredFeedbacks.value = filtered
        totalCount.value = filtered.length
      }
    } else {
      // If no cache yet, load all feedbacks
      loadAllFeedbacks()
    }
  }
})

// Load initial feedback data
onMounted(async () => {
  // Small timeout to ensure all reactivity is properly set up
  setTimeout(async () => {
    // Restore any saved state from localStorage
    const savedPage = restoreFeedbackListState();
    
    // If we have a saved page, use it
    if (savedPage > 1) {
      // First load all feedbacks to get the total count
      await loadAllFeedbacks();
      
      // Then navigate to the saved page
      if (savedPage <= totalPages.value) {
        await goToPage(savedPage);
      }
    } else {
      // Otherwise just load the first page as usual
      await loadFeedbacks();
    }
  }, 0);
})

// Navigate to specific page - efficient direct approach
async function goToPage(page) {
  if (page === currentPage.value || page < 1 || page > totalPages.value || isLoading.value) {
    return
  }

  isLoading.value = true
  try {
    // Update current page immediately for UI
    currentPage.value = page

    // If we have a snapshot for this page, use it from cache
    if (pageSnapshots.value[page]) {
      const cachedData = pageSnapshots.value[page]
      feedbacks.value = cachedData.data
      filteredFeedbacks.value = searchTerm.value.trim() || selectedStatus.value !== 'all' ?
        applyFilters(feedbacks.value) :
        feedbacks.value
    } else {
      // Direct access to any page using an optimized query approach
      await loadPageDirect(page)
    }
  } catch (err) {
    console.error('Error navigating to page:', err)
    error.value = 'Failed to load page'
  } finally {
    isLoading.value = false
  }
}

// Load next page using direct pagination
async function loadNextPage() {
  if (isLoading.value) return
  const nextPage = currentPage.value + 1

  // Don't go beyond total pages
  if (nextPage > totalPages.value) return

  isLoading.value = true
  try {
    // If we already have a snapshot for the next page, use it from cache
    if (pageSnapshots.value[nextPage]) {
      currentPage.value = nextPage
      const cachedData = pageSnapshots.value[nextPage]
      feedbacks.value = cachedData.data
      filteredFeedbacks.value = searchTerm.value.trim() || selectedStatus.value !== 'all' ?
        applyFilters(feedbacks.value) :
        feedbacks.value
    } else {
      // Direct approach to get the next page
      await loadPageDirect(nextPage)
    }
  } catch (err) {
    console.error('Error loading next page:', err)
    error.value = 'Failed to load next page'
  } finally {
    isLoading.value = false
  }
}

// Load previous page using direct pagination
async function loadPreviousPage() {
  if (isLoading.value) return
  const prevPage = currentPage.value - 1

  // Don't go below page 1
  if (prevPage < 1) return

  isLoading.value = true
  try {
    // If we already have a snapshot for the previous page, use it from cache
    if (pageSnapshots.value[prevPage]) {
      currentPage.value = prevPage
      const cachedData = pageSnapshots.value[prevPage]
      feedbacks.value = cachedData.data
      filteredFeedbacks.value = searchTerm.value.trim() || selectedStatus.value !== 'all' ?
        applyFilters(feedbacks.value) :
        feedbacks.value
    } else {
      // Direct approach to get the previous page
      await loadPageDirect(prevPage)
    }
  } catch (err) {
    console.error('Error loading previous page:', err)
    error.value = 'Failed to load previous page'
  } finally {
    isLoading.value = false
  }
}

// Build query based on current filters and pagination state
function buildQuery(page = 1) {
  let constraints = [
    orderBy('timestamp', 'desc')
  ]

  // Apply status filtering if needed
  if (selectedStatus.value !== 'all') {
    constraints.push(where('status', '==', selectedStatus.value))
  }

  // We'll handle search filtering client-side for better flexibility
  // No search constraints added to the server query

  // For single page requests, just apply simple limit
  if (page === 1) {
    constraints.push(limit(itemsPerPage))
  } else {
    // For other pages, we'll fetch all documents up to the end of requested page
    // The calling function will slice the results to get just the requested page
    constraints.push(limit(page * itemsPerPage))
  }

  return query(collection(db, 'feedback'), ...constraints)
}

// New function to load a page directly without sequential navigation
async function loadPageDirect(page) {
  // First, get total count if not already set
  if (totalCount.value === 0) {
    await getTotalCount()
  }

  if (page > Math.ceil(totalCount.value / itemsPerPage)) {
    page = 1 // If page is beyond total, go to first page
  }

  // For page 1, simple approach
  if (page === 1) {
    const q = buildQuery(1)
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      feedbacks.value = []
      filteredFeedbacks.value = []
      return
    }

    // Extract data from first page
    const feedbacksData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
      status: doc.data().status || 'new',
    }))

    // Update state
    feedbacks.value = feedbacksData
    filteredFeedbacks.value = searchTerm.value.trim() || selectedStatus.value !== 'all' ?
      applyFilters(feedbacksData) :
      feedbacksData

    // Cache page data
    pageSnapshots.value[1] = {
      data: [...feedbacksData],
      timestamp: Date.now()
    }

    // Update state
    currentPage.value = 1
    return
  }

  // For other pages, we need to get all documents up to this page
  const q = buildQuery(page)
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    // If no results, go to page 1
    currentPage.value = 1
    await loadPageDirect(1)
    return
  }

  // Calculate the slice for the current page
  const startIdx = (page - 1) * itemsPerPage
  const endIdx = startIdx + itemsPerPage

  // Get all documents up to this page
  const allDocs = querySnapshot.docs

  // Make sure we have enough documents
  if (startIdx >= allDocs.length) {
    // Not enough data for this page, go to last possible page
    const lastPossiblePage = Math.ceil(allDocs.length / itemsPerPage)
    if (lastPossiblePage < 1) {
      currentPage.value = 1
      await loadPageDirect(1)
    } else {
      currentPage.value = lastPossiblePage
      await loadPageDirect(lastPossiblePage)
    }
    return
  }

  // Get just the documents for the requested page
  const pageDocSlice = allDocs.slice(startIdx, endIdx)

  // Extract data for just this page
  const feedbacksData = pageDocSlice.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate() || new Date(),
    status: doc.data().status || 'new',
  }))

  // Update state
  feedbacks.value = feedbacksData
  filteredFeedbacks.value = searchTerm.value.trim() || selectedStatus.value !== 'all' ?
    applyFilters(feedbacksData) :
    feedbacksData

  // Cache this page data
  pageSnapshots.value[page] = {
    data: [...feedbacksData],
    timestamp: Date.now()
  }

  // Update state
  currentPage.value = page

  // Cache adjacent pages too for smoother navigation (optimization)
  if (page > 1 && startIdx >= itemsPerPage) {
    const prevPageDocs = allDocs.slice(startIdx - itemsPerPage, startIdx)
    const prevPageData = prevPageDocs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
      status: doc.data().status || 'new',
    }))
    pageSnapshots.value[page - 1] = {
      data: [...prevPageData],
      timestamp: Date.now()
    }
  }

  if (endIdx < allDocs.length) {
    const nextPageDocs = allDocs.slice(endIdx, endIdx + itemsPerPage)
    const nextPageData = nextPageDocs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
      status: doc.data().status || 'new',
    }))
    pageSnapshots.value[page + 1] = {
      data: [...nextPageData],
      timestamp: Date.now()
    }
  }
}

// We've replaced the processQuerySnapshot function with loadPageDirect

// Load all feedbacks for search capability
async function loadAllFeedbacks() {
  try {
    isLoading.value = true
    error.value = null

    // Build query with role-based filtering but no pagination
    let feedbackQuery = collection(db, 'feedback')
    let constraints = [orderBy('timestamp', 'desc')]


    feedbackQuery = query(feedbackQuery, ...constraints)

    // Get all matching feedbacks
    const querySnapshot = await getDocs(feedbackQuery)

    // Process all feedbacks
    const allFeedbacks = []

    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data()
      const feedback = {
        id: docSnapshot.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
        user: null
      }

      // If there's a userId, get the user data
      if (data.userId) {
        try {
          const userDoc = await getDoc(doc(db, 'users', data.userId))
          if (userDoc.exists()) {
            feedback.user = {
              uid: userDoc.id,
              ...userDoc.data()
            }
          }
        } catch (err) {
          console.error(`Error fetching user data for feedback ${docSnapshot.id}:`, err)
        }
      }

      allFeedbacks.push(feedback)
    }

    // Store in cache for search
    allFeedbacksCache.value = allFeedbacks

    // Apply filters if needed
    if (searchTerm.value.trim() || selectedStatus.value !== 'all') {
      // Apply status filter
      let filtered = allFeedbacks
      if (selectedStatus.value !== 'all') {
        filtered = filterFeedbacksByStatus(filtered, selectedStatus.value)
      }

      // Apply search filter
      if (searchTerm.value.trim()) {
        filtered = filterFeedbacksBySearch(filtered, searchTerm.value)
      }

      feedbacks.value = filtered
      filteredFeedbacks.value = filtered
      totalCount.value = filtered.length
    } else {
      // No filtering, use paginated results
      await loadFeedbacksPaginated()
    }
  } catch (err) {
    console.error('Error loading all feedbacks:', err)
    error.value = err.message || 'Error loading feedbacks'
  } finally {
    isLoading.value = false
  }
}

// Helper function to get total count
async function getTotalCount() {
  try {
    // Only count if not searching
    if (searchTerm.value.trim()) {
      // For search, we'll set total count based on filtered results later
      return
    }

    let countQuery = collection(db, 'feedback')
    let constraints = []

    // Apply status filtering for count
    if (selectedStatus.value !== 'all') {
      constraints.push(where('status', '==', selectedStatus.value))
    }

    if (constraints.length > 0) {
      countQuery = query(countQuery, ...constraints)
    }

    const snapshot = await getCountFromServer(countQuery)
    totalCount.value = snapshot.data().count
  } catch (err) {
    console.error('Error getting total count:', err)
    // Default to showing at least one page
    totalCount.value = itemsPerPage
  }
}

// Main function to load feedbacks (now uses direct page loading)
async function loadFeedbacksPaginated(countTotal = true) {
  try {
    isLoading.value = true
    error.value = null

    // Get count if requested
    if (countTotal) {
      await getTotalCount()
    }

    // Use the direct loading approach
    await loadPageDirect(currentPage.value)
  } catch (err) {
    console.error('Error fetching feedbacks:', err)
    error.value = 'Failed to load feedbacks'
  } finally {
    isLoading.value = false
  }
}

// Original function renamed to maintain backward compatibility
async function loadFeedbacks(countTotal = true) {
  return loadFeedbacksPaginated(countTotal)
}

function viewFeedback(id) {
  // Save the current page state before navigating
  saveFeedbackListState();
  router.push(`/admin/feedback/${id}`)
}

// Save the current state of the FeedbackList to localStorage
function saveFeedbackListState() {
  const stateToSave = {
    currentPage: currentPage.value,
    selectedStatus: selectedStatus.value,
    searchTerm: searchTerm.value
  };
  localStorage.setItem('feedbackListState', JSON.stringify(stateToSave));
}

// Restore the saved state of the FeedbackList from localStorage
function restoreFeedbackListState() {
  try {
    const savedState = localStorage.getItem('feedbackListState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      
      // Restore filters first
      selectedStatus.value = parsedState.selectedStatus || 'all';
      searchTerm.value = parsedState.searchTerm || '';
      
      // Return the saved page to navigate to
      return parsedState.currentPage || 1;
    }
  } catch (error) {
    console.error('Error restoring feedback list state:', error);
  }
  return 1; // Default to page 1 if no saved state or error
}

function formatDate(timestamp) {
  if (!timestamp) return 'Unknown date'

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// Clear all filters
function clearFilters() {
  // Prevent multiple API calls by setting loading state first
  isLoading.value = true
  searchTerm.value = ''
  selectedStatus.value = 'all'
  currentPage.value = 1
  firstVisible.value = null
  lastVisible.value = null

  // Load with pagination and no filters
  loadFeedbacksPaginated()

  // Reset filtered feedbacks
  filteredFeedbacks.value = feedbacks.value
}
</script>
