<template>
  <div class="admin-badge-form">
    <!-- Breadcrumb Navigation -->
    <AdminBreadcrumbs
      :itemId="badgeId"
      :itemTitle="isEditing ? badge.name || 'Edit Badge' : 'New Badge'"
    />

    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ isEditing ? 'Edit' : 'Create' }} Badge</h1>
      <router-link to="/admin/badges" class="text-purple-600 hover:underline">
        Back to Badges
      </router-link>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <form @submit.prevent="saveBadge">
        <!-- Basic Badge Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div class="space-y-6">

            <!-- Name -->
            <div>
              <label for="badge-name" class="block text-sm font-medium text-gray-700">Name</label>
              <div class="mt-1">
                <input
                  type="text"
                  name="badge-name"
                  id="badge-name"
                  v-model="badge.name"
                  class="py-2 px-3 border border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm rounded-md"
                  placeholder="HTML Apprentice"
                />
              </div>
              <p class="mt-1 text-sm text-gray-500">Enter Your Badge Name</p>
            </div>

            <!-- ID -->
            <div>
              <label for="badge-id" class="block text-sm font-medium text-gray-700">Badge ID</label>
              <div class="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  name="badge-id"
                  id="badge-id"
                  v-model="badge.id"
                  :disabled="isEditing"
                  class="flex-1 py-2 px-3 border focus:ring-purple-500 focus:border-purple-500 block w-full min-w-0 rounded-md sm:text-sm"
                  :class="{
                    'border-gray-300 bg-gray-100': isEditing,
                    'border-gray-300': !idChecked && !isEditing,
                    'border-green-500 bg-green-50': idAvailable && idChecked && !isEditing,
                    'border-red-500 bg-red-50': !idAvailable && idChecked && !isEditing
                  }"
                  placeholder="html-apprentice"
                  @input="checkBadgeIdAvailability"
                />
              </div>
              <div v-if="!isEditing" class="mt-1 text-sm">
                <span v-if="!idChecked" class="text-gray-500">ID will be automatically generated from name if empty</span>
                <span v-else-if="idAvailable" class="text-green-600">✓ This ID is available</span>
                <span v-else class="text-red-600">✗ This ID is already taken</span>
              </div>
              <p v-else class="mt-1 text-sm text-gray-500">Unique identifier (e.g., html-apprentice, css-master)</p>
            </div>

            <!-- Description -->
            <div>
              <label for="badge-description" class="block text-sm font-medium text-gray-700">Description</label>
              <div class="mt-1">
                <textarea
                  name="badge-description"
                  id="badge-description"
                  v-model="badge.description"
                  rows="3"
                  class="py-2 px-3 border border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm rounded-md"
                  placeholder="Completed your first HTML page"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <!-- Icon -->
            <div>
              <label for="badge-icon" class="block text-sm font-medium text-gray-700">Icon (Emoji)</label>
              <div class="mt-1">
                <input
                  type="text"
                  name="badge-icon"
                  id="badge-icon"
                  v-model="badge.icon"
                  maxlength="2"
                  class="py-2 px-3 border border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm rounded-md"
                  placeholder="📄"
                />
              </div>
              <!-- <div class="mt-2 text-center">
                <span class="text-4xl">{{ badge.icon || '🏆' }}</span>
              </div> -->
              <p class="mt-1 text-sm text-gray-500">Use a single emoji character</p>
            </div>

            <!-- Category -->
            <div>
              <label for="badge-category" class="block text-sm font-medium text-gray-700">Category</label>
              <select
                id="badge-category"
                name="badge-category"
                v-model="badge.category"
                class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              >
                <option v-for="category in availableCategories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Requirements Section -->
        <div class="mb-8">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Badge Requirements</h2>

          <div v-if="loadingLevels" class="text-center py-4">
            <p class="text-gray-600">Loading levels...</p>
          </div>

          <div v-else>
            <!-- Selected Levels -->
            <div class="bg-gray-50 p-4 rounded-md mb-4">
              <h3 class="text-sm font-medium text-gray-700 mb-2">Required Levels</h3>

              <div v-if="!badge.requirements?.length" class="text-sm text-gray-500 italic">
                No levels selected. Badge will require special achievement logic or admin assignment.
              </div>

              <div v-else class="space-y-2">
                <div
                  v-for="levelId in badge.requirements"
                  :key="levelId"
                  class="flex items-center justify-between bg-white p-3 rounded border border-gray-200"
                >
                  <div>
                    <span class="font-medium">{{ getLevelName(levelId) || levelId }}</span>
                    <span class="text-xs text-gray-500 ml-2">({{ getLevelCategory(levelId) }})</span>
                  </div>
                  <button
                    type="button"
                    @click="removeRequirement(levelId)"
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
                    @click="addRequirement(level.id)"
                    class="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Badge Group Requirements -->
        <div class="mb-8">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Badge Group Requirements</h2>
          <p class="text-sm text-gray-600 mb-4">
            If this badge requires earning other badges (like a "Master" badge), select them below.
          </p>

          <div v-if="loadingBadges" class="text-center py-4">
            <p class="text-gray-600">Loading badges...</p>
          </div>

          <div v-else>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                v-for="otherBadge in otherBadges"
                :key="otherBadge.id"
                class="border rounded-md p-3 flex items-center"
                :class="{'border-purple-500 bg-purple-50': isRequiredBadge(otherBadge.id)}"
              >
                <div class="mr-3 text-2xl">{{ otherBadge.icon || '🏆' }}</div>
                <div class="flex-1">
                  <div class="font-medium">{{ otherBadge.name }}</div>
                  <div class="text-xs text-gray-500">{{ otherBadge.category }}</div>
                </div>
                <div>
                  <button
                    type="button"
                    @click="toggleRequiredBadge(otherBadge.id)"
                    class="px-2 py-1 text-sm rounded"
                    :class="isRequiredBadge(otherBadge.id) ?
                      'bg-purple-200 text-purple-800' :
                      'bg-gray-200 text-gray-800'"
                  >
                    {{ isRequiredBadge(otherBadge.id) ? 'Selected' : 'Select' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3 pt-5 border-t border-gray-200">
          <router-link
            to="/admin/badges"
            class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Cancel
          </router-link>
          <button
            type="submit"
            :disabled="isSaving"
            class="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            {{ isSaving ? 'Saving...' : 'Save Badge' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { auth, db } from '@/firebase';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import AdminBreadcrumbs from '@/components/AdminBreadcrumbs.vue';

const route = useRoute();
const router = useRouter();
const badgeId = computed(() => route.params.id);
const isEditing = computed(() => route.path.includes('/edit'));

// Form data
const badge = ref({
  id: '',
  name: '',
  description: '',
  icon: '🏆',
  category: 'HTML',
  requirements: [],
  createdBy: '',
  createdAt: new Date()
});

const allLevels = ref([]);
const allBadges = ref([]);
const loadingLevels = ref(true);
const loadingBadges = ref(true);
const isSaving = ref(false);
const error = ref(null);

// ID availability checking
const idChecked = ref(false);
const idAvailable = ref(true);
const existingBadgeIds = ref([]);

const availableCategories = ['HTML', 'CSS', 'JavaScript', 'Python', 'Special', 'Achievement'];

// Generate a badge ID from the name
function generateIdFromName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

// Check if badge ID is available
function checkBadgeIdAvailability() {
  if (!badge.value.id || isEditing.value) {
    idChecked.value = false;
    return;
  }

  idChecked.value = true;

  // Ensure ID is properly formatted
  badge.value.id = generateIdFromName(badge.value.id);

  // Check if ID exists in our loaded list
  idAvailable.value = !existingBadgeIds.value.includes(badge.value.id);
}

// Debounced function to update ID from name
let nameDebounceTimeout = null;
function updateIdFromNameDebounced(newName) {
  // Clear any existing timeout
  if (nameDebounceTimeout) {
    clearTimeout(nameDebounceTimeout);
  }

  // Set a new timeout to update the ID after 800ms
  nameDebounceTimeout = setTimeout(() => {
    // Only auto-generate if ID is empty or hasn't been manually edited
    if (!isEditing.value && (!badge.value.id || !idChecked.value)) {
      badge.value.id = generateIdFromName(newName);
      if (badge.value.id) {
        checkBadgeIdAvailability();
      }
    }
  }, 800); // 800ms debounce delay
}

// Watch for name changes to auto-generate ID with debouncing
watch(() => badge.value.name, (newName) => {
  updateIdFromNameDebounced(newName);
});

// Other badges (for selecting badge requirements)
const otherBadges = computed(() => {
  if (isEditing.value) {
    // When editing, exclude the current badge from the list
    return allBadges.value.filter(b => b.id !== badge.value.id);
  }
  return allBadges.value;
});

// Available levels (levels not already selected)
const availableLevels = computed(() => {
  return allLevels.value.filter(level => !badge.value.requirements?.includes(level.id))
    .sort((a, b) => {
      // Sort by category first, then by level number
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.number - b.number;
    });
});

// Load badge data if editing
onMounted(async () => {
  try {
    // Load levels
    const levelsSnapshot = await getDocs(collection(db, 'levels'));
    allLevels.value = levelsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    loadingLevels.value = false;

    // Load badges
    const badgesSnapshot = await getDocs(collection(db, 'badges'));

    // Extract all existing badge IDs for availability checking
    existingBadgeIds.value = badgesSnapshot.docs.map(doc => doc.id);

    allBadges.value = badgesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    loadingBadges.value = false;

    // If editing, load the badge
    if (isEditing.value && badgeId.value) {
      const badgeDoc = await getDoc(doc(db, 'badges', badgeId.value));

      if (badgeDoc.exists()) {
        const badgeData = badgeDoc.data();
        badge.value = { ...badgeData, id: badgeDoc.id };

        // Initialize arrays if they don't exist
        if (!badge.value.requirements) badge.value.requirements = [];
      } else {
        error.value = 'Badge not found';
      }
    } else if (!isEditing.value && badge.value.name) {
      // For new badges with a name, generate ID suggestion
      badge.value.id = generateIdFromName(badge.value.name);
      checkBadgeIdAvailability();
    }
  } catch (err) {
    console.error('Error loading data:', err);
    error.value = 'Failed to load data';
  }
});

// Helper functions
function getLevelName(levelId) {
  const level = allLevels.value.find(level => level.id === levelId);
  return level ? level.title : levelId;
}

function getLevelCategory(levelId) {
  const level = allLevels.value.find(level => level.id === levelId);
  return level ? level.category : '';
}

function addRequirement(levelId) {
  if (!badge.value.requirements) {
    badge.value.requirements = [];
  }

  if (!badge.value.requirements.includes(levelId)) {
    badge.value.requirements.push(levelId);
  }
}

function removeRequirement(levelId) {
  badge.value.requirements = badge.value.requirements.filter(id => id !== levelId);
}

function isRequiredBadge(badgeId) {
  if (!badge.value.requiredBadges) return false;
  return badge.value.requiredBadges.includes(badgeId);
}

function toggleRequiredBadge(badgeId) {
  if (!badge.value.requiredBadges) {
    badge.value.requiredBadges = [];
  }

  if (isRequiredBadge(badgeId)) {
    badge.value.requiredBadges = badge.value.requiredBadges.filter(id => id !== badgeId);
  } else {
    badge.value.requiredBadges.push(badgeId);
  }
}

// Save badge
async function saveBadge() {
  if (!badge.value.name || !badge.value.id) {
    alert('Badge name and ID are required');
    return;
  }

  try {
    isSaving.value = true;

    // Ensure badge ID is properly formatted
    badge.value.id = badge.value.id.trim().toLowerCase().replace(/\s+/g, '-');

    // Set creator information if creating new badge
    if (!isEditing.value) {
      badge.value.createdBy = auth.currentUser?.uid || '';
      badge.value.createdAt = new Date();
    }

    // Save to Firestore
    await setDoc(doc(db, 'badges', badge.value.id), badge.value);

    // Navigate back to badge list
    router.push('/admin/badges');
  } catch (err) {
    console.error('Error saving badge:', err);
    error.value = 'Failed to save badge';
  } finally {
    isSaving.value = false;
  }
}
</script>
