# Code Quest - Interactive Web Development Learning Platform

Code Quest is an interactive educational web application designed to teach middle and high school students the fundamentals of web development through gamified learning experiences. Students can learn HTML, CSS, and JavaScript through interactive challenges and progress tracking.

## Features

- **Interactive Learning**: Hands-on coding challenges with real-time feedback
- **Gamified Experience**: Progress tracking, badges, and a leaderboard to motivate students
- **Multi-level Curriculum**: Structured learning path from HTML basics to advanced JavaScript
- **User Authentication**: Secure login and registration system using Firebase
- **Responsive Design**: Works on desktops, tablets, and mobile devices
- **Progress Tracking**: Students can track their progress and earn achievements

## Technology Stack

- **Frontend**: Vue.js 3 with Composition API
- **Styling**: Tailwind CSS for responsive design
- **Backend/Database**: Firebase (Authentication and Firestore)
- **Game Engine**: GDevelop integration for interactive coding challenges
- **State Management**: Pinia for global state management

## Project Structure

```
edugame/
├── public/                 # Static assets
├── src/
│   ├── assets/             # CSS, images, and other assets
│   ├── components/         # Vue components
│   │   ├── GameEngine.vue  # Game engine integration component
│   │   └── ...
│   ├── firebase/           # Firebase configuration and utilities
│   │   ├── index.js        # Firebase initialization
│   │   └── init-sample-data.js # Sample data for the app
│   ├── router/             # Vue Router configuration
│   ├── stores/             # Pinia store modules
│   │   └── gameStore.js    # Game state management
│   ├── views/              # Vue components for pages
│   ├── App.vue             # Root component
│   └── main.js             # Application entry point
├── index.html              # HTML entry point
├── tailwind.config.js      # Tailwind CSS configuration
├── package.json            # Project dependencies
└── README.md              # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/edugame.git
   cd edugame
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
   - Set up Authentication (Email/Password)
   - Create a Firestore database

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

5. Initialize the database (optional for development)
   - Uncomment the initialization code in `src/firebase/init-sample-data.js`
   - Run the initialization script:
   ```bash
   node src/firebase/init-sample-data.js
   ```

6. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Features & Components

### Authentication
- User registration and login powered by Firebase Authentication
- Profile management for students

### Learning Modules
- HTML Fundamentals: Basic HTML structure, tags, and attributes
- CSS Styling: Selectors, properties, and layouts
- JavaScript Basics: Variables, functions, and DOM manipulation

### Game Engine Integration
The application integrates with GDevelop for interactive coding challenges:
- Real-time code execution and validation
- Visual feedback for successful code completion
- Progressive difficulty levels

### User Progress Tracking
- Completed levels tracking
- Achievement badges for completing modules
- Leaderboard to promote healthy competition

## Application Structure

### Views
- Home: Landing page with course information
- Login/Register: Authentication pages
- Levels: Overview of available learning modules
- LevelDetail: Detailed information about a specific level
- Game: Interactive coding environment
- Profile: User progress and achievements
- Leaderboard: Top performers

### Components
- GameEngine: Integration with GDevelop for interactive coding challenges
- Navigation: Responsive navigation bar
- Various UI components (cards, buttons, forms, etc.)

## Firebase Structure

```
/users/{userId}/
  displayName: string
  email: string
  level: number
  points: number
  completedLevels: array
  badges: array
  lastActive: timestamp

/levels/{levelId}/
  title: string
  description: string
  category: string (HTML/CSS/JavaScript)
  difficulty: string
  tasks: array of task objects
  pointsToEarn: number

/badges/
  id: string
  name: string
  description: string
  category: string
  requirements: array
```

## Future Enhancements

- Multiplayer challenges and competitions
- Code playground for free-form experimentation
- Expanded curriculum covering more web technologies
- Teacher dashboard for classroom management
- Mobile app version

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors and beta testers
- Built with Vue.js, Tailwind CSS, and Firebase
- Developed as an educational platform for middle and high school students
