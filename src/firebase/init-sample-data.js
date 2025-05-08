/**
 * Firebase initialization script for code4u
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
    title: 'HTML Fundamentals: Your First Web Page',
    description: 'Learn the basic building blocks of every website! In this level, you\'ll discover how HTML works and create your very first web page from scratch.',
    category: 'HTML',
    difficulty: 'Beginner',
    pointsToEarn: 100,
    estimatedTime: '30 minutes',
    prerequisites: [],
    learningObjectives: [
      'Understand what HTML is and why it\'s important',
      'Learn the basic structure of an HTML document',
      'Create headings and paragraphs on a web page'
    ],
    realWorldApplications: [
      'Every website you visit uses HTML!',
      'Creating your own personal web page',
      'Sharing information with friends online'
    ],
    references: [
      { title: 'MDN Web Docs: HTML Basics', url: 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics' },
      { title: 'W3Schools HTML Tutorial', url: 'https://www.w3schools.com/html/html_intro.asp' }
    ],
    tags: ['HTML', 'Web Basics', 'Document Structure'],
    tasks: [
      {
        id: 'task1',
        title: 'Create the HTML boilerplate',
        description: 'Every HTML page needs a special structure to work correctly. Create the basic HTML structure with the <!DOCTYPE html> declaration, <html>, <head>, and <body> tags. Think of this like the skeleton for your web page!',
        initialCode: '<!-- Write your HTML code here -->\n<!-- Hint: Start with <!DOCTYPE html> -->\n',
        solution: '<html>',
        expectedOutput: 'HTML document structure created successfully!',
        errorHint: 'Your HTML structure is missing some essential elements. Make sure you have <!DOCTYPE html>, <html>, <head>, and <body> tags.'
      },
      {
        id: 'task2',
        title: 'Add a heading to your page',
        description: 'Headings are like titles for your web page. They help organize your content and make it easy to read. Add an H1 heading with the text "My First Web Page" - this will be the main title of your page!',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <!-- Add your heading here -->\n  \n</body>\n</html>',
        solution: '<h1>',
        expectedOutput: 'Heading added successfully!',
        errorHint: 'Your page needs an <h1> heading. Try adding <h1>My First Web Page</h1> inside the body.'
      },
      {
        id: 'task3',
        title: 'Add a paragraph of text',
        description: 'Paragraphs are used for regular text on your web page. Add a paragraph that introduces yourself or describes what you\'re learning about HTML!',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <h1>My First Web Page</h1>\n  <!-- Add your paragraph here -->\n  \n</body>\n</html>',
        solution: '<p>',
        expectedOutput: 'Paragraph added successfully!',
        errorHint: 'Your page needs a <p> paragraph element. Try adding <p>I am learning HTML with code4u!</p>'
      }
    ]
  },
  {
    id: 'level-2',
    number: 2,
    title: 'HTML Text Formatting: Make Your Content Stand Out',
    description: 'Discover how to make your text look awesome! Learn to format text with bold, italic, underline, and create organized lists that make information easy to read.',
    category: 'HTML',
    difficulty: 'Beginner',
    pointsToEarn: 150,
    estimatedTime: '45 minutes',
    prerequisites: ['HTML Fundamentals'],
    learningObjectives: [
      'Format text using bold, italic, and underline',
      'Create ordered and unordered lists',
      'Use different heading levels to organize content'
    ],
    realWorldApplications: [
      'Creating a recipe page with ingredients list',
      'Making a personal blog with formatted text',
      'Designing a school project presentation'
    ],
    references: [
      { title: 'MDN Web Docs: HTML Text Fundamentals', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/HTML_text_fundamentals' },
      { title: 'W3Schools HTML Text Formatting', url: 'https://www.w3schools.com/html/html_formatting.asp' }
    ],
    tags: ['HTML', 'Text Formatting', 'Lists'],
    tasks: [
      {
        id: 'task1',
        title: 'Create different heading levels',
        description: 'Headings come in different sizes, from h1 (largest) to h6 (smallest). Create at least three different heading levels to organize your page about "My Favorite Hobbies".',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Favorite Hobbies</title>\n</head>\n<body>\n  <!-- Add your headings here -->\n  <!-- Try h1 for the main title -->\n  <!-- Try h2 for sections -->\n  <!-- Try h3 for subsections -->\n  \n</body>\n</html>',
        solution: '<h2>',
        expectedOutput: 'Headings created successfully!',
        errorHint: 'Your page should include multiple heading levels. Try adding <h1>, <h2>, and <h3> headings to organize your content.'
      },
      {
        id: 'task2',
        title: 'Format your text',
        description: 'Make your text more interesting by adding some formatting! Create a paragraph and use <strong> for bold text, <em> for italic text, and <u> for underlined text.',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Text Formatting</title>\n</head>\n<body>\n  <h1>Text Formatting</h1>\n  <!-- Add a paragraph with bold, italic, and underlined text -->\n  \n</body>\n</html>',
        solution: '<strong>',
        expectedOutput: 'Text formatting added successfully!',
        errorHint: 'Try adding a paragraph with formatted text like: <p>This is <strong>bold</strong>, this is <em>italic</em>, and this is <u>underlined</u>.</p>'
      },
      {
        id: 'task3',
        title: 'Create a favorite foods list',
        description: 'Lists help organize information! Create an unordered list (<ul>) with at least 3 list items (<li>) of your favorite foods.',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Favorite Foods</title>\n</head>\n<body>\n  <h1>My Favorite Foods</h1>\n  <!-- Create your unordered list here -->\n  \n</body>\n</html>',
        solution: '<ul>',
        expectedOutput: 'Unordered list created successfully!',
        errorHint: 'You need to create an unordered list with <ul> and at least 3 <li> tags inside it.'
      }
    ]
  },
  {
    id: 'level-3',
    number: 3,
    title: 'HTML Links: Connect Your Pages',
    description: 'Learn how to connect web pages together with links! In this level, you\'ll discover how to create clickable links to other pages and websites.',
    category: 'HTML',
    difficulty: 'Beginner',
    pointsToEarn: 150,
    estimatedTime: '30 minutes',
    prerequisites: ['HTML Text Formatting'],
    learningObjectives: [
      'Create links to other websites',
      'Link to pages within your own website',
      'Add title attributes to provide more information'
    ],
    realWorldApplications: [
      'Creating a personal website with multiple pages',
      'Building a navigation menu',
      'Sharing resources with friends'
    ],
    references: [
      { title: 'MDN Web Docs: Creating hyperlinks', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Creating_hyperlinks' },
      { title: 'W3Schools HTML Links', url: 'https://www.w3schools.com/html/html_links.asp' }
    ],
    tags: ['HTML', 'Links', 'Navigation'],
    tasks: [
      {
        id: 'task1',
        title: 'Create a link to another website',
        description: 'Links let you connect to other websites! Create a link to your favorite website using the <a> tag with the href attribute.',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Links</title>\n</head>\n<body>\n  <h1>My Favorite Websites</h1>\n  <!-- Add a link to a website you like -->\n  \n</body>\n</html>',
        solution: '<a href',
        expectedOutput: 'External link created successfully!',
        errorHint: 'You need to create a link using the <a> tag with an href attribute. Try something like: <a href="https://www.example.com">My favorite website</a>'
      },
      {
        id: 'task2',
        title: 'Create a navigation menu',
        description: 'Navigation menus help users find their way around your website. Create a simple navigation menu with links to "Home", "About", and "Contact" pages.',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Website</title>\n</head>\n<body>\n  <h1>Welcome to My Website</h1>\n  <!-- Create a navigation menu here -->\n  \n  <p>This is the home page of my website.</p>\n</body>\n</html>',
        solution: '<nav>',
        expectedOutput: 'Navigation menu created successfully!',
        errorHint: 'Try creating a navigation menu using the <nav> tag with links inside it.'
      }
    ]
  },
  {
    id: 'level-4',
    number: 4,
    title: 'HTML Images: Add Visual Appeal',
    description: 'Make your web pages come alive with images! Learn how to add pictures, adjust their size, and include alternative text for accessibility.',
    category: 'HTML',
    difficulty: 'Beginner',
    pointsToEarn: 200,
    estimatedTime: '45 minutes',
    prerequisites: ['HTML Links'],
    learningObjectives: [
      'Add images to your web pages',
      'Set image dimensions appropriately',
      'Provide alternative text for accessibility'
    ],
    realWorldApplications: [
      'Creating a photo gallery',
      'Adding a logo to your website',
      'Showing product images for an online store'
    ],
    references: [
      { title: 'MDN Web Docs: Images in HTML', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Images_in_HTML' },
      { title: 'W3Schools HTML Images', url: 'https://www.w3schools.com/html/html_images.asp' }
    ],
    tags: ['HTML', 'Images', 'Accessibility'],
    tasks: [
      {
        id: 'task1',
        title: 'Add an image to your page',
        description: 'Images make your web pages more interesting! Add an image to your page using the <img> tag with src and alt attributes.',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Images</title>\n</head>\n<body>\n  <h1>My Favorite Animals</h1>\n  <!-- Add an image here -->\n  \n</body>\n</html>',
        solution: '<img src=',
        expectedOutput: 'Image added successfully!',
        errorHint: 'You need to add an image using the <img> tag with src and alt attributes. Try: <img src="url-to-image.jpg" alt="Description of image">'
      },
      {
        id: 'task2',
        title: 'Create a simple gallery',
        description: 'Create a simple gallery with at least 3 images. Make sure to include alternative text for each image to make your page accessible to everyone!',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Gallery</title>\n</head>\n<body>\n  <h1>My Photo Gallery</h1>\n  <!-- Create your gallery with at least 3 images here -->\n  \n</body>\n</html>',
        solution: 'alt=',
        expectedOutput: 'Gallery created successfully!',
        errorHint: 'Create a gallery with at least 3 images. Remember to include the alt attribute for each image.'
      }
    ]
  },
  {
    id: 'level-5',
    number: 5,
    title: 'HTML Tables: Organize Data',
    description: 'Learn how to organize information in rows and columns! Tables are perfect for displaying structured data like schedules, scores, or product information.',
    category: 'HTML',
    difficulty: 'Intermediate',
    pointsToEarn: 250,
    estimatedTime: '60 minutes',
    prerequisites: ['HTML Images'],
    learningObjectives: [
      'Create basic HTML tables',
      'Add table headers for better organization',
      'Use rowspan and colspan to create more complex tables'
    ],
    realWorldApplications: [
      'Making a class schedule',
      'Creating a scoreboard for a game',
      'Displaying product comparison information'
    ],
    references: [
      { title: 'MDN Web Docs: HTML Table Basics', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML/Tables/Basics' },
      { title: 'W3Schools HTML Tables', url: 'https://www.w3schools.com/html/html_tables.asp' }
    ],
    tags: ['HTML', 'Tables', 'Data Organization'],
    tasks: [
      {
        id: 'task1',
        title: 'Create a simple table',
        description: 'Create a table with 3 rows and 3 columns. Include table headers (th) for each column.',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Table</title>\n</head>\n<body>\n  <h1>My Schedule</h1>\n  <!-- Create your table here -->\n  \n</body>\n</html>',
        solution: '<table>',
        expectedOutput: 'Table created successfully!',
        errorHint: 'Create a table using <table>, <tr>, <th>, and <td> elements. Start with <table> and add rows with <tr>.'
      },
      {
        id: 'task2',
        title: 'Add a caption to your table',
        description: 'Table captions help explain what the table contains. Add a caption to your table using the <caption> element.',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Table</title>\n</head>\n<body>\n  <h1>Class Schedule</h1>\n  <table>\n    <!-- Add your caption here -->\n    <tr>\n      <th>Time</th>\n      <th>Monday</th>\n      <th>Wednesday</th>\n    </tr>\n    <tr>\n      <td>9:00 AM</td>\n      <td>Math</td>\n      <td>Science</td>\n    </tr>\n    <tr>\n      <td>11:00 AM</td>\n      <td>History</td>\n      <td>English</td>\n    </tr>\n  </table>\n</body>\n</html>',
        solution: '<caption>',
        expectedOutput: 'Caption added successfully!',
        errorHint: 'Add a caption to your table using the <caption> element right after the opening <table> tag.'
      }
    ]
  }
];

// Sample CSS levels
const cssLevels = [
  {
    id: 'level-6',
    number: 6,
    title: 'CSS Basics: Adding Style to Your Pages',
    description: 'Discover how to make your web pages beautiful! Learn how to add colors, fonts, and style to your HTML elements using CSS.',
    category: 'CSS',
    difficulty: 'Beginner',
    pointsToEarn: 200,
    estimatedTime: '45 minutes',
    prerequisites: ['HTML Fundamentals'],
    learningObjectives: [
      'Understand what CSS is and how it works with HTML',
      'Learn different ways to add CSS to your HTML',
      'Apply basic styles like colors and fonts'
    ],
    realWorldApplications: [
      'Making your personal website look professional',
      'Creating a colorful online poster',
      'Designing a digital birthday card'
    ],
    references: [
      { title: 'MDN Web Docs: CSS Basics', url: 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/CSS_basics' },
      { title: 'W3Schools CSS Tutorial', url: 'https://www.w3schools.com/css/css_intro.asp' }
    ],
    tags: ['CSS', 'Styling', 'Colors', 'Fonts'],
    tasks: [
      {
        id: 'task1',
        title: 'Add your first CSS style',
        description: 'Add an internal style sheet to your HTML using the <style> tag in the head section. Make all h1 headings blue.',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Styled Page</title>\n  <!-- Add your style tag here -->\n  \n</head>\n<body>\n  <h1>Welcome to My Colorful Page</h1>\n  <p>This is a paragraph that will stay the default color.</p>\n</body>\n</html>',
        solution: '<style>',
        expectedOutput: 'Style added successfully!',
        errorHint: 'Add a <style> tag in the head section with a rule to make h1 elements blue. Try: <style>h1 { color: blue; }</style>'
      },
      {
        id: 'task2',
        title: 'Style multiple elements',
        description: 'Use CSS to style paragraphs to be dark gray and have a larger font size. Also make h1 headings red and centered.',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Multiple Styles</title>\n  <style>\n    /* Add your styles here */\n    \n  </style>\n</head>\n<body>\n  <h1>My Awesome Website</h1>\n  <p>This is my first paragraph with custom styling.</p>\n  <p>This is another paragraph that should look the same.</p>\n</body>\n</html>',
        solution: 'p {',
        expectedOutput: 'Multiple styles added successfully!',
        errorHint: 'Add CSS rules for both p and h1 elements with different properties.'
      }
    ]
  },
  {
    id: 'level-7',
    number: 7,
    title: 'CSS Selectors: Target Elements with Precision',
    description: 'Learn how to select exactly the right elements to style! Master different types of CSS selectors to have precise control over your page design.',
    category: 'CSS',
    difficulty: 'Beginner',
    pointsToEarn: 250,
    estimatedTime: '45 minutes',
    prerequisites: ['CSS Basics'],
    learningObjectives: [
      'Use element, class, and ID selectors',
      'Combine selectors for more specific targeting',
      'Style elements based on their relationships'
    ],
    realWorldApplications: [
      'Creating a navigation menu with different states',
      'Designing a product card with styled sections',
      'Building a form with styled input fields'
    ],
    references: [
      { title: 'MDN Web Docs: CSS Selectors', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors' },
      { title: 'W3Schools CSS Selectors', url: 'https://www.w3schools.com/css/css_selectors.asp' }
    ],
    tags: ['CSS', 'Selectors', 'Styling', 'Specificity'],
    tasks: [
      {
        id: 'task1',
        title: 'Use different types of selectors',
        description: 'Create styles using element, class, and ID selectors. Make all paragraphs blue, add a "highlight" class with yellow background, and give a special #mainTitle ID with large font size.',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>CSS Selectors</title>\n  <style>\n    /* Add your selectors and styles here */\n    \n  </style>\n</head>\n<body>\n  <h1 id="mainTitle">Welcome to My Website</h1>\n  <p>This is a regular paragraph.</p>\n  <p class="highlight">This paragraph should be highlighted!</p>\n  <p>This is another regular paragraph.</p>\n</body>\n</html>',
        solution: '.highlight',
        expectedOutput: 'Selectors applied successfully!',
        errorHint: 'Create three different selectors: one for all p elements, one for the .highlight class, and one for the #mainTitle ID.'
      },
      {
        id: 'task2',
        title: 'Combine selectors',
        description: 'Use combined selectors to style elements more specifically. Create a style that only affects paragraphs inside a div with class "special".',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Combined Selectors</title>\n  <style>\n    /* Style all paragraphs to be blue */\n    p { color: blue; }\n    \n    /* Add your combined selector here to make paragraphs \n       inside the special div have a different color */\n    \n  </style>\n</head>\n<body>\n  <p>This paragraph is blue.</p>\n  \n  <div class="special">\n    <p>This paragraph should be a different color!</p>\n    <p>This paragraph too!</p>\n  </div>\n  \n  <p>This paragraph is blue again.</p>\n</body>\n</html>',
        solution: '.special p',
        expectedOutput: 'Combined selector applied successfully!',
        errorHint: 'Use a combined selector with the format ".special p" to target paragraphs inside the special div.'
      }
    ]
  },
  {
    id: 'level-8',
    number: 8,
    title: 'CSS Box Model: Understanding Layout',
    description: 'Learn how elements take up space on your page! Master the CSS box model to control margins, borders, padding, and size of your elements.',
    category: 'CSS',
    difficulty: 'Intermediate',
    pointsToEarn: 300,
    estimatedTime: '60 minutes',
    prerequisites: ['CSS Selectors'],
    learningObjectives: [
      'Understand the CSS box model concept',
      'Apply margins, padding, and borders',
      'Control element dimensions with width and height'
    ],
    realWorldApplications: [
      'Creating product cards with consistent spacing',
      'Designing buttons with proper padding and borders',
      'Building a photo gallery with even spacing'
    ],
    references: [
      { title: 'MDN Web Docs: The box model', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model' },
      { title: 'W3Schools CSS Box Model', url: 'https://www.w3schools.com/css/css_boxmodel.asp' }
    ],
    tags: ['CSS', 'Box Model', 'Layout', 'Spacing'],
    tasks: [
      {
        id: 'task1',
        title: 'Apply the box model properties',
        description: 'Create a box with specific dimensions, padding, border, and margin. Make it colorful so you can see each part of the box model.',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Box Model</title>\n  <style>\n    /* Create your box with box model properties here */\n    .box {\n      /* Add width, height, padding, border, and margin */\n      \n    }\n  </style>\n</head>\n<body>\n  <div class="box">This is my box!</div>\n</body>\n</html>',
        solution: 'padding:',
        expectedOutput: 'Box model properties applied successfully!',
        errorHint: 'Add width, height, padding, border, and margin properties to your .box class.'
      },
      {
        id: 'task2',
        title: 'Create a card with box model',
        description: 'Use the box model to create a profile card with an image, name, and description. Add appropriate spacing, borders, and background colors.',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Profile Card</title>\n  <style>\n    /* Style your profile card here */\n    .card {\n      /* Add box model properties to create a card */\n      \n    }\n    \n    .card img {\n      /* Style the image */\n      \n    }\n    \n    .card h2, .card p {\n      /* Style the text */\n      \n    }\n  </style>\n</head>\n<body>\n  <div class="card">\n    <img src="https://via.placeholder.com/150" alt="Profile picture">\n    <h2>Alex Johnson</h2>\n    <p>Web Developer & Gamer</p>\n  </div>\n</body>\n</html>',
        solution: 'border:',
        expectedOutput: 'Profile card created successfully!',
        errorHint: 'Create a card with proper spacing using margin, padding, and border. Add background colors and rounded corners for a nice effect.'
      }
    ]
  },
  {
    id: 'level-9',
    number: 9,
    title: 'CSS Colors & Backgrounds: Make It Pop!',
    description: 'Learn how to use colors and backgrounds to make your web pages visually exciting! Master different color formats, gradients, and background images.',
    category: 'CSS',
    difficulty: 'Beginner',
    pointsToEarn: 250,
    estimatedTime: '45 minutes',
    prerequisites: ['CSS Basics'],
    learningObjectives: [
      'Use different color formats (names, hex, rgb, rgba)',
      'Apply background colors and images',
      'Create gradient backgrounds'
    ],
    realWorldApplications: [
      'Designing a colorful game interface',
      'Creating a themed website with matching colors',
      'Building a digital poster with eye-catching backgrounds'
    ],
    references: [
      { title: 'MDN Web Docs: Applying color to HTML elements using CSS', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Colors/Applying_color' },
      { title: 'W3Schools CSS Colors', url: 'https://www.w3schools.com/css/css_colors.asp' }
    ],
    tags: ['CSS', 'Colors', 'Backgrounds', 'Gradients'],
    tasks: [
      {
        id: 'task1',
        title: 'Experiment with color formats',
        description: 'Create a color palette by styling different divs with various color formats: color names, hex codes, rgb values, and rgba for transparency.',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Color Formats</title>\n  <style>\n    .color-box {\n      width: 100px;\n      height: 100px;\n      margin: 10px;\n      display: inline-block;\n    }\n    \n    /* Style each box with a different color format */\n    .named-color {\n      /* Use a color name */\n      \n    }\n    \n    .hex-color {\n      /* Use a hex color code */\n      \n    }\n    \n    .rgb-color {\n      /* Use rgb() format */\n      \n    }\n    \n    .rgba-color {\n      /* Use rgba() for transparency */\n      \n    }\n  </style>\n</head>\n<body>\n  <h1>CSS Color Formats</h1>\n  \n  <div class="color-box named-color"></div>\n  <div class="color-box hex-color"></div>\n  <div class="color-box rgb-color"></div>\n  <div class="color-box rgba-color"></div>\n</body>\n</html>',
        solution: 'background-color:',
        expectedOutput: 'Color formats applied successfully!',
        errorHint: 'Add background-color properties to each class using different formats: color names, hex (#rrggbb), rgb(r,g,b), and rgba(r,g,b,a).'
      },
      {
        id: 'task2',
        title: 'Create gradient backgrounds',
        description: 'Make a beautiful gradient background for a section of your page. Experiment with linear and radial gradients.',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Gradient Backgrounds</title>\n  <style>\n    body {\n      margin: 0;\n      font-family: Arial, sans-serif;\n    }\n    \n    .hero {\n      height: 300px;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      color: white;\n      /* Add your gradient background here */\n      \n    }\n    \n    .button {\n      padding: 10px 20px;\n      border-radius: 5px;\n      /* Add a different gradient for the button */\n      \n    }\n  </style>\n</head>\n<body>\n  <div class="hero">\n    <h1>Welcome to My Cool Website</h1>\n  </div>\n  \n  <div style="text-align: center; margin-top: 20px;">\n    <button class="button">Click Me</button>\n  </div>\n</body>\n</html>',
        solution: 'linear-gradient',
        expectedOutput: 'Gradient backgrounds applied successfully!',
        errorHint: 'Use the background or background-image property with linear-gradient() or radial-gradient() functions to create gradients.'
      }
    ]
  },
  {
    id: 'level-10',
    number: 10,
    title: 'CSS Flexbox: Modern Layouts Made Easy',
    description: 'Learn how to create flexible, responsive layouts easily! With Flexbox, you can build modern designs that look great on any screen size.',
    category: 'CSS',
    difficulty: 'Intermediate',
    pointsToEarn: 350,
    estimatedTime: '60 minutes',
    prerequisites: ['CSS Box Model'],
    learningObjectives: [
      'Understand the Flexbox layout model',
      'Create flexible rows and columns',
      'Control spacing and alignment of elements'
    ],
    realWorldApplications: [
      'Building a responsive navigation bar',
      'Creating a photo gallery that adjusts to screen size',
      'Designing a card layout for a game or app'
    ],
    references: [
      { title: 'MDN Web Docs: Flexbox', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Flexbox' },
      { title: 'CSS Tricks: A Complete Guide to Flexbox', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/' }
    ],
    tags: ['CSS', 'Flexbox', 'Layout', 'Responsive Design'],
    tasks: [
      {
        id: 'task1',
        title: 'Create a flex container',
        description: 'Create a horizontal navigation menu using Flexbox. Space the items evenly and center them vertically.',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Flexbox Navigation</title>\n  <style>\n    body {\n      margin: 0;\n      font-family: Arial, sans-serif;\n    }\n    \n    /* Style your navigation with flexbox */\n    .navbar {\n      background-color: #333;\n      /* Add flexbox properties here */\n      \n    }\n    \n    .navbar a {\n      color: white;\n      text-decoration: none;\n      padding: 15px 20px;\n    }\n  </style>\n</head>\n<body>\n  <div class="navbar">\n    <a href="#">Home</a>\n    <a href="#">Games</a>\n    <a href="#">Leaderboard</a>\n    <a href="#">Profile</a>\n    <a href="#">About</a>\n  </div>\n</body>\n</html>',
        solution: 'display: flex',
        expectedOutput: 'Flex container created successfully!',
        errorHint: 'Add "display: flex" to the .navbar class and use justify-content to space the items.'
      },
      {
        id: 'task2',
        title: 'Create a card layout with Flexbox',
        description: 'Build a row of cards that wrap to the next line on smaller screens. Each card should have equal width and maintain spacing between them.',
        initialCode: `<!DOCTYPE html>
<html>
<head>
  <title>Flexbox Cards</title>
  <style>
    body {
      font-family: Arial, sans-serif;
    }

    /* Style the container for cards */
    .card-container {
      /* Add flexbox properties here */

    }

    /* Style individual cards */
    .card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      margin: 10px;
      /* Set width for cards */

    }
  </style>
</head>
<body>
  <h1>Awesome Games</h1>

  <div class="card-container">
    <div class="card">
      <h2>Minecraft</h2>
      <p>Build and explore your own virtual world!</p>
    </div>

    <div class="card">
      <h2>Roblox</h2>
      <p>Play thousands of different games created by users.</p>
    </div>

    <div class="card">
      <h2>Fortnite</h2>
      <p>Battle against others to be the last one standing!</p>
    </div>

    <div class="card">
      <h2>Among Us</h2>
      <p>Find the imposter before it's too late!</p>
    </div>
  </div>
</body>
</html>`,
        solution: 'flex-wrap',
        expectedOutput: 'Card layout created successfully!',
        errorHint: 'Add "display: flex" and "flex-wrap: wrap" to the .card-container class. Give each card a specific width (like 250px) or use flex properties like "flex: 1 0 250px".'
      }
    ]
  }
];

// Sample JavaScript levels
const jsLevels = [
  {
    id: 'level-11',
    number: 11,
    title: 'JavaScript Basics: Start Coding!',
    description: 'Begin your journey into programming! Learn the building blocks of JavaScript including variables, data types, and simple operations.',
    category: 'JavaScript',
    difficulty: 'Beginner',
    pointsToEarn: 300,
    estimatedTime: '45 minutes',
    prerequisites: ['HTML Fundamentals'],
    learningObjectives: [
      'Understand what JavaScript is and why it\'s important',
      'Learn about variables and different data types',
      'Use basic operators to perform calculations'
    ],
    realWorldApplications: [
      'Creating interactive elements on your website',
      'Building simple calculators and tools',
      'Making decisions in your programs'
    ],
    references: [
      { title: 'MDN Web Docs: JavaScript First Steps', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps' },
      { title: 'W3Schools JavaScript Tutorial', url: 'https://www.w3schools.com/js/js_intro.asp' }
    ],
    tags: ['JavaScript', 'Programming', 'Variables', 'Data Types'],
    tasks: [
      {
        id: 'task1',
        title: 'Create your first variables',
        description: 'Variables are like containers that store information in your program. Create variables for name, age, and isStudent using the appropriate data types (string, number, and boolean).',
        initialCode: '// Create your variables below\n// Example: let color = "blue";\n\n// Your code here:\n',
        solution: 'let name',
        expectedOutput: 'Variables created successfully!',
        errorHint: 'You need to declare variables using let or const. Try: let name = "Alex"; let age = 14; let isStudent = true;'
      },
      {
        id: 'task2',
        title: 'Perform simple calculations',
        description: 'JavaScript can perform math operations just like a calculator! Create variables for two numbers and then add, subtract, multiply, and divide them.',
        initialCode: '// Create two number variables\nlet num1 = 10;\nlet num2 = 5;\n\n// Now perform operations and store the results in new variables\n// Addition: num1 + num2\n// Subtraction: num1 - num2\n// Multiplication: num1 * num2\n// Division: num1 / num2\n\n// Your code here:\n',
        solution: 'let sum =',
        expectedOutput: 'Calculations performed successfully!',
        errorHint: 'Store each calculation in a new variable. Try: let sum = num1 + num2; let difference = num1 - num2;'
      }
    ]
  },
  {
    id: 'level-12',
    number: 12,
    title: 'JavaScript Conditionals: Making Decisions',
    description: 'Learn how to make your programs decide what to do! Master if statements, comparison operators, and logical operators to create different paths in your code.',
    category: 'JavaScript',
    difficulty: 'Beginner',
    pointsToEarn: 350,
    estimatedTime: '60 minutes',
    prerequisites: ['JavaScript Basics'],
    learningObjectives: [
      'Use if, else if, and else statements',
      'Compare values with comparison operators',
      'Combine conditions with logical operators'
    ],
    realWorldApplications: [
      'Creating a game that responds to player choices',
      'Building a quiz that checks if answers are correct',
      'Making a website that shows different content based on age'
    ],
    references: [
      { title: 'MDN Web Docs: Making decisions in your code', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/conditionals' },
      { title: 'W3Schools JavaScript If...Else', url: 'https://www.w3schools.com/js/js_if_else.asp' }
    ],
    tags: ['JavaScript', 'Conditionals', 'Logic', 'Decision Making'],
    tasks: [
      {
        id: 'task1',
        title: 'Create a simple if statement',
        description: 'If statements let your program make decisions. Write a program that checks if a user is old enough to play a game (13 or older).',
        initialCode: '// We already have the user\'s age\nlet age = 12;\n\n// Create a message variable\nlet message = "";\n\n// Write an if statement to check if age is at least 13\n// If they\'re old enough, set message to "You can play the game!"\n// Otherwise, set message to "Sorry, you must be at least 13 to play."\n\n// Your code here:\n',
        solution: 'if (age >= 13)',
        expectedOutput: 'Conditional statement created successfully!',
        errorHint: 'Use an if/else statement to check if age is greater than or equal to 13. Set the message variable accordingly.'
      },
      {
        id: 'task2',
        title: 'Create a grade calculator',
        description: 'Let\'s create a program that converts a test score (0-100) into a letter grade (A, B, C, D, or F).',
        initialCode: '// The test score (0-100)\nlet score = 85;\n\n// Variable to store the letter grade\nlet grade = "";\n\n// Write your code to determine the grade:\n// A: 90-100\n// B: 80-89\n// C: 70-79\n// D: 60-69\n// F: below 60\n\n// Your code here (use if, else if, and else):\n',
        solution: 'if (score >= 90)',
        expectedOutput: 'Grade calculator created successfully!',
        errorHint: 'Use if, else if, and else statements to check the score ranges and assign the appropriate letter grade.'
      }
    ]
  },
  {
    id: 'level-13',
    number: 13,
    title: 'JavaScript Functions: Make Reusable Code',
    description: 'Learn to write code once and use it many times! Discover how functions can make your code more organized, reusable, and powerful.',
    category: 'JavaScript',
    difficulty: 'Intermediate',
    pointsToEarn: 400,
    estimatedTime: '60 minutes',
    prerequisites: ['JavaScript Conditionals'],
    learningObjectives: [
      'Create and call functions',
      'Pass information to functions with parameters',
      'Return values from functions'
    ],
    realWorldApplications: [
      'Creating a calculator with different operations',
      'Building a mini-game with reusable game mechanics',
      'Making a greeting function that works for different users'
    ],
    references: [
      { title: 'MDN Web Docs: Functions', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Functions' },
      { title: 'W3Schools JavaScript Functions', url: 'https://www.w3schools.com/js/js_functions.asp' }
    ],
    tags: ['JavaScript', 'Functions', 'Parameters', 'Return Values'],
    tasks: [
      {
        id: 'task1',
        title: 'Create your first function',
        description: 'Functions are like mini-programs inside your code. Create a sayHello function that accepts a name parameter and returns a greeting message.',
        initialCode: '// Create a function called sayHello\n// It should accept one parameter: name\n// It should return "Hello, [name]!"\n\n// Your function here:\n\n\n// Test your function\nconsole.log(sayHello("Alex")); // Should display: "Hello, Alex!"',
        solution: 'function sayHello',
        expectedOutput: 'Function created successfully!',
        errorHint: 'Create a function called sayHello that takes a name parameter and returns a greeting string.'
      },
      {
        id: 'task2',
        title: 'Build a calculator function',
        description: 'Let\'s create a calculator function that can add, subtract, multiply, or divide two numbers based on an operation parameter.',
        initialCode: '// Create a function called calculate\n// It should accept three parameters: \n// - num1 (first number)\n// - num2 (second number)\n// - operation (a string that can be "add", "subtract", "multiply", or "divide")\n// The function should return the result of the operation\n\n// Your function here:\n\n\n// Test your function\nconsole.log(calculate(10, 5, "add"));      // Should display: 15\nconsole.log(calculate(10, 5, "subtract")); // Should display: 5\nconsole.log(calculate(10, 5, "multiply")); // Should display: 50\nconsole.log(calculate(10, 5, "divide"));   // Should display: 2',
        solution: 'function calculate',
        expectedOutput: 'Calculator function created successfully!',
        errorHint: 'Create a function called calculate that uses if or switch statements to perform different operations based on the operation parameter.'
      }
    ]
  },
  {
    id: 'level-14',
    number: 14,
    title: 'JavaScript Arrays: Working with Lists',
    description: 'Learn how to store and manage collections of data! Arrays let you keep multiple values in one variable and perform operations on the whole group.',
    category: 'JavaScript',
    difficulty: 'Intermediate',
    pointsToEarn: 400,
    estimatedTime: '60 minutes',
    prerequisites: ['JavaScript Functions'],
    learningObjectives: [
      'Create and access array elements',
      'Add and remove items from arrays',
      'Loop through arrays to process each item'
    ],
    realWorldApplications: [
      'Creating a todo list application',
      'Managing a list of high scores in a game',
      'Storing and displaying user comments'
    ],
    references: [
      { title: 'MDN Web Docs: Arrays', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/Arrays' },
      { title: 'W3Schools JavaScript Arrays', url: 'https://www.w3schools.com/js/js_arrays.asp' }
    ],
    tags: ['JavaScript', 'Arrays', 'Data Structures', 'Loops'],
    tasks: [
      {
        id: 'task1',
        title: 'Create and modify an array',
        description: 'Arrays are like ordered lists. Create an array of favorite fruits, then add and remove items from it.',
        initialCode: '// Create an array of favorite fruits\nlet fruits = [];\n\n// Add at least 3 fruits to your array using push()\n// Your code here:\n\n\n// Remove the last fruit from the array using pop()\n// Your code here:\n\n\n// Add a new fruit to the beginning using unshift()\n// Your code here:\n\n\n// Display the final array\nconsole.log(fruits);',
        solution: 'fruits.push',
        expectedOutput: 'Array modified successfully!',
        errorHint: 'Use array methods like push(), pop(), and unshift() to modify your array.'
      },
      {
        id: 'task2',
        title: 'Find items in an array',
        description: 'Let\'s create a function that searches through an array and tells us if a specific item exists in it.',
        initialCode: '// Our array of student names\nlet students = ["Emma", "Liam", "Olivia", "Noah", "Ava", "William", "Sophia", "James", "Isabella", "Benjamin"];\n\n// Create a function called findStudent\n// It should accept two parameters: \n// - name (the name to search for)\n// - list (the array to search in)\n// It should return true if the name is found, otherwise false\n\n// Your function here:\n\n\n// Test your function\nconsole.log(findStudent("Ava", students));      // Should display: true\nconsole.log(findStudent("Alex", students));     // Should display: false',
        solution: 'function findStudent',
        expectedOutput: 'Search function created successfully!',
        errorHint: 'Create a findStudent function that uses array methods or a loop to check if name exists in list.'
      }
    ]
  },
  {
    id: 'level-15',
    number: 15,
    title: 'JavaScript DOM Basics: Connect to Your Webpage',
    description: 'Learn how to make your web pages interactive! The Document Object Model (DOM) lets you use JavaScript to modify your HTML and respond to user actions.',
    category: 'JavaScript',
    difficulty: 'Intermediate',
    pointsToEarn: 450,
    estimatedTime: '75 minutes',
    prerequisites: ['JavaScript Arrays'],
    learningObjectives: [
      'Understand what the DOM is and how it works',
      'Select and modify HTML elements with JavaScript',
      'Create interactive buttons and forms'
    ],
    realWorldApplications: [
      'Creating a theme switcher for your website',
      'Building an interactive quiz',
      'Making a form that validates user input'
    ],
    references: [
      { title: 'MDN Web Docs: Document Object Model', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Manipulating_documents' },
      { title: 'W3Schools JavaScript HTML DOM', url: 'https://www.w3schools.com/js/js_htmldom.asp' }
    ],
    tags: ['JavaScript', 'DOM', 'Web Development', 'Interactivity'],
    tasks: [
      {
        id: 'task1',
        title: 'Select and modify elements',
        description: 'Let\'s use JavaScript to select HTML elements and change their content and appearance.',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>DOM Manipulation</title>\n</head>\n<body>\n  <h1 id="title">Welcome to my Website</h1>\n  <p id="message">This is a paragraph.</p>\n  <button id="changeBtn">Change Content</button>\n  \n  <script>\n    // Your task: When the button is clicked, change the title to "Updated Title!"\n    // and change the paragraph to "The content has been changed!"\n    \n    // Get references to the elements\n    // Your code here:\n    \n    \n    // Add a click event listener to the button\n    // Your code here:\n    \n    \n  </script>\n</body>\n</html>',
        solution: 'document.getElementById',
        expectedOutput: 'DOM elements selected and modified successfully!',
        errorHint: 'Use document.getElementById() to select elements and add an event listener to the button.'
      },
      {
        id: 'task2',
        title: 'Create a simple counter',
        description: 'Let\'s build an interactive counter with buttons to increase, decrease, and reset the count.',
        initialCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Interactive Counter</title>\n  <style>\n    .counter {\n      text-align: center;\n      margin: 50px;\n    }\n    .count {\n      font-size: 48px;\n      margin: 20px;\n    }\n    button {\n      padding: 10px 20px;\n      margin: 0 10px;\n      font-size: 16px;\n    }\n  </style>\n</head>\n<body>\n  <div class="counter">\n    <h1>Counter</h1>\n    <div class="count" id="countDisplay">0</div>\n    <button id="decreaseBtn">Decrease</button>\n    <button id="resetBtn">Reset</button>\n    <button id="increaseBtn">Increase</button>\n  </div>\n  \n  <script>\n    // Implement the counter functionality\n    // Initialize the count variable\n    // Your code here:\n    \n    \n    // Get references to HTML elements\n    // Your code here:\n    \n    \n    // Add event listeners to buttons\n    // Your code here:\n    \n    \n    // Update the display function\n    // Your code here:\n    \n    \n  </script>\n</body>\n</html>',
        solution: 'addEventListener',
        expectedOutput: 'Counter application created successfully!',
        errorHint: 'Create a count variable, get references to the elements, and add event listeners that update the count and display.'
      }
    ]
  }
];

// Sample badges
const badges = [
  // HTML Badges
  {
    id: 'html-apprentice',
    name: 'HTML Apprentice',
    description: 'Completed your first HTML page',
    category: 'HTML',
    requirements: ['level-1'],
    icon: '📄'
  },
  {
    id: 'html-formatter',
    name: 'Text Wizard',
    description: 'Mastered HTML text formatting',
    category: 'HTML',
    requirements: ['level-2'],
    icon: '✏️'
  },
  {
    id: 'html-navigator',
    name: 'Web Navigator',
    description: 'Connected pages with HTML links',
    category: 'HTML',
    requirements: ['level-3'],
    icon: '🔗'
  },
  {
    id: 'html-illustrator',
    name: 'Web Illustrator',
    description: 'Added images to make your pages come alive',
    category: 'HTML',
    requirements: ['level-4'],
    icon: '🖼️'
  },
  {
    id: 'html-organizer',
    name: 'Data Organizer',
    description: 'Created tables to organize information',
    category: 'HTML',
    requirements: ['level-5'],
    icon: '📊'
  },
  {
    id: 'html-master',
    name: 'HTML Master',
    description: 'Completed all HTML levels',
    category: 'HTML',
    requirements: ['level-1', 'level-2', 'level-3', 'level-4', 'level-5'],
    icon: '🏆'
  },

  // CSS Badges
  {
    id: 'css-stylist',
    name: 'CSS Stylist',
    description: 'Added your first CSS styles',
    category: 'CSS',
    requirements: ['level-6'],
    icon: '🎨'
  },
  {
    id: 'css-selector',
    name: 'Element Selector',
    description: 'Mastered CSS selectors',
    category: 'CSS',
    requirements: ['level-7'],
    icon: '🎯'
  },
  {
    id: 'css-architect',
    name: 'Box Model Architect',
    description: 'Built layouts using the CSS box model',
    category: 'CSS',
    requirements: ['level-8'],
    icon: '📦'
  },
  {
    id: 'css-artist',
    name: 'Color Artist',
    description: 'Created beautiful color schemes and gradients',
    category: 'CSS',
    requirements: ['level-9'],
    icon: '🌈'
  },
  {
    id: 'css-flexmaster',
    name: 'Flexbox Master',
    description: 'Built responsive layouts with Flexbox',
    category: 'CSS',
    requirements: ['level-10'],
    icon: '📱'
  },
  {
    id: 'css-master',
    name: 'CSS Master',
    description: 'Completed all CSS levels',
    category: 'CSS',
    requirements: ['level-6', 'level-7', 'level-8', 'level-9', 'level-10'],
    icon: '🏆'
  },

  // JavaScript Badges
  {
    id: 'js-rookie',
    name: 'JavaScript Rookie',
    description: 'Wrote your first JavaScript code',
    category: 'JavaScript',
    requirements: ['level-11'],
    icon: '🔰'
  },
  {
    id: 'js-logician',
    name: 'Code Logician',
    description: 'Mastered conditional statements',
    category: 'JavaScript',
    requirements: ['level-12'],
    icon: '🔄'
  },
  {
    id: 'js-engineer',
    name: 'Function Engineer',
    description: 'Created reusable code with functions',
    category: 'JavaScript',
    requirements: ['level-13'],
    icon: '⚙️'
  },
  {
    id: 'js-collector',
    name: 'Data Collector',
    description: 'Managed data collections with arrays',
    category: 'JavaScript',
    requirements: ['level-14'],
    icon: '📚'
  },
  {
    id: 'js-manipulator',
    name: 'DOM Manipulator',
    description: 'Made interactive web pages using the DOM',
    category: 'JavaScript',
    requirements: ['level-15'],
    icon: '🖱️'
  },
  {
    id: 'js-master',
    name: 'JavaScript Master',
    description: 'Completed all JavaScript levels',
    category: 'JavaScript',
    requirements: ['level-11', 'level-12', 'level-13', 'level-14', 'level-15'],
    icon: '🏆'
  },

  // Special Badges
  {
    id: 'web-developer',
    name: 'Web Developer',
    description: 'Mastered HTML, CSS, and JavaScript fundamentals',
    category: 'Special',
    requirements: ['html-master', 'css-master', 'js-master'],
    icon: '🚀'
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
