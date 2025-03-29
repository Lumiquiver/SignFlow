/**
 * Utility script to directly test and update gesture data 
 * Run with: node api-test.mjs
 */

import http from 'http';
import { Buffer } from 'buffer';

// Fetch all gesture data from a working endpoint
function getGesturesByType(type) {
  return new Promise((resolve, reject) => {
    const options = {
      host: 'localhost',
      port: 5000,
      path: `/api/gestures/type/${type}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          // Always attempt to parse as JSON
          const parsedData = JSON.parse(data);
          resolve(parsedData);
        } catch (e) {
          console.log('Warning: Could not parse as JSON, returning raw data');
          resolve(data);
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Request failed: ${e.message}`));
    });

    req.end();
  });
}

// Get a specific gesture by ID
function getGestureById(id) {
  return new Promise((resolve, reject) => {
    const options = {
      host: 'localhost',
      port: 5000,
      path: `/api/gestures/${id}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          // Always attempt to parse as JSON
          const parsedData = JSON.parse(data);
          resolve(parsedData);
        } catch (e) {
          console.log('Warning: Could not parse as JSON, returning raw data');
          resolve(data);
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Request failed: ${e.message}`));
    });

    req.end();
  });
}

// Update a gesture by ID
function updateGesture(id, updateData) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(updateData);

    const options = {
      host: 'localhost',
      port: 5000,
      path: `/api/gestures/${id}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          // Always attempt to parse as JSON
          const parsedData = JSON.parse(responseData);
          resolve(parsedData);
        } catch (e) {
          console.log('Warning: Could not parse as JSON, returning raw data');
          resolve(responseData);
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Request failed: ${e.message}`));
    });

    req.write(data);
    req.end();
  });
}

// Main function
async function main() {
  try {
    // First, get alphabet gestures (we know this endpoint works)
    console.log('Fetching alphabet gestures...');
    const alphabetGestures = await getGesturesByType('alphabet');
    
    if (Array.isArray(alphabetGestures)) {
      console.log(`Retrieved ${alphabetGestures.length} alphabet gestures from the API`);
      
      // Display first gesture as an example
      if (alphabetGestures.length > 0) {
        const firstGesture = alphabetGestures[0];
        console.log('First alphabet gesture:');
        console.log(JSON.stringify(firstGesture, null, 2));
        
        // Get phrase gestures
        console.log('\nFetching phrase gestures...');
        const phraseGestures = await getGesturesByType('phrase');
        
        if (Array.isArray(phraseGestures) && phraseGestures.length > 0) {
          console.log(`Retrieved ${phraseGestures.length} phrase gestures`);
          console.log('First phrase gesture:');
          console.log(JSON.stringify(phraseGestures[0], null, 2));
        }
        
        // Update a specific gesture (let's use ID 1 which is usually "A")
        console.log('\nGetting gesture with ID 1...');
        const gestureA = await getGestureById(1);
        
        if (gestureA && gestureA.id) {
          console.log('Retrieved gesture:', gestureA.name);
          
          // Create update data - toggle hasMotion and update description
          const updateData = { 
            hasMotion: !gestureA.hasMotion,
            description: `Updated via API - ${new Date().toISOString()}`
          };
          
          console.log(`\nUpdating gesture ID ${gestureA.id} with:`, updateData);
          
          try {
            const updatedGesture = await updateGesture(gestureA.id, updateData);
            console.log('\nUpdate response:');
            console.log(JSON.stringify(updatedGesture, null, 2));
            
            // Verify the update
            console.log('\nVerifying update...');
            const verifiedGesture = await getGestureById(gestureA.id);
            console.log(JSON.stringify(verifiedGesture, null, 2));
          } catch (updateError) {
            console.error('Error updating gesture:', updateError.message);
          }
        } else {
          console.log('Could not retrieve gesture with ID 1');
        }
      }
    } else {
      console.log('Unexpected response format:', alphabetGestures);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the main function
main();