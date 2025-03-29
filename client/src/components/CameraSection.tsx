import { useState } from 'react';
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
  // Define all useState hooks first to maintain consistent order
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  
  // Then use custom hooks
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
                <div className="bg-red-50 border border-red-200 rounded-md mt-4 px-4 py-3 max-w-md">
                  <p className="text-[#EA4335] text-sm font-medium">
                    {error}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Please ensure you're using a modern browser with WebGL support and have allowed camera permissions.
                  </p>
                </div>
              )}
              
              {detectionError && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md mt-4 px-4 py-3 max-w-md">
                  <p className="text-amber-700 text-sm font-medium">
                    {detectionError}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    The hand detection model had trouble loading. Try refreshing the page or using a different browser.
                  </p>
                </div>
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
              {/* Loading indicator when model is initializing */}
              {!isModelReady && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
                  <div className="bg-white rounded-md p-4 shadow-lg max-w-md text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto"></div>
                    <p className="mt-3 text-[#202124] font-['Google_Sans'] font-medium">Loading detection model...</p>
                    <p className="text-sm text-gray-500 mt-1">This may take a few moments on first run</p>
                  </div>
                </div>
              )}
              
              {/* Bounding box around detected hand */}
              {isModelReady && detectionState.boundingBox && (
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
              
              {/* Status indicator */}
              <div className="absolute bottom-4 right-4 px-3 py-1 bg-black bg-opacity-60 text-white rounded text-sm flex items-center">
                {!isModelReady && (
                  <span className="material-icons text-sm mr-1 text-yellow-300">timelapse</span>
                )}
                {isModelReady && detectionState.detectionStatus === 'detecting' && (
                  <span className="material-icons text-sm mr-1 text-blue-300">search</span>
                )}
                {isModelReady && detectionState.detectionStatus === 'detected' && (
                  <span className="material-icons text-sm mr-1 text-green-300">pan_tool</span>
                )}
                {isModelReady && detectionState.detectionStatus === 'recognized' && (
                  <span className="material-icons text-sm mr-1 text-green-400">check_circle</span>
                )}
                {isModelReady && detectionState.detectionStatus === 'error' && (
                  <span className="material-icons text-sm mr-1 text-red-400">error</span>
                )}
                
                <span>
                  {!isModelReady && 'Initializing model...'}
                  {isModelReady && detectionState.detectionStatus === 'idle' && 'Starting detection...'}
                  {isModelReady && detectionState.detectionStatus === 'detecting' && 'No hands detected'}
                  {isModelReady && detectionState.detectionStatus === 'detected' && 'Hand detected'}
                  {isModelReady && detectionState.detectionStatus === 'recognizing' && 'Recognizing sign...'}
                  {isModelReady && detectionState.detectionStatus === 'recognized' && 'Sign recognized!'}
                  {isModelReady && detectionState.detectionStatus === 'error' && 'Detection error'}
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
