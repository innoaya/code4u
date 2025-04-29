/**
 * Firebase initialization script for Code Quest
 * This file contains sample data that would be used to populate the Firestore database
 * Run this file once to set up your initial data structure
 */

import { auth, db } from './firebase-node.js'
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

// Sample HTML levels
const htmlLevels = [
  {
    id: 'level-1',
    number: 1,
    title: 'HTML Fundamentals',
    description: 'Learn the basic structure of an HTML document and create your first web page from scratch.',
    category: 'HTML',
    difficulty: 'Beginner',
    pointsToEarn: 100,
    estimatedTime: '30 minutes',
    prerequisites: [],
    tags: ['HTML', 'Web Basics', 'Document Structure'],
    tasks: [
      {
        id: 'task1',
        title: 'Create the HTML boilerplate',
        description: 'Set up the basic HTML document structure with <!DOCTYPE>, <html>, <head>, and <body> tags.',
        initialCode: '<!-- Write your HTML code here -->\n',
        solution: '<html>',
        expectedOutput: 'HTML document structure created successfully!',
        errorHint: 'Your HTML structure is missing some essential elements.'
      },
      {
        id: 'task2',
        title: 'Add a heading to your page',
        description: 'Create an H1 heading with the text "My First Web Page".',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <!-- Add your heading here -->\n  \n</body>\n</html>',
        solution: '<h1>',
        expectedOutput: 'Heading added successfully!',
        errorHint: 'Your page needs an <h1> heading.'
      },
      {
        id: 'task3',
        title: 'Add a paragraph of text',
        description: 'Add a paragraph that describes what you\'re learning.',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <h1>My First Web Page</h1>\n  <!-- Add your paragraph here -->\n  \n</body>\n</html>',
        solution: '<p>',
        expectedOutput: 'Paragraph added successfully!',
        errorHint: 'Your page needs a <p> paragraph element.'
      }
    ]
  },
  {
    id: 'level-2',
    number: 2,
    title: 'HTML Text Formatting',
    description: 'Learn how to format text in HTML using various elements like headings, paragraphs, lists, and more.',
    category: 'HTML',
    difficulty: 'Beginner',
    pointsToEarn: 150,
    estimatedTime: '45 minutes',
    prerequisites: ['HTML Fundamentals'],
    tags: ['HTML', 'Text Formatting', 'Web Development'],
    tasks: [
      {
        id: 'task1',
        title: 'Create different heading levels',
        description: 'Add headings from h1 to h6 to see the difference in sizes.',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Headings</title>\n</head>\n<body>\n  <!-- Add your headings here -->\n  \n</body>\n</html>',
        solution: '<h2>',
        expectedOutput: 'Headings created successfully!',
        errorHint: 'Your page should include multiple heading levels (h1-h6).'
      },
      {
        id: 'task2',
        title: 'Create a list',
        description: 'Create an unordered list with at least 3 items.',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Lists</title>\n</head>\n<body>\n  <h1>My Favorite Foods</h1>\n  <!-- Add your list here -->\n  \n</body>\n</html>',
        solution: '<ul>',
        expectedOutput: 'List created successfully!',
        errorHint: 'You need to create an unordered list with the <ul> and <li> tags.'
      }
    ]
  }
];

// Sample CSS levels
const cssLevels = [
  {
    id: 'level-6',
    number: 6,
    title: 'CSS Selectors',
    description: 'Learn how to select and style HTML elements using CSS selectors.',
    category: 'CSS',
    difficulty: 'Intermediate',
    pointsToEarn: 200,
    estimatedTime: '45 minutes',
    prerequisites: ['HTML Fundamentals'],
    tags: ['CSS', 'Selectors', 'Styling'],
    tasks: [
      {
        id: 'task1',
        title: 'Style elements using element selectors',
        description: 'Use CSS to change the text color of all paragraphs to blue.',
        initialCode: '/* Write your CSS code here */\n',
        solution: 'p {',
        expectedOutput: 'Element selector applied successfully!',
        errorHint: 'You need to select all paragraph elements using the p selector.'
      },
      {
        id: 'task2',
        title: 'Use class selectors',
        description: 'Create a CSS rule for a class named "highlight" that adds a yellow background.',
        initialCode: '/* Write your CSS code here */\n',
        solution: '.highlight',
        expectedOutput: 'Class selector applied successfully!',
        errorHint: 'You need to create a class selector using the .highlight syntax.'
      }
    ]
  }
];

// Sample JavaScript levels
const jsLevels = [
  {
    id: 'level-11',
    number: 11,
    title: 'JavaScript Basics',
    description: 'Learn the fundamentals of JavaScript, including variables, data types, and operators.',
    category: 'JavaScript',
    difficulty: 'Intermediate',
    pointsToEarn: 300,
    estimatedTime: '60 minutes',
    prerequisites: ['HTML Fundamentals', 'CSS Basics'],
    tags: ['JavaScript', 'Programming', 'Web Development'],
    tasks: [
      {
        id: 'task1',
        title: 'Create variables',
        description: 'Declare variables for name, age, and isStudent using the appropriate data types.',
        initialCode: '// Write your JavaScript code here\n',
        solution: 'let name',
        expectedOutput: 'Variables created successfully!',
        errorHint: 'You need to declare variables using let or const.'
      },
      {
        id: 'task2',
        title: 'Write a conditional statement',
        description: 'Write an if statement that checks if age is greater than 18.',
        initialCode: 'let age = 20;\n\n// Write your conditional statement here\n',
        solution: 'if (age > 18)',
        expectedOutput: 'Conditional statement created successfully!',
        errorHint: 'You need to write an if statement that checks if age is greater than 18.'
      }
    ]
  }
];

// Sample badges
const badges = [
  {
    id: 'html-basics',
    name: 'HTML Apprentice',
    description: 'Completed the HTML fundamentals level',
    category: 'HTML',
    requirements: ['level-1']
  },
  {
    id: 'css-basics',
    name: 'CSS Stylist',
    description: 'Mastered the fundamentals of CSS',
    category: 'CSS',
    requirements: ['level-6']
  },
  {
    id: 'js-basics',
    name: 'JavaScript Rookie',
    description: 'Wrote your first JavaScript code',
    category: 'JavaScript',
    requirements: ['level-11']
  }
];

// Initialize Firestore with sample data
export async function initializeFirestore() {
  try {
    console.log('Initializing Firestore with sample data...');

    const batch = writeBatch(db);

    // Add HTML levels
    for (const level of htmlLevels) {
      const levelRef = doc(collection(db, 'levels'), level.id);
      batch.set(levelRef, level);
    }

    // Add CSS levels
    for (const level of cssLevels) {
      const levelRef = doc(collection(db, 'levels'), level.id);
      batch.set(levelRef, level);
    }

    // Add JavaScript levels
    for (const level of jsLevels) {
      const levelRef = doc(collection(db, 'levels'), level.id);
      batch.set(levelRef, level);
    }

    // Add badges
    for (const badge of badges) {
      const badgeRef = doc(collection(db, 'badges'), badge.id);
      batch.set(badgeRef, badge);
    }

    // Commit the batch
    await batch.commit();

    console.log('Sample data initialized successfully!');
    return true;
  } catch (error) {
    console.error('Error initializing sample data:', error);
    return false;
  }
}

// Demo user for testing
export async function createDemoUser() {
  try {
    const email = 'demo@codequest.edu';
    const password = 'demo123';
    
    // First, create the authentication user
    let userCredential;
    try {
      // Try to create the user
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Demo authentication user created successfully!');
    } catch (authError) {
      if (authError.code === 'auth/email-already-in-use') {
        // User already exists, just sign in to get the user credentials
        console.log('Demo user already exists, signing in instead...');
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Other auth error
        throw authError;
      }
    }
    
    // Get the user UID from the authentication
    const uid = userCredential.user.uid;
    
    // Then create/update the user document in Firestore
    const userRef = doc(collection(db, 'users'), uid);
    await setDoc(userRef, {
      displayName: 'Demo User',
      email: email,
      createdAt: new Date(),
      level: 3,
      points: 250,
      completedLevels: ['level-1', 'level-2'],
      badges: ['html-basics'],
      lastActive: new Date()
    });

    console.log('Demo user data created successfully in Firestore!');
    console.log('Demo Login Credentials:', { email, password });
    return true;
  } catch (error) {
    console.error('Error creating demo user:', error);
    return false;
  }
}

// Uncomment to run the initialization when this file is executed directly
initializeFirestore().then(() => createDemoUser());
