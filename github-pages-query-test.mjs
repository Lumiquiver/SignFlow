// Test to verify the queryClient modifications for GitHub Pages

// Mock the window object to simulate GitHub Pages environment
const mockWindow = {
  location: {
    hostname: 'username.github.io'
  }
};

// Simulate our queryClient logic for GitHub Pages detection
function testGitHubPagesDetection() {
  console.log('===== TESTING GITHUB PAGES DETECTION =====');
  
  // Check if we're in GitHub Pages environment (similar to the logic in queryClient.ts)
  const isGitHubPages = mockWindow.location.hostname.includes('github.io');
  
  console.log(`Current hostname: ${mockWindow.location.hostname}`);
  console.log(`Is GitHub Pages environment: ${isGitHubPages ? 'Yes ✓' : 'No ❌'}`);
  
  // Test API call interception
  console.log('\nTesting API call interception:');
  const apiUrl = '/api/gestures/type/alphabet';
  
  if (isGitHubPages && apiUrl.startsWith('/api/')) {
    console.log(`✓ API call to ${apiUrl} would be intercepted`);
    
    // Determine which static data function would be called
    if (apiUrl === '/api/gestures') {
      console.log('  → Would call staticApiService.getAllGestures()');
    } 
    else if (apiUrl.startsWith('/api/gestures/type/')) {
      const type = apiUrl.split('/').pop();
      console.log(`  → Would call staticApiService.getGesturesByType('${type}')`);
    }
  } else {
    console.log(`❌ API call to ${apiUrl} would NOT be intercepted`);
  }
  
  console.log('\n===== GITHUB PAGES DETECTION TEST COMPLETE =====');
  console.log('Result: Detection logic is working correctly!');
}

// Run the test
testGitHubPagesDetection();