<template>
  <div class="admin-journey-form">
    <!-- Breadcrumb Navigation -->
    <AdminBreadcrumbs
      :itemId="journeyId"
      :itemTitle="isEditing ? journey.title || 'Edit Journey' : 'New Journey'"
    />

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
            <!-- Title -->
            <div>
              <label for="journey-title" class="block text-sm font-medium text-gray-700">Title</label>
              <div class="mt-1">
                <input
                  type="text"
                  name="journey-title"
                  id="journey-title"
                  v-model="journey.title"
                  class="py-2 px-3 border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md"
                  placeholder="Web Development Fundamentals"
                />
              </div>
            </div>

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
                  class="flex-1 py-2 px-3 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-md sm:text-sm"
                  placeholder="web-fundamentals"
                  @input="checkJourneyIdAvailability"
                />
              </div>
              <p v-if="!isEditing" class="mt-1 text-sm">
                <span v-if="!idChecked" class="text-gray-500">ID will be automatically generated from title if empty</span>
                <span v-else-if="idAvailable" class="text-green-600">✓ This ID is available</span>
                <span v-else class="text-red-600">✗ This ID is already taken</span>
              </p>
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
                  class="py-2 px-3 border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md"
                  placeholder="🌐"
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
                  rows="5"
                  class="py-2 px-3 border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md"
                  placeholder="Learn the basics of HTML, CSS, and JavaScript to build simple websites"
                ></textarea>
              </div>
            </div>

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

            <!-- Featured Toggle -->
            <div v-if="isAdmin">
              <label for="journey-featured" class="block text-sm font-medium text-gray-700 mb-2">Featured</label>
              <div class="flex items-center space-x-2">
                <div class="relative inline-block h-6 w-11">
                  <input
                    type="checkbox"
                    id="journey-featured"
                    v-model="journey.featured"
                    class="appearance-none h-6 w-11 rounded-full cursor-pointer bg-gray-300 checked:bg-blue-500 transition-colors duration-200 ease-in-out focus:outline-none focus:ring focus:ring-offset-2 focus:ring-blue-300"
                  />
                  <span
                    class="pointer-events-none absolute left-0 top-0 h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out"
                    :class="{ 'translate-x-5': journey.featured }"
                  ></span>
                </div>
                <span class="text-sm text-gray-500">{{ journey.featured ? 'This journey will be featured on the homepage' : 'This journey will not be featured' }}</span>
              </div>
            </div>

          </div>

          <div class="space-y-6">

            <!-- Published Toggle -->
            <div class="mt-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label for="journey-published" class="block text-sm font-medium text-gray-700 mb-2">Publishing Status</label>
              <div class="flex items-center space-x-2">
                <div class="relative inline-block h-6 w-11">
                  <input
                    type="checkbox"
                    id="journey-published"
                    v-model="journey.isPublished"
                    class="appearance-none h-6 w-11 rounded-full cursor-pointer bg-gray-300 checked:bg-green-500 transition-colors duration-200 ease-in-out focus:outline-none focus:ring focus:ring-offset-2 focus:ring-green-300"
                  />
                  <span
                    class="pointer-events-none absolute left-0 top-0 h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out"
                    :class="{ 'translate-x-5': journey.isPublished }"
                  ></span>
                </div>
                <span class="text-sm text-gray-500">{{ journey.isPublished ? 'This journey is published and visible to users' : 'This journey is unpublished and only visible to admins and creators' }}</span>
              </div>
              <p class="text-sm text-gray-500 mt-3">
                <span class="font-medium">Note for creators:</span> Instead of deleting content, you can toggle this switch to unpublish journeys temporarily. This keeps your content in the system while making it invisible to regular users.
              </p>
              <p class="text-sm text-blue-600 mt-1">
                Only administrators can permanently delete content. If you need to remove something permanently, please contact an admin.
              </p>
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
                  class="py-2 px-3 border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md"
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
                  <option value="">None</option>
                  <option v-for="badge in badges" :key="badge.id" :value="badge.id">
                    {{ badge.name }} ({{ badge.id }})
                  </option>
                </select>
              </div>
            </div>

            <!-- Order -->
            <div>
              <label for="journey-order" class="block text-sm font-medium text-gray-700">Display Order</label>
              <div class="mt-1">
                <input
                  type="number"
                  name="journey-order"
                  id="journey-order"
                  v-model="journey.order"
                  min="1"
                  class="py-2 px-3 border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md"
                  placeholder="1"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Categories Section -->
        <div class="mb-8">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Categories</label>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="category in availableCategories"
                :key="category"
                @click="toggleCategory(category)"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer"
                :class="journey.categories?.includes(category)
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 text-gray-800 border border-gray-300'"
              >
                {{ category }}
              </div>
            </div>
          </div>
        </div>

        <!-- Tags Section -->
        <div class="mb-8">
          <div>
            <label for="journey-tags" class="block text-sm font-medium text-gray-700">Tags</label>
            <div class="mt-1">
              <input
                type="text"
                name="journey-tags"
                id="journey-tags"
                v-model="tagsInput"
                class="py-2 px-3 border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md"
                placeholder="beginner, fundamentals, web"
              />
            </div>
            <p class="mt-1 text-sm text-gray-500">Comma-separated list of tags</p>
          </div>

          <!-- Tags Preview -->
          <div v-if="tagsInput" class="mt-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Tags Preview</label>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="(tag, idx) in tagsInput.split(',').map(t => t.trim()).filter(t => t)"
                :key="idx"
                class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
              >
                {{ tag }}
              </span>
            </div>
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

        <!-- JSON Editor Section -->
        <div class="mb-8 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium text-gray-900">JSON Editor</h2>
            <div>
              <button
                type="button"
                @click="showJsonEditor = !showJsonEditor"
                class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                {{ showJsonEditor ? 'Hide' : 'Show' }} JSON Editor
              </button>
            </div>
          </div>

          <div v-if="showJsonEditor" class="space-y-4">
            <div>
              <label for="json-editor" class="block text-sm font-medium text-gray-700 mb-1">
                Edit Journey JSON
              </label>
              <textarea
                id="json-editor"
                v-model="jsonContent"
                rows="10"
                class="py-2 px-3 border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md font-mono"
                placeholder='{"id": "web-dev", "title": "Web Development", ...}'
              ></textarea>
            </div>
            <div class="flex justify-end space-x-2">
              <button
                type="button"
                @click="updateJsonContent"
                class="px-3 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Update Form from JSON
              </button>
              <button
                type="button"
                @click="copyJsonToClipboard"
                class="px-3 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Copy JSON
              </button>
            </div>
            <div v-if="jsonError" class="text-red-600 text-sm mt-2">
              {{ jsonError }}
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
import AdminBreadcrumbs from '@/components/AdminBreadcrumbs.vue';
import { auth, db } from '@/firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { useUserStore } from '@/stores/userStore';

const route = useRoute();
const router = useRouter();
const journeyId = computed(() => route.params.id);
const isEditing = computed(() => route.path.includes('/edit'));

const userStore = useUserStore();
const userRole = computed(() => userStore.userRole);
const isAdmin = computed(() => userRole.value === 'admin');

// Journey data
const journey = ref({
  id: '',
  title: '',
  description: '',
  icon: '',
  imageUrl: '',
  videoUrl: '',
  categories: [],
  levelIds: [],
  difficulty: 'beginner',
  order: 0,
  tags: [],
  featured: false,
  isPublished: false,
  createdBy: '',
  createdAt: new Date()
});

const tagsInput = ref('');
const allLevels = ref([]);
const badges = ref([]);
const loadingLevels = ref(true);
const isSaving = ref(false);
const error = ref(null);

// ID availability checking
const idChecked = ref(false);
const idAvailable = ref(true);
const existingJourneyIds = ref([]);

// JSON Editor functionality
const showJsonEditor = ref(false);
const jsonContent = ref('');
const jsonError = ref('');

const availableCategories = ['HTML', 'CSS', 'JavaScript', 'Python'];

// Computed properties for level management
const selectedLevels = computed(() => {
  if (!journey.value.levelIds || !allLevels.value.length) return [];

  return journey.value.levelIds
    .map(id => allLevels.value.find(level => level.id === id))
    .filter(level => level) // Remove any undefined values
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

// Update JSON content whenever journey data changes
watch(journey, () => {
  try {
    jsonContent.value = JSON.stringify(journey.value, null, 2);
  } catch (err) {
    console.error('Error converting journey to JSON:', err);
  }
}, { deep: true });

// Function to update form data from JSON
function updateJsonContent() {
  try {
    const parsedJson = JSON.parse(jsonContent.value);

    // Validate required fields
    if (!parsedJson.id || !parsedJson.title) {
      jsonError.value = 'Journey must have at least id and title fields';
      return;
    }

    // Update the journey object
    journey.value = { ...journey.value, ...parsedJson };

    // Update tags input if tags array exists
    if (parsedJson.tags && Array.isArray(parsedJson.tags)) {
      tagsInput.value = parsedJson.tags.join(', ');
    }

    jsonError.value = '';
  } catch (err) {
    jsonError.value = 'Invalid JSON format: ' + err.message;
  }
}

// Function to copy JSON to clipboard
async function copyJsonToClipboard() {
  try {
    // Update JSON content with the latest journey data
    jsonContent.value = JSON.stringify(journey.value, null, 2);

    // Copy to clipboard
    await navigator.clipboard.writeText(jsonContent.value);

    // Show temporary success message
    const originalError = jsonError.value;
    jsonError.value = 'JSON copied to clipboard!';
    setTimeout(() => {
      jsonError.value = originalError;
    }, 2000);
  } catch (err) {
    jsonError.value = 'Failed to copy: ' + err.message;
  }
}

// Generate a journey ID from the title
function generateIdFromTitle(title) {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

// Check if journey ID is available
async function checkJourneyIdAvailability() {
  if (!journey.value.id || isEditing.value) {
    idChecked.value = false;
    return;
  }

  idChecked.value = true;
  
  // Ensure ID is properly formatted
  journey.value.id = generateIdFromTitle(journey.value.id);
  
  // Check if ID exists in our loaded list
  idAvailable.value = !existingJourneyIds.value.includes(journey.value.id);
}

// Debounced function to update ID from title
let titleDebounceTimeout = null;
function updateIdFromTitleDebounced(newTitle) {
  // Clear any existing timeout
  if (titleDebounceTimeout) {
    clearTimeout(titleDebounceTimeout);
  }
  
  // Set a new timeout to update the ID after 800ms
  titleDebounceTimeout = setTimeout(() => {
    // Only auto-generate if ID is empty or hasn't been manually edited
    if (!isEditing.value && (!journey.value.id || !idChecked.value)) {
      journey.value.id = generateIdFromTitle(newTitle);
      if (journey.value.id) {
        checkJourneyIdAvailability();
      }
    }
  }, 800); // 800ms debounce delay
}

// Watch for title changes to auto-generate ID with debouncing
watch(() => journey.value.title, (newTitle) => {
  updateIdFromTitleDebounced(newTitle);
});

// Load badges and levels on mount
onMounted(async () => {
  // Initialize JSON content
  jsonContent.value = JSON.stringify(journey.value, null, 2);

  try {
    // Load all existing journey IDs for availability checking
    const journeysSnapshot = await getDocs(collection(db, 'journeys'));
    existingJourneyIds.value = journeysSnapshot.docs.map(doc => doc.id);

    // If editing, load the journey
    if (isEditing.value && journeyId.value) {
      const journeyDoc = await getDoc(doc(db, 'journeys', journeyId.value));
      if (journeyDoc.exists()) {
        journey.value = journeyDoc.data();
        journey.value.id = journeyId.value; // Ensure ID is set
        // Process tags for the input field
        tagsInput.value = journey.value.tags ? journey.value.tags.join(', ') : '';
      } else {
        console.error('Journey not found');
        error.value = 'Journey not found';
      }
    } else if (!isEditing.value && journey.value.title) {
      // For new journeys with a title, generate ID suggestion
      journey.value.id = generateIdFromTitle(journey.value.title);
      checkJourneyIdAvailability();
    }

    // Load all levels
    loadingLevels.value = true;
    const levelsSnapshot = await getDocs(collection(db, 'levels'));
    const levelData = [];

    levelsSnapshot.forEach(doc => {
      const level = doc.data();
      level.id = doc.id;
      levelData.push(level);
    });

    allLevels.value = levelData;
    loadingLevels.value = false;

    // Load badges
    const badgesSnapshot = await getDocs(collection(db, 'badges'));
    const badgeData = [];

    badgesSnapshot.forEach(doc => {
      const badge = doc.data();
      badge.id = doc.id;
      badgeData.push(badge);
    });

    badges.value = badgeData;
  } catch (err) {
    console.error('Error loading journey data:', err);
    error.value = 'Error loading journey data';
  } finally {
    loadingLevels.value = false;
  }
});

// Category toggle
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

// Level management
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

    // Set creator information if creating new journey
    if (!isEditing.value) {
      journey.value.createdBy = auth.currentUser?.uid || '';
      journey.value.createdAt = new Date();
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
