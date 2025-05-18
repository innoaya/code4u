# Code4U Creator Documentation

This guide is designed for content creators developing educational material for the Code4U platform.

## Table of Contents

1. [Introduction](#introduction)
2. [Creator Role Access](#creator-role-access)
3. [Content Structure](#content-structure)
4. [Solution Checking](#solution-checking)
5. [Creating Effective Levels](#creating-effective-levels)
6. [Journey Organization](#journey-organization)
7. [Badge Creation](#badge-creation)
8. [Content Management Workflow](#content-management-workflow)

## Introduction

Code4U is an interactive educational web application designed to teach middle and high school students web development fundamentals through a gamified learning experience. As a creator, you'll be developing content that engages students while teaching them valuable coding skills in HTML, CSS, and JavaScript.

## Creator Role Access

As a creator, you have the following permissions:

- Create and edit your own journeys, levels, and badges
- Manage the visibility of your content through the `isPublished` field
- View analytics for your created content
- Organize your content into meaningful learning paths

Note that creators cannot permanently delete content - instead, use the `isPublished` toggle to hide content that should not be publicly visible.

## Content Structure

The platform organizes content into a hierarchy:

```
Journeys
  └── Levels
       └── Tasks
```

- **Journeys**: Collections of related levels forming a complete learning path
- **Levels**: Individual coding challenges with specific learning objectives
- **Tasks**: Step-by-step exercises within a level that build toward the learning objective

## Solution Checking

### How Solutions are Verified

Code4U uses pattern matching to verify student solutions. Each task has a `solution` field containing a string that must be present in the student's code to be considered correct.

```javascript
// From gameStore.js
function runCode(code) {
  if (!currentLevel.value || !currentLevel.value.tasks) return false

  const task = currentLevel.value.tasks[currentTask.value]
  userCode.value = code

  // Check if the solution pattern exists in the student's code
  if (code.includes(task.solution)) {
    codeOutput.value = task.expectedOutput
    return true
  } else {
    codeOutput.value = 'Error: ' + task.errorHint
    return false
  }
}
```

### Task Structure

When creating a task, include the following fields:

| Field | Description | Example |
|-------|-------------|---------|
| `id` | Unique identifier for the task | `"task1"` |
| `title` | Short, descriptive title | `"Create a simple if statement"` |
| `description` | Clear instructions for the student | `"Write a program that checks if a user is old enough (13 or older)."` |
| `initialCode` | Starter code for the student | `"let age = 12;\nlet message = \"\";\n// Your code here:"` |
| `solution` | Pattern to check for in student's answer | `"if (age >= 13)"` |
| `expectedOutput` | Success message when correct | `"Conditional statement created successfully!"` |
| `errorHint` | Helpful hint when incorrect | `"Use an if/else statement to check if age is greater than or equal to 13."` |

### Solution Pattern Best Practices

1. **Be specific but flexible**: Choose a solution pattern that must be present in a correct answer but allows for variations in implementation

2. **Focus on key concepts**: Your solution pattern should verify the student understands the core concept being taught

3. **Consider edge cases**: Think about different ways students might correctly solve the problem

4. **Multiple solutions**: If there are multiple valid approaches, consider using several solution patterns and checking if any match

5. **Avoid overly strict checking**: Don't require exact whitespace or formatting matches

## Creating Effective Levels

### Level Structure

Each level includes:

- Core metadata (ID, number, title, description)
- Category (HTML, CSS, or JavaScript)
- Difficulty rating
- Points awarded on completion
- Learning objectives
- Real-world applications
- Reference materials
- Tags for searchability
- A series of tasks that build toward the learning objective

### Best Practices

1. **Clear progression**: Design levels that build on previous knowledge
2. **Engaging context**: Provide real-world scenarios for applying coding concepts
3. **Scaffolded learning**: Start with guided examples and gradually reduce support
4. **Clear success criteria**: Make it obvious what students need to accomplish
5. **Helpful feedback**: Provide specific guidance when students make mistakes

## Journey Organization

Journeys are collections of levels that form a complete learning path. When creating a journey:

1. Group related levels that build toward a cohesive skill set
2. Provide a clear description of what students will learn
3. Set appropriate difficulty and prerequisites
4. Include varied content to maintain engagement
5. Culminate with a project or challenge that integrates all skills

## Badge Creation

Badges are awarded for achievements within the platform. As a creator, you can define badges that are awarded for:

1. Completing specific levels
2. Finishing entire categories (HTML, CSS, JavaScript)
3. Achieving special milestones

Each badge needs:
- A unique identifier
- A descriptive name
- Category classification
- Icon representation
- Requirements for earning

## Content Management Workflow

### Creating New Content

1. **Plan your content**: Define learning objectives, tasks, and progression
2. **Draft in the admin interface**: Create your journeys, levels, and tasks
3. **Test thoroughly**: Verify all solutions work as expected
4. **Review and polish**: Refine descriptions, hints, and examples
5. **Publish when ready**: Toggle the `isPublished` field to make content available

### Updating Existing Content

1. Only published content is visible to regular users
2. You can toggle publication status at any time
3. Make content changes and test thoroughly before republishing

### Collaboration Considerations

1. While you can only edit your own content, you can view others' published content for inspiration
2. Organize your content with clear naming conventions
3. Use tags effectively to help users discover your content

---

By following these guidelines, you'll create engaging, effective learning experiences that help students develop their coding skills within the Code4U platform.
