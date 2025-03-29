import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import { HandDetectionState } from '../types';

// Initialize the handpose model
let handposeModel: handpose.HandPose | null = null;

export async function initializeHandpose(): Promise<void> {
  // Load the TensorFlow.js core
  await tf.ready();
  
  // Load the handpose model
  handposeModel = await handpose.load({
    detectionConfidence: 0.8,
    maxContinuousChecks: 10,
    iouThreshold: 0.3,
    scoreThreshold: 0.75,
  });
  
  console.log("Handpose model loaded");
}

export async function detectHands(video: HTMLVideoElement): Promise<HandDetectionState> {
  if (!handposeModel) {
    console.error("Handpose model not initialized");
    return {
      isDetecting: false,
      detectionStatus: "error",
      detectedHands: false
    };
  }
  
  try {
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
