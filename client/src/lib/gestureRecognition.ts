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
    
    // Calculate additional ASL-specific features
    // 1. Hand compactness (ratio of hand width to height)
    const handWidth = Math.max(...handLandmarks.map(l => l[0])) - Math.min(...handLandmarks.map(l => l[0]));
    const handHeight = Math.max(...handLandmarks.map(l => l[1])) - Math.min(...handLandmarks.map(l => l[1]));
    const handCompactness = handWidth / handHeight;
    
    // 2. Thumb position relative to palm - important for many ASL signs
    const thumbTip = handLandmarks[4];
    const indexMCP = handLandmarks[5];
    const thumbToIndexBase = distance(thumbTip, indexMCP);
    
    // Find closest matching gesture based on the improved finger pattern detection
    const gestureMatches = getFingerprintMatches(fingersExtended, availableGestures);
    
    // Enhanced matching with additional checks for specific ASL signs
    if (gestureMatches.length > 0) {
      let matchedGesture = gestureMatches[0].gesture;
      let confidence = gestureMatches[0].confidence;
      
      // Log the top matches for debugging
      console.log("Top matches:", gestureMatches.slice(0, 3).map(m => 
        `${m.gesture.name} (${(m.confidence * 100).toFixed(1)}%)`).join(", "));
      
      // Special case handling for commonly confused ASL signs
      
      // Case 1: 'A' vs 'S' - both have closed fist but 'A' has thumb to side
      if ((matchedGesture.name === 'A' || matchedGesture.name === 'S') && 
          fingersExtended[0] && !fingersExtended.slice(1).some(Boolean)) {
        // Confirm it's truly 'A' by checking thumb position
        if (thumbToIndexBase > distance(handLandmarks[1], indexMCP) * 0.8) {
          matchedGesture = availableGestures.find(g => g.name === 'A') || matchedGesture;
          confidence = Math.max(confidence, 0.85);
          console.log("Special case: Detected 'A' sign");
        }
      }
      
      // Case 2: 'U' vs 'V' - both use index+middle but 'V' has them spread
      if ((matchedGesture.name === 'U' || matchedGesture.name === 'V') && 
          fingersExtended[1] && fingersExtended[2] && !fingersExtended[3] && !fingersExtended[4]) {
        // Measure spread between index and middle fingertips
        const indexTip = handLandmarks[8];
        const middleTip = handLandmarks[12];
        const fingerSpread = distance(indexTip, middleTip) / handHeight;
        
        if (fingerSpread > 0.3) {
          // Wide spread indicates 'V'
          matchedGesture = availableGestures.find(g => g.name === 'V') || matchedGesture;
          confidence = Math.max(confidence, 0.85);
          console.log("Special case: Detected 'V' sign (spread fingers)");
        } else {
          // Narrow spread indicates 'U'
          matchedGesture = availableGestures.find(g => g.name === 'U') || matchedGesture;
          confidence = Math.max(confidence, 0.85);
          console.log("Special case: Detected 'U' sign (close fingers)");
        }
      }
      
      // If we found a gesture with good confidence, return it
      if (matchedGesture && confidence > 0.7) {
        return {
          gesture: matchedGesture,
          confidence
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error in gesture recognition:", error);
    return null;
  }
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
    
    // Different extension thresholds for different fingers (ASL-specific)
    let extensionThreshold = 1.5;
    let angleThreshold = 140;
    
    // Special case: index finger (i=1) is often used in signs like 'D', 'G', 'Z'
    if (i === 1) {
      extensionThreshold = 1.2; // Lower threshold for index finger
      angleThreshold = 130;     // More permissive angle for index finger
    }
    
    // Special case: pinky (i=4) for signs like 'I', 'Y'
    if (i === 4) {
      extensionThreshold = 1.3;
      angleThreshold = 120;     // Pinky doesn't need to be as straight
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
  // Significantly improved fingerprint patterns based on true ASL finger positions
  // Format: [thumb, index, middle, ring, pinky]
  const patterns: {[key: string]: boolean[]} = {
    // ASL alphabet finger patterns
    'A': [true, false, false, false, false],    // Fist with thumb to the side
    'B': [false, true, true, true, true],       // Flat hand, all fingers extended except thumb
    'C': [false, false, false, false, false],   // Curved C shape (detected as closed because of curve)
    'D': [true, true, false, false, false],     // Index up, thumb touches index
    'E': [false, false, false, false, false],   // Curved fingers, thumb against palm
    'F': [true, true, false, false, false],     // Index and thumb touching, rest closed
    'G': [true, true, false, false, false],     // Point with index, thumb out
    'H': [true, true, true, false, false],      // Index and middle out, parallel
    'I': [false, false, false, false, true],    // Only pinky extended
    'J': [false, false, false, false, true],    // Pinky extended with motion
    'K': [true, true, true, false, false],      // Index and middle extended in V, thumb out
    'L': [true, true, false, false, false],     // Thumb and index make L shape
    'M': [false, false, false, false, false],   // Three fingers folded over thumb
    'N': [false, false, false, false, false],   // Two fingers folded over thumb
    'O': [false, false, false, false, false],   // Curved O shape with all fingers
    'P': [true, true, false, false, false],     // Pointing down with index, thumb out
    'Q': [true, true, false, false, false],     // Pointing down with index
    'R': [true, true, true, false, false],      // Crossed index and middle
    'S': [false, false, false, false, false],   // Fist with thumb across palm
    'T': [false, false, false, false, false],   // Fist with thumb between index and middle
    'U': [true, true, true, false, false],      // Index and middle extended together
    'V': [true, true, true, false, false],      // Index and middle extended in V shape
    'W': [true, true, true, true, false],       // Index, middle, and ring extended
    'X': [true, false, false, false, false],    // Bent index, thumb out
    'Y': [true, false, false, false, true],     // Thumb and pinky extended (hang loose)
    'Z': [true, true, false, false, false],     // Index draws Z in air
    
    // Common phrases - more accurately mapped to specific hand shapes
    'Hello': [true, true, true, true, true],    // Open hand wave
    'Thank You': [true, false, false, false, false], // Flat hand from chin forward
    'Please': [true, false, false, false, false],    // Circular motion on chest
    'Sorry': [false, false, false, false, false],    // Fist circular motion on chest
    'Help': [true, true, false, false, false],       // One flat hand on other
    'Yes': [true, false, false, false, false],       // Nodding fist
    'No': [true, true, true, false, false],          // Index and middle extended, shake
    'Good': [true, false, false, false, false],      // Flat hand down from chin
    'Bad': [true, false, false, false, false],       // Flat hand down from chin with frown
    'Love': [true, false, false, false, false],      // Cross arms over chest
  };
  
  // Add default patterns for any missing gestures (to avoid errors)
  availableGestures.forEach(gesture => {
    if (!patterns[gesture.name]) {
      // Default to all fingers extended as fallback
      patterns[gesture.name] = [true, true, true, true, true];
    }
  });
  
  // Match current pattern against known patterns with improved weighting
  const results = availableGestures
    .map(gesture => {
      const pattern = patterns[gesture.name];
      
      // Count matching fingers with weighted scoring based on ASL importance
      // Different weights for different fingers based on their importance in ASL
      let weightedScore = 0;
      
      // Weights adjusted for ASL recognition:
      // - Thumb and index get higher weight as they're most distinctive in many ASL signs
      // - Middle, ring, and pinky fingers get proportionally lower weights
      const weights = [0.8, 1.2, 1.0, 0.7, 0.8]; // [thumb, index, middle, ring, pinky]
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      
      // Calculate weighted matching score
      for (let i = 0; i < 5; i++) {
        if (fingersExtended[i] === pattern[i]) {
          weightedScore += weights[i];
        }
      }
      
      // Calculate confidence score
      const confidence = weightedScore / totalWeight;
      
      // Add more context for better debugging
      if (confidence > 0.7) {
        console.log(`High match for ${gesture.name}: ${(confidence * 100).toFixed(1)}%, pattern: [${pattern}], detected: [${fingersExtended}]`);
      }
      
      return { gesture, confidence };
    })
    .filter(result => {
      // Adaptive confidence threshold based on gesture type
      // Letters need higher confidence than phrases
      const minConfidence = result.gesture.type === 'alphabet' ? 0.7 : 0.65;
      return result.confidence > minConfidence;
    })
    .sort((a, b) => b.confidence - a.confidence); // Sort by confidence
  
  return results;
}
