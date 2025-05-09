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

    // User profiles - public read access for leaderboard functionality
    match /users/{userId} {
      // Allow public read access for all users to support leaderboard
      allow read: if true;
      
      // But only allow users to create/update their own data
      allow create: if isSignedIn() && request.auth.uid == userId;
      allow update: if isSignedIn() && request.auth.uid == userId && 
                      request.resource.data.diff(resource.data).affectedKeys()
                      .hasOnly(['displayName', 'photoURL', 'level', 'points', 'badges', 'completedLevels', 'lastLogin']);
      allow delete: if false;
    }

    // Level data - all authenticated users can read, only admins can modify
    match /levels/{levelId} {
      allow read: if isSignedIn();
      allow write: if false; // Restrict level creation/modification to admin tools or server
    }

    // User activities - public read access for activity feed, restricted write
    match /user_activities/{activityId} {
      allow read: if true; // Public read access for activity feed
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }

    // Badges - read-only for all authenticated users
    match /badges/{badgeId} {
      allow read: if isSignedIn();
      allow write: if false;
    }

    // Leaderboard data - public read access
    match /leaderboard/{entryId} {
      allow read: if true; // Allow everyone to read leaderboard data
      allow write: if false; // Should be updated by server functions
    }

    // Legal content - public read access, admin-only write access
    match /legal_content/{documentId} {
      allow read: if true; // Allow everyone to read legal documents
      allow write: if false; // Only admins should update legal content
    }
  }
}
