<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  levelId: {
    type: String,
    required: true
  },
  onComplete: {
    type: Function,
    default: () => {}
  }
})

const emit = defineEmits(['gameLoaded', 'taskCompleted', 'gameCompleted'])

const gameContainer = ref(null)
const gameInstance = ref(null)
const gameLoaded = ref(false)
const gameError = ref(null)

// GDevelop game integration
onMounted(() => {
  initializeGDevelopGame()
})

onUnmounted(() => {
  if (gameInstance.value) {
    // Clean up game resources
    disposeGame()
  }
})

// Watch for level changes to reload the game
watch(() => props.levelId, () => {
  if (gameLoaded.value) {
    disposeGame()
    initializeGDevelopGame()
  }
})

// Initialize GDevelop game
const initializeGDevelopGame = () => {
  if (!gameContainer.value) return
  
  try {
    gameError.value = null
    
    // In a real implementation, we would load the appropriate GDevelop game for the level
    // For development purposes, we're simulating the GDevelop integration
    
    console.log(`Initializing GDevelop game for level: ${props.levelId}`)
    
    // Simulate loading the game (this would be replaced with actual GDevelop code)
    setTimeout(() => {
      // Create a canvas element to simulate the game
      const canvas = document.createElement('canvas')
      canvas.width = gameContainer.value.clientWidth
      canvas.height = 400
      canvas.style.display = 'block'
      canvas.style.backgroundColor = '#333'
      
      // Clear the container
      gameContainer.value.innerHTML = ''
      gameContainer.value.appendChild(canvas)
      
      // Initialize a 2D context to draw on the canvas
      const ctx = canvas.getContext('2d')
      
      // Draw some sample graphics to simulate the game
      drawGameElements(ctx, canvas.width, canvas.height)
      
      // Store reference to the game instance (in a real implementation, this would be the GDevelop game instance)
      gameInstance.value = {
        canvas,
        ctx,
        animationFrame: null,
        startTime: Date.now()
      }
      
      // Start the game loop
      startGameLoop()
      
      // Mark as loaded
      gameLoaded.value = true
      emit('gameLoaded')
    }, 1000)
  } catch (error) {
    console.error('Error initializing GDevelop game:', error)
    gameError.value = 'Failed to initialize game'
  }
}

// Start the game loop
const startGameLoop = () => {
  if (!gameInstance.value) return
  
  const loop = () => {
    if (!gameInstance.value) return
    
    const { ctx, canvas } = gameInstance.value
    const elapsedTime = Date.now() - gameInstance.value.startTime
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Update and draw game elements
    drawGameElements(ctx, canvas.width, canvas.height, elapsedTime)
    
    // Continue the loop
    gameInstance.value.animationFrame = requestAnimationFrame(loop)
  }
  
  // Start the loop
  gameInstance.value.animationFrame = requestAnimationFrame(loop)
}

// Draw game elements on the canvas
const drawGameElements = (ctx, width, height, elapsedTime = 0) => {
  // Background
  ctx.fillStyle = '#1f2937'
  ctx.fillRect(0, 0, width, height)
  
  // Draw grid lines
  ctx.strokeStyle = '#374151'
  ctx.lineWidth = 1
  
  // Vertical lines
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  
  // Horizontal lines
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
  
  // Draw level title
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 24px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(`Level ${props.levelId.split('-')[1] || '1'}`, width / 2, 50)
  
  // Draw subtitle
  ctx.fillStyle = '#9ca3af'
  ctx.font = '16px Arial'
  ctx.fillText('GDevelop Game Engine Integration', width / 2, 80)
  
  // Draw animated character
  if (elapsedTime) {
    const x = (width / 2) + Math.sin(elapsedTime / 500) * 50
    const y = height / 2
    
    // Character body
    ctx.fillStyle = '#4f46e5' // Primary color
    ctx.beginPath()
    ctx.arc(x, y, 30, 0, Math.PI * 2)
    ctx.fill()
    
    // Eyes
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(x - 10, y - 10, 5, 0, Math.PI * 2)
    ctx.arc(x + 10, y - 10, 5, 0, Math.PI * 2)
    ctx.fill()
    
    // Mouth
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y + 5, 15, 0.2, Math.PI - 0.2)
    ctx.stroke()
  }
  
  // Draw instruction
  ctx.fillStyle = '#ffffff'
  ctx.font = '14px Arial'
  ctx.fillText('Complete the coding challenge to progress', width / 2, height - 50)
  
  // Show animation frame
  if (elapsedTime) {
    ctx.fillStyle = '#9ca3af'
    ctx.font = '12px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(`Frame: ${Math.floor(elapsedTime / 16)}`, 20, 20)
  }
}

// Clean up game resources
const disposeGame = () => {
  if (gameInstance.value) {
    // Cancel animation frame
    if (gameInstance.value.animationFrame) {
      cancelAnimationFrame(gameInstance.value.animationFrame)
    }
    
    // Remove canvas
    if (gameInstance.value.canvas && gameInstance.value.canvas.parentNode) {
      gameInstance.value.canvas.parentNode.removeChild(gameInstance.value.canvas)
    }
    
    // Clear reference
    gameInstance.value = null
  }
  
  gameLoaded.value = false
}

// Methods to be called from parent component
const completeTask = () => {
  // This would trigger animations or other effects in the GDevelop game
  // For now, we'll just highlight this in the canvas
  if (gameInstance.value) {
    const { ctx, canvas } = gameInstance.value
    
    // Flash effect
    ctx.fillStyle = 'rgba(16, 185, 129, 0.3)' // Success color
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Emit event
    emit('taskCompleted')
  }
}

const completeGame = () => {
  // Final game completion effect
  if (gameInstance.value) {
    const { ctx, canvas } = gameInstance.value
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Success background
    ctx.fillStyle = '#10b981' // Success color
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Congratulations text
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 32px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Level Completed!', canvas.width / 2, canvas.height / 2 - 20)
    
    ctx.font = '18px Arial'
    ctx.fillText('Great job! You\'ve mastered this challenge.', canvas.width / 2, canvas.height / 2 + 20)
    
    // Emit event
    emit('gameCompleted')
    
    // Call the completion callback
    props.onComplete()
  }
}

// Expose methods to parent component
defineExpose({
  completeTask,
  completeGame
})
</script>

<template>
  <div class="game-engine">
    <div v-if="gameError" class="game-error">
      <p>{{ gameError }}</p>
    </div>
    <div 
      ref="gameContainer" 
      class="game-container bg-gray-800 overflow-hidden rounded-lg"
      :class="{ 'opacity-50': !gameLoaded }"
    >
      <div v-if="!gameLoaded" class="loading-indicator">
        <div class="spinner"></div>
        <p>Loading game engine...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-engine {
  position: relative;
  height: 400px;
  margin-bottom: 1rem;
}

.game-container {
  width: 100%;
  height: 100%;
  transition: opacity 0.3s ease-in-out;
}

.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 10px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #4f46e5;
  animation: spin 1s linear infinite;
}

.game-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ef4444;
  background: rgba(0, 0, 0, 0.7);
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
  z-index: 10;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
