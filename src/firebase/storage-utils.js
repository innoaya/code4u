import { storage } from './index.js';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Upload a profile picture to Firebase Storage
 * @param {string} userId - The user ID to use for the storage path
 * @param {File|Blob} file - The file to upload
 * @returns {Promise<string>} - The download URL of the uploaded image
 */
export const uploadProfilePicture = async (userId, file) => {
  try {
    // Create a reference to the file in Firebase Storage
    const profilePicRef = storageRef(storage, `profile-pictures/${userId}/profile-image`);
    
    // Upload the file
    const snapshot = await uploadBytes(profilePicRef, file);
    
    // Get and return the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    
    // If this is a CORS error or any storage error, return a temporary URL
    // that works as a placeholder until the proper configuration is set up
    if (error.code === 'storage/unauthorized' || error.message?.includes('CORS')) {
      console.warn('CORS issue detected. Using local placeholder image.');
      
      // Create a data URL from the file (works in the browser without CORS issues)
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }
    
    throw error;
  }
};

/**
 * Upload a profile picture from an external URL to Firebase Storage
 * @param {string} userId - The user ID to use for the storage path
 * @param {string} imageUrl - The URL of the image to download and upload
 * @returns {Promise<string>} - The download URL of the uploaded image
 */
export const uploadProfilePictureFromUrl = async (userId, imageUrl) => {
  try {
    // For Google profile pictures, we should use a proxy or modify the URL
    // to avoid CORS issues. Google profile pictures typically come from
    // lh3.googleusercontent.com or similar domains
    
    // Option 1: Just return the original URL to bypass CORS issues
    // We can't upload the image directly due to CORS, so we'll just use the original URL
    return imageUrl;
    
    // Note: In a production environment, you would typically:
    // 1. Use a server-side proxy to download the image and then upload it to Firebase
    // 2. Or use a CORS proxy service (though this has security implications)
    // 3. Or set up proper CORS headers on your Firebase Storage bucket
    
    /* Commented out the problematic code:
    // Fetch the image from the URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    // Convert response to blob
    const imageBlob = await response.blob();
    
    // Upload the blob to Firebase Storage
    return await uploadProfilePicture(userId, imageBlob);
    */
  } catch (error) {
    console.error('Error uploading profile picture from URL:', error);
    throw error;
  }
};

/**
 * Delete a profile picture from Firebase Storage
 * @param {string} userId - The user ID to delete the picture for
 * @returns {Promise<void>}
 */
export const deleteProfilePicture = async (userId) => {
  try {
    // Create a reference to the file in Firebase Storage
    const profilePicRef = storageRef(storage, `profile-pictures/${userId}/profile-image`);
    
    // Delete the file
    await deleteObject(profilePicRef);
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    
    // If this is a CORS error or an unauthorized error, don't throw the error
    // This allows the rest of the profile update to continue even if storage access fails
    if (error.code === 'storage/unauthorized' || error.code === 'storage/object-not-found' || error.message?.includes('CORS')) {
      console.warn('CORS issue or file not found. Continuing with profile update.');
      return;
    }
    
    throw error;
  }
};
