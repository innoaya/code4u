<template>
  <div class="admin-level-form">
    <!-- Breadcrumb Navigation -->
    <AdminBreadcrumbs 
      :itemId="levelId" 
      :itemTitle="isEditing ? level.title || 'Edit Level' : 'New Level'" 
    />
    
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ isEditing ? 'Edit' : 'Create' }} Level</h1>
      <router-link to="/admin/levels" class="text-blue-600 hover:underline">
        Back to Levels
      </router-link>
    </div>

    <div class="bg-white rounded-lg shadow">
      <form @submit.prevent="saveLevel">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-lg font-medium mb-4">Level Information</h2>

          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <!-- ID -->
            <div>
              <label for="level-id" class="block text-sm font-medium text-gray-700">Level ID</label>
              <div class="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  name="level-id"
                  id="level-id"
                  v-model="level.id"
                  :disabled="isEditing"
                  class="flex-1 py-2 px-3 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-md sm:text-sm"
                  :class="{ 'bg-gray-100': isEditing }"
                  placeholder="level-1"
                />
              </div>
              <p class="mt-1 text-sm text-gray-500">Unique identifier (e.g., level-1)</p>
            </div>

            <!-- Level Number -->
            <div>
              <label for="level-number" class="block text-sm font-medium text-gray-700">Level Number</label>
              <div class="mt-1">
                <input
                  type="number"
                  name="level-number"
                  id="level-number"
                  v-model="level.number"
                  min="1"
                  class="py-2 px-3 border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md"
                  placeholder="1"
                />
              </div>
              <p class="mt-1 text-sm text-gray-500">Sequential number for ordering</p>
            </div>

            <!-- Category -->
            <div>
              <label for="level-category" class="block text-sm font-medium text-gray-700">Category</label>
              <select
                id="level-category"
                name="level-category"
                v-model="level.category"
                class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option v-for="category in availableCategories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
          </div>

          <!-- Title and Description -->
          <div class="space-y-6 mb-6">
            <!-- Title -->
            <div>
              <label for="level-title" class="block text-sm font-medium text-gray-700">Title</label>
              <div class="mt-1">
                <input
                  type="text"
                  name="level-title"
                  id="level-title"
                  v-model="level.title"
                  class="py-2 px-3 border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md"
                  placeholder="HTML Fundamentals: Your First Web Page"
                />
              </div>
            </div>

            <!-- Description -->
            <div>
              <label for="level-description" class="block text-sm font-medium text-gray-700">Description</label>
              <div class="mt-1">
                <textarea
                  name="level-description"
                  id="level-description"
                  v-model="level.description"
                  rows="3"
                  class="py-2 px-3 border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md"
                  placeholder="Learn the basic building blocks of every website..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Level Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Difficulty -->
            <div>
              <label for="level-difficulty" class="block text-sm font-medium text-gray-700">Difficulty</label>
              <select
                id="level-difficulty"
                name="level-difficulty"
                v-model="level.difficulty"
                class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <!-- Points -->
            <div>
              <label for="level-points" class="block text-sm font-medium text-gray-700">Points to Earn</label>
              <div class="mt-1">
                <input
                  type="number"
                  name="level-points"
                  id="level-points"
                  v-model="level.pointsToEarn"
                  min="50"
                  step="50"
                  class="py-2 px-3 border shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="100"
                />
              </div>
            </div>

            <!-- Estimated Time -->
            <div>
              <label for="level-time" class="block text-sm font-medium text-gray-700">Estimated Time</label>
              <div class="mt-1">
                <input
                  type="text"
                  name="level-time"
                  id="level-time"
                  v-model="level.estimatedTime"
                  class="py-2 px-3 border shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="30 minutes"
                />
              </div>
            </div>

            <!-- Prerequisites -->
            <div>
              <label for="level-prerequisites" class="block text-sm font-medium text-gray-700">Prerequisites</label>
              <select
                id="level-prerequisites"
                multiple
                v-model="level.prerequisites"
                class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option v-for="availableLevel in availableLevels" :key="availableLevel.id" :value="availableLevel.title">
                  {{ availableLevel.title }}
                </option>
              </select>
              <p class="mt-1 text-sm text-gray-500">Hold ctrl/cmd to select multiple</p>
            </div>

            <!-- Published Toggle -->
            <div class="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
              <label for="level-published" class="block text-sm font-medium text-gray-700 mb-2">Publishing Status</label>
              <div class="flex items-center space-x-2">
                <div class="relative inline-block h-6 w-11">
                  <input
                    type="checkbox"
                    id="level-published"
                    v-model="level.isPublished"
                    class="appearance-none h-6 w-11 rounded-full cursor-pointer bg-gray-300 checked:bg-green-500 transition-colors duration-200 ease-in-out focus:outline-none focus:ring focus:ring-offset-2 focus:ring-green-300"
                  />
                  <span
                    class="pointer-events-none absolute left-0 top-0 h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out"
                    :class="{ 'translate-x-5': level.isPublished }"
                  ></span>
                </div>
                <span class="text-sm text-gray-500">{{ level.isPublished ? 'This level is published and visible to users' : 'This level is unpublished and only visible to admins and creators' }}</span>
              </div>
              <p class="text-sm text-gray-500 mt-3">
                <span class="font-medium">Note for creators:</span> Instead of deleting content, you can toggle this switch to unpublish levels temporarily. This keeps your content in the system while making it invisible to regular users.
              </p>
              <p class="text-sm text-blue-600 mt-1">
                Only administrators can permanently delete content. If you need to remove something permanently, please contact an admin.
              </p>
            </div>
          </div>
        </div>

        <!-- Learning Objectives and Applications -->
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-lg font-medium mb-4">Learning Content</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Learning Objectives -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Learning Objectives</label>
              <div class="space-y-2">
                <div v-for="(objective, index) in level.learningObjectives" :key="`objective-${index}`" class="flex">
                  <input
                    type="text"
                    v-model="level.learningObjectives[index]"
                    class="py-2 px-3 border shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Understand what HTML is and why it's important"
                  />
                  <button
                    type="button"
                    @click="removeObjective(index)"
                    class="ml-2 text-red-600"
                  >
                    ×
                  </button>
                </div>
                <button
                  type="button"
                  @click="addObjective"
                  class="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Learning Objective
                </button>
              </div>
            </div>

            <!-- Real World Applications -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Real World Applications</label>
              <div class="space-y-2">
                <div v-for="(application, index) in level.realWorldApplications" :key="`application-${index}`" class="flex">
                  <input
                    type="text"
                    v-model="level.realWorldApplications[index]"
                    class="py-2 px-3 border shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Creating your own personal web page"
                  />
                  <button
                    type="button"
                    @click="removeApplication(index)"
                    class="ml-2 text-red-600"
                  >
                    ×
                  </button>
                </div>
                <button
                  type="button"
                  @click="addApplication"
                  class="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Real World Application
                </button>
              </div>
            </div>
          </div>

          <!-- References -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">References</label>
            <div class="space-y-2">
              <div v-for="(reference, index) in level.references" :key="`reference-${index}`" class="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  v-model="level.references[index].title"
                  class="py-2 px-3 border shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-1/3 sm:text-sm border-gray-300 rounded-md"
                  placeholder="MDN Web Docs: HTML Basics"
                />
                <input
                  type="url"
                  v-model="level.references[index].url"
                  class="py-2 px-3 border shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-2/3 sm:text-sm border-gray-300 rounded-md"
                  placeholder="https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics"
                />
                <button
                  type="button"
                  @click="removeReference(index)"
                  class="sm:ml-2 text-red-600"
                >
                  ×
                </button>
              </div>
              <button
                type="button"
                @click="addReference"
                class="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Reference
              </button>
            </div>
          </div>

          <!-- Tags -->
          <div class="mt-6">
            <label for="level-tags" class="block text-sm font-medium text-gray-700">Tags</label>
            <div class="mt-1">
              <input
                type="text"
                name="level-tags"
                id="level-tags"
                v-model="tagsInput"
                class="py-2 px-3 border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md"
                placeholder="HTML, Web Basics, Document Structure"
              />
            </div>
            <p class="mt-1 text-sm text-gray-500">Comma-separated tags</p>
          </div>
        </div>

        <!-- Tasks -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium">Coding Tasks</h2>
            <button
              type="button"
              @click="addTask"
              class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-700 transition ease-in-out duration-150"
            >
              Add Task
            </button>
          </div>

          <!-- Empty state -->
          <div v-if="!level.tasks.length" class="bg-gray-50 rounded-md p-6 text-center">
            <p class="text-gray-500">No tasks added yet. Add your first task to get started.</p>
          </div>

          <!-- Task list -->
          <div v-else>
            <div v-for="(task, index) in level.tasks" :key="`task-${index}`" class="mb-6 border rounded-md p-4 bg-gray-50">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-md font-medium">Task {{ index + 1 }}: {{ task.title || 'Untitled Task' }}</h3>
                <button
                  type="button"
                  @click="removeTask(index)"
                  class="text-red-600 hover:text-red-800"
                >
                  Remove Task
                </button>
              </div>

              <!-- Task Fields -->
              <div class="space-y-4">
                <!-- Task Title and ID -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="md:col-span-2">
                    <label :for="`task-${index}-title`" class="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      :id="`task-${index}-title`"
                      type="text"
                      v-model="task.title"
                      class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Create the HTML boilerplate"
                    />
                  </div>
                  <div>
                    <label :for="`task-${index}-id`" class="block text-sm font-medium text-gray-700">Task ID</label>
                    <input
                      :id="`task-${index}-id`"
                      type="text"
                      v-model="task.id"
                      class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="task1"
                    />
                  </div>
                </div>

                <!-- Task Description -->
                <div>
                  <label :for="`task-${index}-description`" class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    :id="`task-${index}-description`"
                    v-model="task.description"
                    rows="3"
                    class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Every HTML page needs a special structure to work correctly..."
                  ></textarea>
                </div>

                <!-- Initial Code -->
                <div>
                  <label :for="`task-${index}-initial-code`" class="block text-sm font-medium text-gray-700">Initial Code</label>
                  <textarea
                    :id="`task-${index}-initial-code`"
                    v-model="task.initialCode"
                    rows="5"
                    class="mt-1 font-mono focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="<!-- Write your HTML code here -->\n<!-- Hint: Start with <!DOCTYPE html> -->"
                  ></textarea>
                </div>

                <!-- Solution, Output and Error Hint -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label :for="`task-${index}-solution`" class="block text-sm font-medium text-gray-700">Solution Pattern</label>
                    <input
                      :id="`task-${index}-solution`"
                      type="text"
                      v-model="task.solution"
                      class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="<html>"
                    />
                    <p class="mt-1 text-xs text-gray-500">Text pattern to look for in student's solution</p>
                  </div>
                  <div>
                    <label :for="`task-${index}-output`" class="block text-sm font-medium text-gray-700">Expected Output</label>
                    <input
                      :id="`task-${index}-output`"
                      type="text"
                      v-model="task.expectedOutput"
                      class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="HTML document structure created successfully!"
                    />
                  </div>
                  <div>
                    <label :for="`task-${index}-error`" class="block text-sm font-medium text-gray-700">Error Hint</label>
                    <input
                      :id="`task-${index}-error`"
                      type="text"
                      v-model="task.errorHint"
                      class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Your HTML structure is missing some essential elements."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="p-6 flex justify-end space-x-3">
          <router-link
            to="/admin/levels"
            class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </router-link>
          <button
            type="submit"
            :disabled="isSaving"
            class="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {{ isSaving ? 'Saving...' : 'Save Level' }}
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
import AdminBreadcrumbs from '@/components/AdminBreadcrumbs.vue';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';

const route = useRoute();
const router = useRouter();
const levelId = computed(() => route.params.id);
const isEditing = computed(() => route.path.includes('/edit'));

// Form data
const level = ref({
  id: '',
  number: 1,
  title: '',
  description: '',
  category: 'HTML',
  difficulty: 'Beginner',
  pointsToEarn: 100,
  estimatedTime: '30 minutes',
  prerequisites: [],
  learningObjectives: [''],
  realWorldApplications: [''],
  references: [{ title: '', url: '' }],
  tags: [],
  tasks: [],
  createdBy: '',
  createdAt: new Date(),
  isPublished: true // Default to published for new levels
});

const tagsInput = ref('');
const availableCategories = ['HTML', 'CSS', 'JavaScript', 'Python'];

const availableLevels = ref([]);
const isSaving = ref(false);
const error = ref(null);

// Watch for changes to tagsInput and update level.tags
watch(tagsInput, (newVal) => {
  level.value.tags = newVal
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag);
});

// Load level data if editing
onMounted(async () => {
  try {
    // Load available levels for prerequisites
    const levelsSnapshot = await getDocs(collection(db, 'levels'));
    availableLevels.value = levelsSnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      ...doc.data()
    }));

    // If editing, load the level
    if (isEditing.value && levelId.value) {
      const levelDoc = await getDoc(doc(db, 'levels', levelId.value));

      if (levelDoc.exists()) {
        const levelData = levelDoc.data();
        level.value = { ...levelData, id: levelDoc.id };

        // Initialize arrays if they don't exist
        if (!level.value.learningObjectives) level.value.learningObjectives = [''];
        if (!level.value.realWorldApplications) level.value.realWorldApplications = [''];
        if (!level.value.references) level.value.references = [{ title: '', url: '' }];
        if (!level.value.tasks) level.value.tasks = [];

        // Set tags input from array
        if (levelData.tags && Array.isArray(levelData.tags)) {
          tagsInput.value = levelData.tags.join(', ');
        }
      } else {
        error.value = 'Level not found';
      }
    } else {
      // Initialize empty arrays for new level
      level.value.learningObjectives = [''];
      level.value.realWorldApplications = [''];
      level.value.references = [{ title: '', url: '' }];
      level.value.tasks = [];
    }
  } catch (err) {
    console.error('Error loading data:', err);
    error.value = 'Failed to load data';
  }
});

// Helper functions for learning objectives
function addObjective() {
  level.value.learningObjectives.push('');
}

function removeObjective(index) {
  level.value.learningObjectives.splice(index, 1);
  // Ensure there's always at least one empty field
  if (level.value.learningObjectives.length === 0) {
    level.value.learningObjectives.push('');
  }
}

// Helper functions for real world applications
function addApplication() {
  level.value.realWorldApplications.push('');
}

function removeApplication(index) {
  level.value.realWorldApplications.splice(index, 1);
  // Ensure there's always at least one empty field
  if (level.value.realWorldApplications.length === 0) {
    level.value.realWorldApplications.push('');
  }
}

// Helper functions for references
function addReference() {
  level.value.references.push({ title: '', url: '' });
}

function removeReference(index) {
  level.value.references.splice(index, 1);
  // Ensure there's always at least one empty reference
  if (level.value.references.length === 0) {
    level.value.references.push({ title: '', url: '' });
  }
}

// Helper functions for tasks
function addTask() {
  level.value.tasks.push({
    id: `task${level.value.tasks.length + 1}`,
    title: '',
    description: '',
    initialCode: '',
    solution: '',
    expectedOutput: '',
    errorHint: ''
  });
}

function removeTask(index) {
  level.value.tasks.splice(index, 1);
  // Renumber task IDs if needed
  level.value.tasks.forEach((task, idx) => {
    if (task.id.startsWith('task')) {
      task.id = `task${idx + 1}`;
    }
  });
}

// Save level
async function saveLevel() {
  if (!level.value.title || !level.value.id) {
    alert('Level title and ID are required');
    return;
  }

  try {
    isSaving.value = true;

    // Ensure level.id is properly formatted
    level.value.id = level.value.id.trim().toLowerCase().replace(/\s+/g, '-');

    // Filter out empty strings from arrays
    level.value.learningObjectives = level.value.learningObjectives.filter(obj => obj.trim());
    level.value.realWorldApplications = level.value.realWorldApplications.filter(app => app.trim());
    level.value.references = level.value.references.filter(ref => ref.title.trim() || ref.url.trim());

    // Process tags from the input field
    if (tagsInput.value) {
      level.value.tags = tagsInput.value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
    }

    // Check if tasks have required fields
    level.value.tasks.forEach((task, index) => {
      if (!task.id) task.id = `task${index + 1}`;
      if (!task.title) task.title = `Task ${index + 1}`;
    });

    // Set creator information if creating new level
    if (!isEditing.value) {
      level.value.createdBy = auth.currentUser?.uid || '';
      level.value.createdAt = new Date();
    }

    // Save to Firestore
    await setDoc(doc(db, 'levels', level.value.id), level.value);

    // Navigate back to level list
    router.push('/admin/levels');
  } catch (err) {
    console.error('Error saving level:', err);
    error.value = 'Failed to save level';
  } finally {
    isSaving.value = false;
  }
}
</script>
