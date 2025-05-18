<template>
  <div class="css-learn-container">
    <h1 class="text-3xl font-bold mb-6">CSS Learning</h1>
    <HtmlContentViewer :contentUrl="'/src/assets/h5/css.html'" />
  </div>
</template>

<script setup>
import HtmlContentViewer from '@/components/HtmlContentViewer.vue';
</script>
