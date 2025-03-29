/**
 * Utility script to directly test and update gesture data 
 * Run with: node api-test.mjs
 */

import http from 'http';
import { Buffer } from 'buffer';

// Fetch all gesture data
function getAllGestures() {
  return new Promise((resolve, reject) => {
    const options = {
      host: 'localhost',
      port: 5000,
      path: '/api/raw/gestures',
      method: 'GET',
      headers: {
        'Accept': 'text/plain'
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
      path: `/api/raw/gestures/${id}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Accept': 'text/plain'
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
    // First, get all gesture data
    console.log('Fetching all gestures...');
    const gestures = await getAllGestures();
    
    if (Array.isArray(gestures)) {
      console.log(`Retrieved ${gestures.length} gestures from the API`);
      
      // Display first gesture as an example
      if (gestures.length > 0) {
        console.log('Example gesture:');
        console.log(JSON.stringify(gestures[0], null, 2));
        
        // Update a property of the first gesture for testing
        const firstGesture = gestures[0];
        const updateData = { 
          hasMotion: !firstGesture.hasMotion,
          description: `Updated description - ${new Date().toISOString()}`
        };
        
        console.log(`\nUpdating gesture ID ${firstGesture.id} with:`, updateData);
        
        const updatedGesture = await updateGesture(firstGesture.id, updateData);
        console.log('\nUpdate response:');
        console.log(JSON.stringify(updatedGesture, null, 2));
      }
    } else {
      console.log('Unexpected response format:', gestures);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the main function
main();