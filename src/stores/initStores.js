// Store initialization helper
import { useJourneyStore } from './journeyStore';

/**
 * Pre-load critical data for the application
 * This should be called early in the app lifecycle
 */
export async function initializeStores() {
  // Initialize the journey store data
  const journeyStore = useJourneyStore();
  
  try {
    // Pre-fetch journeys
    await journeyStore.fetchAllJourneys();
    console.log('Journeys pre-loaded successfully');
  } catch (error) {
    console.error('Error pre-loading journeys:', error);
  }
  
  // Add other store initializations here as needed
}
