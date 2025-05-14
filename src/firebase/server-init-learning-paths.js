/**
 * Server-side script to initialize learning paths in Firestore
 * This script is meant to be run with Node.js and not imported into the client application
 */

import { db } from './firebase-node.js';
import { doc, writeBatch } from 'firebase/firestore';

// Learning paths definition - copy from learning-paths.js to avoid import issues
const learningPaths = [
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
    id: 'js-dom-manipulation',
    title: 'JavaScript DOM Manipulation',
    description: 'Master JavaScript techniques to create dynamic and interactive web experiences',
    icon: '⚡',
    difficulty: 'Intermediate',
    estimatedHours: 12,
    levelIds: ['level-dom-1', 'level-dom-2', 'level-dom-3', 'level-dom-4', 'level-dom-5'],
    prerequisites: ['web-fundamentals'],
    badgeId: 'dom-wizard',
    categories: ['JavaScript', 'DOM'],
    tags: ['intermediate', 'interactive', 'dynamic'],
    featured: true,
    order: 3
  }
];

// Sample levels for responsive design path
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
        description: 'Build a card layout that adapts to different screen sizes',
        completed: false
      }
    ]
  }
];

// Sample levels for DOM manipulation path
const domManipulationLevels = [
  {
    id: 'level-dom-1',
    number: 1,
    title: 'DOM Selection Methods',
    description: 'Learn different ways to select and target HTML elements with JavaScript.',
    category: 'JavaScript',
    difficulty: 'Intermediate',
    pointsToEarn: 150,
    estimatedTime: '40 minutes',
    prerequisites: ['level-10'],
    tasks: [
      {
        id: 'task-dom-1-1',
        description: 'Select elements using different methods',
        completed: false
      },
      {
        id: 'task-dom-1-2',
        description: 'Understand the difference between live and static NodeLists',
        completed: false
      }
    ]
  }
];

// Badges for the learning paths
const learningPathBadges = [
  // Responsive design badges
  {
    id: 'responsive-novice',
    name: 'Responsive Design Novice',
    description: 'Completed the first level of responsive web design',
    category: 'CSS',
    requirements: ['level-resp-1'],
    icon: '📱'
  },
  {
    id: 'responsive-apprentice',
    name: 'Responsive Design Apprentice',
    description: 'Completed the first two levels of responsive web design',
    category: 'CSS',
    requirements: ['level-resp-1', 'level-resp-2'],
    icon: '🖥️'
  },
  {
    id: 'responsive-master',
    name: 'Responsive Design Master',
    description: 'Mastered all aspects of responsive web design',
    category: 'CSS',
    requirements: ['level-resp-1', 'level-resp-2', 'level-resp-3', 'level-resp-4'],
    icon: '🏆'
  },

  // DOM manipulation badges
  {
    id: 'dom-novice',
    name: 'DOM Manipulation Novice',
    description: 'Completed the first level of DOM manipulation',
    category: 'JavaScript',
    requirements: ['level-dom-1'],
    icon: '📝'
  },
  {
    id: 'dom-wizard',
    name: 'DOM Wizard',
    description: 'Mastered the art of DOM manipulation',
    category: 'JavaScript',
    requirements: ['level-dom-1', 'level-dom-2', 'level-dom-3', 'level-dom-4', 'level-dom-5'],
    icon: '🧙‍♂️'
  }
];

// Initialize learning paths in Firestore
async function initLearningPaths() {
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

    // Add badges
    for (const badge of learningPathBadges) {
      const badgeRef = doc(db, 'badges', badge.id);
      batch.set(badgeRef, badge);
      console.log(`Added badge: ${badge.name}`);
    }

    // Commit the batch
    await batch.commit();
    console.log('Learning paths initialized successfully');

    return true;
  } catch (error) {
    console.error('Error initializing learning paths:', error);
    return false;
  }
}

// Execute the initialization
const runInit = async () => {
  try {
    console.log('Starting learning paths initialization...');

    await initLearningPaths();

    console.log('Learning paths initialization completed successfully!');
    console.log('All done! You can now close this terminal.');
  } catch (error) {
    console.error('Error initializing learning paths:', error);
    console.error('Initialization failed.');
  }
};

// Run the initialization
runInit();
