<template>
  <div class="html-learn-container">
    <h1 class="text-3xl font-bold mb-6">HTML Learning</h1>
    <HtmlContentViewer :contentUrl="'/src/assets/h5/html.html'" />
  </div>
</template>

<script setup>
import HtmlContentViewer from '@/components/HtmlContentViewer.vue';
</script>
