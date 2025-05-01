<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    default: 'html',
    validator: (value) => ['html', 'css', 'javascript'].includes(value),
  },
})

const previewFrame = ref(null)
const previewError = ref(null)

// Update the preview when code changes
watch(
  () => props.code,
  () => {
    updatePreview()
  },
)

// Initial render
onMounted(() => {
  updatePreview()
})

// Function to update the preview based on code type
const updatePreview = () => {
  if (!previewFrame.value) return

  try {
    previewError.value = null
    const frame = previewFrame.value
    const frameDoc = frame.contentDocument || frame.contentWindow.document
    
    // Clear the document first
    frameDoc.open()
    
    if (props.language === 'html') {
      // For HTML, just render the HTML directly
      frameDoc.write(props.code)
    } else if (props.language === 'css') {
      // For CSS, create a default HTML structure with the CSS applied
      const demoHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              ${props.code}
            </style>
          </head>
          <body>
            <div class="box">Box with your CSS</div>
            <p>This is a paragraph</p>
            <button>This is a button</button>
            <div class="container">
              <div class="item">Item 1</div>
              <div class="item">Item 2</div>
              <div class="item">Item 3</div>
            </div>
          </body>
        </html>
      `
      frameDoc.write(demoHtml)
    } else if (props.language === 'javascript') {
      // For JavaScript, we'll show a message that execution happens in the console output
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: sans-serif; padding: 20px; }
              .message { background-color: #f8f9fa; padding: 15px; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="message">
              <h3>JavaScript Preview</h3>
              <p>Your JavaScript code will run when you click "Run Code".</p>
              <p>Results will appear in the Console Output panel below.</p>
            </div>
          </body>
        </html>
      `)
    }
    
    frameDoc.close()
  } catch (error) {
    previewError.value = error.message
  }
}
</script>

<template>
  <div class="code-preview">
    <div v-if="previewError" class="error-message">
      {{ previewError }}
    </div>
    <iframe
      ref="previewFrame"
      class="preview-frame"
      sandbox="allow-scripts allow-same-origin"
      title="Code Preview"
    ></iframe>
  </div>
</template>

<style scoped>
.code-preview {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.preview-frame {
  width: 100%;
  height: 300px;
  border: none;
  background: white;
  border-radius: 0.5rem;
}

.error-message {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 0.5rem;
  background-color: #fee2e2;
  color: #ef4444;
  font-family: monospace;
  font-size: 0.875rem;
  z-index: 10;
}
</style>
