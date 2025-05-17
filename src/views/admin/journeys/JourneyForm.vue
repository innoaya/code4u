<template>
  <div class="admin-journey-form">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ isEditing ? 'Edit' : 'Create' }} Journey</h1>
      <router-link to="/admin/journeys" class="text-blue-600 hover:underline">
        Back to Journeys
      </router-link>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <form @submit.prevent="saveJourney">
        <!-- Basic Journey Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div class="space-y-6">
            <!-- ID -->
            <div>
              <label for="journey-id" class="block text-sm font-medium text-gray-700">Journey ID</label>
              <div class="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  name="journey-id"
                  id="journey-id"
                  v-model="journey.id"
                  :disabled="isEditing"
                  class="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                  :class="{ 'bg-gray-100': isEditing }"
                  placeholder="web-fundamentals"
                />
              </div>
              <p class="mt-1 text-sm text-gray-500">Unique identifier (e.g., web-fundamentals, css-mastery)</p>
            </div>

            <!-- Title -->
            <div>
              <label for="journey-title" class="block text-sm font-medium text-gray-700">Title</label>
              <div class="mt-1">
                <input
                  type="text"
                  name="journey-title"
                  id="journey-title"
                  v-model="journey.title"
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Web Development Fundamentals"
                />
              </div>
            </div>

            <!-- Description -->
            <div>
              <label for="journey-description" class="block text-sm font-medium text-gray-700">Description</label>
              <div class="mt-1">
                <textarea
                  name="journey-description"
                  id="journey-description"
                  v-model="journey.description"
                  rows="3"
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Learn the basics of HTML, CSS, and JavaScript to build simple websites"
                ></textarea>
              </div>
            </div>

            <!-- Icon -->
            <div>
              <label for="journey-icon" class="block text-sm font-medium text-gray-700">Icon (Emoji)</label>
              <div class="mt-1">
                <input
                  type="text"
                  name="journey-icon"
                  id="journey-icon"
                  v-model="journey.icon"
                  maxlength="2"
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="🌐"
                />
              </div>
              <p class="mt-1 text-sm text-gray-500">Use a single emoji character</p>
            </div>
          </div>

          <div class="space-y-6">
            <!-- Difficulty -->
            <div>
              <label for="journey-difficulty" class="block text-sm font-medium text-gray-700">Difficulty</label>
              <select
                id="journey-difficulty"
                name="journey-difficulty"
                v-model="journey.difficulty"
                class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <!-- Estimated Hours -->
            <div>
              <label for="journey-hours" class="block text-sm font-medium text-gray-700">Estimated Hours</label>
              <div class="mt-1">
                <input
                  type="number"
                  name="journey-hours"
                  id="journey-hours"
                  v-model="journey.estimatedHours"
                  min="1"
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="15"
                />
              </div>
            </div>

            <!-- Badge ID -->
            <div>
              <label for="journey-badge" class="block text-sm font-medium text-gray-700">Badge ID</label>
              <div class="mt-1">
                <select
                  id="journey-badge"
                  name="journey-badge"
                  v-model="journey.badgeId"
                  class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="" disabled>Select a badge</option>
                  <option v-for="badge in badges" :key="badge.id" :value="badge.id">
                    {{ badge.icon }} {{ badge.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Display Order -->
            <div>
              <label for="journey-order" class="block text-sm font-medium text-gray-700">Display Order</label>
              <div class="mt-1">
                <input
                  type="number"
                  name="journey-order"
                  id="journey-order"
                  v-model="journey.order"
                  min="1"
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="1"
                />
              </div>
              <p class="mt-1 text-sm text-gray-500">Lower numbers appear first</p>
            </div>
          </div>
        </div>

        <!-- Categories and Tags -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <!-- Categories -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Categories</label>
            <div class="flex flex-wrap gap-2">
              <div 
                v-for="category in availableCategories" 
                :key="category"
                @click="toggleCategory(category)"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer"
                :class="journey.categories?.includes(category) ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'"
              >
                {{ category }}
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div>
            <label for="journey-tags" class="block text-sm font-medium text-gray-700">Tags</label>
            <div class="mt-1">
              <input
                type="text"
                name="journey-tags"
                id="journey-tags"
                v-model="tagsInput"
                class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="beginner, fundamentals, web"
              />
            </div>
            <p class="mt-1 text-sm text-gray-500">Comma-separated tags</p>
          </div>
        </div>

        <!-- Featured Journey -->
        <div class="mb-6">
          <div class="flex items-center">
            <input
              id="journey-featured"
              name="journey-featured"
              type="checkbox"
              v-model="journey.featured"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="journey-featured" class="ml-2 block text-sm text-gray-900">
              Featured Journey (shown prominently on homepage)
            </label>
          </div>
        </div>

        <!-- Levels Section -->
        <div class="mb-8">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Journey Levels</h2>
          
          <div v-if="loadingLevels" class="text-center py-4">
            <p class="text-gray-600">Loading levels...</p>
          </div>
          
          <div v-else>
            <!-- Selected Levels -->
            <div class="bg-gray-50 p-4 rounded-md mb-4">
              <h3 class="text-sm font-medium text-gray-700 mb-2">Selected Levels</h3>
              
              <div v-if="!selectedLevels.length" class="text-sm text-gray-500 italic">
                No levels selected. Select levels from the available levels below.
              </div>
              
              <div v-else class="space-y-2">
                <div
                  v-for="level in selectedLevels"
                  :key="level.id"
                  class="flex items-center justify-between bg-white p-3 rounded border border-gray-200"
                >
                  <div>
                    <span class="font-medium">{{ level.title }}</span>
                    <span class="text-xs text-gray-500 ml-2">({{ level.category }})</span>
                  </div>
                  <button 
                    type="button" 
                    @click="removeLevel(level.id)"
                    class="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Available Levels -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-2">Available Levels</h3>
              
              <div class="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                <div
                  v-for="level in availableLevels"
                  :key="level.id"
                  class="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0"
                >
                  <div>
                    <span class="font-medium">{{ level.title }}</span>
                    <div class="text-xs text-gray-500">
                      {{ level.category }} · Level {{ level.number }} · {{ level.difficulty }}
                    </div>
                  </div>
                  <button 
                    type="button" 
                    @click="addLevel(level)"
                    class="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3 pt-5 border-t border-gray-200">
          <router-link
            to="/admin/journeys"
            class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </router-link>
          <button
            type="submit"
            :disabled="isSaving"
            class="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {{ isSaving ? 'Saving...' : 'Save Journey' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db } from '@/firebase';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';

const route = useRoute();
const router = useRouter();
const journeyId = computed(() => route.params.id);
const isEditing = computed(() => route.path.includes('/edit'));

// Form data
const journey = ref({
  id: '',
  title: '',
  description: '',
  icon: '🌐',
  difficulty: 'Beginner',
  estimatedHours: 15,
  levelIds: [],
  prerequisites: [],
  badgeId: '',
  categories: [],
  tags: [],
  featured: false,
  order: 1
});

const availableCategories = ['HTML', 'CSS', 'JavaScript', 'Web Design', 'Projects'];
const tagsInput = ref('');
const badges = ref([]);
const allLevels = ref([]);
const loadingLevels = ref(true);
const isSaving = ref(false);
const error = ref(null);

// Computed properties for level management
const selectedLevels = computed(() => {
  if (!journey.value.levelIds || !allLevels.value.length) return [];
  
  return journey.value.levelIds
    .map(id => allLevels.value.find(level => level.id === id))
    .filter(level => level) // Remove any undefined values
    .sort((a, b) => a.number - b.number);
});

const availableLevels = computed(() => {
  if (!allLevels.value.length) return [];
  
  return allLevels.value
    .filter(level => !journey.value.levelIds?.includes(level.id))
    .sort((a, b) => {
      // Sort by category first, then by level number
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.number - b.number;
    });
});

// Watch for changes to tagsInput and update journey.tags
watch(tagsInput, (newVal) => {
  journey.value.tags = newVal
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag);
});

// Load journey data if editing
onMounted(async () => {
  try {
    // Load badges
    const badgesSnapshot = await getDocs(collection(db, 'badges'));
    badges.value = badgesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Load levels
    const levelsSnapshot = await getDocs(collection(db, 'levels'));
    allLevels.value = levelsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // If editing, load the journey
    if (isEditing.value && journeyId.value) {
      const journeyDoc = await getDoc(doc(db, 'journeys', journeyId.value));
      
      if (journeyDoc.exists()) {
        const journeyData = journeyDoc.data();
        journey.value = { ...journeyData, id: journeyDoc.id };
        
        // Set tags input from array
        if (journeyData.tags && Array.isArray(journeyData.tags)) {
          tagsInput.value = journeyData.tags.join(', ');
        }
      } else {
        error.value = 'Journey not found';
      }
    }
  } catch (err) {
    console.error('Error loading data:', err);
    error.value = 'Failed to load data';
  } finally {
    loadingLevels.value = false;
  }
});

// Helper functions
function toggleCategory(category) {
  if (!journey.value.categories) {
    journey.value.categories = [];
  }
  
  if (journey.value.categories.includes(category)) {
    journey.value.categories = journey.value.categories.filter(c => c !== category);
  } else {
    journey.value.categories.push(category);
  }
}

function addLevel(level) {
  if (!journey.value.levelIds) {
    journey.value.levelIds = [];
  }
  
  if (!journey.value.levelIds.includes(level.id)) {
    journey.value.levelIds.push(level.id);
  }
}

function removeLevel(levelId) {
  journey.value.levelIds = journey.value.levelIds.filter(id => id !== levelId);
}

// Save journey
async function saveJourney() {
  if (!journey.value.title || !journey.value.id) {
    alert('Journey title and ID are required');
    return;
  }
  
  try {
    isSaving.value = true;
    
    // Ensure journey.id doesn't have spaces and is lowercase
    journey.value.id = journey.value.id.trim().toLowerCase().replace(/\s+/g, '-');
    
    // Process tags from the input field
    if (tagsInput.value) {
      journey.value.tags = tagsInput.value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
    }
    
    // Save to Firestore
    await setDoc(doc(db, 'journeys', journey.value.id), journey.value);
    
    // Navigate back to journey list
    router.push('/admin/journeys');
  } catch (err) {
    console.error('Error saving journey:', err);
    error.value = 'Failed to save journey';
  } finally {
    isSaving.value = false;
  }
}
</script>
