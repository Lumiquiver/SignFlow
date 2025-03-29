import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWebcam } from '@/hooks/useWebcam';
import { useHandDetection } from '@/hooks/useHandDetection';
import { DetectedGesture, Gesture } from '@/types';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface CameraSectionProps {
  onGestureDetected?: (gesture: DetectedGesture) => void;
  onPermissionDenied?: () => void;
  availableGestures: Gesture[];
}

export default function CameraSection({ 
  onGestureDetected, 
  onPermissionDenied,
  availableGestures
}: CameraSectionProps) {
  const { 
    videoRef, 
    isActive, 
    isLoading, 
    error, 
    startCamera, 
    stopCamera 
  } = useWebcam({
    onPermissionDenied
  });
  
  const { 
    detectionState, 
    isModelReady, 
    error: detectionError 
  } = useHandDetection({
    enabled: isActive,
    videoRef,
    onGestureDetected,
    availableGestures,
  });
  
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  
  return (
    <section className="lg:col-span-7 xl:col-span-8 flex flex-col">
      <Card className="overflow-hidden flex-grow">
        <CardHeader className="p-4 border-b border-[#DADCE0] flex-row flex items-center justify-between space-y-0 space-x-0">
          <CardTitle className="text-lg font-['Google_Sans'] font-medium text-[#202124]">Camera Feed</CardTitle>
          <div className="flex space-x-2">
            {!isActive && (
              <Button 
                className="bg-primary hover:bg-blue-600 text-white font-['Google_Sans'] text-sm"
                disabled={isLoading}
                onClick={startCamera}
              >
                <span className="material-icons mr-1 text-sm">videocam</span>
                Start Camera
              </Button>
            )}
            
            {isActive && (
              <Button 
                className="bg-[#EA4335] hover:bg-red-600 text-white font-['Google_Sans'] text-sm"
                onClick={stopCamera}
              >
                <span className="material-icons mr-1 text-sm">videocam_off</span>
                Stop
              </Button>
            )}
          </div>
        </CardHeader>
        
        <div className="relative aspect-video w-full bg-[#F1F3F4] flex flex-col items-center justify-center">
          {/* Camera placeholder (shown before camera starts) */}
          {!isActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F1F3F4] z-10">
              <span className="material-icons text-6xl text-[#DADCE0] mb-4">videocam</span>
              <p className="text-[#202124] font-['Google_Sans'] text-center max-w-md px-4">
                Click "Start Camera" to begin sign language detection.<br />
                <span className="text-sm text-gray-500">You'll be prompted to allow camera access</span>
              </p>
              
              {error && (
                <p className="text-[#EA4335] text-sm mt-4 max-w-md px-4 text-center">
                  {error}
                </p>
              )}
            </div>
          )}
          
          {/* Actual video element */}
          <video 
            ref={videoRef} 
            className={cn(
              "w-full h-full object-cover",
              !isActive && "hidden"
            )}
            muted
            playsInline
          ></video>
          
          {/* Hand detection overlay */}
          {isActive && (
            <div className="absolute inset-0 pointer-events-none">
              {detectionState.boundingBox && (
                <div 
                  className="absolute border-2 border-primary rounded-md"
                  style={{
                    top: `${detectionState.boundingBox.y}px`,
                    left: `${detectionState.boundingBox.x}px`,
                    width: `${detectionState.boundingBox.width}px`,
                    height: `${detectionState.boundingBox.height}px`,
                    boxShadow: '0 0 0 4px rgba(26, 115, 232, 0.2)',
                    animation: 'pulse 2s infinite'
                  }}
                ></div>
              )}
              
              <div className="absolute bottom-4 right-4 px-3 py-1 bg-black bg-opacity-60 text-white rounded text-sm">
                <span>
                  {detectionState.detectionStatus === 'idle' && 'Starting detection...'}
                  {detectionState.detectionStatus === 'detecting' && 'No hands detected'}
                  {detectionState.detectionStatus === 'detected' && 'Hand detected'}
                  {detectionState.detectionStatus === 'recognizing' && 'Recognizing sign...'}
                  {detectionState.detectionStatus === 'recognized' && 'Sign recognized!'}
                  {detectionState.detectionStatus === 'error' && 'Detection error'}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Instructions and Tips */}
        <div className="p-4 bg-[#F1F3F4] border-t border-[#DADCE0]">
          <div className="text-sm">
            <button 
              className="font-['Google_Sans'] font-medium text-primary cursor-pointer flex items-center"
              onClick={() => setIsTipsOpen(!isTipsOpen)}
            >
              <span className="material-icons text-sm mr-1">tips_and_updates</span>
              Tips for better recognition
              <span className="material-icons text-sm ml-1">
                {isTipsOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
              </span>
            </button>
            
            {isTipsOpen && (
              <div className="mt-3 ml-6 space-y-2 text-[#202124]">
                <p className="flex items-start">
                  <span className="material-icons text-sm text-primary mr-2 mt-0.5">check_circle</span>
                  Position yourself in good lighting with an uncluttered background
                </p>
                <p className="flex items-start">
                  <span className="material-icons text-sm text-primary mr-2 mt-0.5">check_circle</span>
                  Keep your hand in the center of the frame and avoid quick movements
                </p>
                <p className="flex items-start">
                  <span className="material-icons text-sm text-primary mr-2 mt-0.5">check_circle</span>
                  Make clear, well-defined gestures and allow a brief pause between signs
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </section>
  );
}
