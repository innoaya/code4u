// This is a test script to manually create a user activity
import { auth, db } from './firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

// Function to test adding an activity
async function testAddActivity() {
  try {
    console.log('Starting test: Adding user activity...')
    
    if (!auth.currentUser) {
      console.error('No user is logged in! Please log in first.')
      return
    }
    
    console.log('Current user:', auth.currentUser.uid)
    
    const activityData = {
      userId: auth.currentUser.uid,
      type: 'test_activity',
      details: {
        message: 'This is a test activity',
        timestamp: new Date().toISOString()
      },
      timestamp: serverTimestamp()
    }
    
    console.log('Attempting to add activity:', activityData)
    
    const docRef = await addDoc(collection(db, 'user_activities'), activityData)
    
    console.log('Activity added successfully with ID:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('Error adding test activity:', error)
    throw error
  }
}

// Export for use in Vue components
export { testAddActivity }
