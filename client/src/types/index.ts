export interface Gesture {
  id: number;
  name: string;
  type: "alphabet" | "phrase";
  description: string;
}

export interface DetectedGesture {
  gesture: string;
  confidence: number;
  timestamp: number;
}

export interface HandDetectionState {
  isDetecting: boolean;
  detectionStatus: "idle" | "detecting" | "detected" | "recognizing" | "recognized" | "error";
  detectedHands: boolean;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  }
}

export interface RecognitionResult {
  gesture: Gesture;
  confidence: number;
}
