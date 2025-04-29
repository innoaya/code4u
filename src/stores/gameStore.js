import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, db } from '../firebase'
import { doc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore'

export const useGameStore = defineStore('game', () => {
  // State
  const currentLevel = ref(null)
  const userProgress = ref({
    level: 1,
    points: 0,
    completedLevels: [],
    badges: []
  })
  const isLoading = ref(false)
  const error = ref(null)
  
  // Game state
  const gameStarted = ref(false)
  const gameCompleted = ref(false)
  const currentTask = ref(0)
  const userCode = ref('')
  const codeOutput = ref('')

  // Computed
  const isLoggedIn = computed(() => !!auth.currentUser)
  const currentUser = computed(() => auth.currentUser)
  
  // Actions
  async function fetchUserProgress() {
    if (!auth.currentUser) return

    try {
      isLoading.value = true
      error.value = null
      
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
      if (userDoc.exists()) {
        userProgress.value = {
          level: userDoc.data().level || 1,
          points: userDoc.data().points || 0,
          completedLevels: userDoc.data().completedLevels || [],
          badges: userDoc.data().badges || []
        }
      }
    } catch (err) {
      console.error('Error fetching user progress:', err)
      error.value = 'Failed to load user progress'
    } finally {
      isLoading.value = false
    }
  }

  async function loadLevel(levelId) {
    try {
      isLoading.value = true
      error.value = null
      
      // Get level from Firestore
      const levelDoc = await getDoc(doc(db, 'levels', levelId))
      
      if (levelDoc.exists()) {
        currentLevel.value = {
          id: levelDoc.id,
          ...levelDoc.data()
        }
      } else {
        // Use mock data for development
        const levelNum = parseInt(levelId.split('-')[1], 10) || 1
        currentLevel.value = getMockLevel(levelNum)
      }
      
      // Reset game state
      gameStarted.value = false
      gameCompleted.value = false
      currentTask.value = 0
      userCode.value = ''
      codeOutput.value = ''
    } catch (err) {
      console.error('Error loading level:', err)
      error.value = 'Failed to load level data'
    } finally {
      isLoading.value = false
    }
  }

  function startGame() {
    gameStarted.value = true
    currentTask.value = 0
    userCode.value = currentLevel.value?.tasks?.[0]?.initialCode || ''
    codeOutput.value = ''
  }

  async function completeLevel(levelId) {
    gameCompleted.value = true
    
    if (!auth.currentUser) return
    
    try {
      // Update user progress in Firestore
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        completedLevels: arrayUnion(levelId),
        points: increment(currentLevel.value?.pointsToEarn || 100),
        level: increment(1)
      })
      
      // Update local state
      userProgress.value.completedLevels.push(levelId)
      userProgress.value.points += (currentLevel.value?.pointsToEarn || 100)
      userProgress.value.level += 1
      
      // Check for badges
      await checkForBadges()
    } catch (err) {
      console.error('Error updating progress:', err)
    }
  }

  async function checkForBadges() {
    // Logic to award badges based on progress
    // This would be more complex in a real application
    
    // Example: Award HTML badge after completing 5 HTML levels
    const htmlLevels = userProgress.value.completedLevels.filter(
      id => parseInt(id.split('-')[1], 10) <= 5
    )
    
    if (htmlLevels.length >= 5 && !userProgress.value.badges.includes('html-basics')) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          badges: arrayUnion('html-basics')
        })
        userProgress.value.badges.push('html-basics')
      } catch (err) {
        console.error('Error awarding badge:', err)
      }
    }
  }

  function runCode(code) {
    if (!currentLevel.value || !currentLevel.value.tasks) return false
    
    const task = currentLevel.value.tasks[currentTask.value]
    userCode.value = code
    
    // Simple code checking logic - in a real app this would be more sophisticated
    if (code.includes(task.solution)) {
      codeOutput.value = task.expectedOutput
      return true
    } else {
      codeOutput.value = 'Error: ' + task.errorHint
      return false
    }
  }

  function nextTask() {
    if (currentTask.value < (currentLevel.value?.tasks?.length || 0) - 1) {
      currentTask.value++
      userCode.value = currentLevel.value?.tasks?.[currentTask.value]?.initialCode || ''
      codeOutput.value = ''
      return true
    } else {
      return false // No more tasks
    }
  }

  // Helper function for mock data
  function getMockLevel(levelNum) {
    return {
      id: `level-${levelNum}`,
      number: levelNum,
      title: getLevelTitle(levelNum),
      description: `Learn essential ${getLevelCategory(levelNum)} concepts in this interactive level.`,
      category: getLevelCategory(levelNum),
      difficulty: levelNum <= 3 ? 'Beginner' : levelNum <= 8 ? 'Intermediate' : 'Advanced',
      pointsToEarn: levelNum * 100,
      estimatedTime: '30 minutes',
      tasks: getMockTasks(levelNum)
    }
  }

  function getLevelCategory(levelNum) {
    if (levelNum <= 5) return 'HTML'
    if (levelNum <= 10) return 'CSS'
    return 'JavaScript'
  }

  function getLevelTitle(levelNum) {
    const category = getLevelCategory(levelNum)
    if (category === 'HTML') {
      const titles = [
        'HTML Fundamentals',
        'HTML Document Structure',
        'HTML Text Elements',
        'HTML Lists and Tables',
        'HTML Forms and Inputs'
      ]
      return titles[Math.min(levelNum - 1, titles.length - 1)]
    } else if (category === 'CSS') {
      const titles = [
        'CSS Selectors',
        'CSS Box Model',
        'CSS Layouts',
        'CSS Flexbox',
        'CSS Responsive Design'
      ]
      return titles[Math.min(levelNum - 6, titles.length - 1)]
    } else {
      const titles = [
        'JavaScript Basics',
        'JavaScript Functions',
        'JavaScript DOM Manipulation',
        'JavaScript Events',
        'JavaScript Web APIs'
      ]
      return titles[Math.min(levelNum - 11, titles.length - 1)]
    }
  }

  function getMockTasks(levelNum) {
    const category = getLevelCategory(levelNum)
    
    if (category === 'HTML') {
      return [
        {
          id: 'task1',
          title: 'Create the HTML boilerplate',
          description: 'Set up the basic HTML document structure with <!DOCTYPE>, <html>, <head>, and <body> tags.',
          initialCode: '<!-- Write your HTML code here -->\n',
          solution: '<html>',
          expectedOutput: 'HTML document structure created successfully!',
          errorHint: 'Your HTML structure is missing some essential elements.'
        },
        {
          id: 'task2',
          title: 'Add a heading to your page',
          description: 'Create an H1 heading with the text "My First Web Page".',
          initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <!-- Add your heading here -->\n  \n</body>\n</html>',
          solution: '<h1>',
          expectedOutput: 'Heading added successfully!',
          errorHint: 'Your page needs an <h1> heading.'
        },
        {
          id: 'task3',
          title: 'Add a paragraph of text',
          description: 'Add a paragraph that describes what you\'re learning.',
          initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <h1>My First Web Page</h1>\n  <!-- Add your paragraph here -->\n  \n</body>\n</html>',
          solution: '<p>',
          expectedOutput: 'Paragraph added successfully!',
          errorHint: 'Your page needs a <p> paragraph element.'
        }
      ]
    } else if (category === 'CSS') {
      return [
        {
          id: 'task1',
          title: 'Create a CSS rule',
          description: 'Write a CSS rule to change the text color of all paragraphs to blue.',
          initialCode: '/* Write your CSS code here */\n',
          solution: 'color: blue',
          expectedOutput: 'CSS rule created successfully!',
          errorHint: 'Your CSS rule should set the text color to blue.'
        },
        {
          id: 'task2',
          title: 'Style a heading',
          description: 'Create a CSS rule to center the h1 heading and set its font size to 24px.',
          initialCode: 'h1 {\n  /* Style the heading here */\n  \n}',
          solution: 'text-align: center',
          expectedOutput: 'Heading styled successfully!',
          errorHint: 'Your CSS rule should center the text.'
        },
        {
          id: 'task3',
          title: 'Add a border',
          description: 'Add a 2px solid black border to the image.',
          initialCode: 'img {\n  /* Add your border style here */\n  \n}',
          solution: 'border:',
          expectedOutput: 'Border added successfully!',
          errorHint: 'Your CSS rule should include a border property.'
        }
      ]
    } else {
      return [
        {
          id: 'task1',
          title: 'Create a variable',
          description: 'Create a variable called "name" and assign your name to it.',
          initialCode: '// Write your JavaScript code here\n',
          solution: 'let name',
          expectedOutput: 'Variable created successfully!',
          errorHint: 'Your code should declare a variable named "name".'
        },
        {
          id: 'task2',
          title: 'Write a function',
          description: 'Create a function called "greet" that logs "Hello" followed by the name variable.',
          initialCode: 'let name = "Your Name";\n\n// Write your function here\n',
          solution: 'function greet',
          expectedOutput: 'Function created successfully!',
          errorHint: 'Your code should define a function named "greet".'
        },
        {
          id: 'task3',
          title: 'Use DOM manipulation',
          description: 'Write code to change the text of the element with id "output" to "Hello, World!"',
          initialCode: '// Write DOM manipulation code here\n',
          solution: 'document.getElementById',
          expectedOutput: 'DOM manipulation successful!',
          errorHint: 'Your code should use getElementById to select the element.'
        }
      ]
    }
  }

  return {
    // State
    currentLevel,
    userProgress,
    isLoading,
    error,
    gameStarted,
    gameCompleted,
    currentTask,
    userCode,
    codeOutput,
    
    // Computed
    isLoggedIn,
    currentUser,
    
    // Actions
    fetchUserProgress,
    loadLevel,
    startGame,
    completeLevel,
    runCode,
    nextTask
  }
})
