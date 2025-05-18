<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../firebase'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'

const users = ref([])
const allBadges = ref({})
const isLoading = ref(true)
const error = ref(null)
const timeframe = ref('all-time') // all-time, weekly, monthly

// Fetch badge data and leaderboard data
onMounted(async () => {
  await fetchBadges()
  await fetchLeaderboard()
})

// Fetch all badges from Firestore
const fetchBadges = async () => {
  try {
    const badgesSnapshot = await getDocs(collection(db, 'badges'))

    // Create a map of badge ID to badge object for quick lookups
    const badgesMap = {}
    badgesSnapshot.docs.forEach(doc => {
      badgesMap[doc.id] = {
        id: doc.id,
        ...doc.data()
      }
    })

    allBadges.value = badgesMap
  } catch (err) {
    console.error('Error fetching badges:', err)
    // Fall back to empty object if there's an error
    allBadges.value = {}
  }
}

const fetchLeaderboard = async () => {
  try {
    isLoading.value = true
    error.value = null

    // Create query based on selected timeframe
    let usersQuery = query(
      collection(db, 'users'),
      orderBy('points', 'desc'),
      limit(20)
    )

    // Get users from Firestore
    const usersSnapshot = await getDocs(usersQuery)

    // Map data and add rank
    users.value = usersSnapshot.docs.map((doc, index) => {
      const userData = doc.data()

      // Map badge IDs to full badge objects if they exist
      let mappedBadges = []

      if (userData.badges && Array.isArray(userData.badges)) {
        mappedBadges = userData.badges.map(badgeId => {
          // Handle both string IDs and existing badge objects
          if (typeof badgeId === 'string') {
            return allBadges.value[badgeId] || badgeId
          }
          return badgeId
        })
      }

      return {
        id: doc.id,
        rank: index + 1,
        ...userData,
        badges: mappedBadges
      }
    })
  } catch (err) {
    console.error('Error fetching leaderboard:', err)
    error.value = 'Failed to load leaderboard data'

    // Use mock data if there's an error
    users.value = mockUsers
  } finally {
    isLoading.value = false
  }
}

// Change timeframe and refresh data
const changeTimeframe = (newTimeframe) => {
  timeframe.value = newTimeframe
  fetchLeaderboard()
}

// Mock data for development
const mockUsers = [
  { id: 'user1', rank: 1, displayName: 'CodeMaster', points: 1250, level: 15, badges: ['html-expert', 'css-expert', 'js-ninja'] },
  { id: 'user2', rank: 2, displayName: 'WebWizard', points: 1180, level: 14, badges: ['html-expert', 'css-expert', 'js-apprentice'] },
  { id: 'user3', rank: 3, displayName: 'HTMLHero', points: 950, level: 12, badges: ['html-expert', 'css-stylist'] },
  { id: 'user4', rank: 4, displayName: 'CSSCrafter', points: 820, level: 10, badges: ['html-expert', 'css-apprentice'] },
  { id: 'user5', rank: 5, displayName: 'JavaScriptJedi', points: 780, level: 9, badges: ['html-expert'] },
  { id: 'user6', rank: 6, displayName: 'FrontEndFan', points: 720, level: 8, badges: ['html-apprentice'] },
  { id: 'user7', rank: 7, displayName: 'CodeNewbie', points: 650, level: 7, badges: [] },
  { id: 'user8', rank: 8, displayName: 'WebDeveloper', points: 580, level: 6, badges: [] },
  { id: 'user9', rank: 9, displayName: 'CodingKid', points: 510, level: 5, badges: [] },
  { id: 'user10', rank: 10, displayName: 'TechLearner', points: 450, level: 4, badges: [] },
]
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">Leaderboard</h1>

    <!-- Timeframe selector -->
    <div class="flex space-x-2 mb-8">
      <button
        @click="changeTimeframe('all-time')"
        class="px-4 py-2 rounded-lg text-sm font-medium"
        :class="timeframe === 'all-time' ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'"
      >
        All Time
      </button>
      <button
        @click="changeTimeframe('monthly')"
        class="px-4 py-2 rounded-lg text-sm font-medium"
        :class="timeframe === 'monthly' ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'"
      >
        This Month
      </button>
      <button
        @click="changeTimeframe('weekly')"
        class="px-4 py-2 rounded-lg text-sm font-medium"
        :class="timeframe === 'weekly' ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'"
      >
        This Week
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="card bg-danger/10 text-danger p-8 text-center">
      <h2 class="text-2xl font-bold mb-4">{{ error }}</h2>
      <p>There was a problem loading the leaderboard data.</p>
    </div>

    <!-- Leaderboard table -->
    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 text-left">
              <th class="px-6 py-3 text-text-secondary font-medium">Rank</th>
              <th class="px-6 py-3 text-text-secondary font-medium">User</th>
              <th class="px-6 py-3 text-text-secondary font-medium">Level</th>
              <th class="px-6 py-3 text-text-secondary font-medium">Points</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
              <!-- Rank -->
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div v-if="user.rank <= 3" class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                    :class="{
                      'bg-yellow-400': user.rank === 1,
                      'bg-gray-400': user.rank === 2,
                      'bg-amber-600': user.rank === 3
                    }"
                  >
                    {{ user.rank }}
                  </div>
                  <div v-else class="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-text-secondary font-medium">
                    {{ user.rank }}
                  </div>
                </div>
              </td>

              <!-- User -->
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-primary font-bold">
                    {{ user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U' }}
                  </div>
                  <div>
                    <div class="font-semibold">{{ user.displayName }}</div>
                    <div v-if="user.rank <= 3" class="text-xs">
                      <span v-if="user.rank === 1" class="text-yellow-500">👑 Leader</span>
                      <span v-else-if="user.rank === 2" class="text-gray-500">🥈 Runner-up</span>
                      <span v-else class="text-amber-600">🥉 Third Place</span>
                    </div>
                  </div>
                </div>
              </td>

              <!-- Level -->
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {{ user.level }}
                  </div>
                </div>
              </td>

              <!-- Points -->
              <td class="px-6 py-4 font-bold text-primary">
                {{ user.points.toLocaleString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
