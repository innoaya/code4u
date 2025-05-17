// Store initialization helper
import { useJourneyStore } from './journeyStore';
import { useUserStore } from './userStore';

/**
 * Pre-load critical data for the application
 * This should be called early in the app lifecycle
 */
export async function initializeStores() {
  // Initialize the journey store data
  const journeyStore = useJourneyStore();
  
  // Initialize the user store - initialization happens in the store itself
  useUserStore();
  
  try {
    // Pre-fetch journeys
    await journeyStore.fetchAllJourneys();
    console.log('Journeys pre-loaded successfully');
  } catch (error) {
    console.error('Error pre-loading journeys:', error);
  }
  
  // Add other store initializations here as needed
}
