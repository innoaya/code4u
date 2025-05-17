<template>
  <div class="admin-user-form">
    <!-- Breadcrumb Navigation -->
    <AdminBreadcrumbs 
      :itemId="userId" 
      :itemTitle="isEditing ? user.displayName || 'Edit User' : 'New User'" 
    />
    
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ isEditing ? 'Edit' : 'Create' }} User</h1>
      <router-link to="/admin/users" class="text-blue-600 hover:underline">
        Back to Users
      </router-link>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <form @submit.prevent="saveUser">
        <!-- Basic User Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="space-y-6">
            <!-- ID (UID) -->
            <div v-if="isEditing">
              <label for="user-id" class="block text-sm font-medium text-gray-700">User ID</label>
              <div class="mt-1">
                <input
                  type="text"
                  name="user-id"
                  id="user-id"
                  v-model="user.uid"
                  disabled
                  class="py-2 px-3 border border-gray-300 bg-gray-100 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md"
                />
              </div>
            </div>

            <!-- Display Name -->
            <div>
              <label for="user-name" class="block text-sm font-medium text-gray-700">Display Name</label>
              <div class="mt-1">
                <input
                  type="text"
                  name="user-name"
                  id="user-name"
                  v-model="user.displayName"
                  class="py-2 px-3 border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <!-- Email -->
            <div>
              <label for="user-email" class="block text-sm font-medium text-gray-700">Email</label>
              <div class="mt-1">
                <input
                  type="email"
                  name="user-email"
                  id="user-email"
                  v-model="user.email"
                  :disabled="isEditing"
                  class="py-2 px-3 border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md"
                  :class="{ 'bg-gray-100': isEditing }"
                  placeholder="user@example.com"
                />
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <!-- Profile Image URL -->
            <div>
              <label for="user-photo" class="block text-sm font-medium text-gray-700">Profile Image URL</label>
              <div class="mt-1">
                <input
                  type="text"
                  name="user-photo"
                  id="user-photo"
                  v-model="user.photoURL"
                  class="py-2 px-3 border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md"
                  placeholder="https://example.com/profile.jpg"
                />
              </div>
            </div>

            <!-- Role Display (Read-only) -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Role</label>
              <div class="mt-1">
                <div class="py-2 px-3 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-700 flex items-center">
                  <span
                    class="mr-2 px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full"
                    :class="{
                      'bg-purple-100 text-purple-800': user.role === 'admin',
                      'bg-green-100 text-green-800': user.role === 'creator',
                      'bg-blue-100 text-blue-800': user.role === 'user' || !user.role
                    }"
                  >
                    {{ getRoleName(user.role) }}
                  </span>
                  <span class="text-xs text-gray-500 italic">
                    {{ getRoleDescription(user.role) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Account Status -->
            <div>
              <label for="user-status" class="block text-sm font-medium text-gray-700">Account Status</label>
              <div class="mt-1">
                <select
                  id="user-status"
                  name="user-status"
                  v-model="user.disabled"
                  class="py-2 px-3 border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md"
                >
                  <option :value="false">Active</option>
                  <option :value="true">Disabled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- User Stats Section -->
        <div class="mb-6" v-if="isEditing">
          <h2 class="text-lg font-medium text-gray-900 mb-4">User Statistics</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Points -->
            <div class="bg-white p-4 rounded-lg border border-gray-200">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg class="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">Total Points</div>
                  <div class="text-lg font-semibold">{{ user.points || 0 }}</div>
                </div>
              </div>
            </div>

            <!-- Completed Levels -->
            <div class="bg-white p-4 rounded-lg border border-gray-200">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <svg class="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">Completed Levels</div>
                  <div class="text-lg font-semibold">{{ user.completedLevels?.length || 0 }}</div>
                </div>
              </div>
            </div>

            <!-- Earned Badges -->
            <div class="bg-white p-4 rounded-lg border border-gray-200">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg class="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">Earned Badges</div>
                  <div class="text-lg font-semibold">{{ user.earnedBadges?.length || 0 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Completed Levels Section -->
        <div class="mb-8" v-if="isEditing && user.completedLevels && user.completedLevels.length > 0">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Completed Levels</h2>
          <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div class="flex flex-wrap gap-2">
              <div
                v-for="levelId in user.completedLevels"
                :key="levelId"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
              >
                {{ levelId }}
              </div>
            </div>
          </div>
        </div>

        <!-- Earned Badges Section -->
        <div class="mb-8" v-if="isEditing && user.earnedBadges && user.earnedBadges.length > 0">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Earned Badges</h2>
          <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div class="flex flex-wrap gap-2">
              <div
                v-for="badgeId in user.earnedBadges"
                :key="badgeId"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
              >
                {{ badgeId }}
              </div>
            </div>
          </div>
        </div>

        <!-- Role Management (for existing users) -->
        <div v-if="isEditing" class="mb-6">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h3 class="text-lg font-medium text-gray-900">Role Management</h3>
              <p class="text-sm text-gray-500">Assign an appropriate role to this user</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- User Role Option -->
            <button
              type="button"
              @click="changeRole('user')"
              class="p-4 border rounded-md shadow-sm text-sm flex flex-col items-center"
              :class="user.role === 'user' ?
                'bg-blue-50 text-blue-600 border-blue-300' :
                'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="font-medium">Regular User</span>
              <span class="text-xs mt-1 text-center">Standard account with basic access</span>
            </button>

            <!-- Creator Role Option -->
            <button
              type="button"
              @click="changeRole('creator')"
              class="p-4 border rounded-md shadow-sm text-sm flex flex-col items-center"
              :class="user.role === 'creator' ?
                'bg-green-50 text-green-600 border-green-300' :
                'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span class="font-medium">Creator</span>
              <span class="text-xs mt-1 text-center">Can create and manage own journeys and levels</span>
            </button>

            <!-- Admin Role Option -->
            <button
              type="button"
              @click="changeRole('admin')"
              class="p-4 border rounded-md shadow-sm text-sm flex flex-col items-center"
              :class="user.role === 'admin' ?
                'bg-purple-50 text-purple-600 border-purple-300' :
                'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span class="font-medium">Administrator</span>
              <span class="text-xs mt-1 text-center">Full access to all system features</span>
            </button>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3 pt-5 border-t border-gray-200">
          <router-link
            to="/admin/users"
            class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </router-link>
          <button
            type="submit"
            :disabled="isSaving"
            class="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {{ isSaving ? 'Saving...' : 'Save User' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db } from '@/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import AdminBreadcrumbs from '@/components/AdminBreadcrumbs.vue';

const route = useRoute();
const router = useRouter();
const userId = route.params.id;
const isEditing = computed(() => !!userId);

// User data
const user = ref({
  uid: '',
  email: '',
  displayName: '',
  photoURL: '',
  role: 'user',
  disabled: false,
  points: 0,
  completedLevels: [],
  earnedBadges: []
});

// UI state
const isSaving = ref(false);
const error = ref(null);

// User form data and state

// Load user on mount if editing
onMounted(async () => {
  if (isEditing.value) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Format date fields if needed
        if (userData.createdAt && typeof userData.createdAt.toDate === 'function') {
          userData.createdAt = userData.createdAt.toDate();
        }

        user.value = {
          uid: userId,
          ...userData
        };
      } else {
        error.value = 'User not found';
      }
    } catch (err) {
      console.error('Error loading user:', err);
      error.value = err.message;
    }
  }

  // Initialize JSON content
  jsonContent.value = JSON.stringify(user.value, null, 2);
});

// Change user role
async function changeRole(newRole) {
  if (user.value.role === newRole) return; // No change needed

  try {
    // Update Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: newRole
    });

    // Update local state
    user.value.role = newRole;
  } catch (err) {
    console.error('Error updating user role:', err);
    error.value = 'Failed to update user role: ' + err.message;
  }
}

// Get display name for role
function getRoleName(role) {
  switch (role) {
    case 'admin': return 'Admin';
    case 'creator': return 'Creator';
    default: return 'User';
  }
}

// Get description for role
function getRoleDescription(role) {
  switch (role) {
    case 'admin': return 'Has full admin privileges';
    case 'creator': return 'Can create and manage content';
    default: return 'Regular user account';
  }
}

// Save user changes
async function saveUser() {
  isSaving.value = true;
  error.value = null;

  try {
    if (isEditing.value) {
      // When editing, we only update the user document
      const userRef = doc(db, 'users', userId);

      // Prepare data for update (remove uid as it's not stored in the document)
      const { ...userData } = user.value;
      delete userData.uid; // Remove UID from the data to be saved

      // Update the document
      await updateDoc(userRef, userData);
    } else {
      // Creating a new user is typically handled by Firebase Auth
      // This would normally be handled by the authentication system
      // For admin purposes, we could just create a new document
      if (!user.value.email) {
        throw new Error('Email is required');
      }

      // Create a new user document with a generated ID
      await setDoc(doc(db, 'users', user.value.uid || Math.random().toString(36).substring(2, 15)), user.value);
    }

    // Navigate back to users list
    router.push('/admin/users');
  } catch (err) {
    console.error('Error saving user:', err);
    error.value = err.message;
  } finally {
    isSaving.value = false;
  }
}
</script>
