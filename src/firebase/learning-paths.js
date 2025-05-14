/**
 * Learning Paths Configuration for Code4U
 *
 * This file defines the available learning paths for the Code4U platform.
 * Each path has its own set of levels, prerequisites, and metadata.
 */

import { db } from './index.js'
import { collection, doc, getDocs, writeBatch, getDoc } from 'firebase/firestore'

/**
 * Learning path definitions
 */
export const learningPaths = [
  {
    id: 'web-fundamentals',
    title: 'Web Development Fundamentals',
    description: 'Learn the basics of HTML, CSS, and JavaScript to build simple websites',
    icon: '🌐',
    difficulty: 'Beginner',
    estimatedHours: 15,
    levelIds: ['level-1', 'level-2', 'level-3', 'level-4', 'level-5',
               'level-6', 'level-7', 'level-8', 'level-9', 'level-10',
               'level-11', 'level-12', 'level-13', 'level-14', 'level-15'],
    prerequisites: [],
    badgeId: 'web-developer',
    categories: ['HTML', 'CSS', 'JavaScript'],
    tags: ['beginner', 'fundamentals', 'web'],
    featured: true,
    order: 1
  },
  {
    id: 'responsive-design',
    title: 'Responsive Web Design',
    description: 'Master responsive design techniques using CSS Grid, Flexbox, and media queries',
    icon: '📱',
    difficulty: 'Intermediate',
    estimatedHours: 12,
    levelIds: ['level-resp-1', 'level-resp-2', 'level-resp-3', 'level-resp-4', 'level-resp-5'],
    prerequisites: ['web-fundamentals'],
    badgeId: 'responsive-master',
    categories: ['CSS', 'Design'],
    tags: ['responsive', 'flexbox', 'grid', 'intermediate'],
    featured: true,
    order: 2
  },
  {
    id: 'js-dom-manipulation',
    title: 'JavaScript DOM Manipulation',
    description: 'Learn advanced techniques for manipulating the Document Object Model with JavaScript',
    icon: '🧩',
    difficulty: 'Intermediate',
    estimatedHours: 10,
    levelIds: ['level-dom-1', 'level-dom-2', 'level-dom-3', 'level-dom-4', 'level-dom-5'],
    prerequisites: ['web-fundamentals'],
    badgeId: 'dom-wizard',
    categories: ['JavaScript', 'DOM'],
    tags: ['intermediate', 'interactive', 'events'],
    featured: true,
    order: 3
  },
];

/**
 * Sample level definitions for the Responsive Design path
 */
export const responsiveDesignLevels = [
  {
    id: 'level-resp-1',
    number: 1,
    pathId: 'responsive-design',
    title: 'Responsive Design Principles',
    description: 'Learn the fundamental principles of responsive web design, including mobile-first design and viewport settings.',
    category: 'CSS',
    difficulty: 'Intermediate',
    pointsToEarn: 150,
    estimatedTime: '45 minutes',
    prerequisites: ['level-10'], // Requires completion of CSS levels
    learningObjectives: [
      'Understand the concept of responsive web design',
      'Configure the viewport meta tag',
      'Implement mobile-first design principles'
    ],
    realWorldApplications: [
      'Creating websites that work well on phones, tablets, and desktops',
      'Improving user experience across different device sizes',
      'Meeting modern web standards for device compatibility'
    ],
    references: [
      { title: 'MDN Web Docs: Responsive Design', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design' },
      { title: 'Web.dev Responsive Design', url: 'https://web.dev/responsive-web-design-basics/' }
    ],
    tags: ['CSS', 'Responsive', 'Viewport', 'Mobile-First'],
    tasks: [
      {
        id: 'resp-task1',
        title: 'Set up the viewport',
        description: 'Add the viewport meta tag to make your page responsive to different device sizes.',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Responsive Design</title>\n  <!-- Add viewport meta tag here -->\n</head>\n<body>\n  <h1>My Responsive Website</h1>\n  <p>This will look good on any device!</p>\n</body>\n</html>',
        solution: '<meta name="viewport"',
        expectedOutput: 'Viewport meta tag added successfully!',
        errorHint: 'Make sure to add the viewport meta tag in the head section with content="width=device-width, initial-scale=1.0"'
      },
      {
        id: 'resp-task2',
        title: 'Create a mobile-first style',
        description: 'Add CSS that designs for mobile devices first, then enhances for larger screens.',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Responsive Design</title>\n  <style>\n    /* Add your mobile-first styles here */\n    \n  </style>\n</head>\n<body>\n  <div class="container">\n    <h1>My Responsive Website</h1>\n    <p>This will look good on any device!</p>\n  </div>\n</body>\n</html>',
        solution: '@media',
        expectedOutput: 'Mobile-first design implemented successfully!',
        errorHint: 'Your CSS should define base styles for mobile, then use @media queries for larger screens.'
      }
    ]
  },
  {
    id: 'level-resp-2',
    number: 2,
    pathId: 'responsive-design',
    title: 'CSS Flexbox Layout',
    description: 'Master the powerful Flexbox layout model to create flexible, responsive layouts.',
    category: 'CSS',
    difficulty: 'Intermediate',
    pointsToEarn: 200,
    estimatedTime: '60 minutes',
    prerequisites: ['level-resp-1'],
    learningObjectives: [
      'Understand the Flexbox container and item properties',
      'Create flexible layouts that adapt to different screen sizes',
      'Control element alignment and distribution with Flexbox'
    ],
    tasks: [
      {
        id: 'flex-task1',
        title: 'Create a flex container',
        description: 'Set up a flex container with multiple flex items that adjust based on screen size.',
        initialCode: '/* Add your flex container styles here */\n',
        solution: 'display: flex',
        expectedOutput: 'Flex container created successfully!'
      }
    ]
  }
];

/**
 * Sample level definitions for the DOM Manipulation path
 */
export const domManipulationLevels = [
  {
    id: 'level-dom-1',
    number: 1,
    pathId: 'js-dom-manipulation',
    title: 'DOM Selection Methods',
    description: 'Learn how to select and target elements in the DOM using modern JavaScript methods.',
    category: 'JavaScript',
    difficulty: 'Intermediate',
    pointsToEarn: 150,
    estimatedTime: '45 minutes',
    prerequisites: ['level-15'], // Requires completion of JS levels
    learningObjectives: [
      'Understand the Document Object Model (DOM)',
      'Master element selection methods (querySelector, getElementById, etc.)',
      'Learn how to manipulate element properties and attributes'
    ],
    tasks: [
      {
        id: 'dom-task1',
        title: 'Select page elements',
        description: 'Use different selection methods to target elements on a web page.',
        initialCode: '// Write JavaScript to select elements\n',
        solution: 'querySelector',
        expectedOutput: 'Elements selected successfully!'
      }
    ]
  }
];

/**
 * Initialize learning paths in Firestore
 */
export const initLearningPaths = async () => {
  try {
    console.log('Initializing learning paths...');
    const batch = writeBatch(db);

    // Add learning paths
    for (const path of learningPaths) {
      const pathRef = doc(db, 'learning_paths', path.id);
      batch.set(pathRef, path);
      console.log(`Added learning path: ${path.title}`);
    }

    // Add responsive design levels
    for (const level of responsiveDesignLevels) {
      const levelRef = doc(db, 'levels', level.id);
      batch.set(levelRef, level);
      console.log(`Added level: ${level.title}`);
    }

    // Add DOM manipulation levels
    for (const level of domManipulationLevels) {
      const levelRef = doc(db, 'levels', level.id);
      batch.set(levelRef, level);
      console.log(`Added level: ${level.title}`);
    }

    // Commit the batch
    await batch.commit();
    console.log('Learning paths initialized successfully');

    // Add badges for new learning paths
    await initLearningPathBadges();

    return true;
  } catch (error) {
    console.error('Error initializing learning paths:', error);
    return false;
  }
};

/**
 * Initialize badges for learning paths
 */
const initLearningPathBadges = async () => {
  try {
    console.log('Initializing learning path badges...');
    const batch = writeBatch(db);

    // New badges for the responsive design path
    const responsiveBadges = [
      {
        id: 'responsive-apprentice',
        name: 'Responsive Apprentice',
        description: 'Completed your first responsive design challenge',
        category: 'CSS',
        requirements: ['level-resp-1'],
        icon: '📱'
      },
      {
        id: 'flex-master',
        name: 'Flexbox Master',
        description: 'Mastered CSS Flexbox layouts',
        category: 'CSS',
        requirements: ['level-resp-2'],
        icon: '🔄'
      },
      {
        id: 'grid-guru',
        name: 'Grid Guru',
        description: 'Mastered CSS Grid layouts',
        category: 'CSS',
        requirements: ['level-resp-3'],
        icon: '📊'
      },
      {
        id: 'media-maestro',
        name: 'Media Query Maestro',
        description: 'Created complex responsive designs with media queries',
        category: 'CSS',
        requirements: ['level-resp-4'],
        icon: '📲'
      },
      {
        id: 'responsive-master',
        name: 'Responsive Design Master',
        description: 'Completed all responsive design challenges',
        category: 'CSS',
        requirements: ['level-resp-5'],
        icon: '🏆'
      }
    ];

    // New badges for the DOM manipulation path
    const domBadges = [
      {
        id: 'dom-explorer',
        name: 'DOM Explorer',
        description: 'Learned to navigate and select DOM elements',
        category: 'JavaScript',
        requirements: ['level-dom-1'],
        icon: '🔍'
      },
      {
        id: 'event-master',
        name: 'Event Master',
        description: 'Mastered DOM events and event handling',
        category: 'JavaScript',
        requirements: ['level-dom-2'],
        icon: '🎯'
      },
      {
        id: 'dom-creator',
        name: 'DOM Creator',
        description: 'Created and modified DOM elements dynamically',
        category: 'JavaScript',
        requirements: ['level-dom-3'],
        icon: '🏗️'
      },
      {
        id: 'animation-artist',
        name: 'Animation Artist',
        description: 'Created smooth JavaScript animations',
        category: 'JavaScript',
        requirements: ['level-dom-4'],
        icon: '✨'
      },
      {
        id: 'dom-wizard',
        name: 'DOM Wizard',
        description: 'Completed all DOM manipulation challenges',
        category: 'JavaScript',
        requirements: ['level-dom-5'],
        icon: '🧙‍♂️'
      }
    ];

    // Add all badges to Firestore
    for (const badge of [...responsiveBadges, ...domBadges]) {
      const badgeRef = doc(db, 'badges', badge.id);
      batch.set(badgeRef, badge);
      console.log(`Added badge: ${badge.name}`);
    }

    // Commit the batch
    await batch.commit();
    console.log('Learning path badges initialized successfully');

    return true;
  } catch (error) {
    console.error('Error initializing learning path badges:', error);
    return false;
  }
};

/**
 * Fetch available learning paths
 * @returns {Array} Array of learning path objects
 */
export const fetchLearningPaths = async () => {
  try {
    const pathsSnapshot = await getDocs(collection(db, 'learning_paths'));
    return pathsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    return [];
  }
};

/**
 * Fetch levels for a specific learning path
 * @param {string} pathId - ID of the learning path
 * @returns {Array} Array of level objects sorted by number
 */
export const fetchPathLevels = async (pathId) => {
  try {
    const path = await getDoc(doc(db, 'learning_paths', pathId));

    if (!path.exists()) {
      throw new Error(`Learning path with ID ${pathId} not found`);
    }

    const pathData = path.data();
    const levelIds = pathData.levelIds || [];

    // Get all level documents for this path
    const levels = [];

    for (const levelId of levelIds) {
      const levelDoc = await getDoc(doc(db, 'levels', levelId));
      if (levelDoc.exists()) {
        levels.push({
          id: levelDoc.id,
          ...levelDoc.data()
        });
      }
    }

    // Sort by number property
    return levels.sort((a, b) => a.number - b.number);
  } catch (error) {
    console.error(`Error fetching levels for path ${pathId}:`, error);
    return [];
  }
};

export default {
  learningPaths,
  initLearningPaths,
  fetchLearningPaths,
  fetchPathLevels
};
