/**
 * Firebase level data importer for Code4U
 * This script imports level data from JSON files in the /docs directory into Firestore
 */

import { db } from './firebase-node.js'
import { doc, writeBatch, getDoc } from 'firebase/firestore'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../../../')

// Path to JSON files
const docsDir = path.join(rootDir, 'docs')

// Files to import
const levelFiles = [
  'JavaScript-Levels.json',
  'Python-Levels.json',
  'CSS-Levels.json'
]

/**
 * Import levels from JSON files to Firestore
 */
async function importLevelsFromJson() {
  console.log('Starting level import process...')

  // Counter for statistics
  let totalLevels = 0
  let importedLevels = 0
  let skippedLevels = 0
  let failedLevels = 0

  try {
    // Process each JSON file
    for (const file of levelFiles) {
      const filePath = path.join(docsDir, file)

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${file}. Skipping.`)
        continue
      }

      // Read and parse the JSON file
      console.log(`\nReading ${file}...`)
      const jsonData = fs.readFileSync(filePath, 'utf8')
      const levels = JSON.parse(jsonData)

      totalLevels += levels.length
      console.log(`Found ${levels.length} levels in ${file}`)

      // Use batched writes for more efficient imports
      // Firestore allows up to 500 operations per batch
      const batchSize = 450
      let batchCount = 0

      for (let i = 0; i < levels.length; i += batchSize) {
        const batch = writeBatch(db)
        const currentBatch = levels.slice(i, i + batchSize)
        batchCount++

        console.log(`Processing batch ${batchCount} (${currentBatch.length} levels)`)

        for (const level of currentBatch) {
          // Check if the level already exists
          const levelDocRef = doc(db, 'levels', level.id)
          const levelDoc = await getDoc(levelDocRef)

          if (levelDoc.exists()) {
            console.log(`Level ${level.id} already exists. Skipping.`)
            skippedLevels++
            continue
          }

          // Add the level to the batch
          batch.set(levelDocRef, {
            ...level,
            createdAt: new Date(),
            isPublished: true // Default to published
          })

          importedLevels++
        }

        // Commit the batch
        await batch.commit()
        console.log(`Batch ${batchCount} committed successfully`)
      }
    }

    console.log('\n=== Import Summary ===')
    console.log(`Total levels found: ${totalLevels}`)
    console.log(`Levels imported: ${importedLevels}`)
    console.log(`Levels skipped (already exist): ${skippedLevels}`)
    console.log(`Failed imports: ${failedLevels}`)
    console.log('Import process complete!')

  } catch (error) {
    console.error('Error importing levels:', error)
    process.exit(1)
  }
}

// Run the import function
importLevelsFromJson().then(() => {
  console.log('Script execution completed')
  process.exit(0)
}).catch(error => {
  console.error('Script execution failed:', error)
  process.exit(1)
})
