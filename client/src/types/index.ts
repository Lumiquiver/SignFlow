export interface Gesture {
  id: number;
  name: string;
  type: "alphabet" | "phrase" | "word";
  category?: string;
  description: string;
  fingerPattern?: boolean[];
  handShape?: string;
  hasMotion?: boolean;
  isTwoHanded?: boolean;
  faceExpression?: string;
  complexity?: number;
  msaslClass?: number;
  imageUrl?: string;
  videoUrl?: string;
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
