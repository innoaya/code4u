import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { auth, db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export const useUserStore = defineStore('user', () => {
  // State
  const currentUser = ref(null);
  const userRole = ref(null);
  const userProfile = ref(null);
  const isLoading = ref(true);
  
  // Computed properties
  const isAdmin = computed(() => userRole.value === 'admin');
  const isCreator = computed(() => userRole.value === 'creator');
  const isAdminOrCreator = computed(() => isAdmin.value || isCreator.value);
  const isLoggedIn = computed(() => !!currentUser.value);

  // Actions
  function init() {
    onAuthStateChanged(auth, async (user) => {
      isLoading.value = true;
      
      if (user) {
        currentUser.value = user;
        await fetchUserRole(user.uid);
        await fetchUserProfile(user.uid);
      } else {
        currentUser.value = null;
        userRole.value = null;
        userProfile.value = null;
      }
      
      isLoading.value = false;
    });
  }

  async function fetchUserRole(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        userRole.value = userDoc.data().role || 'user';
      } else {
        userRole.value = 'user'; // Default role
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      userRole.value = 'user'; // Default to user on error
    }
  }

  async function fetchUserProfile(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        userProfile.value = userDoc.data();
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }

  // Initialize auth listener on store creation
  init();

  return {
    currentUser,
    userRole,
    userProfile,
    isLoading,
    isAdmin,
    isCreator,
    isAdminOrCreator,
    isLoggedIn,
    fetchUserRole,
    fetchUserProfile
  };
});
