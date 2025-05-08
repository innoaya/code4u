import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, db } from '../firebase'
import { doc, getDoc, updateDoc, arrayUnion, increment, collection, getDocs, query, where, orderBy, limit, serverTimestamp, addDoc } from 'firebase/firestore'

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
        const levelData = levelDoc.data()
        console.log('Loaded level from Firestore:', levelData)
        
        // Ensure learning objectives array exists and is not empty
        if (!levelData.learningObjectives || levelData.learningObjectives.length === 0) {
          console.warn('Learning objectives missing in Firestore data, adding default ones')
          levelData.learningObjectives = getMockLearningObjectives(levelData.number || 1)
        }
        
        console.log('Learning objectives after check:', levelData.learningObjectives)
        
        currentLevel.value = {
          id: levelDoc.id,
          ...levelData
        }
      } else {
        console.warn(`Level ${levelId} not found in Firestore, using mock data`)
        // Use mock data for development
        const levelNum = parseInt(levelId.split('-')[1], 10) || 1
        currentLevel.value = getMockLevel(levelNum)
        console.log('Using mock level data:', currentLevel.value)
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
      // Extract level number from levelId (e.g., 'level-1' => 1)
      const completedLevelNum = parseInt(levelId.split('-')[1], 10) || 0
      
      // Get current user data to determine the correct next level
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
      const userData = userDoc.exists() ? userDoc.data() : { level: 1 }
      
      // Determine the new level - should be the next sequential level
      // Only update level if the completed level is the current level
      // This prevents skipping levels if a user completes them out of order
      const newLevel = (completedLevelNum === userData.level) ? 
                      completedLevelNum + 1 : 
                      Math.max(userData.level, completedLevelNum)
      
      // Update user progress in Firestore
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        completedLevels: arrayUnion(levelId),
        points: increment(currentLevel.value?.pointsToEarn || 100),
        level: newLevel
      })
      
      // Update local state
      userProgress.value.completedLevels.push(levelId)
      userProgress.value.points += (currentLevel.value?.pointsToEarn || 100)
      userProgress.value.level = newLevel
      
      // Record this activity
      await recordUserActivity('level_completed', {
        levelId,
        levelNumber: currentLevel.value?.number,
        levelTitle: currentLevel.value?.title,
        category: currentLevel.value?.category,
        pointsEarned: currentLevel.value?.pointsToEarn || 100
      })
      
      // Check for badges
      await checkForBadges()
    } catch (err) {
      console.error('Error updating progress:', err)
    }
  }

  async function checkForBadges() {
    if (!auth.currentUser) return
    
    try {
      // Check for individual level badges
      for (let levelNum = 1; levelNum <= 15; levelNum++) {
        const levelId = `level-${levelNum}`
        
        // Check if level is completed
        if (userProgress.value.completedLevels.includes(levelId)) {
          // Determine which badges to check based on level number
          let badgesToCheck = []
          
          if (levelNum <= 5) { // HTML Levels (1-5)
            if (levelNum === 1) badgesToCheck.push('html-apprentice')
            if (levelNum === 2) badgesToCheck.push('html-formatter')
            if (levelNum === 3) badgesToCheck.push('html-navigator')
            if (levelNum === 4) badgesToCheck.push('html-illustrator')
            if (levelNum === 5) badgesToCheck.push('html-organizer')
          } else if (levelNum <= 10) { // CSS Levels (6-10)
            if (levelNum === 6) badgesToCheck.push('css-stylist')
            if (levelNum === 7) badgesToCheck.push('css-selector')
            if (levelNum === 8) badgesToCheck.push('css-layouter')
            if (levelNum === 9) badgesToCheck.push('css-animator')
            if (levelNum === 10) badgesToCheck.push('css-master')
          } else { // JavaScript Levels (11-15)
            if (levelNum === 11) badgesToCheck.push('js-starter')
            if (levelNum === 12) badgesToCheck.push('js-logician')
            if (levelNum === 13) badgesToCheck.push('js-manipulator')
            if (levelNum === 14) badgesToCheck.push('js-event-handler')
            if (levelNum === 15) badgesToCheck.push('js-master')
          }
          
          // Award badges not yet earned
          for (const badgeId of badgesToCheck) {
            if (!userProgress.value.badges.includes(badgeId)) {
              await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                badges: arrayUnion(badgeId)
              })
              userProgress.value.badges.push(badgeId)
              
              // Record badge earned activity with correct name
              const badgeName = getBadgeName(badgeId)
              await recordUserActivity('badge_earned', {
                badgeId,
                badgeName
              })
            }
          }
        }
      }
      
      // Check for category mastery badges
      const completedLevelNumbers = userProgress.value.completedLevels.map(
        id => parseInt(id.split('-')[1], 10)
      )
      
      // HTML Master badge - all HTML levels complete
      const htmlComplete = [1, 2, 3, 4, 5].every(num => completedLevelNumbers.includes(num))
      if (htmlComplete && !userProgress.value.badges.includes('html-master')) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          badges: arrayUnion('html-master')
        })
        userProgress.value.badges.push('html-master')
        await recordUserActivity('badge_earned', {
          badgeId: 'html-master',
          badgeName: 'HTML Master'
        })
      }
      
      // CSS Master badge - all CSS levels complete
      const cssComplete = [6, 7, 8, 9, 10].every(num => completedLevelNumbers.includes(num))
      if (cssComplete && !userProgress.value.badges.includes('css-master')) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          badges: arrayUnion('css-master')
        })
        userProgress.value.badges.push('css-master')
        await recordUserActivity('badge_earned', {
          badgeId: 'css-master',
          badgeName: 'CSS Master'
        })
      }
      
      // JavaScript Master badge - all JS levels complete
      const jsComplete = [11, 12, 13, 14, 15].every(num => completedLevelNumbers.includes(num))
      if (jsComplete && !userProgress.value.badges.includes('js-master')) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          badges: arrayUnion('js-master')
        })
        userProgress.value.badges.push('js-master')
        await recordUserActivity('badge_earned', {
          badgeId: 'js-master',
          badgeName: 'JavaScript Master'
        })
      }
      
      // Web Developer badge - all levels complete
      const allComplete = completedLevelNumbers.length >= 15
      if (allComplete && !userProgress.value.badges.includes('web-developer')) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          badges: arrayUnion('web-developer')
        })
        userProgress.value.badges.push('web-developer')
        await recordUserActivity('badge_earned', {
          badgeId: 'web-developer',
          badgeName: 'Web Developer'
        })
      }
    } catch (err) {
      console.error('Error checking/awarding badges:', err)
    }
  }
  
  // Helper function to get badge name from ID
  function getBadgeName(badgeId) {
    const badgeNames = {
      'html-apprentice': 'HTML Apprentice',
      'html-formatter': 'Text Wizard',
      'html-navigator': 'Web Navigator',
      'html-illustrator': 'Web Illustrator',
      'html-organizer': 'Data Organizer',
      'html-master': 'HTML Master',
      'css-stylist': 'CSS Stylist',
      'css-selector': 'Element Selector',
      'css-layouter': 'Layout Designer',
      'css-animator': 'Animation Creator',
      'css-master': 'CSS Master',
      'js-starter': 'JavaScript Starter',
      'js-logician': 'Logic Master',
      'js-manipulator': 'DOM Manipulator',
      'js-event-handler': 'Event Handler',
      'js-master': 'JavaScript Master',
      'web-developer': 'Web Developer'
    }
    
    return badgeNames[badgeId] || 'Unknown Badge'
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
      learningObjectives: getMockLearningObjectives(levelNum),
      realWorldApplications: [
        `Building websites with ${getLevelCategory(levelNum)}`,
        `Creating interactive user experiences`
      ],
      prerequisites: [],
      references: [
        { 
          title: `MDN Web Docs: ${getLevelCategory(levelNum)}`, 
          url: `https://developer.mozilla.org/en-US/docs/Web/${getLevelCategory(levelNum)}` 
        }
      ],
      tasks: getMockTasks(levelNum)
    }
  }
  
  // Generate appropriate learning objectives based on level
  function getMockLearningObjectives(levelNum) {
    const category = getLevelCategory(levelNum)
    
    if (category === 'HTML') {
      return [
        `Understand what HTML is and why it's important`,
        `Learn the basic structure of an HTML document`,
        `Create headings and paragraphs on a web page`
      ]
    } else if (category === 'CSS') {
      return [
        `Understand what CSS is and how it styles HTML`,
        `Learn how to apply colors and fonts`,
        `Create simple layouts with CSS`
      ]
    } else { // JavaScript
      return [
        `Understand JavaScript basics and syntax`,
        `Learn variables and data types`,
        `Create simple interactive elements`
      ]
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

  // Function to record user activity
  async function recordUserActivity(activityType, details = {}) {
    console.log('Recording activity:', activityType, details);
    if (!auth.currentUser) {
      console.log('No auth user found, cannot record activity');
      return;
    }
    
    try {
      console.log('Adding to Firestore:', activityType, 'for user', auth.currentUser.uid);
      const docRef = await addDoc(collection(db, 'user_activities'), {
        userId: auth.currentUser.uid,
        type: activityType,
        details,
        timestamp: serverTimestamp()
      });
      console.log('Activity recorded successfully with ID:', docRef.id);
    } catch (err) {
      console.error('Error recording user activity:', err);
    }
  }
  
  // Function to fetch user activities
  async function fetchUserActivities(resultLimit = 5) {
    console.log('Fetching user activities with limit:', resultLimit);
    if (!auth.currentUser) {
      console.log('No authenticated user, returning empty array');
      return [];
    }
    
    try {
      console.log('Current user UID:', auth.currentUser.uid);
      
      // Check specific document for debugging
      if (auth.currentUser.email === 'demo@codequest.edu') {
        console.log('Checking specific document for demo@codequest.edu');
        try {
          const specificDoc = await getDoc(doc(db, 'user_activities', 'UEEpaovuF8jZyTgsFMGX'));
          if (specificDoc.exists()) {
            console.log('Found specific document:', specificDoc.id);
            console.log('Document data:', specificDoc.data());
          } else {
            console.log('Specific document not found');
          }
        } catch (err) {
          console.error('Error fetching specific document:', err);
        }
      }
      
      // General query for all user activities
      const q = query(
        collection(db, 'user_activities'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc'),
        limit(resultLimit)
      );
      
      console.log('Executing Firestore query...');
      const snapshot = await getDocs(q);
      console.log(`Found ${snapshot.docs.length} activities`);
      
      // Debugging query results
      snapshot.docs.forEach((doc, index) => {
        console.log(`Document ${index}:`, doc.id);
        console.log(`Data:`, doc.data());
      });
      
      // Process each document
      const activities = snapshot.docs.map(doc => {
        const data = doc.data();
        const timestamp = data.timestamp;
        
        let formattedDate = null;
        
        // Handle different timestamp formats
        if (timestamp && typeof timestamp.toDate === 'function') {
          // Firestore Timestamp object
          formattedDate = timestamp.toDate();
        } else if (timestamp && timestamp._seconds) {
          // Firestore timestamp in seconds format
          formattedDate = new Date(timestamp._seconds * 1000);
        } else if (timestamp) {
          // Regular date string or timestamp
          formattedDate = new Date(timestamp);
        } else {
          // No timestamp, use current time
          formattedDate = new Date();
        }
        
        return {
          id: doc.id,
          ...data,
          timestamp: formattedDate,
          rawTimestamp: timestamp // Keep the original for debugging
        };
      });
      
      console.log('Processed activities:', activities);
      return activities;
    } catch (err) {
      console.error('Error fetching user activities:', err)
      return []
    }
  }
  
  // Calculate progress by category
  function calculateCategoryProgress() {
    const totalLevels = {
      'HTML': 5,  // Levels 1-5
      'CSS': 5,   // Levels 6-10
      'JavaScript': 5 // Levels 11-15
    }
    
    // Count completed levels by category
    const completedCount = {
      'HTML': 0,
      'CSS': 0,
      'JavaScript': 0
    }
    
    userProgress.value.completedLevels.forEach(levelId => {
      const levelNum = parseInt(levelId.split('-')[1], 10)
      
      if (levelNum <= 5) {
        completedCount['HTML']++
      } else if (levelNum <= 10) {
        completedCount['CSS']++
      } else {
        completedCount['JavaScript']++
      }
    })
    
    // Calculate percentages
    return {
      HTML: Math.min(100, Math.round((completedCount['HTML'] / totalLevels['HTML']) * 100)),
      CSS: Math.min(100, Math.round((completedCount['CSS'] / totalLevels['CSS']) * 100)),
      JavaScript: Math.min(100, Math.round((completedCount['JavaScript'] / totalLevels['JavaScript']) * 100))
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
    nextTask,
    
    // Progress tracking
    recordUserActivity,
    fetchUserActivities,
    calculateCategoryProgress
  }
})
