<template>
  <div class="admin-badges">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Manage Achievement Badges</h1>
      <router-link to="/admin/badges/new" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center">
        <span class="mr-1">+</span> Create New Badge
      </router-link>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <!-- Loading state -->
      <div v-if="loading" class="p-4 text-center">
        <p class="text-gray-600">Loading badges...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="badges.length === 0" class="p-8 text-center">
        <p class="text-gray-600 mb-4">No badges have been created yet.</p>
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
          <tr v-for="badge in sortedBadges" :key="badge.id">
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
                <router-link :to="`/admin/badges/${badge.id}/edit`" class="text-indigo-600 hover:text-indigo-900">
                  Edit
                </router-link>
                <button @click="confirmDelete(badge)" class="text-red-600 hover:text-red-900">
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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
import { ref, computed, onMounted } from 'vue';
import { db } from '@/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
const badges = ref([]);
const levels = ref([]);
const loading = ref(true);
const error = ref(null);
const showDeleteModal = ref(false);
const badgeToDelete = ref(null);

// Sort badges by category
const sortedBadges = computed(() => {
  return [...badges.value].sort((a, b) => {
    // First sort by category
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    // Then sort by name
    return a.name.localeCompare(b.name);
  });
});

onMounted(async () => {
  try {
    // Fetch badges
    const badgesSnapshot = await getDocs(collection(db, 'badges'));
    badges.value = badgesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Fetch levels to map level IDs to names
    const levelsSnapshot = await getDocs(collection(db, 'levels'));
    levels.value = levelsSnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      ...doc.data()
    }));
  } catch (err) {
    console.error('Error fetching badges:', err);
    error.value = 'Failed to load badges';
  } finally {
    loading.value = false;
  }
});

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
</script>
