<template>
  <div class="javascript-learn-container">
    <h1 class="text-3xl font-bold mb-6">JavaScript Learning</h1>
    <HtmlContentViewer :contentUrl="'/src/assets/h5/javascript.html'" />
  </div>
</template>

<script setup>
import HtmlContentViewer from '@/components/HtmlContentViewer.vue';
</script>
