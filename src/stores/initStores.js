// Store initialization helper
import { useLearningPathStore } from './learningPathStore';

/**
 * Pre-load critical data for the application
 * This should be called early in the app lifecycle
 */
export async function initializeStores() {
  // Initialize the learning path store data
  const learningPathStore = useLearningPathStore();
  
  try {
    // Pre-fetch learning paths
    await learningPathStore.fetchAllPaths();
    console.log('Learning paths pre-loaded successfully');
  } catch (error) {
    console.error('Error pre-loading learning paths:', error);
  }
  
  // Add other store initializations here as needed
}
