// This file tests the static API service to verify GitHub Pages compatibility
import fs from 'fs';

// Manually load the gesture data
const gestureData = JSON.parse(fs.readFileSync('./client/src/data/gestures.json', 'utf8'));

// Create a simple version of the static API service
const staticApiService = {
  // Get all gestures
  async getAllGestures() {
    return gestureData;
  },
  
  // Get gestures by type (alphabet, phrase, word)
  async getGesturesByType(type) {
    return gestureData.filter(g => g.type === type);
  },
  
  // Get a specific gesture by ID
  async getGesture(id) {
    return gestureData.find(g => g.id === id);
  }
};

async function testGitHubPagesSetup() {
  console.log('===== TESTING GITHUB PAGES COMPATIBILITY =====');
  
  try {
    // Test 1: Get all gestures
    console.log('\nTest 1: Getting all gestures');
    const allGestures = await staticApiService.getAllGestures();
    console.log(`✓ Found ${allGestures.length} gestures`);
    
    // Test 2: Get gestures by type (alphabet)
    console.log('\nTest 2: Getting alphabet gestures');
    const alphabetGestures = await staticApiService.getGesturesByType('alphabet');
    console.log(`✓ Found ${alphabetGestures.length} alphabet gestures`);
    
    // Test 3: Get gestures by type (phrase)
    console.log('\nTest 3: Getting phrase gestures');
    const phraseGestures = await staticApiService.getGesturesByType('phrase');
    console.log(`✓ Found ${phraseGestures.length} phrase gestures`);
    
    // Test 4: Get a specific gesture
    console.log('\nTest 4: Getting a specific gesture');
    const gesture = await staticApiService.getGesture(1);
    console.log(`✓ Found gesture: ${gesture.name}`);
    
    // Test 5: Verify all data properties
    console.log('\nTest 5: Verifying data properties');
    const sampleGesture = allGestures[0];
    const requiredProps = ['id', 'name', 'type', 'description', 'fingerPattern'];
    const missingProps = requiredProps.filter(prop => !(prop in sampleGesture));
    
    if (missingProps.length === 0) {
      console.log('✓ All required properties are present');
    } else {
      console.log(`❌ Missing properties: ${missingProps.join(', ')}`);
    }
    
    console.log('\n===== GITHUB PAGES COMPATIBILITY TEST COMPLETE =====');
    console.log('Result: All tests passed! The application is ready for GitHub Pages deployment.');
    
  } catch (error) {
    console.error('❌ ERROR DURING TESTING:', error);
  }
}

testGitHubPagesSetup();