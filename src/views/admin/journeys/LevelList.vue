<template>
  <div class="admin-levels">
    <AdminBreadcrumbs />
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Levels</h1>
      <router-link to="/admin/levels/new" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center">
        <span class="mr-1">+</span> Create New Level
      </router-link>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <!-- Loading state -->
      <div v-if="loading" class="p-4 text-center">
        <p class="text-gray-600">Loading levels...</p>
      </div>

      <!-- Search and Filter Bar -->
      <div v-else class="p-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <div class="relative flex-grow max-w-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <input
              type="text"
              v-model="searchTerm"
              placeholder="Search by title, description, or number"
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
          </div>
          <button
            v-if="searchTerm"
            @click="clearSearch"
            class="ml-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Clear
          </button>
        </div>

        <!-- Search Results Info -->
        <div v-if="searchTerm" class="mt-2 text-sm text-gray-500">
          Found {{ totalCount }} matching levels
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="totalCount === 0" class="p-8 text-center">
        <p v-if="searchTerm" class="text-gray-600 mb-4">No levels match your search term "{{ searchTerm }}".</p>
        <p v-else class="text-gray-600 mb-4">No levels have been created yet.</p>
        <button v-if="searchTerm" @click="clearSearch" class="text-blue-600 underline mr-4">Clear search</button>
        <router-link to="/admin/levels/new" class="text-blue-600 underline">Create your first level</router-link>
      </div>

      <!-- Level list -->
      <table v-if="totalCount > 0" class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Level
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Difficulty
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tasks
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Points
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Published
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="level in sortedLevels" :key="level.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              {{ level.number }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="font-medium text-gray-900 truncate max-w-xs">{{ level.title }}</div>
              <div class="text-sm text-gray-500 truncate max-w-xs">{{ level.description }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="{
                  'bg-green-100 text-green-800': level.category === 'HTML',
                  'bg-blue-100 text-blue-800': level.category === 'CSS',
                  'bg-yellow-100 text-yellow-800': level.category === 'JavaScript',
                  'bg-purple-100 text-purple-800': level.category === 'Project'
                }">
                {{ level.category }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ level.difficulty }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ level.tasks?.length || 0 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ level.pointsToEarn }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="level.isPublished ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
              >
                {{ level.isPublished ? 'Published' : 'Draft' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex space-x-3">
                <button 
                  @click="navigateToEdit(level.id)" 
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  Edit
                </button>
                <button v-if="userRole === 'admin'" @click="confirmDelete(level)" class="text-red-600 hover:text-red-900">
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Controls -->
      <div v-if="totalCount > 0" class="flex justify-center mt-6 space-x-2 pb-6">
        <!-- Previous page button -->
        <button
          @click="loadPreviousPage()"
          :disabled="currentPage === 1 || loading"
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
            :disabled="loading"
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
          :disabled="currentPage === totalPages || totalPages === 0 || loading"
          class="px-3 py-1 rounded-md border border-gray-300 text-sm"
          :class="currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="showDeleteModal = false">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Level</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Are you sure you want to delete the level "{{ levelToDelete?.title }}"? This action cannot be undone.
                  </p>
                  <p class="text-sm text-red-500 mt-2 font-medium">
                    Warning: This may break journeys that use this level!
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="deleteLevel"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Delete
            </button>
            <button
              @click="showDeleteModal = false"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '@/firebase';
import AdminBreadcrumbs from '@/components/AdminBreadcrumbs.vue';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  query,
  orderBy,
  limit,
  where,
  getCountFromServer
} from 'firebase/firestore';
const router = useRouter();
const levels = ref([]);
const filteredLevels = ref([]);
const allLevelsCache = ref([]);
const loading = ref(true);
const error = ref(null);
const showDeleteModal = ref(false);
const levelToDelete = ref(null);
const currentUser = ref(null);
const userRole = ref('user');
const totalCount = ref(0);

// Pagination variables
const currentPage = ref(1);
const itemsPerPage = 5;
const firstVisible = ref(null);
const lastVisible = ref(null);
const pageSnapshots = ref({});

// Search term
const searchTerm = ref('');

// Computed property for total pages
const totalPages = computed(() => {
  return Math.ceil(totalCount.value / itemsPerPage);
});

// Helper function to check if the current user is an admin
const isAdmin = computed(() => {
  return userRole.value === 'admin';
});

// Helper function to filter levels by search term (client-side)
function filterLevelsBySearch(levelsArray, searchText) {
  if (!searchText) {
    return levelsArray; // Return all levels if no search term
  }

  const searchLower = searchText.toLowerCase();

  // Filter levels by title, description, or number
  return levelsArray.filter(level =>
    (level.title && level.title.toLowerCase().includes(searchLower)) ||
    (level.description && level.description.toLowerCase().includes(searchLower)) ||
    (level.number && level.number.toString().includes(searchLower))
  );
}

// Sort levels primarily by number - Using a mutable strategy for performance
const sortedLevels = computed(() => {
  // Determine which array to use based on whether we're filtering
  const sourceArray = searchTerm.value ? filteredLevels.value : levels.value;

  // Return a sorted copy of the array
  return [...sourceArray].sort((a, b) => {
    // Sort directly by level number
    return a.number - b.number;
  });
});

// Watch for search term changes
watch(searchTerm, () => {
  // Only trigger a reload if not currently loading
  if (!loading.value) {
    currentPage.value = 1;
    firstVisible.value = null;
    lastVisible.value = null;

    // If we have cached data, use client-side filtering
    if (allLevelsCache.value.length > 0) {
      if (searchTerm.value.trim() === '') {
        // If no search term, revert to paginated results
        loadLevelsPaginated();
      } else {
        // Filter cached levels by search term
        levels.value = filterLevelsBySearch(allLevelsCache.value, searchTerm.value.trim());
        filteredLevels.value = levels.value;
        totalCount.value = filteredLevels.value.length;
      }
    } else {
      // If no cache yet, load all levels
      loadAllLevels();
    }
  }
});

// Handle pagination
// Navigate to a specific page - efficient direct approach
async function goToPage(page) {
  if (page === currentPage.value || page < 1 || page > totalPages.value || loading.value) {
    return;
  }

  loading.value = true;
  try {
    // Update current page immediately for UI
    currentPage.value = page;

    // If we have a snapshot for this page, use it from cache
    if (pageSnapshots.value[page]) {
      const cachedData = pageSnapshots.value[page];
      levels.value = cachedData.data;
      filteredLevels.value = searchTerm.value ?
        filterLevelsBySearch(levels.value, searchTerm.value) :
        levels.value;
    } else {
      // Direct access to any page using an optimized query approach
      await loadPageDirect(page);
    }
  } catch (err) {
    console.error('Error navigating to page:', err);
    error.value = 'Failed to load page';
  } finally {
    loading.value = false;
  }
}

// Load next page using standard cursor-based pagination
async function loadNextPage() {
  if (loading.value) return;
  const nextPage = currentPage.value + 1;

  // Don't go beyond total pages
  if (nextPage > totalPages.value) return;

  loading.value = true;
  try {
    // If we already have a snapshot for the next page, use it from cache
    if (pageSnapshots.value[nextPage]) {
      currentPage.value = nextPage;
      const cachedData = pageSnapshots.value[nextPage];
      levels.value = cachedData.data;
      filteredLevels.value = searchTerm.value ?
        filterLevelsBySearch(levels.value, searchTerm.value) :
        levels.value;
    } else {
      // Direct approach to get the next page
      await loadPageDirect(nextPage);
    }
  } catch (err) {
    console.error('Error loading next page:', err);
    error.value = 'Failed to load next page';
  } finally {
    loading.value = false;
  }
}

// Load previous page using direct pagination
async function loadPreviousPage() {
  if (loading.value) return;
  const prevPage = currentPage.value - 1;

  // Don't go below page 1
  if (prevPage < 1) return;

  loading.value = true;
  try {
    // If we already have a snapshot for the previous page, use it from cache
    if (pageSnapshots.value[prevPage]) {
      currentPage.value = prevPage;
      const cachedData = pageSnapshots.value[prevPage];
      levels.value = cachedData.data;
      filteredLevels.value = searchTerm.value ?
        filterLevelsBySearch(levels.value, searchTerm.value) :
        levels.value;
    } else {
      // Direct approach to get the previous page
      await loadPageDirect(prevPage);
    }
  } catch (err) {
    console.error('Error loading previous page:', err);
    error.value = 'Failed to load previous page';
  } finally {
    loading.value = false;
  }
}

// Build Firestore query based on current state
function buildQuery(page = 1) {
  let constraints = [
    orderBy('number') // Sort by level number
  ];

  // Apply role-based access control
  if (!isAdmin.value) {
    // Creator only sees their own levels
    constraints.push(where('createdBy', '==', auth.currentUser?.uid));
  }

  // For single page requests, just apply simple limit
  if (page === 1) {
    constraints.push(limit(itemsPerPage));
  } else {
    // For other pages, we'll fetch all documents up to the end of requested page
    // The calling function will slice the results to get just the requested page
    constraints.push(limit(page * itemsPerPage));
  }

  return query(collection(db, 'levels'), ...constraints);
}

// New function to load a page directly without sequential navigation
async function loadPageDirect(page) {
  // First, get total count if not already set
  if (totalCount.value === 0) {
    await getTotalCount();
  }

  if (page > Math.ceil(totalCount.value / itemsPerPage)) {
    page = 1; // If page is beyond total, go to first page
  }

  // For page 1, simple approach
  if (page === 1) {
    const q = buildQuery(1);
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      levels.value = [];
      filteredLevels.value = [];
      return;
    }

    // Extract data from first page
    const levelsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Update state
    levels.value = levelsData;
    filteredLevels.value = searchTerm.value.trim() ?
      filterLevelsBySearch(levelsData, searchTerm.value.trim()) :
      levelsData;

    // Cache page data
    pageSnapshots.value[1] = {
      data: [...levelsData],
      timestamp: Date.now()
    };

    // Update state
    currentPage.value = 1;
    return;
  }

  // For other pages, we need to get all documents up to this page
  const q = buildQuery(page);
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    // If no results, go to page 1
    currentPage.value = 1;
    await loadPageDirect(1);
    return;
  }

  // Calculate the slice for the current page
  const startIdx = (page - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;

  // Get all documents up to this page
  const allDocs = querySnapshot.docs;

  // Make sure we have enough documents
  if (startIdx >= allDocs.length) {
    // Not enough data for this page, go to last possible page
    const lastPossiblePage = Math.ceil(allDocs.length / itemsPerPage);
    if (lastPossiblePage < 1) {
      currentPage.value = 1;
      await loadPageDirect(1);
    } else {
      currentPage.value = lastPossiblePage;
      await loadPageDirect(lastPossiblePage);
    }
    return;
  }

  // Get just the documents for the requested page
  const pageDocSlice = allDocs.slice(startIdx, endIdx);

  // Extract data for just this page
  const levelsData = pageDocSlice.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Update state
  levels.value = levelsData;
  filteredLevels.value = searchTerm.value.trim() ?
    filterLevelsBySearch(levelsData, searchTerm.value.trim()) :
    levelsData;

  // Cache this page data
  pageSnapshots.value[page] = {
    data: [...levelsData],
    timestamp: Date.now()
  };

  // Update state
  currentPage.value = page;

  // Cache adjacent pages too for smoother navigation (optimization)
  if (page > 1 && startIdx >= itemsPerPage) {
    const prevPageDocs = allDocs.slice(startIdx - itemsPerPage, startIdx);
    const prevPageData = prevPageDocs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    pageSnapshots.value[page - 1] = {
      data: [...prevPageData],
      timestamp: Date.now()
    };
  }

  if (endIdx < allDocs.length) {
    const nextPageDocs = allDocs.slice(endIdx, endIdx + itemsPerPage);
    const nextPageData = nextPageDocs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    pageSnapshots.value[page + 1] = {
      data: [...nextPageData],
      timestamp: Date.now()
    };
  }
}

// Load all levels for search capability
async function loadAllLevels() {
  try {
    loading.value = true;
    error.value = null;

    // We'll use a limit to prevent loading too much data
    // This is a reasonable limit for client-side search
    const searchLimit = 500;

    // Build query with role-based filtering and a reasonable limit
    let levelsQuery = collection(db, 'levels');
    let constraints = [orderBy('number'), limit(searchLimit)];

    // Apply role-based access control
    if (!isAdmin.value) {
      constraints.push(where('createdBy', '==', auth.currentUser?.uid));
    }

    if (constraints.length > 0) {
      levelsQuery = query(levelsQuery, ...constraints);
    }

    // Get matching levels (with limit for performance)
    const querySnapshot = await getDocs(levelsQuery);

    // Process the levels
    allLevelsCache.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply search filter if needed
    if (searchTerm.value.trim()) {
      levels.value = filterLevelsBySearch(allLevelsCache.value, searchTerm.value.trim());
      filteredLevels.value = levels.value;
      totalCount.value = filteredLevels.value.length;
    } else {
      // No search - use direct page loading for initial view
      await loadPageDirect(currentPage.value);
    }

    // Save the actual total count
    if (!searchTerm.value.trim()) {
      // If not searching, get exact count from server
      await getTotalCount();
    }
  } catch (err) {
    console.error('Error loading all levels:', err);
    error.value = 'Failed to load levels';
  } finally {
    loading.value = false;
  }
}

// Helper function to get total count
async function getTotalCount() {
  try {
    // Only count if not searching
    if (searchTerm.value.trim()) {
      // For search, we'll set total count based on filtered results later
      return;
    }

    let countQuery = collection(db, 'levels');
    let constraints = [];

    // Apply role-based access control for counting
    if (!isAdmin.value) {
      constraints.push(where('createdBy', '==', auth.currentUser?.uid));
    }

    if (constraints.length > 0) {
      countQuery = query(countQuery, ...constraints);
    }

    const snapshot = await getCountFromServer(countQuery);
    totalCount.value = snapshot.data().count;
  } catch (err) {
    console.error('Error getting total count:', err);
    // Default to showing at least one page
    totalCount.value = itemsPerPage;
  }
}

// Main function to load levels (now uses direct page loading)
async function loadLevelsPaginated(countTotal = true) {
  try {
    loading.value = true;
    error.value = null;

    // Get count if requested
    if (countTotal) {
      await getTotalCount();
    }

    // Use the direct loading approach
    await loadPageDirect(currentPage.value);
  } catch (err) {
    console.error('Error fetching levels:', err);
    error.value = 'Failed to load levels';
  } finally {
    loading.value = false;
  }
}

// Clear search and reset page
function clearSearch() {
  searchTerm.value = '';
  currentPage.value = 1;
  firstVisible.value = null;
  lastVisible.value = null;
  loadLevelsPaginated();
}

onMounted(async () => {
  try {
    // Get current user info
    currentUser.value = auth.currentUser;

    if (currentUser.value) {
      // Get user role
      const userDoc = await getDoc(doc(db, 'users', currentUser.value.uid));
      if (userDoc.exists()) {
        userRole.value = userDoc.data().role || 'user';
      }
    }

    // Small timeout to ensure all reactivity is properly set up
    setTimeout(async () => {
      // Restore any saved state from localStorage
      const savedPage = restoreLevelListState();
      
      // Load all levels for search capability
      await loadAllLevels();

      // If we have a saved page, navigate to it
      if (savedPage > 1) {
        // Then navigate to the saved page
        if (savedPage <= totalPages.value) {
          await goToPage(savedPage);
        }
      }
    }, 0);
  } catch (err) {
    console.error('Error fetching levels:', err);
    error.value = 'Failed to load levels';
  } finally {
    loading.value = false;
  }
});

function confirmDelete(level) {
  levelToDelete.value = level;
  showDeleteModal.value = true;
}

async function deleteLevel() {
  if (!levelToDelete.value) return;

  try {
    loading.value = true;
    showDeleteModal.value = false;

    // Delete the level from Firestore
    const levelRef = doc(db, 'levels', levelToDelete.value.id);
    deleteDoc(levelRef);

    // Remove from local arrays
    levels.value = levels.value.filter(level => level.id !== levelToDelete.value.id);
    filteredLevels.value = filteredLevels.value.filter(level => level.id !== levelToDelete.value.id);
    
    // Decrease total count
    totalCount.value--;
  } catch (error) {
    console.error('Error deleting level:', error);
  } finally {
    loading.value = false;
  }
}

// Function to navigate to the edit page and save current state
function navigateToEdit(levelId) {
  // Save the current state before navigating
  saveLevelListState();
  router.push(`/admin/levels/${levelId}/edit`);
}

// Save the current state of the LevelList to localStorage
function saveLevelListState() {
  const stateToSave = {
    currentPage: currentPage.value,
    searchTerm: searchTerm.value
  };
  localStorage.setItem('levelListState', JSON.stringify(stateToSave));
}

// Restore the saved state of the LevelList from localStorage
function restoreLevelListState() {
  try {
    const savedState = localStorage.getItem('levelListState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      
      // Restore search term first
      searchTerm.value = parsedState.searchTerm || '';
      
      // Return the saved page to navigate to
      return parsedState.currentPage || 1;
    }
  } catch (error) {
    console.error('Error restoring level list state:', error);
  }
  return 1; // Default to page 1 if no saved state or error
}
</script>
