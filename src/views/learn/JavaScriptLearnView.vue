<template>
  <div class="javascript-learn-container">
    <h1 class="text-3xl font-bold mb-6">JavaScript Learning</h1>
    <HtmlContentViewer :contentUrl="jsContentUrl" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import HtmlContentViewer from '@/components/HtmlContentViewer.vue';

// Import the JavaScript content file using Vite's asset handling
import jsContent from '@/assets/h5/javascript.html?url';

const jsContentUrl = ref('');

onMounted(() => {
  // Set the content URL after component is mounted
  jsContentUrl.value = jsContent;
});
</script>
