<template>
  <div class="html-content-container">
    <iframe ref="contentFrame" :src="contentUrl" class="w-full h-screen border-0"></iframe>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  contentUrl: {
    type: String,
    required: true
  }
});

const contentFrame = ref(null);

// Handle any necessary iframe initialization
onMounted(() => {
  if (contentFrame.value) {
    // You can add event listeners or other setup here if needed
  }
});

// Watch for URL changes to refresh the iframe when needed
watch(() => props.contentUrl, (newUrl) => {
  if (contentFrame.value) {
    contentFrame.value.src = newUrl;
  }
}, { deep: true });
</script>

<style scoped>
.html-content-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
