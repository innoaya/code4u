<template>
  <div class="admin-journeys">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Manage Learning Journeys</h1>
      <router-link to="/admin/journeys/new" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center">
        <span class="mr-1">+</span> Create New Journey
      </router-link>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <!-- Loading state -->
      <div v-if="loading" class="p-4 text-center">
        <p class="text-gray-600">Loading journeys...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="journeys.length === 0" class="p-8 text-center">
        <p class="text-gray-600 mb-4">No journeys have been created yet.</p>
        <router-link to="/admin/journeys/new" class="text-blue-600 underline">Create your first journey</router-link>
      </div>

      <!-- Journey list -->
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Icon
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Journey Title
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Difficulty
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categories
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              # of Levels
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Featured
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="journey in sortedJourneys" :key="journey.id">
            <td class="px-6 py-4 whitespace-nowrap text-2xl">
              {{ journey.icon || "🧩" }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="font-medium text-gray-900">{{ journey.title }}</div>
              <div class="text-sm text-gray-500 truncate max-w-xs">{{ journey.description }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ journey.difficulty }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="(category, idx) in journey.categories" 
                  :key="idx" 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ category }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ journey.levelIds?.length || 0 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span v-if="journey.featured" class="text-green-500">✓</span>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex space-x-3">
                <router-link :to="`/admin/journeys/${journey.id}/edit`" class="text-indigo-600 hover:text-indigo-900">
                  Edit
                </router-link>
                <button @click="confirmDelete(journey)" class="text-red-600 hover:text-red-900">
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
                <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Journey</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Are you sure you want to delete the journey "{{ journeyToDelete?.title }}"? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              @click="deleteJourney" 
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
import { useRouter } from 'vue-router';

const router = useRouter();
const journeys = ref([]);
const loading = ref(true);
const error = ref(null);
const showDeleteModal = ref(false);
const journeyToDelete = ref(null);

// Sort journeys by order property
const sortedJourneys = computed(() => {
  return [...journeys.value].sort((a, b) => (a.order || 999) - (b.order || 999));
});

onMounted(async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'journeys'));
    journeys.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (err) {
    console.error('Error fetching journeys:', err);
    error.value = 'Failed to load journeys';
  } finally {
    loading.value = false;
  }
});

function confirmDelete(journey) {
  journeyToDelete.value = journey;
  showDeleteModal.value = true;
}

async function deleteJourney() {
  if (!journeyToDelete.value) return;
  
  try {
    await deleteDoc(doc(db, 'journeys', journeyToDelete.value.id));
    journeys.value = journeys.value.filter(j => j.id !== journeyToDelete.value.id);
    showDeleteModal.value = false;
    journeyToDelete.value = null;
  } catch (err) {
    console.error('Error deleting journey:', err);
    error.value = 'Failed to delete journey';
  }
}
</script>
