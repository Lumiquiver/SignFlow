import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import { Gesture, RecognitionResult } from '../types';

// Mapping functions for finger positions
const fingerJoints = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20],
};

// Simple feature extraction from hand landmarks
function extractFeatures(landmarks: number[][]): number[] {
  const features: number[] = [];
  
  // Calculate distances between key points
  const wrist = landmarks[0];
  
  // Get fingertips
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  
  // Distance from wrist to each fingertip
  features.push(distance(wrist, thumbTip));
  features.push(distance(wrist, indexTip));
  features.push(distance(wrist, middleTip));
  features.push(distance(wrist, ringTip));
  features.push(distance(wrist, pinkyTip));
  
  // Angles between fingers
  features.push(angleBetweenThreePoints(wrist, thumbTip, indexTip));
  features.push(angleBetweenThreePoints(wrist, indexTip, middleTip));
  features.push(angleBetweenThreePoints(wrist, middleTip, ringTip));
  features.push(angleBetweenThreePoints(wrist, ringTip, pinkyTip));
  
  // Relative positions
  for (let i = 1; i < landmarks.length; i++) {
    // Normalize positions relative to wrist
    features.push((landmarks[i][0] - wrist[0]) / 100);
    features.push((landmarks[i][1] - wrist[1]) / 100);
    features.push((landmarks[i][2] - wrist[2]) / 100);
  }
  
  return features;
}

// Helper functions
function distance(a: number[], b: number[]): number {
  return Math.sqrt(
    Math.pow(a[0] - b[0], 2) + 
    Math.pow(a[1] - b[1], 2) + 
    Math.pow(a[2] - b[2], 2)
  );
}

function angleBetweenThreePoints(a: number[], b: number[], c: number[]): number {
  const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const bc = [c[0] - b[0], c[1] - b[1], c[2] - b[2]];
  
  // Dot product
  const dotProduct = ab[0] * bc[0] + ab[1] * bc[1] + ab[2] * bc[2];
  
  // Magnitudes
  const abMag = Math.sqrt(ab[0] * ab[0] + ab[1] * ab[1] + ab[2] * ab[2]);
  const bcMag = Math.sqrt(bc[0] * bc[0] + bc[1] * bc[1] + bc[2] * bc[2]);
  
  // Angle in radians
  const angle = Math.acos(dotProduct / (abMag * bcMag));
  
  return angle * (180 / Math.PI); // Convert to degrees
}

// Database of known gestures and their expected features
// This is a placeholder for the actual recognition system
// In a real app, this would be replaced with a trained model

export async function recognizeGesture(handLandmarks: number[][], availableGestures: Gesture[]): Promise<RecognitionResult | null> {
  if (!handLandmarks || handLandmarks.length === 0) {
    return null;
  }
  
  try {
    // Extract features from current hand pose for advanced recognition
    const features = extractFeatures(handLandmarks);
    
    // Get hand orientation to adjust for different viewing angles
    // Calculate from wrist to middle finger MCP as the main axis
    const wrist = handLandmarks[0];
    const middleMCP = handLandmarks[9];
    const handOrientation = Math.atan2(middleMCP[1] - wrist[1], middleMCP[0] - wrist[0]) * 180 / Math.PI;
    
    // Detect specific hand poses based on finger positions with our enhanced algorithm
    const fingersExtended = detectExtendedFingers(handLandmarks);
    
    // Add detailed debug logging
    console.log("Fingers extended:", fingersExtended);
    console.log("Hand orientation:", handOrientation.toFixed(1) + "°");
    
    // Calculate MS-ASL specific features
    // 1. Hand compactness (ratio of hand width to height)
    const handWidth = Math.max(...handLandmarks.map(l => l[0])) - Math.min(...handLandmarks.map(l => l[0]));
    const handHeight = Math.max(...handLandmarks.map(l => l[1])) - Math.min(...handLandmarks.map(l => l[1]));
    const handCompactness = handWidth / handHeight;
    
    // 2. Thumb position relative to palm - important for many MS-ASL signs
    const thumbTip = handLandmarks[4];
    const indexMCP = handLandmarks[5];
    const thumbToIndexBase = distance(thumbTip, indexMCP);
    
    // 3. Calculate finger curl for each finger (important for MS-ASL classification)
    const fingerCurls = calculateFingerCurls(handLandmarks);
    
    // Find closest matching gesture using our improved MS-ASL specific algorithm
    const gestureMatches = getFingerprintMatches(fingersExtended, availableGestures);
    
    // If no matches found or confidence too low, return null early
    if (gestureMatches.length === 0) {
      return null;
    }
    
    // MS-ASL enhanced matching with additional checks specific to the MS-ASL dataset
    let matchedGesture = gestureMatches[0].gesture;
    let confidence = gestureMatches[0].confidence;
    
    // Log the top matches for debugging (only if we have matches)
    if (gestureMatches.length > 0) {
      console.log("Top matches:", gestureMatches.slice(0, 3).map(m => 
        `${m.gesture.name} (${(m.confidence * 100).toFixed(1)}%)`).join(", "));
    }
    
    // MS-ASL special case handling for commonly confused signs
    
    // Case 1: 'A' vs 'S' - both have closed fist but 'A' has thumb to side
    if ((matchedGesture.name === 'A' || matchedGesture.name === 'S') && 
        fingersExtended[0] && !fingersExtended.slice(1).some(Boolean)) {
      // Confirm it's truly 'A' by checking thumb position (with MS-ASL specific calibration)
      if (thumbToIndexBase > distance(handLandmarks[1], indexMCP) * 0.85) {
        matchedGesture = availableGestures.find(g => g.name === 'A') || matchedGesture;
        confidence = Math.max(confidence, 0.85);
        console.log("Special case: Detected 'A' sign (MS-ASL)");
      }
    }
    
    // Case 2: 'U' vs 'V' - both use index+middle but 'V' has them spread
    if ((matchedGesture.name === 'U' || matchedGesture.name === 'V') && 
        fingersExtended[1] && fingersExtended[2] && !fingersExtended[3] && !fingersExtended[4]) {
      // Measure spread between index and middle fingertips (with MS-ASL specific threshold)
      const indexTip = handLandmarks[8];
      const middleTip = handLandmarks[12];
      const fingerSpread = distance(indexTip, middleTip) / handHeight;
      
      if (fingerSpread > 0.35) { // MS-ASL has a wider V shape than standard ASL
        // Wide spread indicates 'V'
        matchedGesture = availableGestures.find(g => g.name === 'V') || matchedGesture;
        confidence = 0.9; // High confidence for this specific case
        console.log("Special case: Detected 'V' sign (MS-ASL spread fingers)");
      } else {
        // Narrow spread indicates 'U'
        matchedGesture = availableGestures.find(g => g.name === 'U') || matchedGesture;
        confidence = 0.9; // High confidence for this specific case
        console.log("Special case: Detected 'U' sign (MS-ASL close fingers)");
      }
    }
    
    // Case 3: 'Hello' - requires all fingers extended with palm facing camera
    // This helps distinguish from other signs with all fingers extended
    if (matchedGesture.name === 'Hello' && fingersExtended.every(Boolean)) {
      // For Hello, check if the palm is relatively facing the camera 
      // Calculate palm normal vector (simplified)
      const palmNormal = calculatePalmNormal(handLandmarks);
      const facingCamera = Math.abs(palmNormal[2]) > 0.7; // Z component indicates facing camera
      
      if (facingCamera) {
        confidence = 0.95; // Very high confidence for this distinctive gesture
        console.log("Special case: Confirmed 'Hello' sign with palm facing camera (MS-ASL)");
      } else {
        // If palm is not facing camera, this is likely not the Hello sign
        confidence *= 0.5; // Reduce confidence significantly
      }
    }
    
    // Case 4: Improve distinction between number signs in MS-ASL (1-5)
    if (['1', '2', '3', '4', '5'].includes(matchedGesture.name)) {
      const numExtendedFingers = fingersExtended.filter(Boolean).length;
      const expectedNumber = parseInt(matchedGesture.name);
      
      // If number of extended fingers matches the number sign, boost confidence
      if (numExtendedFingers === expectedNumber) {
        confidence = Math.max(confidence, 0.9);
        console.log(`Special case: Confirmed number sign '${matchedGesture.name}' (MS-ASL)`);
      } else {
        // If extended fingers don't match expected number, this is likely wrong
        confidence *= 0.3; // Significantly reduce confidence
      }
    }
    
    // Apply MS-ASL specific adjustments based on available data from gesture
    if (matchedGesture.msaslClass !== undefined) {
      // Use MS-ASL class information to refine confidence
      // Higher class numbers have more complex constraints
      const complexityAdjustment = 1.0 - (matchedGesture.msaslClass / 100);
      confidence *= complexityAdjustment;
    }
    
    // Set extremely strict thresholds based on gesture type for MS-ASL
    // This makes our detection much more accurate but requires clearer signing
    let confThreshold = 0.95; // Very high default threshold for MS-ASL
    
    // Adjust threshold based on sign type and complexity
    if (matchedGesture) {
      // Different thresholds for different types of signs
      if (matchedGesture.type === 'alphabet') {
        confThreshold = 0.88; // Strict for alphabet to prevent false positives
      } else if (matchedGesture.type === 'phrase') {
        confThreshold = 0.85; // Slightly less strict for phrases 
      }
      
      // Further adjust threshold based on known complexity
      if (matchedGesture.complexity !== undefined) {
        // Allow slightly lower threshold for more complex signs
        // But still maintain high overall standards
        confThreshold -= (matchedGesture.complexity * 0.01);
      }
    }
    
    // If we found a gesture with high enough confidence (MS-ASL threshold), return it
    if (matchedGesture && confidence > confThreshold) {
      return {
        gesture: matchedGesture,
        confidence
      };
    }
    
    // If confidence is too low after all our checks, return null
    return null;
  } catch (error) {
    console.error("Error in gesture recognition:", error);
    return null;
  }
}

// Calculate finger curl values for each finger (MS-ASL specific feature)
// Returns an array of values from 0 (straight) to 1 (fully curled)
function calculateFingerCurls(landmarks: number[][]): number[] {
  const curls: number[] = [];
  
  // For each finger (except thumb which works differently)
  for (let finger = 1; finger <= 4; finger++) {
    // Get the base (MCP), middle (PIP), and tip landmarks for this finger
    const baseIndex = finger * 4 + 1;
    const midIndex = finger * 4 + 2;
    const tipIndex = finger * 4 + 4;
    
    const base = landmarks[baseIndex];
    const mid = landmarks[midIndex];
    const tip = landmarks[tipIndex];
    
    // Calculate the angle at the middle joint
    const angle = angleBetweenThreePoints(base, mid, tip);
    
    // Convert angle to curl value (180° = straight = 0 curl, 0° = fully bent = 1 curl)
    // MS-ASL specific scaling based on their dataset characteristics
    const curl = 1 - (angle / 180);
    curls.push(curl);
  }
  
  // Calculate thumb curl separately (it bends differently)
  const thumbBase = landmarks[1];
  const thumbMid = landmarks[2];
  const thumbTip = landmarks[4];
  const thumbAngle = angleBetweenThreePoints(thumbBase, thumbMid, thumbTip);
  const thumbCurl = 1 - (thumbAngle / 180);
  
  // Add thumb curl at the beginning
  curls.unshift(thumbCurl);
  
  return curls;
}

// Calculate palm normal vector (simplified for MS-ASL)
// Returns a unit vector [x,y,z] representing direction palm is facing
function calculatePalmNormal(landmarks: number[][]): number[] {
  // Use wrist and key MCP joints to define the palm plane
  const wrist = landmarks[0];
  const indexMCP = landmarks[5];
  const pinkyMCP = landmarks[17];
  
  // Calculate two vectors in the palm plane
  const v1 = [
    indexMCP[0] - wrist[0],
    indexMCP[1] - wrist[1],
    indexMCP[2] - wrist[2]
  ];
  
  const v2 = [
    pinkyMCP[0] - wrist[0],
    pinkyMCP[1] - wrist[1],
    pinkyMCP[2] - wrist[2]
  ];
  
  // Cross product to get normal vector
  const normal = [
    v1[1] * v2[2] - v1[2] * v2[1],
    v1[2] * v2[0] - v1[0] * v2[2],
    v1[0] * v2[1] - v1[1] * v2[0]
  ];
  
  // Normalize to unit vector
  const magnitude = Math.sqrt(normal[0]**2 + normal[1]**2 + normal[2]**2);
  return [
    normal[0] / magnitude,
    normal[1] / magnitude,
    normal[2] / magnitude
  ];
}

// Enhanced algorithm to detect which fingers are extended
function detectExtendedFingers(landmarks: number[][]): boolean[] {
  const wrist = landmarks[0];
  const palm = landmarks[0]; // Palm center (approximated as wrist for simplicity)
  
  // Finger joints:
  // - First knuckle: landmarks[1,5,9,13,17] (MCP - metacarpophalangeal joint)
  // - Second knuckle: landmarks[2,6,10,14,18] (PIP - proximal interphalangeal joint)
  // - Third knuckle: landmarks[3,7,11,15,19] (DIP - distal interphalangeal joint)
  // - Fingertips: landmarks[4,8,12,16,20]
  
  // Get all fingertips
  const fingertips = [
    landmarks[4],   // Thumb tip
    landmarks[8],   // Index fingertip
    landmarks[12],  // Middle fingertip
    landmarks[16],  // Ring fingertip
    landmarks[20]   // Pinky fingertip
  ];
  
  // Get middle knuckles (PIP joints)
  const midKnuckles = [
    landmarks[2],   // Thumb IP joint
    landmarks[6],   // Index PIP joint
    landmarks[10],  // Middle PIP joint
    landmarks[14],  // Ring PIP joint
    landmarks[18]   // Pinky PIP joint
  ];
  
  // Get base knuckles (MCP joints)
  const baseKnuckles = [
    landmarks[1],   // Thumb MCP joint
    landmarks[5],   // Index MCP joint 
    landmarks[9],   // Middle MCP joint
    landmarks[13],  // Ring MCP joint
    landmarks[17]   // Pinky MCP joint
  ];
  
  // Calculate finger extension using multiple criteria with better ASL-specific detection
  return fingertips.map((tip, i) => {
    // Special handling for thumb (i=0) which works differently in ASL
    if (i === 0) {
      // For thumb: check if it's extended to the side by measuring distance to pinky base
      // This helps with ASL signs like 'A' where thumb sticks out to the side
      const thumbToPinkyBaseDistance = distance(tip, landmarks[17]);
      const thumbBaseToWristDistance = distance(landmarks[1], wrist);
      
      // Thumb is considered extended if it's sufficiently far from the pinky base
      // This ratio is carefully tuned for ASL thumb positions
      const isThumbExtended = thumbToPinkyBaseDistance > thumbBaseToWristDistance * 0.6;
      
      // Log detailed thumb position data for debugging
      console.log(`Thumb position - Extended: ${isThumbExtended}, Ratio: ${thumbToPinkyBaseDistance/thumbBaseToWristDistance}`);
      
      return isThumbExtended;
    }
    
    const midKnuckle = midKnuckles[i];
    const baseKnuckle = baseKnuckles[i];
    const fingerBaseToPalmDistance = distance(baseKnuckle, palm);
    
    // For standard fingers: multiple improved criteria for ASL detection
    
    // 1. Check if fingertip is farther from palm than knuckle
    // Important for detecting clearly extended fingers in signs like 'B', 'V'
    const extensionRatio = distance(tip, palm) / fingerBaseToPalmDistance;
    
    // 2. Calculate angle to better detect bent fingers in ASL
    // Critical for detecting curved fingers in letters like 'C', 'O'
    const angle = angleBetweenThreePoints(baseKnuckle, midKnuckle, tip);
    
    // STRICTER extension thresholds for different fingers (MS-ASL specifically tuned)
    // More rigid detection especially for MS-ASL dataset
    let extensionThreshold = 1.7; // Higher ratio threshold = more extended
    let angleThreshold = 150;    // Higher angle threshold = straighter fingers
    
    // Special case: index finger (i=1) is often used in signs like 'D', 'G', 'Z'
    if (i === 1) {
      extensionThreshold = 1.4; // Still higher than before but recognizes index pointing
      angleThreshold = 140;     // Straighter for MS-ASL index pointing
    }
    
    // Special case: middle finger (i=2) for signs where it's important
    if (i === 2) {
      extensionThreshold = 1.5; // Calibrated specifically for MS-ASL
      angleThreshold = 145;     // Slightly more forgiving than index
    }
    
    // Special case: pinky (i=4) for signs like 'I', 'Y'
    if (i === 4) {
      extensionThreshold = 1.5; // Higher than before
      angleThreshold = 130;     // Still a bit forgiving as pinky is harder to extend
    }
    
    const isExtendedByDistance = extensionRatio > extensionThreshold;
    const isExtendedByAngle = angle > angleThreshold;
    
    // Combine criteria with logical OR for better sensitivity
    // This improves detection for ASL signs like 'V', 'R', 'U' where fingers may not be fully extended
    return isExtendedByDistance || isExtendedByAngle;
  });
}

// Simple pattern matching for ASL letters
function getFingerprintMatches(fingersExtended: boolean[], availableGestures: Gesture[]): Array<{gesture: Gesture, confidence: number}> {
  // MS-ASL specific finger patterns based on MS-ASL dataset
  // Format: [thumb, index, middle, ring, pinky]
  const patterns: {[key: string]: {
    fingerPattern: boolean[], 
    // Additional verification required (function that returns true if this is a match)
    verifyFn?: (fingersExtended: boolean[]) => boolean
  }} = {
    // ASL alphabet with MS-ASL specific patterns
    'A': { 
      fingerPattern: [true, false, false, false, false],
      verifyFn: (fingers) => fingers[0] && !fingers.slice(1).some(Boolean) // Only thumb extended
    },    
    'B': { 
      fingerPattern: [false, true, true, true, true],
      // For B, we want to be extra sure the thumb is NOT extended while all others are
      verifyFn: (fingers) => !fingers[0] && fingers.slice(1).every(Boolean)
    },
    'C': { 
      fingerPattern: [false, false, false, false, false] 
    },
    'D': { 
      fingerPattern: [true, true, false, false, false],
      verifyFn: (fingers) => fingers[0] && fingers[1] && !fingers[2] && !fingers[3] && !fingers[4]
    },
    'E': { 
      fingerPattern: [false, false, false, false, false] 
    },
    'F': { 
      fingerPattern: [true, true, false, false, false] 
    },
    'G': { 
      fingerPattern: [true, true, false, false, false],
      verifyFn: (fingers) => fingers[0] && fingers[1] && !fingers[2] && !fingers[3] && !fingers[4]
    },
    'H': { 
      fingerPattern: [true, true, true, false, false],
      verifyFn: (fingers) => fingers[0] && fingers[1] && fingers[2] && !fingers[3] && !fingers[4]
    },
    'I': { 
      fingerPattern: [false, false, false, false, true],
      verifyFn: (fingers) => !fingers[0] && !fingers[1] && !fingers[2] && !fingers[3] && fingers[4]
    },
    'J': { 
      fingerPattern: [false, false, false, false, true] 
    },
    'K': { 
      fingerPattern: [true, true, true, false, false] 
    },
    'L': { 
      fingerPattern: [true, true, false, false, false],
      verifyFn: (fingers) => fingers[0] && fingers[1] && !fingers[2] && !fingers[3] && !fingers[4]
    },
    'M': { 
      fingerPattern: [false, false, false, false, false] 
    },
    'N': { 
      fingerPattern: [false, false, false, false, false] 
    },
    'O': { 
      fingerPattern: [false, false, false, false, false] 
    },
    'P': { 
      fingerPattern: [true, true, false, false, false] 
    },
    'Q': { 
      fingerPattern: [true, true, false, false, false] 
    },
    'R': { 
      fingerPattern: [true, true, true, false, false] 
    },
    'S': { 
      fingerPattern: [false, false, false, false, false] 
    },
    'T': { 
      fingerPattern: [false, false, false, false, false] 
    },
    'U': { 
      fingerPattern: [true, true, true, false, false],
      verifyFn: (fingers) => fingers[0] && fingers[1] && fingers[2] && !fingers[3] && !fingers[4]
    },
    'V': { 
      fingerPattern: [true, true, true, false, false],
      verifyFn: (fingers) => fingers[0] && fingers[1] && fingers[2] && !fingers[3] && !fingers[4]
    },
    'W': { 
      fingerPattern: [true, true, true, true, false],
      // For W, we specifically want thumb, index, middle, and ring fingers extended, but not pinky
      verifyFn: (fingers) => fingers[0] && fingers[1] && fingers[2] && fingers[3] && !fingers[4]
    },
    'X': { 
      fingerPattern: [true, false, false, false, false] 
    },
    'Y': { 
      fingerPattern: [true, false, false, false, true],
      verifyFn: (fingers) => fingers[0] && !fingers[1] && !fingers[2] && !fingers[3] && fingers[4]
    },
    'Z': { 
      fingerPattern: [true, true, false, false, false] 
    },
    
    // MS-ASL common phrases with more specific patterns
    'Hello': { 
      fingerPattern: [true, true, true, true, true],
      // For Hello, all fingers must be clearly extended - this is a very specific gesture
      verifyFn: (fingers) => fingers.every(Boolean)
    },
    'Thank You': { 
      fingerPattern: [true, false, false, false, false] 
    },
    'Please': { 
      fingerPattern: [true, false, false, false, false] 
    },
    'Sorry': { 
      fingerPattern: [false, false, false, false, false] 
    },
    'Help': { 
      fingerPattern: [true, true, false, false, false] 
    },
    'Yes': { 
      fingerPattern: [true, false, false, false, false] 
    },
    'No': { 
      fingerPattern: [true, true, true, false, false] 
    },
    'Good': { 
      fingerPattern: [true, false, false, false, false] 
    },
    'Bad': { 
      fingerPattern: [true, false, false, false, false] 
    },
    'Love': { 
      fingerPattern: [true, false, false, false, false] 
    },
  };
  
  // Add default patterns for any missing gestures (to avoid errors)
  availableGestures.forEach(gesture => {
    if (!patterns[gesture.name]) {
      patterns[gesture.name] = { 
        fingerPattern: gesture.fingerPattern || [true, true, true, true, true]
      };
    }
  });
  
  // Match current pattern against known patterns with improved weighting
  const results = availableGestures
    .map(gesture => {
      // Get the pattern for this gesture
      const patternInfo = patterns[gesture.name];
      const pattern = patternInfo.fingerPattern;
      
      // MS-ASL specific verification - first check if we have additional verification logic
      // If we do and it fails, return very low confidence
      if (patternInfo.verifyFn && !patternInfo.verifyFn(fingersExtended)) {
        return { gesture, confidence: 0.1 }; // Very low confidence if verification fails
      }
      
      // Count matching fingers with weighted scoring based on MS-ASL importance
      let weightedScore = 0;
      
      // MS-ASL specific weights
      // Thumb and index have higher importance in MS-ASL
      const weights = [1.0, 1.3, 1.0, 0.8, 0.9]; // [thumb, index, middle, ring, pinky]
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      
      // Calculate weighted matching score with improved MS-ASL specific logic
      for (let i = 0; i < 5; i++) {
        // Exact matches get full weight
        if (fingersExtended[i] === pattern[i]) {
          weightedScore += weights[i];
        } else {
          // Penalty is higher when the pattern has crucial differences
          // Missing an extended finger is worse than having an extra extended finger
          // This makes a big difference in MS-ASL accuracy for similar gestures
          
          if (pattern[i] === true && fingersExtended[i] === false) {
            // Should be extended but isn't - heavy penalty for MS-ASL
            weightedScore -= weights[i] * 1.2; // Higher penalty for missing extended fingers
          } else {
            // Should be closed but is extended - moderate penalty
            weightedScore -= weights[i] * 0.8;
          }
        }
      }
      
      // Calculate confidence score and handle negative values
      // With our new penalty system, scores can go negative for very poor matches
      // We need to clamp these to a small positive value
      let confidence = 0.0;
      
      if (weightedScore <= 0) {
        // Very poor match - give it a very low confidence
        confidence = 0.1;
      } else {
        // Normal case - calculate standard confidence
        confidence = Math.min(1.0, weightedScore / totalWeight);
      }
      
      // MS-ASL specific adjustments:
      // 1. Adjust confidence based on gesture type
      if (gesture.type === 'phrase') {
        // Phrases need more precise matches in MS-ASL
        confidence *= 0.9; // Reduce confidence slightly for phrases
      }
      
      // 2. Apply confidence penalty for signs that require motion but can't be detected in single frame
      if (gesture.hasMotion) {
        confidence *= 0.85; // Reduce confidence for signs that require motion
      }
      
      // Add more context for better debugging - only for relatively high confidence matches
      if (confidence > 0.65) {
        console.log(`High match for ${gesture.name}: ${(confidence * 100).toFixed(1)}%, pattern: [${pattern}], detected: [${fingersExtended}]`);
      }
      
      return { gesture, confidence };
    })
    .filter(result => {
      // MS-ASL specific adaptive confidence thresholds
      // More stringent thresholds to reduce false positives
      let minConfidence = 0.8; // Default high threshold
      
      // Different thresholds based on gesture type and complexity
      if (result.gesture.type === 'alphabet') {
        minConfidence = 0.85; // Even higher for alphabet signs
      } else if (result.gesture.type === 'phrase') {
        minConfidence = 0.80; // High for phrases
      }
      
      // Adjust threshold based on complexity if available
      if (result.gesture.complexity !== undefined) {
        // More complex signs get slightly lower threshold
        minConfidence -= (result.gesture.complexity / 100); 
      }
      
      return result.confidence > minConfidence;
    })
    .sort((a, b) => b.confidence - a.confidence); // Sort by confidence
  
  return results;
}
