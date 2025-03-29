/**
 * Direct database interaction script for testing and updating gesture data
 * This bypasses the API layer entirely
 * Run with: node direct-gesture-test.mjs
 */

import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

// Get the directory of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Function to run TypeScript files directly using tsx
async function runTsFile(scriptContent) {
  // Create a temporary file
  const tempFile = join(__dirname, '_temp_script.ts');
  
  try {
    // Write the script content to the temp file
    await fs.writeFile(tempFile, scriptContent);
    
    // Execute the temp script with tsx
    return new Promise((resolve, reject) => {
      exec(`npx tsx ${tempFile}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing script: ${stderr}`);
          reject(error);
          return;
        }
        resolve(stdout);
      });
    });
  } finally {
    // Clean up the temp file
    try {
      await fs.unlink(tempFile);
    } catch (err) {
      console.warn('Warning: Could not delete temporary file:', err.message);
    }
  }
}

// Main function
async function main() {
  // Script to get all gestures
  const getAllGesturesScript = `
    // Import the necessary modules
    import { storage } from "./server/storage";
    
    async function run() {
      try {
        // Get all gestures
        const gestures = await storage.getAllGestures();
        
        // Output the results as JSON
        console.log(JSON.stringify(gestures, null, 2));
      } catch (error) {
        console.error("Error:", error.message);
      }
    }
    
    // Run the function
    run();
  `;
  
  // Script to update a specific gesture
  const updateGestureScript = (id, updateData) => `
    // Import the necessary modules
    import { storage } from "./server/storage";
    
    async function run() {
      try {
        // First, check if the gesture exists
        const existingGesture = await storage.getGesture(${id});
        
        if (!existingGesture) {
          console.error("Gesture with ID ${id} not found");
          return;
        }
        
        // Update the gesture
        const updateData = ${JSON.stringify(updateData)};
        const updatedGesture = await storage.updateGesture(${id}, updateData);
        
        // Output the results
        console.log(JSON.stringify(updatedGesture, null, 2));
      } catch (error) {
        console.error("Error:", error.message);
      }
    }
    
    // Run the function
    run();
  `;
  
  // First, get all gestures
  console.log('Fetching all gestures from storage...');
  let result;
  
  try {
    result = await runTsFile(getAllGesturesScript);
    const gestures = JSON.parse(result);
    
    console.log(`Retrieved ${gestures.length} gestures from storage`);
    
    // Display first gesture as an example
    if (gestures.length > 0) {
      const firstGesture = gestures[0];
      console.log('Example gesture:');
      console.log(JSON.stringify(firstGesture, null, 2));
      
      // Update a property of the first gesture for testing
      const updateData = { 
        description: `Updated description - ${new Date().toISOString()}`,
        complexity: Math.min(5, (firstGesture.complexity || 1) + 1) // increment complexity but max at 5
      };
      
      console.log(`\nUpdating gesture ID ${firstGesture.id} with:`, updateData);
      
      // Run the update script
      const updateResult = await runTsFile(updateGestureScript(firstGesture.id, updateData));
      console.log('\nUpdate result:');
      console.log(updateResult);
      
      // Verify the update
      console.log('\nVerifying update...');
      const verifyScript = `
        import { storage } from "./server/storage";
        
        async function run() {
          try {
            const updatedGesture = await storage.getGesture(${firstGesture.id});
            console.log(JSON.stringify(updatedGesture, null, 2));
          } catch (error) {
            console.error("Error:", error.message);
          }
        }
        
        run();
      `;
      
      const verifyResult = await runTsFile(verifyScript);
      console.log(verifyResult);
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (result) {
      console.log('Raw output:', result);
    }
  }
}

// Run the main function
main();