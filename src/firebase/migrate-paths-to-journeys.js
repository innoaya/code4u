/**
 * Migration script to move data from learning_paths collection to journeys collection
 * This script should be run once to migrate existing data
 */

import { db } from './firebase-node.js';
import { collection, doc, getDocs, writeBatch, updateDoc } from 'firebase/firestore';

/**
 * Main migration function
 * Copies all learning paths to the journeys collection and updates user progress
 */
async function migrateLearningPathsToJourneys() {
  try {
    console.log('Starting migration from learning_paths to journeys...');
    
    // Step 1: Copy all learning paths to journeys collection
    const pathsSnapshot = await getDocs(collection(db, 'learning_paths'));
    const batch = writeBatch(db);
    
    console.log(`Found ${pathsSnapshot.docs.length} learning paths to migrate`);
    
    pathsSnapshot.docs.forEach(pathDoc => {
      const pathData = pathDoc.data();
      const journeyRef = doc(db, 'journeys', pathDoc.id);
      
      // Copy data to the new collection
      batch.set(journeyRef, pathData);
      console.log(`Prepared journey: ${pathData.title}`);
    });
    
    // Commit the batch
    await batch.commit();
    console.log('All learning paths successfully copied to journeys collection');
    
    // Step 2: Update user progress data
    console.log('Updating user progress data...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    // Process each user document
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Check if user has learning path progress
      if (userData.pathProgress) {
        console.log(`Updating progress for user: ${userDoc.id}`);
        
        // Create a new journeyProgress object
        const journeyProgress = {};
        
        // Copy path progress to journey progress
        Object.keys(userData.pathProgress).forEach(pathId => {
          journeyProgress[pathId] = userData.pathProgress[pathId];
        });
        
        // Update the user document
        await updateDoc(doc(db, 'users', userDoc.id), {
          journeyProgress
        });
        
        console.log(`Progress updated for user: ${userDoc.id}`);
      }
    }
    
    console.log('Migration completed successfully!');
    return true;
  } catch (error) {
    console.error('Error during migration:', error);
    return false;
  }
}

// Execute the migration
migrateLearningPathsToJourneys().then(success => {
  if (success) {
    console.log('Migration process complete. All data has been transferred to the new collections.');
  } else {
    console.error('Migration process failed. Please check the error logs and try again.');
  }
}).catch(error => {
  console.error('Migration process failed with an unexpected error:', error);
});
