<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { auth, db } from '../firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { uploadProfilePicture, deleteProfilePicture } from '../firebase/storage-utils'
import { trackProfileUpdate } from '../firebase/analytics-utils'

const router = useRouter()
const route = useRoute()
const user = ref(null)
const isLoading = ref(true)
const isSaving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const isFirstLogin = ref(route.query.firstLogin === 'true')

// Form data
const displayName = ref('')
const selectedFile = ref(null)
const previewURL = ref('')

// Fetch user data
onMounted(async () => {
  if (!auth.currentUser) {
    router.push('/login')
    return
  }

  try {
    isLoading.value = true

    // Get user document from Firestore
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))

    if (userDoc.exists()) {
      user.value = {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: userDoc.data().displayName || auth.currentUser.displayName || 'Code4U User',
        photoURL: userDoc.data().photoURL || auth.currentUser.photoURL,
        ...userDoc.data()
      }

      // Set initial form values
      displayName.value = user.value.displayName
      previewURL.value = user.value.photoURL
    } else {
      // If no Firestore document exists, use auth data
      user.value = {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName || 'Code4U User',
        photoURL: auth.currentUser.photoURL
      }

      displayName.value = user.value.displayName
      previewURL.value = user.value.photoURL
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
    errorMessage.value = 'Failed to load your profile. Please try again.'
  } finally {
    isLoading.value = false
  }
})

// Handle file selection
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Please select an image file.'
    return
  }

  // Check file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    errorMessage.value = 'Image size should be less than 2MB.'
    return
  }

  selectedFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    previewURL.value = e.target.result
  }
  reader.readAsDataURL(file)

  // Clear any error message
  errorMessage.value = ''
}

// Remove selected image (just from the form, doesn't delete from storage)
const removeImage = () => {
  selectedFile.value = null
  previewURL.value = user.value?.photoURL || ''
}

// Completely delete profile picture from storage and user profile
const deleteUserProfilePicture = async () => {
  if (!auth.currentUser || !user.value?.photoURL) return

  try {
    isSaving.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const userId = auth.currentUser.uid

    // Delete from Firebase Storage
    await deleteProfilePicture(userId)

    // Update Firestore document
    await updateDoc(doc(db, 'users', userId), {
      photoURL: null
    })

    // Update Firebase Auth profile
    await updateProfile(auth.currentUser, {
      photoURL: null
    })

    // Update local state
    user.value.photoURL = null
    previewURL.value = ''
    selectedFile.value = null

    successMessage.value = 'Profile picture removed successfully!'
  } catch (error) {
    console.error('Error deleting profile picture:', error)
    errorMessage.value = 'Failed to delete profile picture. Please try again.'
  } finally {
    isSaving.value = false
  }
}

// Save profile changes
const saveProfile = async () => {
  if (!auth.currentUser) return

  try {
    isSaving.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const userId = auth.currentUser.uid
    let photoURL = user.value?.photoURL

    // Upload new profile picture if selected
    if (selectedFile.value) {
      photoURL = await uploadProfilePicture(userId, selectedFile.value)
    }

    const updateData = {
      displayName: displayName.value,
      photoURL: photoURL
    }

    // Save profile changes to Firestore
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid)
      
      // If this is a first login, also remove the isFirstLogin flag
      if (isFirstLogin.value) {
        updateData.isFirstLogin = false
      }
      
      // Update Firestore document
      await updateDoc(userDocRef, updateData)
      
      // Track profile update in analytics
      trackProfileUpdate(isFirstLogin.value ? 'initial_setup' : 'profile_edit')
      
      // Update authentication profile if name changed
      if (displayName.value !== user.value.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: displayName.value
        })
      }
    } catch (error) {
      console.error('Error updating Firestore document:', error)
      throw error
    }

    // Update local user object
    user.value = {
      ...user.value,
      displayName: displayName.value,
      photoURL: photoURL
    }

    successMessage.value = 'Profile updated successfully!'

    // Reset file input
    selectedFile.value = null

    // Redirect to profile page after a short delay
    setTimeout(() => {
      router.push('/profile')
    }, 1500)
  } catch (error) {
    console.error('Error updating profile:', error)
    errorMessage.value = 'Failed to update profile. Please try again.'
  } finally {
    isSaving.value = false
  }
}

// Cancel editing
const cancelEdit = () => {
  router.push('/profile')
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">Edit Profile</h1>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>

    <div v-else class="max-w-2xl mx-auto">
      <!-- Welcome message for first-time users -->
      <div v-if="isFirstLogin" class="mb-6 p-4 bg-primary/10 border-l-4 border-primary rounded-lg">
        <h2 class="text-lg font-bold text-primary mb-2">Welcome to Code4U! 👋</h2>
        <p class="mb-2">Please take a moment to personalize your profile before you start your coding journey.</p>
        <ul class="list-disc list-inside ml-2 text-text-secondary">
          <li>Add a profile picture to make your profile more personal</li>
          <li>Update your display name if you'd like</li>
        </ul>
      </div>
      
      <!-- Success message -->
      <div v-if="successMessage" class="mb-6 p-4 bg-success/10 text-success rounded-lg">
        {{ successMessage }}
      </div>

      <!-- Error message -->
      <div v-if="errorMessage" class="mb-6 p-4 bg-danger/10 text-danger rounded-lg">
        {{ errorMessage }}
      </div>

      <div class="card">
        <h2 class="text-xl font-bold mb-6">Profile Information</h2>

        <form @submit.prevent="saveProfile" class="space-y-6">
          <!-- Profile Picture -->
          <div class="text-center mb-8">
            <div class="mb-4">
              <div
                class="w-32 h-32 rounded-full overflow-hidden mx-auto relative border-4 border-primary/20 bg-primary/5"
              >
                <img
                  v-if="previewURL"
                  :src="previewURL"
                  alt="Profile Preview"
                  class="object-cover w-full h-full"
                />
                <div
                  v-else
                  class="flex items-center justify-center w-full h-full text-4xl font-bold text-primary"
                >
                  {{ displayName.charAt(0).toUpperCase() }}
                </div>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <!-- File input disguised as a button -->
              <div class="relative">
                <input
                  type="file"
                  id="profile-image"
                  accept="image/*"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  @change="handleFileSelect"
                />
                <label
                  for="profile-image"
                  class="btn btn-primary cursor-pointer w-full sm:w-auto inline-block"
                >
                  Change Photo
                </label>
              </div>

              <!-- Remove from preview only -->
              <button
                v-if="selectedFile"
                type="button"
                @click="removeImage"
                class="btn bg-white border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>

              <!-- Delete from storage completely -->
              <button
                v-if="user?.photoURL && !selectedFile"
                type="button"
                @click="deleteUserProfilePicture"
                class="btn bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20"
                :disabled="isSaving"
              >
                <span v-if="!isSaving">Delete Photo</span>
                <div v-else class="flex items-center">
                  <div class="animate-spin w-4 h-4 border-2 border-danger border-t-transparent rounded-full mr-2"></div>
                  Deleting...
                </div>
              </button>
            </div>

            <p class="text-text-secondary text-sm mt-2">
              Recommended: Square image, max 2MB
            </p>
          </div>

          <!-- Display Name -->
          <div>
            <label for="displayName" class="block text-sm font-medium text-text-primary mb-1">
              Display Name
            </label>
            <input
              id="displayName"
              v-model="displayName"
              type="text"
              class="input w-full"
              required
              minlength="2"
              maxlength="30"
            />
          </div>

          <!-- Email (read-only) -->
          <div>
            <label for="email" class="block text-sm font-medium text-text-primary mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              :value="user?.email"
              class="input w-full bg-gray-50"
              readonly
              disabled
            />
            <p class="text-text-secondary text-sm mt-1">
              Email cannot be changed
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              class="btn btn-primary flex items-center justify-center"
              :disabled="isSaving"
            >
              <span v-if="!isSaving">Save Changes</span>
              <div v-else class="flex items-center">
                <div class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Saving...
              </div>
            </button>

            <button
              type="button"
              @click="cancelEdit"
              class="btn bg-white border border-gray-300 hover:bg-gray-100"
              :disabled="isSaving"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input {
  @apply border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all duration-200;
}
</style>
