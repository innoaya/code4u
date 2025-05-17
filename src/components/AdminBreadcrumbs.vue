<template>
  <nav class="flex mb-6" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-3">
      <!-- Admin Home Link -->
      <li class="inline-flex items-center">
        <RouterLink 
          to="/admin" 
          class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-400 dark:hover:text-white"
        >
          <svg 
            class="w-4 h-4 mr-2" 
            fill="currentColor" 
            viewBox="0 0 20 20" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
          </svg>
          Admin
        </RouterLink>
      </li>
      
      <!-- Section Link (Users, Badges, Journeys, Levels, Feedback) -->
      <li>
        <div class="flex items-center">
          <svg 
            class="w-6 h-6 text-gray-400" 
            fill="currentColor" 
            viewBox="0 0 20 20" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              fill-rule="evenodd" 
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
              clip-rule="evenodd"
            ></path>
          </svg>
          <RouterLink 
            :to="sectionLink" 
            class="ml-1 text-sm font-medium text-gray-700 hover:text-primary md:ml-2 dark:text-gray-400 dark:hover:text-white"
          >
            {{ sectionTitle }}
          </RouterLink>
        </div>
      </li>
      
      <!-- Detail Item (when viewing or editing a specific item) -->
      <li v-if="itemId" aria-current="page">
        <div class="flex items-center">
          <svg 
            class="w-6 h-6 text-gray-400" 
            fill="currentColor" 
            viewBox="0 0 20 20" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              fill-rule="evenodd" 
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
              clip-rule="evenodd"
            ></path>
          </svg>
          <span class="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
            {{ itemTitle || 'Details' }}
          </span>
        </div>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'

// Define props with more generic names
const props = defineProps({
  // Generic ID for any item being viewed
  itemId: {
    type: String,
    default: null
  },
  // Generic title for any item being viewed
  itemTitle: {
    type: String,
    default: null
  },
  // Optional override for section detection
  section: {
    type: String,
    default: null
  }
})

// Get current route
const route = useRoute()

// Determine current section based on route path
const currentSection = computed(() => {
  if (props.section) return props.section
  
  const path = route.path
  
  if (path.includes('/admin/users')) return 'users'
  if (path.includes('/admin/badges')) return 'badges'
  if (path.includes('/admin/journeys')) return 'journeys'
  if (path.includes('/admin/levels')) return 'levels'
  if (path.includes('/admin/feedback')) return 'feedback'
  
  return 'dashboard'
})

// Generate section title based on current section
const sectionTitle = computed(() => {
  switch (currentSection.value) {
    case 'users': return 'Users'
    case 'badges': return 'Badges'
    case 'journeys': return 'Journeys'
    case 'levels': return 'Levels'
    case 'feedback': return 'Feedback'
    default: return 'Dashboard'
  }
})

// Generate section link based on current section
const sectionLink = computed(() => {
  return `/admin/${currentSection.value}`
})
</script>
