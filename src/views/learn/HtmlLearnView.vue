<template>
  <div class="html-learn-container">
    <h1 class="text-3xl font-bold mb-6">HTML Learning</h1>
    <HtmlContentViewer :contentUrl="htmlContentUrl" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import HtmlContentViewer from '@/components/HtmlContentViewer.vue';

// Import the HTML content file using Vite's asset handling
import htmlContent from '@/assets/h5/html.html?url';

const htmlContentUrl = ref('');

onMounted(() => {
  // Set the content URL after component is mounted
  htmlContentUrl.value = htmlContent;
});
</script>
