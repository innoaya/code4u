<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '../firebase'
import { signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useGameStore } from '../stores/gameStore'

const router = useRouter()
const gameStore = useGameStore()
const user = ref(null)
const userProgress = ref(null)
const isLoading = ref(true)
const badges = ref([])
const recentActivities = ref([])
const categoryProgress = ref({
  HTML: 0,
  CSS: 0,
  JavaScript: 0
})

// Format date for display
const formatDate = (date) => {
  console.log('Formatting date:', date, typeof date)
  
  if (!date) return 'Unknown date'
  
  // Ensure we're working with a Date object
  try {
    // If it's already a Date object, this is harmless
    // If it's a timestamp number or string, this will convert it
    if (!(date instanceof Date)) {
      date = new Date(date)
    }
    
    const now = new Date()
    const diff = now - date
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    console.log('Time difference:', { days, hours, minutes, seconds })
    
    if (days > 7) {
      return date.toLocaleDateString()
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  } catch (err) {
    console.error('Error formatting date:', err)
    return 'Unknown date'
  }
}

// Get activity icon and description
const getActivityInfo = (activity) => {
  if (!activity) return { icon: '❓', color: 'bg-gray-500', title: 'Unknown activity' }
  
  console.log('Getting info for activity:', activity);
  
  // Handle missing type or null activity gracefully
  const activityType = activity.type || 'unknown';
  
  switch(activityType) {
    case 'level_completed':
      return {
        icon: '✅',
        color: 'bg-success',
        title: `Completed Level ${activity.details?.levelNumber || '?'}: ${activity.details?.levelTitle || 'Unknown'}`
      }
    case 'badge_earned':
      return {
        icon: '🏆',
        color: 'bg-primary',
        title: `Earned ${activity.details?.badgeName || 'Unknown'} Badge`
      }
    case 'profile_updated':
      return {
        icon: '👤',
        color: 'bg-secondary',
        title: 'Updated Profile Information'
      }
    case 'account_created':
      return {
        icon: '🚀',
        color: 'bg-accent',
        title: 'Started Learning Journey'
      }
    case 'test_activity':
      return {
        icon: '🚨',
        color: 'bg-warning',
        title: activity.details?.message || 'Test Activity'
      }
    default:
      return {
        icon: '📝',
        color: 'bg-gray-500',
        title: 'Activity Recorded: ' + activityType
      }
  }
}

// Fetch user data
onMounted(async () => {
  if (!auth.currentUser) {
    router.push('/login')
    return
  }
  
  try {
    isLoading.value = true
    
    // Fetch user progress from gameStore
    await gameStore.fetchUserProgress()
    userProgress.value = gameStore.userProgress
    
    // Get user document for additional info
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
    if (userDoc.exists()) {
      // Set user info combining auth and firestore data
      user.value = {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName || userDoc.data().displayName,
        photoURL: auth.currentUser.photoURL,
        level: userDoc.data().level || 1,
        points: userDoc.data().points || 0,
        completedLevels: userDoc.data().completedLevels || [],
        badges: userDoc.data().badges || []
      }
      
      // Calculate progress percentages by category
      categoryProgress.value = gameStore.calculateCategoryProgress()
      
      console.log('User badges from Firestore:', userDoc.data().badges);
      
      // Set badges - using predefined badge data
      const badgeDefinitions = [
        // HTML Badges
        { id: 'html-apprentice', name: 'HTML Apprentice', description: 'Completed your first HTML page', category: 'HTML', icon: '📄' },
        { id: 'html-formatter', name: 'Text Wizard', description: 'Mastered HTML text formatting', category: 'HTML', icon: '✏️' },
        { id: 'html-navigator', name: 'Web Navigator', description: 'Connected pages with HTML links', category: 'HTML', icon: '🔗' },
        { id: 'html-illustrator', name: 'Web Illustrator', description: 'Added images to make your pages come alive', category: 'HTML', icon: '🖼️' },
        { id: 'html-organizer', name: 'Data Organizer', description: 'Created tables to organize information', category: 'HTML', icon: '📊' },
        { id: 'html-master', name: 'HTML Master', description: 'Completed all HTML levels', category: 'HTML', icon: '🏆' },
        
        // CSS Badges
        { id: 'css-stylist', name: 'CSS Stylist', description: 'Added your first CSS styles', category: 'CSS', icon: '🎨' },
        { id: 'css-selector', name: 'Element Selector', description: 'Mastered CSS selectors', category: 'CSS', icon: '🎯' },
        { id: 'css-layouter', name: 'Layout Designer', description: 'Created complex layouts with CSS', category: 'CSS', icon: '📐' },
        { id: 'css-animator', name: 'Animation Creator', description: 'Added animations to your web pages', category: 'CSS', icon: '✨' },
        { id: 'css-master', name: 'CSS Master', description: 'Completed all CSS levels', category: 'CSS', icon: '🏆' },
        
        // JavaScript Badges
        { id: 'js-starter', name: 'JavaScript Starter', description: 'Wrote your first JavaScript code', category: 'JavaScript', icon: '🚀' },
        { id: 'js-logician', name: 'Logic Master', description: 'Mastered conditionals and loops', category: 'JavaScript', icon: '🧠' },
        { id: 'js-manipulator', name: 'DOM Manipulator', description: 'Learned to manipulate the DOM', category: 'JavaScript', icon: '🔧' },
        { id: 'js-event-handler', name: 'Event Handler', description: 'Created interactive features with event listeners', category: 'JavaScript', icon: '👆' },
        { id: 'js-master', name: 'JavaScript Master', description: 'Completed all JavaScript levels', category: 'JavaScript', icon: '🏆' },
        
        // Achievement badges
        { id: 'web-developer', name: 'Web Developer', description: 'Completed all levels in HTML, CSS, and JavaScript', category: 'Achievement', icon: '👨‍💻' }
      ];
      
      // Filter to only badges the user has earned
      badges.value = badgeDefinitions.filter(badge => 
        user.value.badges?.includes(badge.id)
      )
      
      // Fetch recent activities
      console.log('Fetching user activities...');
      try {
        // Attempt direct fetch for debug user - bypass userId constraint
        if (auth.currentUser.email === 'demo@codequest.edu') {
          console.log('Special handling for demo user');
          // Try to fetch specific document
          try {
            const specificDoc = await getDoc(doc(db, 'user_activities', 'UEEpaovuF8jZyTgsFMGX'));
            if (specificDoc.exists()) {
              const data = specificDoc.data();
              console.log('Demo user specific activity found:', data);
              recentActivities.value = [{
                id: specificDoc.id,
                ...data,
                timestamp: new Date() // Use current date for testing
              }];
            }
          } catch (err) {
            console.error('Error with demo user activity:', err);
          }
        }

        // If no special case or it didn't work, use normal fetch
        if (!recentActivities.value || recentActivities.value.length === 0) {
          recentActivities.value = await gameStore.fetchUserActivities(5);
        }
        
        console.log('Final activities to display:', recentActivities.value);
      } catch (err) {
        console.error('Error fetching activities:', err);
      }
      
      // If no activities found, add a default "account created" activity
      if (recentActivities.value.length === 0) {
        console.log('No activities found, creating a default one');
        // Add a default activity for account creation
        try {
          await gameStore.recordUserActivity('account_created', {});
          console.log('Default activity created, fetching again...');
          recentActivities.value = await gameStore.fetchUserActivities(5);
          console.log('Activities after creating default:', recentActivities.value);
        } catch (err) {
          console.error('Error creating default activity:', err);
        }
      }
    } else {
      user.value = {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName || 'Code4U User',
        photoURL: auth.currentUser.photoURL,
        level: 1,
        points: 0,
        completedLevels: [],
        badges: []
      }
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
  } finally {
    isLoading.value = false
  }
})

// Sign out
const handleSignOut = async () => {
  try {
    await signOut(auth)
    router.push('/')
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

// Test function to manually create an activity
const createTestActivity = async () => {
  try {
    console.log('Creating test activity...')
    // Use the gameStore to record a test activity
    await gameStore.recordUserActivity('test_activity', {
      message: 'Manual test activity from profile',
      timestamp: new Date().toISOString()
    })
    console.log('Test activity created, refreshing...')
    
    // Refresh activities list
    recentActivities.value = await gameStore.fetchUserActivities(5)
    console.log('Updated activities:', recentActivities.value)
  } catch (error) {
    console.error('Error creating test activity:', error)
  }
}

// Badge data is now defined inline in the component setup
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">Your Profile</h1>
    
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
    
    <div v-else-if="user" class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- User profile card -->
      <div class="md:col-span-1">
        <div class="card text-center">
          <div class="mb-6">
            <div class="w-24 h-24 rounded-full bg-primary/20 mx-auto flex items-center justify-center">
              <span v-if="!user.photoURL" class="text-3xl font-bold text-primary">
                {{ user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U' }}
              </span>
              <img
                v-else
                :src="user.photoURL"
                :alt="user.displayName"
                class="w-full h-full rounded-full object-cover"
              />
            </div>
            <h2 class="text-xl font-bold mt-4">{{ user.displayName || 'Coder' }}</h2>
            <p class="text-text-secondary">{{ user.email }}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="text-center p-4 bg-primary/10 rounded-lg">
              <div class="text-primary font-bold text-2xl">{{ user.level || 1 }}</div>
              <div class="text-text-secondary text-sm">Level</div>
            </div>
            <div class="text-center p-4 bg-secondary/10 rounded-lg">
              <div class="text-secondary font-bold text-2xl">{{ user.points || 0 }}</div>
              <div class="text-text-secondary text-sm">Points</div>
            </div>
          </div>
          
          <div class="space-y-2">
            <button @click="handleSignOut" class="btn bg-white border border-gray-300 hover:bg-gray-100 w-full">
              Sign Out
            </button>
            
            <button @click="createTestActivity" class="btn bg-success/10 text-success border border-success/20 hover:bg-success/20 w-full">
              Create Test Activity
            </button>
          </div>
        </div>
      </div>
      
      <!-- Progress and stats -->
      <div class="md:col-span-2">
        <!-- Badges -->
        <div class="card mb-8">
          <h2 class="text-xl font-bold mb-4">Your Badges</h2>
          
          <div v-if="badges.length" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              v-for="badge in badges"
              :key="badge.id"
              class="text-center p-4 rounded-lg"
              :class="`${badge.color}/10`"
            >
              <div class="text-3xl mb-2">{{ badge.icon }}</div>
              <div class="font-bold">{{ badge.name }}</div>
              <div class="text-xs text-text-secondary">{{ badge.description }}</div>
            </div>
          </div>
          
          <div v-else class="text-center p-8 bg-gray-50 rounded-lg">
            <p class="text-text-secondary">
              Complete levels and challenges to earn badges!
            </p>
          </div>
        </div>
        
        <!-- Learning Progress -->
        <div class="card mb-8">
          <h2 class="text-xl font-bold mb-4">Learning Progress</h2>
          
          <div class="space-y-4">
            <div>
              <div class="flex justify-between mb-1">
                <span class="font-medium">HTML</span>
                <span class="text-text-secondary">{{ categoryProgress.HTML }}%</span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full">
                <div class="h-full bg-primary rounded-full" :style="{ width: categoryProgress.HTML + '%' }"></div>
              </div>
            </div>
            
            <div>
              <div class="flex justify-between mb-1">
                <span class="font-medium">CSS</span>
                <span class="text-text-secondary">{{ categoryProgress.CSS }}%</span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full">
                <div class="h-full bg-secondary rounded-full" :style="{ width: categoryProgress.CSS + '%' }"></div>
              </div>
            </div>
            
            <div>
              <div class="flex justify-between mb-1">
                <span class="font-medium">JavaScript</span>
                <span class="text-text-secondary">{{ categoryProgress.JavaScript }}%</span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full">
                <div class="h-full bg-accent rounded-full" :style="{ width: categoryProgress.JavaScript + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recent Activity -->
        <div class="card">
          <h2 class="text-xl font-bold mb-4">Recent Activity</h2>
          
          <div v-if="recentActivities.length > 0" class="space-y-4">
            <div 
              v-for="activity in recentActivities" 
              :key="activity.id"
              class="flex items-start"
            >
              <!-- Debug info -->
              <pre v-if="false" class="text-xs">{{ JSON.stringify(activity, null, 2) }}</pre>
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center mr-4 text-lg"
                :class="`${getActivityInfo(activity).color}/20`"
              >
                {{ getActivityInfo(activity).icon }}
              </div>
              <div>
                <h3 class="font-semibold">{{ getActivityInfo(activity).title }}</h3>
                <p class="text-sm text-text-secondary">{{ formatDate(activity.timestamp) }}</p>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center p-8 bg-gray-50 rounded-lg">
            <p class="text-text-secondary">
              No recent activity. Start completing levels to track your progress!
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
