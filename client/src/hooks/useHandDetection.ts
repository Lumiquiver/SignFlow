import { useState, useEffect, useRef } from 'react';
import { initializeHandpose, detectHands, getHandposeModel } from '../lib/handDetection';
import { recognizeGesture } from '../lib/gestureRecognition';
import { HandDetectionState, DetectedGesture, Gesture } from '../types';

interface UseHandDetectionOptions {
  enabled: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  detectionInterval?: number;
  onGestureDetected?: (result: DetectedGesture) => void;
  availableGestures?: Gesture[];
}

export function useHandDetection({
  enabled,
  videoRef,
  detectionInterval = 500,
  onGestureDetected,
  availableGestures = []
}: UseHandDetectionOptions) {
  const [detectionState, setDetectionState] = useState<HandDetectionState>({
    isDetecting: false,
    detectionStatus: 'idle',
    detectedHands: false,
  });
  const [isModelReady, setIsModelReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Enhanced tracking for MS-ASL specific detection improvements
  const detectionLoopRef = useRef<number | null>(null);
  const lastDetectedGestureRef = useRef<string | null>(null);
  const detectionCountRef = useRef<number>(0);
  const handposeModelRef = useRef<any>(null);
  
  // MS-ASL confidence tracking (for requiring multiple high-confidence detections)
  const confidenceHistoryRef = useRef<Map<string, { count: number, confidences: number[] }>>(new Map());
  const REQUIRED_MATCHES = 2; // Number of high-confidence matches needed for a confirmation
  
  // Load the handpose model when component mounts
  useEffect(() => {
    let mounted = true;
    
    const loadModel = async () => {
      try {
        console.log("Starting handpose model initialization...");
        const model = await initializeHandpose();
        handposeModelRef.current = model;
        
        if (mounted) {
          console.log("Handpose model initialization complete");
          setIsModelReady(true);
        }
      } catch (err) {
        console.error('Failed to load handpose model:', err);
        if (mounted) {
          setError('Failed to load hand detection model');
        }
      }
    };
    
    loadModel();
    
    return () => {
      mounted = false;
    };
  }, []);
  
  // Cleanup confidence history periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const expiration = 5000; // 5 seconds
      
      // Clear old gesture matches to prevent stale data
      confidenceHistoryRef.current.forEach((value, key) => {
        // Reset counts for gestures not seen recently
        confidenceHistoryRef.current.set(key, { count: 0, confidences: [] });
      });
    }, 10000); // Cleanup every 10 seconds
    
    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);
  
  // MS-ASL enhanced detection loop
  useEffect(() => {
    if (!enabled || !isModelReady || !videoRef.current) {
      if (detectionLoopRef.current) {
        cancelAnimationFrame(detectionLoopRef.current);
        detectionLoopRef.current = null;
      }
      return;
    }
    
    console.log("Starting detection loop with model ready:", isModelReady);
    const video = videoRef.current;
    let lastDetectionTime = 0;
    
    const runDetection = async (timestamp: number) => {
      if (timestamp - lastDetectionTime > detectionInterval) {
        setDetectionState(prev => ({
          ...prev,
          isDetecting: true,
          detectionStatus: prev.detectedHands ? 'recognizing' : 'detecting'
        }));
        
        try {
          // First detect hands to get bounding box and detection status
          const handState = await detectHands(video);
          
          if (handState.detectedHands) {
            setDetectionState(prev => ({
              ...prev, 
              ...handState,
              detectionStatus: 'recognized'
            }));
            
            // Use the already loaded model instance for MS-ASL gesture recognition
            const model = getHandposeModel();
            if (model) {
              const predictions = await model.estimateHands(video);
              
              if (predictions.length > 0) {
                const landmarks = predictions[0].landmarks;
                const recognitionResult = await recognizeGesture(landmarks, availableGestures);
                
                // Process only high confidence MS-ASL matches
                if (recognitionResult && recognitionResult.confidence > 0.8) { // Higher threshold for MS-ASL
                  const gestureName = recognitionResult.gesture.name;
                  
                  // Update confidence history for this gesture
                  const history = confidenceHistoryRef.current.get(gestureName) || { count: 0, confidences: [] };
                  history.count++;
                  history.confidences.push(recognitionResult.confidence);
                  confidenceHistoryRef.current.set(gestureName, history);
                  
                  // For MS-ASL signs, require multiple consistent detections before reporting
                  // This helps filter out false positives in complex signs
                  if (history.count >= REQUIRED_MATCHES) {
                    // Calculate average confidence for stability
                    const avgConfidence = history.confidences.reduce((a, b) => a + b, 0) / history.confidences.length;
                    
                    // Apply a cooldown to prevent too frequent detections of the same sign
                    if (
                      lastDetectedGestureRef.current !== gestureName ||
                      detectionCountRef.current > 3 // Lower threshold for MS-ASL to allow faster detection
                    ) {
                      lastDetectedGestureRef.current = gestureName;
                      detectionCountRef.current = 0;
                      
                      // Clear the history count to prevent repeated triggers
                      confidenceHistoryRef.current.set(gestureName, { count: 0, confidences: [] });
                      
                      // Notify with the MS-ASL optimized gesture information
                      onGestureDetected?.({
                        gesture: gestureName,
                        confidence: avgConfidence,
                        timestamp: Date.now()
                      });
                      
                      // For debugging
                      console.log(`MS-ASL detected: ${gestureName} with avg confidence ${(avgConfidence * 100).toFixed(1)}%`);
                    } else {
                      detectionCountRef.current++;
                    }
                  }
                }
              }
            }
          } else {
            setDetectionState(prev => ({
              ...prev,
              ...handState
            }));
            
            // Reset tracking when no hands are detected
            lastDetectedGestureRef.current = null;
            detectionCountRef.current = 0;
          }
        } catch (err) {
          console.error("Error in MS-ASL detection loop:", err);
          setDetectionState(prev => ({
            ...prev,
            isDetecting: false,
            detectionStatus: "error",
            detectedHands: false
          }));
        }
        
        lastDetectionTime = timestamp;
      }
      
      detectionLoopRef.current = requestAnimationFrame(runDetection);
    };
    
    detectionLoopRef.current = requestAnimationFrame(runDetection);
    
    return () => {
      if (detectionLoopRef.current) {
        cancelAnimationFrame(detectionLoopRef.current);
        detectionLoopRef.current = null;
      }
    };
  }, [enabled, isModelReady, videoRef, detectionInterval, onGestureDetected, availableGestures]);
  
  return {
    detectionState,
    isModelReady,
    error
  };
}
