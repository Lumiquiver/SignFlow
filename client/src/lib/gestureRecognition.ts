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
    // Extract features from current hand pose
    const features = extractFeatures(handLandmarks);
    
    // Detect specific hand poses based on finger positions
    const fingersExtended = detectExtendedFingers(handLandmarks);
    
    // Add debug logging to see what's being detected
    console.log("Fingers extended:", fingersExtended);
    
    // Match finger positions to known gestures
    let matchedGesture: Gesture | null = null;
    let confidence = 0;
    
    // Find closest matching gesture based on the extended fingers pattern
    const letterMatches = getFingerprintMatches(fingersExtended, availableGestures);
    
    if (letterMatches.length > 0) {
      matchedGesture = letterMatches[0].gesture;
      confidence = letterMatches[0].confidence;
      
      // Log the top matches for debugging
      console.log("Top matches:", letterMatches.slice(0, 3).map(m => 
        `${m.gesture.name} (${(m.confidence * 100).toFixed(0)}%)`).join(", "));
    }
    
    // If we found a gesture with good confidence, return it
    if (matchedGesture && confidence > 0.65) {
      return {
        gesture: matchedGesture,
        confidence
      };
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
  
  // Calculate finger extension using multiple criteria
  return fingertips.map((tip, i) => {
    // Skip special handling for thumb (i=0) which works differently
    if (i === 0) {
      // For thumb: check if it's extended to the side
      const isThumbExtended = distance(tip, landmarks[17]) > distance(landmarks[1], landmarks[17]) * 0.9;
      return isThumbExtended;
    }
    
    const midKnuckle = midKnuckles[i];
    const baseKnuckle = baseKnuckles[i];
    
    // For other fingers: multiple criteria to determine if extended
    
    // 1. Check if fingertip is farther from wrist than middle knuckle
    const extensionRatio = distance(tip, wrist) / distance(midKnuckle, wrist);
    
    // 2. Calculate angle between joints to detect bend
    const angle = angleBetweenThreePoints(baseKnuckle, midKnuckle, tip);
    const isFingerStraight = angle > 145; // Near straight is > 145 degrees
    
    // 3. Check distance between fingertip and palm to ensure it's extended outward
    const tipToPalmRatio = distance(tip, palm) / distance(baseKnuckle, palm);
    
    // Combine criteria with appropriate weights
    return (extensionRatio > 1.2) && (tipToPalmRatio > 1.5 || isFingerStraight);
  });
}

// Simple pattern matching for ASL letters
function getFingerprintMatches(fingersExtended: boolean[], availableGestures: Gesture[]): Array<{gesture: Gesture, confidence: number}> {
  // Expanded and more accurate fingerprint patterns for ASL letters and common phrases
  const patterns: {[key: string]: boolean[]} = {
    // ASL alphabet finger patterns (thumb, index, middle, ring, pinky)
    'A': [false, false, false, false, false],
    'B': [false, true, true, true, true],
    'C': [true, false, false, false, false], // Curved C shape
    'D': [false, true, false, false, false],
    'E': [false, false, false, false, false], // Curved hand
    'F': [true, true, false, false, false],
    'G': [false, true, false, false, false], // Point with index
    'H': [false, true, true, false, false],
    'I': [false, false, false, false, true],
    'J': [false, false, false, false, true], // With movement
    'K': [false, true, true, false, false],
    'L': [true, true, false, false, false],
    'M': [false, false, false, false, false], // Three fingers folded
    'N': [false, false, false, false, false], // Two fingers folded
    'O': [true, false, false, false, false], // Circle shape
    'P': [false, true, true, false, false], // Point down
    'Q': [false, true, false, false, false], // Point down
    'R': [false, true, true, false, false], // Crossed fingers
    'S': [false, false, false, false, false], // Fist
    'T': [false, false, false, false, false], // Thumb between index and middle
    'U': [false, true, true, false, false],
    'V': [false, true, true, false, false],
    'W': [false, true, true, true, false],
    'X': [false, false, false, false, false], // Bent index
    'Y': [true, false, false, false, true],
    'Z': [false, true, false, false, false], // Z motion
    
    // Common phrases - simplified for demo purposes
    'Hello': [true, true, true, true, true], // Open hand wave
    'Thank You': [false, false, false, false, true], // Hand from chin forward
    'Please': [true, false, false, false, false], // Circular motion
    'Sorry': [false, false, false, false, false], // Fist circular motion
    'Help': [true, true, false, false, false], // One hand on other
    'Yes': [false, false, false, false, false], // Nodding fist
    'No': [false, true, true, false, false], // Sideways movement
    'Good': [true, false, false, false, false], // Flat hand forward
    'Bad': [false, false, false, false, false], // Thumb down
    'Love': [true, true, false, false, true], // Crossed arms
  };
  
  // Add default patterns for any missing gestures (to avoid errors)
  availableGestures.forEach(gesture => {
    if (!patterns[gesture.name]) {
      // Default to all fingers extended as fallback
      patterns[gesture.name] = [true, true, true, true, true];
    }
  });
  
  // Match current pattern against known patterns
  const results = availableGestures
    .map(gesture => {
      const pattern = patterns[gesture.name];
      
      // Count matching fingers with weighted scoring
      // Thumb is less reliable, so it gets less weight
      let weightedScore = 0;
      const weights = [0.6, 1.0, 1.0, 1.0, 1.0]; // Thumb has lower weight
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      
      for (let i = 0; i < 5; i++) {
        if (fingersExtended[i] === pattern[i]) {
          weightedScore += weights[i];
        }
      }
      
      const confidence = weightedScore / totalWeight;
      return { gesture, confidence };
    })
    .filter(result => result.confidence > 0.6) // Higher threshold for better accuracy
    .sort((a, b) => b.confidence - a.confidence); // Sort by confidence
  
  return results;
}
