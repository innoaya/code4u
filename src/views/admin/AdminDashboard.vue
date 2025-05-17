<template>
  <div class="admin-dashboard">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">{{ isAdmin ? 'Admin' : 'Creator' }} Dashboard</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Journey Management Card -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Learning Journeys</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{{ journeyCount }}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-4 sm:px-6">
            <div class="text-sm">
              <router-link to="/admin/journeys" class="font-medium text-blue-600 hover:text-blue-500">
                Manage Journeys<span class="ml-1" aria-hidden="true">&rarr;</span>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Level Management Card -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Coding Levels</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{{ levelCount }}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-4 sm:px-6">
            <div class="text-sm">
              <router-link to="/admin/levels" class="font-medium text-green-600 hover:text-green-500">
                Manage Levels<span class="ml-1" aria-hidden="true">&rarr;</span>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Badge Management Card -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Achievement Badges</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{{ badgeCount }}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-4 sm:px-6">
            <div class="text-sm">
              <router-link to="/admin/badges" class="font-medium text-purple-600 hover:text-purple-500">
                Manage Badges<span class="ml-1" aria-hidden="true">&rarr;</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white shadow rounded-lg mb-8">
        <div class="px-4 py-5 sm:p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <router-link to="/admin/journeys/new" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Create New Journey
            </router-link>
            <router-link to="/admin/levels/new" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              Create New Level
            </router-link>
            <router-link to="/admin/badges/new" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
              Create New Badge
            </router-link>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Recent Admin Activity</h2>
          
          <div v-if="isLoading" class="text-center py-4">
            <p class="text-gray-500">Loading activity...</p>
          </div>
          
          <div v-else-if="recentActivity.length === 0" class="bg-gray-50 rounded-md p-4 text-center">
            <p class="text-gray-500">No recent activity to display.</p>
          </div>
          
          <div v-else class="flow-root">
            <ul class="-mb-8">
              <li v-for="(activity, index) in recentActivity" :key="index">
                <div class="relative pb-8">
                  <span v-if="index !== recentActivity.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                  <div class="relative flex space-x-3">
                    <div>
                      <span
                        class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                        :class="{
                          'bg-blue-500': activity.type === 'journey',
                          'bg-green-500': activity.type === 'level',
                          'bg-purple-500': activity.type === 'badge'
                        }"
                      >
                        <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p class="text-sm text-gray-500">
                          {{ activity.description }}
                          <span class="font-medium text-gray-900">{{ activity.itemName }}</span>
                        </p>
                      </div>
                      <div class="text-right text-sm whitespace-nowrap text-gray-500">
                        {{ activity.date }}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { db, auth } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();
const currentUser = ref(auth.currentUser);
const userRole = computed(() => userStore.userRole);
const isAdmin = computed(() => userRole.value === 'admin');
const isCreator = computed(() => userRole.value === 'creator');

const journeyCount = ref(0);
const levelCount = ref(0);
const badgeCount = ref(0);
const recentActivity = ref([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    // Get journey count based on role
    if (isAdmin.value) {
      const journeysSnapshot = await getDocs(collection(db, 'journeys'));
      journeyCount.value = journeysSnapshot.size;
      
      // Get level count
      const levelsSnapshot = await getDocs(collection(db, 'levels'));
      levelCount.value = levelsSnapshot.size;
      
      // Get badge count
      const badgesSnapshot = await getDocs(collection(db, 'badges'));
      badgeCount.value = badgesSnapshot.size;
    } else {
      // For creators, only show their created content
      const journeysQuery = query(collection(db, 'journeys'), where('createdBy', '==', currentUser.value.uid));
      const journeysSnapshot = await getDocs(journeysQuery);
      journeyCount.value = journeysSnapshot.size;
      
      // Get level count for creator
      const levelsQuery = query(collection(db, 'levels'), where('createdBy', '==', currentUser.value.uid));
      const levelsSnapshot = await getDocs(levelsQuery);
      levelCount.value = levelsSnapshot.size;
      
      // Get badge count for creator
      const badgesQuery = query(collection(db, 'badges'), where('createdBy', '==', currentUser.value.uid));
      const badgesSnapshot = await getDocs(badgesQuery);
      badgeCount.value = badgesSnapshot.size;
    }

    // Customize recent activity based on user role
    recentActivity.value = isCreator.value ? [
      {
        type: 'journey',
        description: 'Created new journey:',
        itemName: 'Getting started with your role',
        date: 'Now'
      }
    ] : [
      {
        type: 'journey',
        description: 'Created new journey:',
        itemName: 'Web Development Fundamentals',
        date: 'Today at 2:30 PM'
      },
      {
        type: 'level',
        description: 'Updated level:',
        itemName: 'HTML Fundamentals: Your First Web Page',
        date: 'Yesterday at 4:15 PM'
      },
      {
        type: 'badge',
        description: 'Created new badge:',
        itemName: 'JavaScript Master',
        date: '3 days ago'
      }
    ];
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>
