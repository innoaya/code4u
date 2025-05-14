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
    await batch.commit();
    console.log('Journeys initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing journeys:', error);
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
