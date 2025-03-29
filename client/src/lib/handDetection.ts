import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import { HandDetectionState } from '../types';

// Initialize the handpose model
let handposeModel: handpose.HandPose | null = null;
let isModelLoading = false;

export async function initializeHandpose(): Promise<handpose.HandPose> {
  // If model is already loaded, return it
  if (handposeModel) {
    return handposeModel;
  }
  
  // If model is already loading, wait for it
  if (isModelLoading) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (handposeModel) {
          clearInterval(checkInterval);
          resolve(handposeModel);
        }
      }, 100);
      
      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Handpose model loading timeout"));
      }, 30000);
    });
  }
  
  try {
    isModelLoading = true;
    
    // Load TensorFlow.js backend
    await tf.setBackend('webgl');
    await tf.ready();
    
    // Load the handpose model with more appropriate settings for browser
    console.log("Loading handpose model...");
    handposeModel = await handpose.load({
      detectionConfidence: 0.7,  // Slightly lower to improve detection rate
      maxContinuousChecks: 5,   // Reduced for better performance
      iouThreshold: 0.3,
      scoreThreshold: 0.6,      // Slightly lower to improve detection rate
    });
    
    console.log("Handpose model loaded successfully");
    return handposeModel;
  } catch (error) {
    console.error("Failed to load handpose model:", error);
    throw error;
  } finally {
    isModelLoading = false;
  }
}

export async function detectHands(video: HTMLVideoElement): Promise<HandDetectionState> {
  try {
    // Ensure model is initialized
    if (!handposeModel) {
      return {
        isDetecting: false,
        detectionStatus: "error",
        detectedHands: false
      };
    }
    
    // Make prediction
    const predictions = await handposeModel.estimateHands(video);
    
    if (predictions.length > 0) {
      // Get bounding box for the first detected hand
      const prediction = predictions[0];
      const landmarks = prediction.landmarks;
      
      // Calculate bounding box from landmarks
      let minX = Infinity, minY = Infinity;
      let maxX = -Infinity, maxY = -Infinity;
      
      landmarks.forEach(point => {
        minX = Math.min(minX, point[0]);
        minY = Math.min(minY, point[1]);
        maxX = Math.max(maxX, point[0]);
        maxY = Math.max(maxY, point[1]);
      });
      
      const width = maxX - minX;
      const height = maxY - minY;
      
      // Add padding to bounding box
      const padding = Math.max(width, height) * 0.2;
      
      return {
        isDetecting: true,
        detectionStatus: "detected",
        detectedHands: true,
        boundingBox: {
          x: Math.max(0, minX - padding),
          y: Math.max(0, minY - padding),
          width: width + padding * 2,
          height: height + padding * 2
        }
      };
    } else {
      return {
        isDetecting: true,
        detectionStatus: "detecting",
        detectedHands: false
      };
    }
  } catch (error) {
    console.error("Error detecting hands:", error);
    return {
      isDetecting: false,
      detectionStatus: "error",
      detectedHands: false
    };
  }
}

// Utility function to get the handpose model directly
export function getHandposeModel(): handpose.HandPose | null {
  return handposeModel;
}
