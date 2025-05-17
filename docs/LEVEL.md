# Level Data Definition

This document defines the structure of the data used to represent a Level consisting of multiple tasks.

---

## Level Structure

- The curriculum is an **array** of **Level** objects.
- Each **Level** contains metadata about the learning module and an array of **Tasks**.
- Tasks represent interactive coding exercises within a level.

---

## Level Object

Each **Level** object has the following fields:

| Field Name           | Type                       | Description                                                                                          |
|----------------------|----------------------------|----------------------------------------------------------------------------------------------------|
| `id`                 | `string`                   | Unique identifier for the level (e.g., `"level-11"`)                                               |
| `number`             | `number`                   | Numeric sequence/order of the level                                                                |
| `title`              | `string`                   | The title of the level/module                                                                       |
| `description`        | `string`                   | A brief summary describing the purpose and content of the level                                     |
| `category`           | `string`                   | The subject category this level belongs to (e.g., `"JavaScript"`)                                  |
| `difficulty`         | `string`                   | Difficulty rating (e.g., `"Beginner"`, `"Intermediate"`, `"Advanced"`)                             |
| `pointsToEarn`       | `number`                   | Number of points awarded for completing this level                                                 |
| `estimatedTime`      | `string`                   | Approximate time to complete the level (e.g., `"45 minutes"`)                                     |
| `prerequisites`      | `string[]`                 | Array of prerequisite topics or prior levels the learner should know before starting this level    |
| `learningObjectives` | `string[]`                 | Array of learning goals that the learner should achieve by completing the level                    |
| `realWorldApplications` | `string[]`              | Examples of practical uses or applications of the concepts taught in the level                     |
| `references`         | `{ title: string, url: string }[]` | Array of reference resources, each with a title and URL for further study                   |
| `tags`               | `string[]`                 | Keywords or tags for categorizing and searching levels                                             |
| `tasks`              | `Task[]`                   | Array of tasks (interactive coding exercises) contained in the level                               |

---

## Task Object

Each **Task** object within a level includes:

| Field Name         | Type             | Description                                                                                     |
|--------------------|------------------|-------------------------------------------------------------------------------------------------|
| `id`               | `string`         | Unique identifier for the task within the level (e.g., `"task1"`)                              |
| `title`            | `string`         | Title of the coding exercise                                                                    |
| `description`      | `string`         | Detailed instructions describing what the learner needs to do                                  |
| `initialCode`      | `string`         | Starter code provided to the learner as a base for their solution                              |
| `solution`         | `string`         | Partial code or hint representing the expected solution or key part of it                      |
| `expectedOutput`   | `string`         | Message or output expected upon successful completion of the task                              |
| `errorHint`        | `string`         | Helpful hints or suggestions to guide learners if their solution is incorrect                  |

---

## Example: Level and Task (Simplified)

```json
{
  "id": "level-11",
  "number": 11,
  "title": "JavaScript Basics: Start Coding!",
  "description": "Begin your journey into programming! Learn the building blocks of JavaScript including variables, data types, and simple operations.",
  "category": "JavaScript",
  "difficulty": "Beginner",
  "pointsToEarn": 300,
  "estimatedTime": "45 minutes",
  "prerequisites": ["HTML Fundamentals"],
  "learningObjectives": [
    "Understand what JavaScript is and why it's important",
    "Learn about variables and different data types",
    "Use basic operators to perform calculations"
  ],
  "realWorldApplications": [
    "Creating interactive elements on your website",
    "Building simple calculators and tools",
    "Making decisions in your programs"
  ],
  "references": [
    {
      "title": "MDN Web Docs: JavaScript First Steps",
      "url": "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps"
    },
    {
      "title": "W3Schools JavaScript Tutorial",
      "url": "https://www.w3schools.com/js/js_intro.asp"
    }
  ],
  "tags": ["JavaScript", "Programming", "Variables", "Data Types"],
  "tasks": [
    {
      "id": "task1",
      "title": "Create your first variables",
      "description": "Variables are like containers that store information in your program. Create variables for name, age, and isStudent using the appropriate data types (string, number, and boolean).",
      "initialCode": "// Create your variables below\n// Example: let color = \"blue\";\n\n// Your code here:\n",
      "solution": "let name",
      "expectedOutput": "Variables created successfully!",
      "errorHint": "You need to declare variables using let or const. Try: let name = \"Alex\"; let age = 14; let isStudent = true;"
    }
  ]
}
