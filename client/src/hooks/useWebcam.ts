import { useState, useRef, useCallback, useEffect } from "react";

interface UseWebcamOptions {
  onStreamStart?: (stream: MediaStream) => void;
  onStreamStop?: () => void;
  onPermissionDenied?: () => void;
}

export function useWebcam({ 
  onStreamStart, 
  onStreamStop,
  onPermissionDenied
}: UseWebcamOptions = {}) {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    if (isActive) return;
    
    setIsLoading(true);
    setError(null);
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Your browser doesn't support camera access");
      setIsLoading(false);
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      streamRef.current = stream;
      setIsActive(true);
      onStreamStart?.(stream);
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setError("Camera access denied. Please allow camera access to use this feature.");
          onPermissionDenied?.();
        } else {
          setError(`Failed to access camera: ${err.message}`);
        }
      } else {
        setError("An unknown error occurred while accessing the camera");
      }
    } finally {
      setIsLoading(false);
    }
  }, [isActive, onStreamStart, onPermissionDenied]);

  const stopCamera = useCallback(() => {
    if (!isActive || !streamRef.current) return;
    
    streamRef.current.getTracks().forEach(track => {
      track.stop();
    });
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    streamRef.current = null;
    setIsActive(false);
    onStreamStop?.();
  }, [isActive, onStreamStop]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, []);

  return {
    videoRef,
    isActive,
    isLoading,
    error,
    startCamera,
    stopCamera
  };
}
