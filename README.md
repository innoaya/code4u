# Code4U - Interactive Web Development Learning Platform

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-green.svg)](https://github.com/innoaya/code4u)

Code4U is an interactive educational web application designed to teach middle and high school students the fundamentals of web development through gamified learning experiences. Students can learn HTML, CSS, and JavaScript through interactive challenges and progress tracking.

## Features

- **Interactive Learning**: Hands-on coding challenges with real-time feedback
- **Gamified Experience**: Progress tracking, badges, and a leaderboard to motivate students
- **Multi-level Curriculum**: Structured learning path from HTML basics to advanced JavaScript
- **User Authentication**: Secure login and registration system using Firebase with Google SSO
- **Profile Management**: Customizable user profiles with display names and profile pictures
- **Responsive Design**: Works on desktops, tablets, and mobile devices
- **Progress Tracking**: Students can track their progress and earn achievements
- **Community Activity Feed**: View other students' accomplishments and activities
- **Feedback System**: Integrated feedback collection with star ratings and screenshot uploads for issue reporting
- **Legal Framework**: Terms of Service and Privacy Policy documents

## Technology Stack

- **Frontend**: Vue.js 3 with Composition API
- **Styling**: Tailwind CSS for responsive design with Roboto Mono as primary font
- **Backend/Database**: Firebase suite of services:
  - **Authentication**: Email/password and Google SSO login
  - **Firestore**: NoSQL database for user data, levels, activities, badges, and feedback
  - **Storage**: Cloud storage for profile pictures, issue screenshots, and assets
  - **Rules**: Custom security rules for data protection and file uploads
- **State Management**: Pinia for global state management
- **Deployment**: Firebase for Backend, AWS S3 + CloudFront for Frontend

## Project Structure

```
Code4U/
├── public/                 # Static assets
├── src/
│   ├── assets/             # CSS, images, and other assets
│   ├── components/         # Vue components
│   │   ├── ActivityFeed.vue       # Community activity feed component
│   │   ├── FeedbackPanel.vue      # Feedback collection form
│   │   ├── FloatingFeedbackButton.vue # Floating button for feedback
│   │   ├── GameEngine.vue         # Gamification integration component
│   │   ├── ProfileEditor.vue      # Profile editing component
│   │   └── ...
│   ├── firebase/           # Firebase configuration and utilities
│   │   ├── index.js             # Firebase browser initialization
│   │   ├── firebase-node.js     # Firebase Node.js initialization
│   │   ├── analytics-utils.js   # Analytics tracking utilities
│   │   ├── firestore.rules      # Firestore security rules
│   │   ├── init-sample-data.js  # Sample data initialization script
│   │   ├── legal-utils.js       # Legal document utilities
│   │   └── storage-utils.js     # Firebase Storage utilities
│   ├── router/             # Vue Router configuration
│   ├── stores/             # Pinia store modules
│   │   ├── gameStore.js    # Game state and progress management
│   │   ├── userStore.js    # User profile and authentication state
│   │   ├── feedbackStore.js # Feedback system state management
│   │   └── ...
│   ├── views/              # Vue components for pages
│   │   ├── ActivitiesView.vue    # Community activity feed page
│   │   ├── EditProfileView.vue   # Profile editing page
│   │   ├── LevelsView.vue        # Coding levels overview
│   │   ├── PrivacyPolicyView.vue # Privacy policy page
│   │   ├── ProfileView.vue       # User profile page
│   │   ├── TermsOfServiceView.vue # Terms of service page
│   │   └── ...
│   ├── App.vue             # Root component with global layout
│   └── main.js             # Application entry point
├── index.html              # HTML entry point
├── firebase.json           # Firebase configuration file
├── firestore.rules         # Firestore security rules
├── firestore.indexes.json  # Firestore indexes configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── package.json            # Project dependencies
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository
   ```bash
   git clone git@github.com:innoaya/code4u.git
   cd code4u
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a Firebase project
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Set up Authentication (Email/Password and Google Sign-In)
   - Create a Firestore database
   - Set up Firebase Storage for profile pictures
   - Enable Google Analytics (recommended)

4. Configure Firebase
   - Create a `.env` file in the root directory with your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

5. Set up Firebase Security Rules
   - Deploy the Firebase security rules using Firebase CLI:
   ```bash
   # Install Firebase CLI if you haven't already
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Initialize Firebase in your project (if not already done)
   firebase init
   
   # Deploy Firestore and Storage rules
   firebase deploy --only firestore:rules,storage
   ```
   
   The project contains security rules for:
   - `firestore.rules`: Database access controls
     - **Important**: Make sure to allow public read access to the badges collection:
     ```
     match /badges/{badgeId} {
       allow read: if true;
       allow write: if false;
     }
     ```
   - `storage.rules`: File upload permissions and validations

6. Initialize the database (optional for development)
   - Uncomment the initialization code in `src/firebase/init-sample-data.js`
   - Run the initialization script:
   ```bash
   node src/firebase/init-sample-data.js
   ```

7. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Features & Components

### Authentication & User Management
- User registration and login powered by Firebase Authentication
- Google SSO integration for quick onboarding
- Custom profile management with display name editing
- Profile picture upload and management with Firebase Storage
- First-time user onboarding flow

### Learning Modules
- HTML Fundamentals: Basic HTML structure, tags, and attributes
- CSS Styling: Selectors, properties, layouts, and responsive design
- JavaScript Basics: Variables, functions, and DOM manipulation
- Progressive learning path with prerequisites and structured advancement
- Real-world application examples for each concept

### Interactive Learning Environment
- Real-time code execution and validation
- Visual feedback for successful code completion
- Progressive difficulty levels across 15+ coding challenges
- Helpful error messages and hints

### Gamification & Motivation
- Achievement badges for completing modules and special challenges
  - Centralized badge definitions in Firestore `/badges` collection
  - Automatic badge awarding based on level completion
  - Category-based badges (HTML, CSS, JavaScript, Achievement)
- Points system for tracking progress
- Community leaderboard to promote healthy competition
- Activity feed showing community achievements

### User Feedback System
- Floating feedback button accessible throughout the application
- Automatic feedback prompts after key learning milestones
- Star rating system (1-5) for quantitative feedback
- Issue reporting functionality with screenshot upload capability
- Multiple image uploads with preview and progress tracking
- Anonymous feedback option for students

### Legal & Compliance
- Age-appropriate Terms of Service for educational context
- Privacy Policy designed for student data protection
- COPPA-compliant user experience
- Clearly explained data collection practices

## Application Structure

### Views
- **Home**: Landing page with course information and getting started
- **Login/Register**: Authentication pages with Google SSO option
- **Levels**: Overview of available learning modules with progress indicators
- **LevelDetail**: Detailed information about a specific level with prerequisites
- **Game**: Interactive coding environment with real-time feedback
- **Profile**: User progress, achievements, and editable profile information
- **EditProfile**: Profile picture and display name management
- **Leaderboard**: Top performers in the community
- **Activities**: Community activity feed showing recent achievements
- **TermsOfService**: Legal terms for platform usage
- **PrivacyPolicy**: Data handling and privacy information

### Components
- **GameEngine**: Integration with GDevelop for interactive coding challenges
- **Navigation**: Responsive navigation bar with mobile optimization
- **ActivityFeed**: Real-time display of community achievements
- **FeedbackPanel**: Modal for collecting star ratings and feedback
- **FloatingFeedbackButton**: Accessible feedback trigger
- **ProfileEditor**: Profile editing interface with image upload
- **StarRating**: Interactive rating component for feedback
- Various UI components (cards, buttons, forms, etc.) with Roboto Mono styling

## Firebase Structure

```
/users/{userId}/
  displayName: string
  email: string
  photoURL: string (optional, profile picture URL)
  level: number
  points: number
  completedLevels: array
  badges: array
  lastLogin: timestamp
  isFirstLogin: boolean
  settings: object (user preferences)
  role: string

/levels/{levelId}/
  title: string
  description: string
  category: string (HTML/CSS/JavaScript)
  difficulty: string
  tasks: array of task objects
  pointsToEarn: number
  estimatedTime: string
  prerequisites: array
  learningObjectives: array
  realWorldApplications: array
  references: array

/badges/
  id: string
  name: string
  description: string
  category: string
  requirements: array
  icon: string

/user_activities/
  userId: string
  activityType: string (level_complete, badge_earned, etc.)
  timestamp: timestamp
  details: object (level, badge, etc.)
  public: boolean

/feedback/
  userId: string (or 'anonymous')
  type: string (feedback or issue)
  text: string
  rating: number (1-5 stars)
  source: string (floating_button or level_completion)
  timestamp: timestamp
  levelId: string (optional)
  category: string (optional)
  screenshotUrls: array (URLs of uploaded screenshots for issues)

/legal_content/
  terms_of_service: object
  privacy_policy: object
```

## Future Enhancements

- **Collaborative Learning**: Multiplayer challenges and pair programming exercises
- **Code Playground**: Free-form experimentation environment without structured tasks
- **Expanded Curriculum**: Additional modules covering React, Vue, and backend technologies
- **Teacher Dashboard**: Classroom management tools for educators
- **Performance Analytics**: Detailed insights into learning patterns and progress
- **Offline Mode**: Support for learning without constant internet connection
- **Accessibility Improvements**: Enhanced support for students with different abilities
- **Feedback Analysis**: AI-powered insights from student feedback to improve content
- **Achievement Sharing**: Social media integration for sharing accomplishments
- **Mobile App**: Native mobile application for iOS and Android

## Contributing

We welcome contributions to Code4U! Whether you're fixing bugs, improving the documentation, or proposing new features, your help is appreciated.

1. **Fork the repository**: https://github.com/innoaya/code4u
2. **Create a branch**: `git checkout -b feature-name`
3. **Make your changes**
4. **Submit a pull request**

Please make sure to update tests as appropriate and adhere to the existing coding style. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE.md) file for details.

## Acknowledgments

- Thanks to all contributors and beta testers
- Built with Vue.js, Tailwind CSS, and Firebase
- Developed as an educational platform for middle and high school students
