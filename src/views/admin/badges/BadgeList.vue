<template>
  <div class="admin-badges">
    <!-- Breadcrumb Navigation -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Badges</h1>
      <router-link to="/admin/badges/new" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center">
        <span class="mr-1">+</span> Create New Badge
      </router-link>
    </div>

    <!-- Search & Filter -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="Search badge name, category, ID..."
              class="block w-full pl-10 sm:text-sm py-2 px-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
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
      <div v-if="searchTerm" class="mt-4 flex justify-between text-sm text-gray-600">
        <div>
          <span v-if="totalCount === 0">No badges match your search</span>
          <span v-else>Found {{ totalCount }} matching badges</span>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <!-- Loading state -->
      <div v-if="loading" class="p-4 text-center">
        <p class="text-gray-600">Loading badges...</p>
      </div>

      <!-- Empty state - no badges or no search results -->
      <div v-else-if="totalCount === 0" class="p-8 text-center">
        <p v-if="searchTerm" class="text-gray-600 mb-4">No badges match your search term "{{ searchTerm }}".</p>
        <p v-else class="text-gray-600 mb-4">No badges have been created yet.</p>
        <button v-if="searchTerm" @click="searchTerm = ''" class="text-purple-600 underline mr-4">Clear search</button>
        <router-link to="/admin/badges/new" class="text-purple-600 underline">Create your first badge</router-link>
      </div>

      <!-- Badge list -->
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Icon
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Badge Name
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Requirements
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="badge in filteredBadges" :key="badge.id">
            <td class="px-6 py-4 whitespace-nowrap text-2xl">
              {{ badge.icon || "🏆" }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="font-medium text-gray-900">{{ badge.name }}</div>
              <div class="text-sm text-gray-500 truncate max-w-xs">{{ badge.description }}</div>
              <div class="text-xs text-gray-400">ID: {{ badge.id }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="{
                  'bg-green-100 text-green-800': badge.category === 'HTML',
                  'bg-blue-100 text-blue-800': badge.category === 'CSS',
                  'bg-yellow-100 text-yellow-800': badge.category === 'JavaScript',
                  'bg-purple-100 text-purple-800': badge.category === 'Special' || badge.category === 'Achievement'
                }">
                {{ badge.category }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div v-if="badge.requirements && badge.requirements.length > 0">
                <div class="text-xs text-gray-500 mb-1">Required levels:</div>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="(req, idx) in badge.requirements"
                    :key="idx"
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {{ getLevelName(req) || req }}
                  </span>
                </div>
              </div>
              <div v-else class="text-xs text-gray-400 italic">
                No specific requirements
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex space-x-3">
                <button 
                  @click="navigateToEdit(badge.id)" 
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  Edit
                </button>
                <button @click="confirmDelete(badge)" class="text-red-600 hover:text-red-900">
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Controls -->
      <div v-if="filteredBadges.length > 0" class="flex justify-center mt-6 space-x-2">
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

      <!-- Page information -->
      <div v-if="badges.length > 0" class="text-center text-sm text-gray-500 mt-2 mb-6">
        Showing {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalCount) }} of {{ totalCount }} badges
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
                <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Badge</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Are you sure you want to delete the badge "{{ badgeToDelete?.name }}"? This action cannot be undone.
                  </p>
                  <p class="text-sm text-red-500 mt-2 font-medium">
                    Warning: This may affect users who have earned this badge!
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="deleteBadge"
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
import AdminBreadcrumbs from '@/components/AdminBreadcrumbs.vue';

const router = useRouter();
const badges = ref([]);
const levels = ref([]);
const loading = ref(true);
const error = ref(null);
const showDeleteModal = ref(false);
const badgeToDelete = ref(null);
const currentUser = ref(null);
const userRole = ref('user');
const totalCount = ref(0);

// Pagination variables
const currentPage = ref(1);
const itemsPerPage = 5;
const searchTerm = ref('');
const firstVisible = ref(null);
const lastVisible = ref(null);
const pageSnapshots = ref({});

// Computed property for total pages
const totalPages = computed(() => {
  return Math.ceil(totalCount.value / itemsPerPage);
});

// Reset pagination when search term changes
watch(searchTerm, () => {
  currentPage.value = 1;
  firstVisible.value = null;
  lastVisible.value = null;
  loadBadgesPaginated();
});

// Reset page and load badges
function clearFilters() {
  searchTerm.value = '';
  currentPage.value = 1;
  firstVisible.value = null;
  lastVisible.value = null;

  // Reset to show all badges (paginated)
  loadBadgesPaginated();

  // Make sure filteredBadges is reset too
  filteredBadges.value = badges.value;
}

// Navigate to specific page - efficient direct approach
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
      badges.value = cachedData.data;
      filteredBadges.value = searchTerm.value.trim() ?
        filterBadgesBySearch(badges.value, searchTerm.value) :
        badges.value;
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

// Load next page
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
      badges.value = cachedData.data;
      filteredBadges.value = searchTerm.value.trim() ?
        filterBadgesBySearch(badges.value, searchTerm.value) :
        badges.value;
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

// Load previous page
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
      badges.value = cachedData.data;
      filteredBadges.value = searchTerm.value.trim() ?
        filterBadgesBySearch(badges.value, searchTerm.value) :
        badges.value;
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

// Build query based on current filters and pagination state - respecting role-based access
function buildQuery(page = 1) {
  let constraints = [
    // Return to original sort order that was working
    orderBy('category'),
    orderBy('name')
  ];

  // Apply role-based filtering
  if (userRole.value === 'creator') {
    // Creator only sees their own badges
    constraints.push(where('createdBy', '==', auth.currentUser?.uid));
  }
  // Admin sees all badges (no additional constraint needed)

  // For single page requests, just apply simple limit
  if (page === 1) {
    constraints.push(limit(itemsPerPage));
  } else {
    // For other pages, we'll fetch all documents up to the end of requested page
    // The calling function will slice the results to get just the requested page
    constraints.push(limit(page * itemsPerPage));
  }

  return query(collection(db, 'badges'), ...constraints);
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
      badges.value = [];
      filteredBadges.value = [];
      return;
    }

    // Extract data from first page with consistent property structure
    const badgesData = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        description: data.description || '',
        category: data.category || 'Uncategorized',
        imageUrl: data.imageUrl || '',
        levelId: data.levelId || null,
        isPublic: data.isPublic !== false, // Default to true if not specified
        createdBy: data.createdBy || '',
        createdAt: data.createdAt || new Date(),
        ...data
      };
    });

    // Update state
    badges.value = badgesData;
    filteredBadges.value = searchTerm.value.trim() ?
      filterBadgesBySearch(badgesData, searchTerm.value) :
      badgesData;

    // Cache page data
    pageSnapshots.value[1] = {
      data: [...badgesData],
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

  // Extract data for just this page with consistent property structure
  const badgesData = pageDocSlice.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || '',
      description: data.description || '',
      category: data.category || 'Uncategorized',
      imageUrl: data.imageUrl || '',
      levelId: data.levelId || null,
      isPublic: data.isPublic !== false, // Default to true if not specified
      createdBy: data.createdBy || '',
      createdAt: data.createdAt || new Date(),
      ...data
    };
  });

  // Update state
  badges.value = badgesData;
  filteredBadges.value = searchTerm.value.trim() ?
    filterBadgesBySearch(badgesData, searchTerm.value) :
    badgesData;

  // Cache this page data
  pageSnapshots.value[page] = {
    data: [...badgesData],
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
      const savedPage = restoreBadgeListState();
      
      // First load all badges for search functionality
      await loadAllBadges();

      // Fetch levels to get their names
      const levelsSnapshot = await getDocs(collection(db, 'levels'));
      levels.value = levelsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // If we have a saved page, navigate to it
      if (savedPage > 1) {
        // Then navigate to the saved page
        if (savedPage <= totalPages.value) {
          await goToPage(savedPage);
        }
      }
    }, 0);
  } catch (error) {
    console.error("Error loading badges:", error);
    error.value = 'Error loading badge data';
  } finally {
    loading.value = false;
  }
});

// We'll implement a hybrid approach with client-side search and server-side pagination
// Client-side filtered badges for search
const filteredBadges = ref([]);
const allBadgesCache = ref([]);

// Apply client-side search filter (used directly with badges array)
function filterBadgesBySearch(badgesArray, searchText) {
  if (!searchText) {
    return badgesArray; // Return all badges if no search term
  }

  const searchLower = searchText.toLowerCase();

  // Filter the loaded badges - only use name field for now as requested
  return badgesArray.filter(badge =>
    badge.name && badge.name.toLowerCase().includes(searchLower)
  );
}

// Watch for search term changes to apply filtering
watch(searchTerm, () => {
  // Reset pagination when search changes
  currentPage.value = 1;
  firstVisible.value = null;
  lastVisible.value = null;

  // If we have existing data in the cache, we can search it client-side
  if (allBadgesCache.value.length > 0) {
    if (searchTerm.value.trim() === '') {
      // If no search term, show regular paginated results
      loadBadgesPaginated();
    } else {
      // Apply search to the complete cache using our filter function
      badges.value = filterBadgesBySearch(allBadgesCache.value, searchTerm.value.trim());

      // Update display
      filteredBadges.value = badges.value;
      totalCount.value = filteredBadges.value.length;
    }
  } else {
    // Otherwise, reload all badges and then filter
    loadAllBadges();
  }
});

// Fetch all badges once for search capabilities (with role-based filtering)
async function loadAllBadges() {
  try {
    loading.value = true;
    error.value = null;

    // Build query with role-filtering but no pagination
    let badgesQuery = collection(db, 'badges');

    // Apply role-based filtering
    if (userRole.value === 'creator') {
      badgesQuery = query(badgesQuery, where('createdBy', '==', auth.currentUser?.uid));
    }

    // Get all matching badges
    const querySnapshot = await getDocs(badgesQuery);

    // Process the badges with consistent property structure
    allBadgesCache.value = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        description: data.description || '',
        category: data.category || 'Uncategorized',
        imageUrl: data.imageUrl || '',
        levelId: data.levelId || null,
        isPublic: data.isPublic !== false, // Default to true if not specified
        createdBy: data.createdBy || '',
        createdAt: data.createdAt || new Date(),
        ...data
      };
    });

    // Apply search filter if needed
    const searchLower = searchTerm.value.trim().toLowerCase();
    if (searchLower) {
      // Only search by name as requested
      badges.value = allBadgesCache.value.filter(badge =>
        badge.name && badge.name.toLowerCase().includes(searchLower)
      );

      // Make sure filtered badges are updated
      filteredBadges.value = badges.value;

      // Update the counter to match the filtered results
      totalCount.value = filteredBadges.value.length;
    } else {
      // No search - use paginated results from server
      await loadBadgesPaginated();
    }
  } catch (err) {
    console.error('Error loading all badges:', err);
    error.value = 'Error loading badge data';
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

    let countQuery = collection(db, 'badges');
    let constraints = [];

    // Apply role-based filtering for count
    if (userRole.value === 'creator') {
      constraints.push(where('createdBy', '==', auth.currentUser?.uid));
    }
    // Admin sees all badges (no additional constraint needed)

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

// Main function to load badges (now uses direct page loading)
async function loadBadgesPaginated(countTotal = true) {
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
    console.error('Error fetching badges:', err);
    error.value = 'Failed to load badges';
  } finally {
    loading.value = false;
  }
};

// Get level name from level ID
function getLevelName(levelId) {
  const level = levels.value.find(level => level.id === levelId);
  return level ? level.title : null;
}

function confirmDelete(badge) {
  badgeToDelete.value = badge;
  showDeleteModal.value = true;
}

async function deleteBadge() {
  if (!badgeToDelete.value) return;

  try {
    await deleteDoc(doc(db, 'badges', badgeToDelete.value.id));
    badges.value = badges.value.filter(b => b.id !== badgeToDelete.value.id);
    showDeleteModal.value = false;
    badgeToDelete.value = null;

    // Note: In a production app, you would also:
    // 1. Check for users who have this badge and handle appropriately
    // 2. Check for journeys that reference this badge
    // 3. Create an admin log of the deletion
  } catch (err) {
    console.error('Error deleting badge:', err);
    error.value = 'Failed to delete badge';
  }
}

// Function to navigate to the edit page and save current state
function navigateToEdit(badgeId) {
  // Save the current state before navigating
  saveBadgeListState();
  router.push(`/admin/badges/${badgeId}/edit`);
}

// Save the current state of the BadgeList to localStorage
function saveBadgeListState() {
  const stateToSave = {
    currentPage: currentPage.value,
    searchTerm: searchTerm.value
  };
  localStorage.setItem('badgeListState', JSON.stringify(stateToSave));
}

// Restore the saved state of the BadgeList from localStorage
function restoreBadgeListState() {
  try {
    const savedState = localStorage.getItem('badgeListState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      
      // Restore search term first
      searchTerm.value = parsedState.searchTerm || '';
      
      // Return the saved page to navigate to
      return parsedState.currentPage || 1;
    }
  } catch (error) {
    console.error('Error restoring badge list state:', error);
  }
  return 1; // Default to page 1 if no saved state or error
}
</script>
