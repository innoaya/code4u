/**
 * Journeys Configuration for Code4U
 *
 * This file defines the available journeys for the Code4U platform.
 * Each journey has its own set of levels, prerequisites, and metadata.
 */

import { db } from './index.js'
import { collection, doc, getDocs, writeBatch, getDoc } from 'firebase/firestore'

/**
 * Journey definitions
 */
export const journeys = [
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
    description: 'Create websites that look great on any device using responsive CSS techniques',
    icon: '📱',
    difficulty: 'Intermediate',
    estimatedHours: 10,
    levelIds: ['responsive-1', 'responsive-2', 'responsive-3', 'responsive-4', 'responsive-5'],
    prerequisites: ['web-fundamentals'],
    badgeId: 'responsive-designer',
    categories: ['CSS', 'Responsive'],
    tags: ['intermediate', 'responsive', 'mobile'],
    featured: true,
    order: 2
  },
  {
    id: 'javascript-dom',
    title: 'JavaScript DOM Manipulation',
    description: 'Learn to create dynamic, interactive web pages with JavaScript',
    icon: '⚡',
    difficulty: 'Intermediate',
    estimatedHours: 12,
    levelIds: ['js-dom-1', 'js-dom-2', 'js-dom-3', 'js-dom-4', 'js-dom-5'],
    prerequisites: ['web-fundamentals'],
    badgeId: 'dom-master',
    categories: ['JavaScript', 'DOM'],
    tags: ['intermediate', 'interactive', 'DOM'],
    featured: false,
    order: 3
  }
];

/**
 * Sample level definitions for the Responsive Design journey
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
 * Sample level definitions for the DOM Manipulation journey
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
 * Initialize development journeys in Firestore
 * @returns {boolean} Success status
 */
export const initializeJourneys = async () => {
  try {
    console.log('Initializing journeys...');
    const batch = writeBatch(db);

    // Add journeys
    for (const journey of journeys) {
      const journeyRef = doc(db, 'journeys', journey.id);
      batch.set(journeyRef, journey);
      console.log(`Added journey: ${journey.title}`);
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
    console.log('Journeys initialized successfully');

    // Add badges for new journeys
    await initJourneyBadges();

    return true;
  } catch (error) {
    console.error('Error initializing journeys:', error);
    return false;
  }
};

/**
 * Initialize badges for journeys
 */
const initJourneyBadges = async () => {
  try {
    console.log('Initializing journey badges...');
    const batch = writeBatch(db);

    // New badges for the responsive design journey
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

    // Add badges to Firestore
    for (const badge of responsiveBadges) {
      const badgeRef = doc(db, 'badges', badge.id);
      batch.set(badgeRef, badge);
      console.log(`Added badge: ${badge.name}`);
    }

    // Commit the badge batch
    await batch.commit();
    console.log('Journey badges initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing journey badges:', error);
    return false;
  }
};

/**
 * Fetch available journeys
 * @returns {Array} Array of journey objects
 */
export async function fetchJourneys() {
  try {
    const journeysSnapshot = await getDocs(collection(db, 'journeys'));
    return journeysSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Error fetching journeys:', error);
    return [];
  }
};

/**
 * Fetch levels for a specific journey
 * @param {string} journeyId - ID of the journey
 * @returns {Array} Array of level objects sorted by number
 */
export async function fetchJourneyLevels(journeyId) {
  try {
    const journey = await getDoc(doc(db, 'journeys', journeyId));

    if (!journey.exists()) {
      throw new Error(`Journey with ID ${journeyId} not found`);
    }

    const journeyData = journey.data();
    
    // If no levels in the journey, return empty array
    if (!journeyData.levelIds || !Array.isArray(journeyData.levelIds) || journeyData.levelIds.length === 0) {
      return [];
    }

    // Get all levels for this journey
    const levelsPromises = journeyData.levelIds.map(levelId => 
      getDoc(doc(db, 'levels', levelId))
    );
    
    const levelDocs = await Promise.all(levelsPromises);
    
    // Map to array of level objects
    const levels = levelDocs
      .filter(doc => doc.exists())
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
    // Sort levels by their number property
    return levels.sort((a, b) => a.number - b.number);
  } catch (error) {
    console.error(`Error fetching levels for journey ${journeyId}:`, error);
    return [];
  }
};

// Export all entities and functions
export default {
  journeys,
  initializeJourneys,
  fetchJourneys,
  fetchJourneyLevels
};
