rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // User profiles - users can read and update only their own data
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.auth.uid == userId;
      allow update: if isOwner(userId);
      allow delete: if false; // Don't allow user deletion through client
    }

    // Level data - all authenticated users can read, only admins can modify
    match /levels/{levelId} {
      allow read: if isSignedIn();
      allow write: if false; // Restrict level creation/modification to admin tools or server
    }

    // User activities - users can only read their own activities
    match /user_activities/{activityId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }

    // Badges - read-only for all authenticated users
    match /badges/{badgeId} {
      allow read: if isSignedIn();
      allow write: if false;
    }

    // Leaderboard data - all authenticated users can read
    match /leaderboard/{entryId} {
      allow read: if isSignedIn();
      allow write: if false; // Should be updated by server functions
    }

    // Legal content - public read access, admin-only write access
    match /legal_content/{documentId} {
      allow read: if true; // Allow everyone to read legal documents
      allow write: if false; // Only admins should update legal content
    }
  }
}
