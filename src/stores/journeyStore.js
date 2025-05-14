import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, db } from '../firebase'
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { fetchJourneys, fetchJourneyLevels } from '../firebase/journeys'

export const useJourneyStore = defineStore('journey', () => {
  // State
  const journeys = ref([])
  const currentJourney = ref(null)
  const journeyLevels = ref([])
  const userJourneyProgress = ref({})
  const isLoading = ref(false)
  const error = ref(null)
  
  // Computed
  const availableJourneys = computed(() => {
    // Ensure journeys.value exists and is an array
    if (!journeys.value || !Array.isArray(journeys.value)) {
      return [];
    }
    
    if (!auth.currentUser) {
      return journeys.value.filter(journey => !journey.prerequisites?.length);
    }
    
    // Filter journeys based on user's completed prerequisites
    return journeys.value.filter(journey => {
      // If no prerequisites, always available
      if (!journey.prerequisites?.length) return true;
      
      // Ensure userJourneyProgress exists
      if (!userJourneyProgress.value) return false;
      
      // Check if all prerequisites are completed in userJourneyProgress
      return journey.prerequisites.every(prereqId => 
        userJourneyProgress.value[prereqId]?.completed || false
      );
    });
  })
  
  const completedJourneys = computed(() => {
    if (!auth.currentUser || !userJourneyProgress.value || !journeys.value) return [];
    
    return journeys.value.filter(journey => 
      userJourneyProgress.value[journey.id]?.completed
    );
  })
  
  const inProgressJourneys = computed(() => {
    if (!auth.currentUser || !userJourneyProgress.value || !journeys.value) return [];
    
    // Filter paths that are in progress (started but not completed)
    const inProgress = [];
    
    for (const journey of journeys.value) {
      const progress = userJourneyProgress.value[journey.id];
      if (progress && progress.startedAt && !progress.completed) {
        // Calculate completion percentage
        const totalLevels = journey.levelIds?.length || 0;
        const completedLevels = progress.completedLevels?.length || 0;
        const completionPercentage = totalLevels > 0 
          ? Math.round((completedLevels / totalLevels) * 100) 
          : 0;
        
        inProgress.push({
          ...journey,
          progress: {
            ...progress,
            completionPercentage,
            completedLevels
          }
        });
      }
    }
    
    return inProgress;
  })
  
  // Actions
  async function fetchAllJourneys() {
    try {
      isLoading.value = true;
      error.value = null;
      
      const paths = await fetchJourneys();
      journeys.value = paths;
      
      return paths;
    } catch (err) {
      console.error('Error fetching journeys:', err);
      error.value = 'Failed to load journeys';
      return [];
    } finally {
      isLoading.value = false;
    }
  }
  
  async function fetchJourneyDetails(journeyId) {
    try {
      isLoading.value = true;
      error.value = null;
      
      // Find the journey from already loaded journeys or fetch it
      const journey = journeys.value.find(p => p.id === journeyId);
      if (journey) {
        currentJourney.value = journey;
      } else {
        // If we don't have the journey yet, fetch all journeys and find it
        await fetchAllJourneys();
        currentJourney.value = journeys.value.find(p => p.id === journeyId) || null;
      }
      
      if (!currentJourney.value) {
        error.value = 'Journey not found';
        return { journey: null, levels: [] };
      }
      
      // Fetch levels for this journey
      const levels = await fetchJourneyLevels(journeyId);
      
      return {
        journey: currentJourney.value,
        levels
      };
    } catch (err) {
      console.error('Error fetching journey details:', err);
      error.value = 'Failed to load journey details';
      return { journey: null, levels: [] };
    } finally {
      isLoading.value = false;
    }
  }
  
  async function fetchUserJourneyProgress() {
    if (!auth.currentUser) return;
    
    try {
      isLoading.value = true;
      error.value = null;
      
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        userJourneyProgress.value = userData.journeyProgress || {};
      } else {
        userJourneyProgress.value = {};
      }
    } catch (err) {
      console.error('Error fetching user journey progress:', err);
      error.value = 'Failed to load your progress data';
    } finally {
      isLoading.value = false;
    }
  }
  
  async function startJourney(journeyId) {
    if (!auth.currentUser) return false;
    
    try {
      // Ensure we have journeys loaded
      if (journeys.value.length === 0) {
        await fetchAllJourneys();
      }
      
      if (journeys.value.length === 0) {
        throw new Error('Journeys not available. Please try again later.');
      }
      
      const journey = journeys.value.find(p => p.id === journeyId);
      if (!journey) {
        throw new Error(`Journey with ID ${journeyId} not found`);
      }
      
      // Check prerequisites
      if (journey.prerequisites && journey.prerequisites.length > 0) {
        // Fetch user progress if we don't have it
        if (Object.keys(userJourneyProgress.value).length === 0) {
          await fetchUserJourneyProgress();
        }
        
        // Check if all prerequisites are completed
        const missingPrerequisites = journey.prerequisites.filter(
          prereqId => !userJourneyProgress.value[prereqId]?.completed
        );
        
        if (missingPrerequisites.length > 0) {
          const prerequisiteNames = missingPrerequisites.map(
            prereqId => journeys.value.find(p => p.id === prereqId)?.title || prereqId
          );
          
          throw new Error(`You need to complete these journeys first: ${prerequisiteNames.join(', ')}`);
        }
      }
      
      // Start the journey by updating Firestore
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        [`journeyProgress.${journeyId}.startedAt`]: new Date(),
        [`journeyProgress.${journeyId}.lastAccessedAt`]: new Date()
      });
      
      // Update local state
      userJourneyProgress.value = {
        ...userJourneyProgress.value,
        [journeyId]: {
          ...userJourneyProgress.value[journeyId],
          startedAt: new Date(),
          lastAccessedAt: new Date()
        }
      };
      
      return true;
    } catch (err) {
      console.error(`Error starting journey ${journeyId}:`, err);
      error.value = err.message;
      return false;
    }
  }
  
  async function completeJourney(journeyId) {
    if (!auth.currentUser) return false;
    
    try {
      // Update Firestore
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        [`journeyProgress.${journeyId}.completed`]: true,
        [`journeyProgress.${journeyId}.completedAt`]: new Date()
      });
      
      // Update local state
      const currentProgress = userJourneyProgress.value[journeyId] || {};
      
      userJourneyProgress.value = {
        ...userJourneyProgress.value,
        [journeyId]: {
          ...currentProgress,
          completed: true,
          completedAt: new Date()
        }
      };
      
      return true;
    } catch (err) {
      console.error(`Error completing journey ${journeyId}:`, err);
      error.value = err.message;
      return false;
    }
  }
  
  async function completeLevelInJourney(journeyId, levelId) {
    if (!auth.currentUser) return false;
    
    try {
      // Check if the user has started this journey
      const progress = userJourneyProgress.value[journeyId];
      if (!progress || !progress.startedAt) {
        await startJourney(journeyId);
      }
      
      // Update user's journey progress
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        [`journeyProgress.${journeyId}.completedLevels`]: arrayUnion(levelId),
        [`journeyProgress.${journeyId}.lastAccessedAt`]: new Date()
      });
      
      // Update local state
      const currentProgress = userJourneyProgress.value[journeyId] || {};
      const completedLevels = currentProgress.completedLevels || [];
      
      if (!completedLevels.includes(levelId)) {
        completedLevels.push(levelId);
      }
      
      userJourneyProgress.value = {
        ...userJourneyProgress.value,
        [journeyId]: {
          ...currentProgress,
          completedLevels,
          lastAccessedAt: new Date()
        }
      };
      
      // Check if all levels are completed
      const journey = journeys.value.find(p => p.id === journeyId);
      if (journey && journey.levelIds && journey.levelIds.every(id => completedLevels.includes(id))) {
        await completeJourney(journeyId);
      }
      
      return true;
    } catch (err) {
      console.error(`Error completing level ${levelId} in journey ${journeyId}:`, err);
      error.value = err.message;
      return false;
    }
  }
  
  // Function to fetch levels for a specific journey
  async function fetchJourneyLevelsById(journeyId) {
    try {
      isLoading.value = true;
      error.value = null;
      
      // Use the imported fetchJourneyLevels function from journeys.js
      const levels = await fetchJourneyLevels(journeyId);
      journeyLevels.value = levels;
      
      return levels;
    } catch (err) {
      console.error(`Error fetching levels for journey ${journeyId}:`, err);
      error.value = `Failed to load levels for journey`;
      return [];
    } finally {
      isLoading.value = false;
    }
  }
  
  return {
    // State
    journeys,
    currentJourney,
    journeyLevels,
    userJourneyProgress,
    isLoading,
    error,
    
    // Computed
    availableJourneys,
    completedJourneys,
    inProgressJourneys,
    
    // Actions
    fetchAllJourneys,
    fetchJourneyDetails,
    fetchJourneyLevelsById,
    fetchUserJourneyProgress,
    startJourney,
    completeJourney,
    completeLevelInJourney
  };
});
