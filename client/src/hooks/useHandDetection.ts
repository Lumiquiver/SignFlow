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
  const confidenceHistoryRef = useRef<Map<string, { count: number, confidences: number[], lastTimestamp: number }>>(new Map());
  const REQUIRED_MATCHES = 4; // Increased number of high-confidence matches needed for a confirmation (more strict)
  
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
  
  // Add a much less aggressive cleanup that only removes truly stale data
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const expiration = 8000; // 8 seconds - much longer than before
      
      // Only clear very old gesture matches that haven't been seen in a long time
      // Don't reset active ones like before!
      confidenceHistoryRef.current.forEach((value, key) => {
        // If data is extremely stale (not seen in 8+ seconds), reset it
        if (now - value.lastTimestamp > expiration) {
          confidenceHistoryRef.current.delete(key); // Just remove it completely instead of resetting
        }
      });
    }, 15000); // Cleanup less frequently (every 15 seconds instead of 10)
    
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
                  
                  // Update confidence history for this gesture with timestamp tracking
                  const now = Date.now();
                  const history = confidenceHistoryRef.current.get(gestureName) || { 
                    count: 0, 
                    confidences: [],
                    lastTimestamp: now
                  };
                  
                  // Reset count if too much time has passed (3 seconds)
                  if (now - history.lastTimestamp > 3000) {
                    history.count = 0;
                    history.confidences = [];
                  }
                  
                  history.count++;
                  history.confidences.push(recognitionResult.confidence);
                  history.lastTimestamp = now;
                  confidenceHistoryRef.current.set(gestureName, history);
                  
                  // For debugging - track the confidence history count
                  console.log(`Confidence count for ${gestureName}: ${history.count}/${REQUIRED_MATCHES} (need ${REQUIRED_MATCHES})`);
                  
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
                      
                      // CRITICAL FIX: Don't reset the history count completely to zero!
                      // Instead, reduce it to maintain more consistency between detections
                      // This allows the system to quickly re-recognize the same sign
                      confidenceHistoryRef.current.set(gestureName, { 
                        count: REQUIRED_MATCHES - 1, // Keep most of our confidence history instead of resetting to 0
                        confidences: history.confidences.slice(-3), // Keep the last 3 confidence measurements
                        lastTimestamp: Date.now() 
                      });
                      
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
