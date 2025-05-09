<script setup>
import { onMounted } from 'vue'
import { trackPageView } from '../firebase/analytics-utils'
import ActivityFeed from '../components/ActivityFeed.vue'

// Page configuration
const pageTitle = 'Community Activity'
const pageDescription = 'See what the Code4U community is learning and achieving in real-time!'

// Track page view for analytics
onMounted(() => {
  trackPageView('activities_page')
})
</script>

<template>
  <div class="py-6">
    <div class="max-w-5xl mx-auto px-4">
      <!-- Page Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold mb-2">{{ pageTitle }}</h1>
        <p class="text-text-secondary">{{ pageDescription }}</p>
      </div>
      
      <!-- Activity Feed -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <ActivityFeed :maxItems="20" :showTitle="false" />
        
        <!-- Activity Statistics -->
        <div class="mt-8 pt-6 border-t border-gray-100">
          <h3 class="font-semibold mb-4">Activity Stats</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-primary/5 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-primary mb-1">🏆</div>
              <div class="text-lg font-medium">Level Completions</div>
              <div class="text-sm text-text-secondary">See who's advancing</div>
            </div>
            <div class="bg-secondary/5 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-secondary mb-1">🎖️</div>
              <div class="text-lg font-medium">Badges Earned</div>
              <div class="text-sm text-text-secondary">Recent achievements</div>
            </div>
            <div class="bg-accent/5 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-accent mb-1">👋</div>
              <div class="text-lg font-medium">New Members</div>
              <div class="text-sm text-text-secondary">Welcome them!</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Community Guidelines -->
      <div class="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 class="font-semibold mb-3">Community Guidelines</h3>
        <p class="text-text-secondary mb-4">
          At Code4U, we believe in celebrating everyone's learning journey! 
          This activity feed showcases real-time achievements from our community of coders.
        </p>
        <ul class="list-disc list-inside space-y-2 text-text-secondary">
          <li>Celebrate others' achievements with positive encouragement</li>
          <li>Everyone learns at their own pace - respect each journey</li>
          <li>Use the activity feed as motivation for your own learning</li>
        </ul>
      </div>
    </div>
  </div>
</template>
