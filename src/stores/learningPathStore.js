import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, db } from '../firebase'
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { fetchLearningPaths, fetchPathLevels as fetchPathLevelsFromFirebase } from '../firebase/learning-paths'

export const useLearningPathStore = defineStore('learningPath', () => {
  // State
  const learningPaths = ref([])
  const currentPath = ref(null)
  const pathLevels = ref([])
  const userPathProgress = ref({})
  const isLoading = ref(false)
  const error = ref(null)
  
  // Computed
  const availablePaths = computed(() => {
    // Ensure learningPaths.value exists and is an array
    if (!learningPaths.value || !Array.isArray(learningPaths.value)) {
      return [];
    }
    
    if (!auth.currentUser) {
      return learningPaths.value.filter(path => !path.prerequisites?.length);
    }
    
    // Filter paths based on user's completed prerequisites
    return learningPaths.value.filter(path => {
      // If no prerequisites, always available
      if (!path.prerequisites?.length) return true;
      
      // Ensure userPathProgress exists
      if (!userPathProgress.value) return false;
      
      // Check if all prerequisites are completed in userPathProgress
      return path.prerequisites.every(prereqId => 
        userPathProgress.value[prereqId]?.completed || false
      );
    });
  })
  
  const completedPaths = computed(() => {
    const completed = [];
    
    // Ensure both learningPaths and userPathProgress exist
    if (!learningPaths.value || !Array.isArray(learningPaths.value) || !userPathProgress.value) {
      return completed;
    }
    
    for (const pathId in userPathProgress.value) {
      if (userPathProgress.value[pathId]?.completed) {
        const path = learningPaths.value.find(p => p.id === pathId);
        if (path) completed.push(path);
      }
    }
    
    return completed;
  })
  
  const inProgressPaths = computed(() => {
    const inProgress = [];
    
    // Ensure both learningPaths and userPathProgress exist
    if (!learningPaths.value || !Array.isArray(learningPaths.value) || !userPathProgress.value) {
      return inProgress;
    }
    
    for (const pathId in userPathProgress.value) {
      const progress = userPathProgress.value[pathId];
      if (progress && progress.startedAt && !progress.completed) {
        const path = learningPaths.value.find(p => p.id === pathId);
        if (path) {
          // Calculate completion percentage
          const totalLevels = path.levelIds?.length || 0;
          const completedLevels = progress.completedLevels?.length || 0;
          const percentage = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;
          
          inProgress.push({
            ...path,
            progress: percentage,
            completedLevels
          });
        }
      }
    }
    
    return inProgress;
  })
  
  // Actions
  async function fetchAllPaths() {
    try {
      isLoading.value = true;
      error.value = null;
      
      const paths = await fetchLearningPaths();
      learningPaths.value = paths;
      
      return paths;
    } catch (err) {
      console.error('Error fetching learning paths:', err);
      error.value = 'Failed to load learning paths';
      return [];
    } finally {
      isLoading.value = false;
    }
  }
  
  async function fetchPathDetails(pathId) {
    try {
      isLoading.value = true;
      error.value = null;
      
      // Find the path from already loaded paths or fetch it
      const path = learningPaths.value.find(p => p.id === pathId);
      if (path) {
        currentPath.value = path;
      } else {
        // If we don't have the path yet, fetch all paths and find it
        await fetchAllPaths();
        currentPath.value = learningPaths.value.find(p => p.id === pathId) || null;
      }
      
      if (!currentPath.value) {
        throw new Error(`Learning path with ID ${pathId} not found`);
      }
      
      // Fetch levels for this path
      const levels = await fetchPathLevels(pathId);
      pathLevels.value = levels;
      
      return { path: currentPath.value, levels };
    } catch (err) {
      console.error(`Error fetching path details for ${pathId}:`, err);
      error.value = 'Failed to load learning path details';
      return { path: null, levels: [] };
    } finally {
      isLoading.value = false;
    }
  }
  
  async function fetchUserPathProgress() {
    if (!auth.currentUser) return {};
    
    try {
      isLoading.value = true;
      error.value = null;
      
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        userPathProgress.value = userData.pathProgress || {};
      } else {
        userPathProgress.value = {};
      }
      
      return userPathProgress.value;
    } catch (err) {
      console.error('Error fetching user path progress:', err);
      error.value = 'Failed to load your learning progress';
      return {};
    } finally {
      isLoading.value = false;
    }
  }
  
  async function startLearningPath(pathId) {
    if (!auth.currentUser) return false;
    
    try {
      // Make sure learningPaths exists and is loaded
      if (!learningPaths.value || !Array.isArray(learningPaths.value)) {
        // Try to fetch paths if not already available
        await fetchAllPaths();
        
        // If still not available after fetching, throw error
        if (!learningPaths.value || !Array.isArray(learningPaths.value)) {
          throw new Error('Learning paths not available. Please try again later.');
        }
      }
      
      // Check if path exists
      const path = learningPaths.value.find(p => p.id === pathId);
      if (!path) {
        throw new Error(`Learning path with ID ${pathId} not found`);
      }
      
      // Check prerequisites
      if (path.prerequisites?.length) {
        // Make sure userPathProgress exists
        if (!userPathProgress.value) {
          await fetchUserPathProgress();
        }
        
        for (const prereqId of path.prerequisites) {
          if (!userPathProgress.value?.[prereqId]?.completed) {
            const prereqPath = learningPaths.value.find(p => p.id === prereqId);
            const prereqTitle = prereqPath?.title || prereqId;
            throw new Error(`You must complete "${prereqTitle}" before starting this path`);
          }
        }
      }
      
      // Update user's path progress
      const pathProgress = userPathProgress.value[pathId] || {};
      const now = new Date();
      
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        [`pathProgress.${pathId}`]: {
          ...pathProgress,
          startedAt: pathProgress.startedAt || now,
          lastAccessedAt: now,
          completedLevels: pathProgress.completedLevels || []
        }
      });
      
      // Update local state
      userPathProgress.value = {
        ...userPathProgress.value,
        [pathId]: {
          ...pathProgress,
          startedAt: pathProgress.startedAt || now,
          lastAccessedAt: now,
          completedLevels: pathProgress.completedLevels || []
        }
      };
      
      return true;
    } catch (err) {
      console.error(`Error starting learning path ${pathId}:`, err);
      error.value = err.message;
      return false;
    }
  }
  
  async function completeLearningPath(pathId) {
    if (!auth.currentUser) return false;
    
    try {
      // Check if path exists
      const path = learningPaths.value.find(p => p.id === pathId);
      if (!path) {
        throw new Error(`Learning path with ID ${pathId} not found`);
      }
      
      // Check if all levels are completed
      const progress = userPathProgress.value[pathId] || {};
      const completedLevels = progress.completedLevels || [];
      const allLevels = path.levelIds || [];
      
      const allCompleted = allLevels.every(levelId => completedLevels.includes(levelId));
      if (!allCompleted) {
        throw new Error(`You must complete all levels in this path before marking it as complete`);
      }
      
      const now = new Date();
      
      // Update user's path progress
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        [`pathProgress.${pathId}`]: {
          ...progress,
          completed: true,
          completedAt: now
        }
      });
      
      // Update local state
      userPathProgress.value = {
        ...userPathProgress.value,
        [pathId]: {
          ...progress,
          completed: true,
          completedAt: now
        }
      };
      
      // Award path completion badge if defined
      if (path.badgeId) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          badges: arrayUnion(path.badgeId)
        });
      }
      
      return true;
    } catch (err) {
      console.error(`Error completing learning path ${pathId}:`, err);
      error.value = err.message;
      return false;
    }
  }
  
  async function completeLevelInPath(pathId, levelId) {
    if (!auth.currentUser) return false;
    
    try {
      // Check if the user has started this path
      const progress = userPathProgress.value[pathId];
      if (!progress || !progress.startedAt) {
        await startLearningPath(pathId);
      }
      
      // Update user's path progress
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        [`pathProgress.${pathId}.completedLevels`]: arrayUnion(levelId),
        [`pathProgress.${pathId}.lastAccessedAt`]: new Date()
      });
      
      // Update local state
      const currentProgress = userPathProgress.value[pathId] || {};
      const completedLevels = currentProgress.completedLevels || [];
      
      if (!completedLevels.includes(levelId)) {
        completedLevels.push(levelId);
      }
      
      userPathProgress.value = {
        ...userPathProgress.value,
        [pathId]: {
          ...currentProgress,
          completedLevels,
          lastAccessedAt: new Date()
        }
      };
      
      // Check if all levels are completed
      const path = learningPaths.value.find(p => p.id === pathId);
      if (path && path.levelIds && path.levelIds.every(id => completedLevels.includes(id))) {
        await completeLearningPath(pathId);
      }
      
      return true;
    } catch (err) {
      console.error(`Error completing level ${levelId} in path ${pathId}:`, err);
      error.value = err.message;
      return false;
    }
  }
  
  // Function to fetch levels for a specific learning path
  async function fetchPathLevels(pathId) {
    try {
      isLoading.value = true;
      error.value = null;
      
      // Use the imported fetchPathLevels function from learning-paths.js (renamed to avoid collision)
      const levels = await fetchPathLevelsFromFirebase(pathId);
      pathLevels.value = levels;
      
      return levels;
    } catch (err) {
      console.error(`Error fetching levels for path ${pathId}:`, err);
      error.value = `Failed to load levels for learning path`;
      return [];
    } finally {
      isLoading.value = false;
    }
  }
  
  return {
    // State
    learningPaths,
    currentPath,
    pathLevels,
    userPathProgress,
    isLoading,
    error,
    
    // Computed
    availablePaths,
    completedPaths,
    inProgressPaths,
    
    // Actions
    fetchAllPaths,
    fetchPathDetails,
    fetchPathLevels,
    fetchUserPathProgress,
    startLearningPath,
    completeLearningPath,
    completeLevelInPath
  }
})
