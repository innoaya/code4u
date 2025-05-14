/**
 * Server-side script to initialize journeys in Firestore
 * This script is meant to be run with Node.js and not imported into the client application
 */

import { db } from './firebase-node.js';
import { doc, writeBatch } from 'firebase/firestore';

// Journeys definition - copy from journeys.js to avoid import issues
const journeys = [
  {
    id: 'web-fundamentals',
    title: 'Web Development Fundamentals',
    description: 'Master the core concepts of HTML, CSS, and JavaScript to build your first websites',
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
    description: 'Learn to create websites that look great on all devices - from phones to desktops',
    icon: '📱',
    difficulty: 'Intermediate',
    estimatedHours: 10,
    levelIds: ['level-resp-1', 'level-resp-2', 'level-resp-3', 'level-resp-4'],
    prerequisites: ['web-fundamentals'],
    badgeId: 'responsive-master',
    categories: ['CSS', 'Design'],
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
    levelIds: ['level-dom-1', 'level-dom-2', 'level-dom-3', 'level-dom-4', 'level-dom-5'],
    prerequisites: ['web-fundamentals'],
    badgeId: 'dom-master',
    categories: ['JavaScript', 'DOM'],
    tags: ['intermediate', 'interactive', 'DOM'],
    featured: false,
    order: 3
  }
];

// Sample levels for responsive design journey
const responsiveDesignLevels = [
  {
    id: 'level-resp-1',
    number: 1,
    title: 'Responsive Design Principles',
    description: 'Learn the fundamental concepts of responsive web design and why it matters.',
    category: 'CSS',
    difficulty: 'Intermediate',
    pointsToEarn: 150,
    estimatedTime: '45 minutes',
    prerequisites: ['level-5'],
    tasks: [
      {
        id: 'task-resp-1-1',
        description: 'Understand the viewport meta tag',
        completed: false
      },
      {
        id: 'task-resp-1-2',
        description: 'Learn about media queries',
        completed: false
      }
    ]
  },
  {
    id: 'level-resp-2',
    number: 2,
    title: 'CSS Flexbox Layout',
    description: 'Master flexbox for creating flexible and responsive layouts.',
    category: 'CSS',
    difficulty: 'Intermediate',
    pointsToEarn: 200,
    estimatedTime: '60 minutes',
    prerequisites: ['level-resp-1'],
    tasks: [
      {
        id: 'task-resp-2-1',
        description: 'Create a responsive navigation bar using flexbox',
        completed: false
      },
      {
        id: 'task-resp-2-2',
        description: 'Build a flexible card layout',
        completed: false
      }
    ]
  }
];

// Sample DOM Manipulation levels
const domManipulationLevels = [
  {
    id: 'level-dom-1',
    number: 1,
    title: 'DOM Selection Methods',
    description: 'Learn how to find and select HTML elements in the DOM.',
    category: 'JavaScript',
    difficulty: 'Intermediate',
    pointsToEarn: 150,
    estimatedTime: '45 minutes',
    prerequisites: ['level-10'], // Requires completion of basic JS levels
    tasks: [
      {
        id: 'task-dom-1-1',
        description: 'Learn to use document.querySelector and querySelectorAll',
        completed: false
      },
      {
        id: 'task-dom-1-2',
        description: 'Practice selecting elements by ID, class, and tag name',
        completed: false
      }
    ]
  }
];

// Badge definitions for journeys
const journeyBadges = [
  // Responsive design badges
  {
    id: 'responsive-novice',
    name: 'Responsive Design Novice',
    description: 'Started your journey into responsive web design',
    category: 'CSS',
    requirements: ['level-resp-1'],
    icon: '📱'
  },
  {
    id: 'flex-master',
    name: 'Flexbox Master',
    description: 'Mastered the CSS Flexbox layout system',
    category: 'CSS',
    requirements: ['level-resp-2'],
    icon: '🔄'
  },
  {
    id: 'grid-guru',
    name: 'Grid Guru',
    description: 'Mastered the CSS Grid layout system',
    category: 'CSS',
    requirements: ['level-resp-3'],
    icon: '📊'
  },
  {
    id: 'responsive-master',
    name: 'Responsive Design Master',
    description: 'Completed all responsive design challenges',
    category: 'CSS',
    requirements: ['level-resp-1', 'level-resp-2', 'level-resp-3', 'level-resp-4'],
    icon: '🏆'
  },

  // DOM Manipulation badges
  {
    id: 'dom-novice',
    name: 'DOM Novice',
    description: 'Started manipulating web pages with JavaScript',
    category: 'JavaScript',
    requirements: ['level-dom-1'],
    icon: '🧩'
  },
  {
    id: 'dom-wizard',
    name: 'DOM Wizard',
    description: 'Mastered dynamic web page manipulation',
    category: 'JavaScript',
    requirements: ['level-dom-1', 'level-dom-2', 'level-dom-3', 'level-dom-4', 'level-dom-5'],
    icon: '⚡'
  }
];

/**
 * Main function to initialize journeys in Firestore
 */
async function initJourneys() {
  try {
    console.log('Starting initialization of journeys...');
    const batch = writeBatch(db);
    
    // Add each journey to Firestore
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
    console.log('Journeys initialized successfully!');
    
    // Initialize badges
    await initJourneyBadges();
    
    return true;
  } catch (error) {
    console.error('Error initializing journeys:', error);
    return false;
  }
}

/**
 * Initialize badges for journeys
 */
async function initJourneyBadges() {
  try {
    console.log('Initializing journey badges...');
    const batch = writeBatch(db);
    
    // Add badges to Firestore
    for (const badge of journeyBadges) {
      const badgeRef = doc(db, 'badges', badge.id);
      batch.set(badgeRef, badge);
      console.log(`Added badge: ${badge.name}`);
    }
    
    // Commit the badge batch
    await batch.commit();
    console.log('Journey badges initialized successfully!');
    return true;
  } catch (error) {
    console.error('Error initializing journey badges:', error);
    return false;
  }
}

/**
 * Run all initialization functions
 */
async function runInit() {
  try {
    console.log('Starting Code4U journey initialization...');
    
    // Initialize journeys and associated data
    await initJourneys();
    
    console.log('Initialization complete!');
    return true;
  } catch (error) {
    console.error('Initialization failed:', error);
    return false;
  }
}

// Execute the initialization
runInit().then(() => {
  console.log('Initialization process completed.');
}).catch(error => {
  console.error('Initialization process failed:', error);
});
