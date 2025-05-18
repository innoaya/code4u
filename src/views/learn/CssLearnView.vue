<template>
  <div class="css-learn-container">
    <h1 class="text-3xl font-bold mb-6">CSS Learning</h1>
    <HtmlContentViewer :contentUrl="cssContentUrl" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import HtmlContentViewer from '@/components/HtmlContentViewer.vue';

// Import the CSS content file using Vite's asset handling
import cssContent from '@/assets/h5/css.html?url';

const cssContentUrl = ref('');

onMounted(() => {
  // Set the content URL after component is mounted
  cssContentUrl.value = cssContent;
});
</script>
