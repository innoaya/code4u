<template>
  <nav class="flex mb-6" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-3">
      <li class="inline-flex items-center">
        <RouterLink 
          to="/admin/feedback" 
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
            v-if="!feedbackId" 
            to="/admin/feedback" 
            class="ml-1 text-sm font-medium text-gray-700 hover:text-primary md:ml-2 dark:text-gray-400 dark:hover:text-white"
          >
            Feedback Management
          </RouterLink>
          <RouterLink 
            v-else 
            to="/admin/feedback" 
            class="ml-1 text-sm font-medium text-gray-700 hover:text-primary md:ml-2 dark:text-gray-400 dark:hover:text-white"
          >
            Feedback Management
          </RouterLink>
        </div>
      </li>
      <li v-if="feedbackId" aria-current="page">
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
            {{ feedbackTitle || 'Feedback Details' }}
          </span>
        </div>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  feedbackId: {
    type: String,
    default: null
  },
  feedbackTitle: {
    type: String,
    default: null
  }
})
</script>
