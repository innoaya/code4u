<template>
  <div class="admin-users">
    <!-- Breadcrumb Navigation -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">User Management</h1>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search -->
        <div class="md:col-span-1">
          <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
            <input
              v-model="searchTerm"
              type="text"
              id="search"
              class="py-2 px-3 border border-gray-300 pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md"
              placeholder="Search by name or email"
            />
          </div>
        </div>

        <!-- Role Filter -->
        <div>
          <label for="role-filter" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            v-model="selectedRole"
            id="role-filter"
            class="py-2 px-3 border border-gray-300 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option v-for="option in roleOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <!-- Status Filter -->
        <div>
          <label for="status-filter" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="selectedStatus"
            id="status-filter"
            class="py-2 px-3 border border-gray-300 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="bg-white shadow rounded-lg p-6 flex justify-center">
      <div class="text-center">
        <p class="text-gray-500">Loading users...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-white shadow rounded-lg p-6">
      <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">Failed to load users: {{ error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtered Results Summary -->
    <div v-if="isFiltering && !isLoading && !error" class="mb-4 flex justify-between items-center">
      <div class="text-sm text-gray-600">
        <span v-if="filteredUsers.length === 0">No users match your filters</span>
        <span v-else>Found {{ filteredUsers.length }} matching users</span>
      </div>
      <button
        @click="clearFilters"
        class="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50"
      >
        Clear Filters
      </button>
    </div>

    <!-- Users List -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <!-- Users Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                User
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5 hidden md:table-cell">
                Email
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                Role
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5 hidden md:table-cell">
                Joined
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in (isFiltering ? filteredUsers : allUsers)" :key="user.uid" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ user.displayName || 'No Name' }}</div>
                    <div class="text-xs text-gray-500">{{ truncateUID(user.uid) }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                <div class="text-sm text-gray-900">{{ user.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-purple-100 text-purple-800': user.role === 'admin',
                    'bg-green-100 text-green-800': user.role === 'creator',
                    'bg-blue-100 text-blue-800': user.role === 'user' || !user.role
                  }"
                >
                  {{ getUserRoleLabel(user.role) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': !user.disabled,
                    'bg-red-100 text-red-800': user.disabled
                  }"
                >
                  {{ user.disabled ? 'Disabled' : 'Active' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="viewUserDetails(user.uid)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  View
                </button>
                <button
                  @click="toggleUserStatus(user)"
                  :class="{
                    'text-red-600 hover:text-red-900': !user.disabled,
                    'text-green-600 hover:text-green-900': user.disabled
                  }"
                >
                  {{ user.disabled ? 'Enable' : 'Disable' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div v-if="allUsers.length > 0" class="flex justify-center mt-6 space-x-2">
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
      <div class="text-center text-sm text-gray-500 py-3">
        Showing {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalCount) }} of {{ totalCount }} users
      </div>

      <!-- Empty State -->
      <div v-if="(isFiltering ? filteredUsers.length : allUsers.length) === 0" class="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No users found</h3>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '@/firebase';
import AdminBreadcrumbs from '@/components/AdminBreadcrumbs.vue'
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  getCountFromServer
} from 'firebase/firestore';

const router = useRouter();
const allUsers = ref([]);
const isLoading = ref(true);
const error = ref(null);
const totalCount = ref(0);

// Pagination variables
const currentPage = ref(1);
const itemsPerPage = 5;
const firstVisible = ref(null);
const lastVisible = ref(null);
const pageSnapshots = ref({});

// Search and filters
const searchTerm = ref('');
const selectedRole = ref('all');
const selectedStatus = ref('all');
// Client-side filtering variables
const allUsersCache = ref([]);

const isFiltering = computed(() => searchTerm.value.trim() !== '' || selectedRole.value !== 'all' || selectedStatus.value !== 'all');

// Filter options
const roleOptions = [
  { label: 'All Roles', value: 'all' },
  { label: 'Admin', value: 'admin' },
  { label: 'Creator', value: 'creator' },
  { label: 'User', value: 'user' }
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'disabled', label: 'Disabled' }
];

// Filtered users
const filteredUsers = computed(() => {
  if (!isFiltering.value) {
    return allUsers.value;
  }

  return allUsers.value.filter((user) => {
    // Status filter
    const statusMatch =
      selectedStatus.value === 'all' ||
      (selectedStatus.value === 'active' && !user.disabled) ||
      (selectedStatus.value === 'disabled' && user.disabled);

    // Role filter
    const roleMatch =
      selectedRole.value === 'all' ||
      (selectedRole.value === 'admin' && user.role === 'admin') ||
      (selectedRole.value === 'creator' && user.role === 'creator') ||
      (selectedRole.value === 'user' && (user.role === 'user' || !user.role));

    // Search term filter
    const searchLower = searchTerm.value.toLowerCase();
    const nameMatch = user.displayName && user.displayName.toLowerCase().includes(searchLower);
    const emailMatch = user.email && user.email.toLowerCase().includes(searchLower);
    const uidMatch = user.uid && user.uid.toLowerCase().includes(searchLower);

    return statusMatch && roleMatch && (nameMatch || emailMatch || uidMatch);
  });
});

// Total pages
const totalPages = computed(() => {
  return Math.ceil(totalCount.value / itemsPerPage);
});

// Reset pagination when filters change
watch([selectedRole, selectedStatus], () => {
  // Only trigger a reload if the component is already mounted
  // This prevents an infinite loop during initialization
  if (!isLoading.value) {
    currentPage.value = 1;
    firstVisible.value = null;
    lastVisible.value = null;
    // Use loadAllUsers as it handles both client and server-side filtering
    loadAllUsers();
  }
});

// Handle search term changes separately to use client-side filtering
watch(searchTerm, () => {
  // Only trigger a reload if the component is already mounted
  if (!isLoading.value) {
    currentPage.value = 1;
    firstVisible.value = null;
    lastVisible.value = null;

    // If we have cached data, use client-side filtering
    if (allUsersCache.value.length > 0) {
      if (searchTerm.value.trim() === '') {
        // If no search term, revert to paginated results
        fetchUsersPaginated();
      } else {
        // Filter cached users by search term
        allUsers.value = filterUsersBySearch(allUsersCache.value, searchTerm.value.trim());
        filteredUsers.value = allUsers.value;
        totalCount.value = filteredUsers.value.length;
      }
    } else {
      // If no cache yet, load all users
      loadAllUsers();
    }
  }
});

// Navigate to specific page - efficient direct approach
async function goToPage(page) {
  if (page === currentPage.value || page < 1 || page > totalPages.value || isLoading.value) {
    return;
  }

  isLoading.value = true;
  try {
    // Update current page immediately for UI
    currentPage.value = page;

    // If we have a snapshot for this page, use it from cache
    if (pageSnapshots.value[page]) {
      const cachedData = pageSnapshots.value[page];
      allUsers.value = cachedData.data;
      filteredUsers.value = isFiltering.value ?
        filterUsersBySearch(allUsers.value, searchTerm.value) :
        allUsers.value;
    } else {
      // Direct access to any page using an optimized query approach
      await loadPageDirect(page);
    }
  } catch (err) {
    console.error('Error navigating to page:', err);
    error.value = 'Failed to load page';
  } finally {
    isLoading.value = false;
  }
}

// Load next page
async function loadNextPage() {
  if (isLoading.value) return;
  const nextPage = currentPage.value + 1;

  // Don't go beyond total pages
  if (nextPage > totalPages.value) return;

  isLoading.value = true;
  try {
    // If we already have a snapshot for the next page, use it from cache
    if (pageSnapshots.value[nextPage]) {
      currentPage.value = nextPage;
      const cachedData = pageSnapshots.value[nextPage];
      allUsers.value = cachedData.data;
      filteredUsers.value = isFiltering.value ?
        filterUsersBySearch(allUsers.value, searchTerm.value) :
        allUsers.value;
    } else {
      // Direct approach to get the next page
      await loadPageDirect(nextPage);
    }
  } catch (err) {
    console.error('Error loading next page:', err);
    error.value = 'Failed to load next page';
  } finally {
    isLoading.value = false;
  }
}

// Load previous page
async function loadPreviousPage() {
  if (isLoading.value) return;
  const prevPage = currentPage.value - 1;

  // Don't go below page 1
  if (prevPage < 1) return;

  isLoading.value = true;
  try {
    // If we already have a snapshot for the previous page, use it from cache
    if (pageSnapshots.value[prevPage]) {
      currentPage.value = prevPage;
      const cachedData = pageSnapshots.value[prevPage];
      allUsers.value = cachedData.data;
      filteredUsers.value = isFiltering.value ?
        filterUsersBySearch(allUsers.value, searchTerm.value) :
        allUsers.value;
    } else {
      // Direct approach to get the previous page
      await loadPageDirect(prevPage);
    }
  } catch (err) {
    console.error('Error loading previous page:', err);
    error.value = 'Failed to load previous page';
  } finally {
    isLoading.value = false;
  }
}

// Build query based on current filters and pagination state
function buildQuery(page = 1) {
  let constraints = [
    orderBy('createdAt', 'desc')
  ];

  // Apply role-based filtering
  if (selectedRole.value !== 'all') {
    constraints.push(where('role', '==', selectedRole.value));
  }

  // Apply status filtering
  if (selectedStatus.value !== 'all') {
    const isEnabled = selectedStatus.value === 'active';
    constraints.push(where('isActive', '==', isEnabled));
  }

  // We'll handle search filtering client-side for better flexibility
  // No search constraints added to the server query

  // For single page requests, just apply simple limit
  if (page === 1) {
    constraints.push(limit(itemsPerPage));
  } else {
    // For other pages, we'll fetch all documents up to the end of requested page
    // The calling function will slice the results to get just the requested page
    constraints.push(limit(page * itemsPerPage));
  }

  return query(collection(db, 'users'), ...constraints);
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
      allUsers.value = [];
      filteredUsers.value = [];
      return;
    }

    // Extract data from first page
    const usersData = querySnapshot.docs.map(doc => ({
      uid: doc.id, // Add uid field for compatibility with existing code
      ...doc.data()
    }));

    // Update state
    allUsers.value = usersData;
    filteredUsers.value = isFiltering.value ?
      filterUsersBySearch(usersData, searchTerm.value) :
      usersData;

    // Cache page data
    pageSnapshots.value[1] = {
      data: [...usersData],
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
  const usersData = pageDocSlice.map(doc => ({
    id: doc.id,
    uid: doc.id, // Add uid field for compatibility with existing code
    ...doc.data()
  }));

  // Update state
  allUsers.value = usersData;
  filteredUsers.value = isFiltering.value ?
    filterUsersBySearch(usersData, searchTerm.value) :
    usersData;

  // Cache this page data
  pageSnapshots.value[page] = {
    data: [...usersData],
    timestamp: Date.now()
  };

  // Update state
  currentPage.value = page;

  // Cache adjacent pages too for smoother navigation (optimization)
  if (page > 1 && startIdx >= itemsPerPage) {
    const prevPageDocs = allDocs.slice(startIdx - itemsPerPage, startIdx);
    const prevPageData = prevPageDocs.map(doc => ({
      id: doc.id,
      uid: doc.id, // Add uid field for compatibility with existing code
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
      uid: doc.id, // Add uid field for compatibility with existing code
      ...doc.data()
    }));
    pageSnapshots.value[page + 1] = {
      data: [...nextPageData],
      timestamp: Date.now()
    };
  }
}

// Load all users for search capability
async function loadAllUsers() {
  try {
    isLoading.value = true;
    error.value = null;

    // We'll use a limit to prevent loading too much data
    // This is a reasonable limit for client-side search
    const searchLimit = 500;

    // Build query with filtering and a reasonable limit
    let usersQuery = collection(db, 'users');
    let constraints = [orderBy('createdAt', 'desc'), limit(searchLimit)];

    // Apply role filtering
    if (selectedRole.value !== 'all') {
      constraints.push(where('role', '==', selectedRole.value));
    }

    // Apply status filtering
    if (selectedStatus.value !== 'all') {
      const isEnabled = selectedStatus.value === 'active';
      constraints.push(where('isActive', '==', isEnabled));
    }

    if (constraints.length > 0) {
      usersQuery = query(usersQuery, ...constraints);
    }

    // Get matching users (with limit for performance)
    const querySnapshot = await getDocs(usersQuery);

    // Cache all users for filtering
    allUsersCache.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      uid: doc.id, // Add uid field for compatibility with existing code
      ...doc.data()
    }));

    // Apply search filter if needed
    if (searchTerm.value.trim()) {
      // Perform client-side filtering
      const filtered = filterUsersBySearch(allUsersCache.value, searchTerm.value.trim());
      allUsers.value = filtered.slice(0, itemsPerPage); // Just take first page worth
      filteredUsers.value = filtered;
      totalCount.value = filtered.length;

      // Since we only show first page, update pagination variables
      currentPage.value = 1;
    } else {
      // No search, but may still have role/status filters - use direct loading
      await loadPageDirect(currentPage.value);
    }

    // Save the actual total count if not searching
    if (!searchTerm.value.trim()) {
      await getTotalCount();
    }
  } catch (err) {
    console.error('Error loading all users:', err);
    error.value = 'Failed to load users';
  } finally {
    isLoading.value = false;
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

    let countQuery = collection(db, 'users');
    let constraints = [];

    // Apply role filtering
    if (selectedRole.value !== 'all') {
      constraints.push(where('role', '==', selectedRole.value));
    }

    // Apply status filtering
    if (selectedStatus.value !== 'all') {
      const isEnabled = selectedStatus.value === 'active';
      constraints.push(where('isActive', '==', isEnabled));
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

// Main function to load users (now uses direct page loading)
async function fetchUsersPaginated(countTotal = true) {
  try {
    isLoading.value = true;
    error.value = null;

    // Get count if requested
    if (countTotal) {
      await getTotalCount();
    }

    // Use the direct loading approach
    await loadPageDirect(currentPage.value);
  } catch (err) {
    console.error('Error fetching users:', err);
    error.value = 'Failed to load users';
  } finally {
    isLoading.value = false;
  }
}

// Filter users by search term (client-side)
function filterUsersBySearch(usersArray, searchText) {
  if (!searchText) {
    return usersArray; // Return all users if no search term
  }

  const searchLower = searchText.toLowerCase();

  // Filter users by email, displayName, or uid
  return usersArray.filter(user =>
    (user.email && user.email.toLowerCase().includes(searchLower)) ||
    (user.displayName && user.displayName.toLowerCase().includes(searchLower)) ||
    (user.uid && user.uid.includes(searchLower))
  );
}

// We've replaced fetchUsers with fetchUsersPaginated

// View user details
function viewUserDetails(userId) {
  // Save the current page state before navigating
  saveUserListState();
  router.push(`/admin/users/${userId}`);
}

// Save the current state of the UserList to localStorage
function saveUserListState() {
  const stateToSave = {
    currentPage: currentPage.value,
    selectedRole: selectedRole.value,
    selectedStatus: selectedStatus.value,
    searchTerm: searchTerm.value
  };
  localStorage.setItem('userListState', JSON.stringify(stateToSave));
}

// Restore the saved state of the UserList from localStorage
function restoreUserListState() {
  try {
    const savedState = localStorage.getItem('userListState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      
      // Restore filters first
      selectedRole.value = parsedState.selectedRole || 'all';
      selectedStatus.value = parsedState.selectedStatus || 'all';
      searchTerm.value = parsedState.searchTerm || '';
      
      // Return the saved page to navigate to
      return parsedState.currentPage || 1;
    }
  } catch (error) {
    console.error('Error restoring user list state:', error);
  }
  return 1; // Default to page 1 if no saved state or error
}


// Toggle user status (enable/disable)
async function toggleUserStatus(user) {
  try {
    const newStatus = !user.disabled;
    await updateDoc(doc(db, 'users', user.uid), {
      disabled: newStatus
    });

    // Update local state
    user.disabled = newStatus;
  } catch (err) {
    console.error('Error updating user status:', err);
    alert('Failed to update user status: ' + err.message);
  }
}

// Helper to format date
function formatDate(date) {
  if (!date) return 'Unknown';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

// Helper to truncate user ID
function truncateUID(uid) {
  if (!uid) return '';
  return uid.substring(0, 6) + '...' + uid.substring(uid.length - 4);
}

// Get user role label for display
function getUserRoleLabel(role) {
  switch (role) {
    case 'admin': return 'Admin';
    case 'creator': return 'Creator';
    default: return 'User';
  }
}

// No longer need the avatar-related functions since we removed the images

// Load users on mount - with a slight delay to ensure reactive setup is complete
onMounted(() => {
  // Small timeout to ensure all reactivity is properly set up
  setTimeout(async () => {
    // Restore any saved state from localStorage
    const savedPage = restoreUserListState();
    
    // If we have a saved page, use it
    if (savedPage > 1) {
      // First load all users to get the total count
      await loadAllUsers();
      
      // Then navigate to the saved page
      if (savedPage <= totalPages.value) {
        await goToPage(savedPage);
      }
    } else {
      // Otherwise just load the first page as usual
      await loadAllUsers();
    }
  }, 0);
});
</script>
