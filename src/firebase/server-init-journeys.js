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
    
    // Commit the batch
    await batch.commit();
    console.log('Journeys initialized successfully!');
  } catch (error) {
    console.error('Error initializing journeys:', error);
  }
}

// Execute the initialization
initJourneys().then(() => {
  console.log('Initialization process completed.');
}).catch(error => {
  console.error('Initialization process failed:', error);
});
