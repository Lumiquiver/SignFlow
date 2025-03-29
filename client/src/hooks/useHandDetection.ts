import { useState, useEffect, useRef } from 'react';
import { initializeHandpose, detectHands } from '../lib/handDetection';
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
  
  const detectionLoopRef = useRef<number | null>(null);
  const lastDetectedGestureRef = useRef<string | null>(null);
  const detectionCountRef = useRef<number>(0);
  
  // Load the handpose model when component mounts
  useEffect(() => {
    let mounted = true;
    
    const loadModel = async () => {
      try {
        await initializeHandpose();
        if (mounted) {
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
  
  // Detection loop
  useEffect(() => {
    if (!enabled || !isModelReady || !videoRef.current) {
      if (detectionLoopRef.current) {
        cancelAnimationFrame(detectionLoopRef.current);
        detectionLoopRef.current = null;
      }
      return;
    }
    
    const video = videoRef.current;
    let lastDetectionTime = 0;
    
    const runDetection = async (timestamp: number) => {
      if (timestamp - lastDetectionTime > detectionInterval) {
        setDetectionState(prev => ({
          ...prev,
          isDetecting: true,
          detectionStatus: prev.detectedHands ? 'recognizing' : 'detecting'
        }));
        
        const handState = await detectHands(video);
        
        if (handState.detectedHands) {
          setDetectionState(prev => ({
            ...prev, 
            ...handState,
            detectionStatus: 'recognized'
          }));
          
          // Get hand landmarks from the handpose model directly in a real app
          // For demo, we're using the mock data in the recognizeGesture function
          const handposeModel = await import('@tensorflow-models/handpose');
          const predictions = await handposeModel.default.load().then(
            model => model.estimateHands(video)
          );
          
          if (predictions.length > 0) {
            const landmarks = predictions[0].landmarks;
            const recognitionResult = await recognizeGesture(landmarks, availableGestures);
            
            if (recognitionResult && recognitionResult.confidence > 0.7) {
              // Only notify if it's a different gesture or repeated after threshold
              // This prevents rapid-fire identical detections
              if (
                lastDetectedGestureRef.current !== recognitionResult.gesture.name ||
                detectionCountRef.current > 10
              ) {
                lastDetectedGestureRef.current = recognitionResult.gesture.name;
                detectionCountRef.current = 0;
                
                onGestureDetected?.({
                  gesture: recognitionResult.gesture.name,
                  confidence: recognitionResult.confidence,
                  timestamp: Date.now()
                });
              } else {
                detectionCountRef.current++;
              }
            }
          }
        } else {
          setDetectionState(prev => ({
            ...prev,
            ...handState
          }));
          
          lastDetectedGestureRef.current = null;
          detectionCountRef.current = 0;
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
