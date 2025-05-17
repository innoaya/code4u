# Code4U Admin UI Documentation

This document provides a complete guide to the Admin UI implementation for Code4U, which allows administrators to manage journeys, levels, tasks, and other learning content.

## Table of Contents

1. [Overview](#overview)
2. [Data Model](#data-model)
3. [Component Structure](#component-structure)
4. [User Interface](#user-interface)
5. [Access Control](#access-control)
6. [Implementation Details](#implementation-details)
7. [Future Enhancements](#future-enhancements)

## Overview

The Code4U Admin UI provides a comprehensive interface for managing the application's learning content. It enables administrators to:

- Create, read, update, and delete journeys
- Create, read, update, and delete levels with their associated tasks
- View and manage the relationships between journeys and levels
- Track administration activities

This interface follows the same data model as the main application, ensuring consistent data across the platform.

## Data Model

The Admin UI works with three main data types, stored in Firebase Firestore:

### Journey Schema

| Field Name       | Type       | Description                                              |
|------------------|------------|----------------------------------------------------------|
| `id`             | `string`   | Unique identifier (e.g., `"web-fundamentals"`)           |
| `title`          | `string`   | Display title                                            |
| `description`    | `string`   | Detailed description                                     |
| `icon`           | `string`   | Emoji icon                                               |
| `difficulty`     | `string`   | Difficulty level (Beginner, Intermediate, Advanced)      |
| `estimatedHours` | `number`   | Estimated completion time                                |
| `levelIds`       | `string[]` | Array of level IDs included in this journey              |
| `prerequisites`  | `string[]` | Array of prerequisite journey IDs                        |
| `badgeId`        | `string`   | Badge earned on completion                               |
| `categories`     | `string[]` | Technology categories (HTML, CSS, JavaScript, etc.)      |
| `tags`           | `string[]` | Searchable tags                                          |
| `featured`       | `boolean`  | Featured on homepage                                     |
| `order`          | `number`   | Display order                                            |

### Level Schema

| Field Name              | Type                                 | Description                                               |
|-------------------------|--------------------------------------|-----------------------------------------------------------|
| `id`                    | `string`                             | Unique identifier (e.g., `"level-1"`)                     |
| `number`                | `number`                             | Sequential number for ordering                            |
| `title`                 | `string`                             | Display title                                             |
| `description`           | `string`                             | Detailed description                                      |
| `category`              | `string`                             | Technology category (HTML, CSS, JavaScript)               |
| `difficulty`            | `string`                             | Difficulty level                                          |
| `pointsToEarn`          | `number`                             | Points awarded on completion                              |
| `estimatedTime`         | `string`                             | Estimated completion time                                 |
| `prerequisites`         | `string[]`                           | Array of prerequisite level names                         |
| `learningObjectives`    | `string[]`                           | Array of learning objectives                              |
| `realWorldApplications` | `string[]`                           | Array of practical applications                           |
| `references`            | `{ title: string, url: string }[]`   | Array of reference resources                              |
| `tags`                  | `string[]`                           | Searchable tags                                           |
| `tasks`                 | `Task[]`                             | Array of task objects                                     |

### Task Schema

| Field Name       | Type     | Description                                               |
|------------------|----------|-----------------------------------------------------------|
| `id`             | `string` | Unique identifier within the level (e.g., `"task1"`)      |
| `title`          | `string` | Display title                                             |
| `description`    | `string` | Detailed instructions                                     |
| `initialCode`    | `string` | Starting code for the challenge                           |
| `solution`       | `string` | Solution pattern to check for                             |
| `expectedOutput` | `string` | Success message                                           |
| `errorHint`      | `string` | Error guidance for incorrect solutions                    |

## Component Structure

The Admin UI consists of the following Vue components:

### Dashboard Components

- **AdminDashboard.vue**: Main entry point for the admin interface, showing statistics and quick access buttons

### Journey Management

- **JourneyList.vue**: Lists all journeys with actions (view, edit, delete)
- **JourneyForm.vue**: Form for creating and editing journeys, including level selection

### Level Management

- **LevelList.vue**: Lists all levels with actions (view, edit, delete)
- **LevelForm.vue**: Form for creating and editing levels, including task management

## User Interface

### Admin Dashboard

The dashboard provides:

- Overview of content metrics (journey count, level count, badge count)
- Quick action buttons to create new content
- Recent admin activity feed

### Journey Management

The journey management interface allows administrators to:

- View all journeys in a table format with key information
- Create new journeys with all required fields
- Edit existing journeys, including adding/removing levels
- Delete journeys (with confirmation)

### Level Management

The level management interface allows administrators to:

- View all levels with their category, difficulty, and task count
- Create new levels with a comprehensive form for all fields
- Edit existing levels, including adding/removing tasks
- Delete levels (with confirmation and warning about journey dependencies)

### Task Management

Tasks are managed within the level form, allowing administrators to:

- Add multiple tasks to a level
- Configure each task with title, description, initial code, and solution
- Set expected output and error hints for the learning experience

## Access Control

The Admin UI is protected by an authentication guard that ensures only users with the admin role can access these pages:

1. When a user navigates to an admin route, the `requireAdmin` navigation guard is triggered
2. The guard checks if the user is authenticated
3. If authenticated, it verifies the user has the admin role in Firestore
4. If the user lacks admin privileges, they are redirected to the home page

The admin role is stored in the user's document in Firestore:

```javascript
{
  uid: 'user-id',
  role: 'admin',
  // other user properties
}
```

## Implementation Details

### Router Configuration

The Admin UI routes are defined in `router/index.js`:

```javascript
// Admin routes
{
  path: '/admin',
  name: 'admin-dashboard',
  component: () => import('../views/admin/AdminDashboard.vue'),
  beforeEnter: requireAdmin,
  meta: {
    title: 'Admin Dashboard - Code4U'
  }
},
// Journey management routes
{
  path: '/admin/journeys',
  name: 'admin-journey-list',
  component: () => import('../views/admin/journeys/JourneyList.vue'),
  beforeEnter: requireAdmin
},
// Additional routes for creating/editing journeys and levels
```

### Firebase Integration

The Admin UI uses Firebase Firestore for data management:

- Read operations use `getDocs` and `getDoc` to retrieve data
- Write operations use `setDoc` for creating/updating documents
- Delete operations use `deleteDoc` to remove documents

Example of saving a journey:

```javascript
await setDoc(doc(db, 'journeys', journey.value.id), journey.value);
```

### Form Validation

The Admin UI implements basic form validation to ensure data integrity:

- Required fields must be filled in before submission
- IDs are formatted appropriately (lowercase, no spaces)
- Arrays are cleaned of empty values before saving
- Related IDs are validated for existence

## Future Enhancements

Potential improvements for the Admin UI include:

1. **Badge Management**: Add dedicated interface for creating and managing achievement badges
2. **User Management**: Interface for assigning admin roles to users
3. **Bulk Operations**: Tools for batch editing or importing/exporting data
4. **Preview Mode**: Allow viewing content as it would appear to students
5. **Version History**: Track changes to learning content
6. **Media Management**: Tools for uploading and managing images or videos for levels
7. **Analytics Dashboard**: View student progress and engagement metrics

## Usage Guide

To access the Admin UI:

1. Navigate to `/admin` in the application
2. Authenticate with an account that has the admin role
3. Use the dashboard to navigate to journey or level management
4. Create, edit, or delete content as needed

When creating a new journey or level, ensure all required fields are completed and that the content follows the established patterns for optimal student experience.
