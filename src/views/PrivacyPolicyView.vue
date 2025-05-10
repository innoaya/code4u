<template>
  <div class="max-w-3xl mx-auto py-8 px-4">
    <div class="card">
      <div v-if="loading" class="py-12 text-center">
        <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-text-secondary">Loading privacy policy...</p>
      </div>

      <div v-else-if="error" class="py-12 text-center">
        <div class="text-danger mb-4">Error loading privacy policy</div>
        <button @click="fetchPrivacyPolicy" class="btn btn-primary">Try Again</button>
      </div>

      <div v-else>
        <h1 class="text-3xl font-bold mb-6">{{ policy.title }}</h1>
        
        <div class="prose max-w-none">
          <div v-for="(section, index) in policy.content" :key="index" class="mb-6">
            <h2 class="text-xl font-semibold mt-6 mb-3">{{ index + 1 }}. {{ section.heading }}</h2>
            <p>{{ section.text }}</p>
          </div>

          <div class="mt-8 border-t pt-4">
            <p class="text-sm text-text-secondary">Last updated: {{ policy.lastUpdated }}</p>
          </div>
        </div>
        
        <div class="mt-8">
          <router-link v-if="!isLoggedIn" to="/login" class="btn btn-primary">Return to Login</router-link>
          <router-link v-else to="/" class="btn btn-primary">Return to Home</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getLegalDocument } from '../firebase/legal-utils'
import { auth } from '../firebase'
import { trackLegalDocumentView } from '../firebase/analytics-utils'

const policy = ref(null)
const loading = ref(true)
const error = ref(false)
const isLoggedIn = ref(!!auth.currentUser)

async function fetchPrivacyPolicy() {
  loading.value = true
  error.value = false
  
  try {
    // Fetch privacy policy
    const policyData = await getLegalDocument('privacy_policy')
    
    if (policyData) {
      policy.value = policyData
    } else {
      error.value = true
    }
  } catch (err) {
    console.error('Error fetching privacy policy:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPrivacyPolicy()
  
  // Track page view in analytics
  trackLegalDocumentView('privacy_policy')
})
</script>
