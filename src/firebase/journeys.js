/**
 * Journeys Configuration for Code4U
 *
 * This file provides client-side functionality for journeyStore.js
 * to fetch and manage journey data from Firestore.
 */

import { db, auth } from './index.js'
import { collection, doc, getDocs, getDoc, query, where } from 'firebase/firestore'

/**
 * Fetch available journeys based on user role
 * @param {boolean} includeUnpublished - Whether to include unpublished journeys (for admin UI)
 * @returns {Array} Array of journey objects
 */
export async function fetchJourneys(includeUnpublished = false) {
  try {
    let journeysSnapshot;
    const currentUser = auth.currentUser;
    
    if (includeUnpublished && currentUser) {
      // For admin views - fetch all journeys
      journeysSnapshot = await getDocs(collection(db, 'journeys'));
    } else {
      // For public views - fetch only published journeys
      const journeysQuery = query(collection(db, 'journeys'), where('isPublished', '==', true));
      journeysSnapshot = await getDocs(journeysQuery);
    }
    
    return journeysSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Error fetching journeys:', error);
    return [];
  }
}

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
}

// Export all client-side journey functions
export default {
  fetchJourneys,
  fetchJourneyLevels
};
