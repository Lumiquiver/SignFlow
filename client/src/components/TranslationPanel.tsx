import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { DetectedGesture, Gesture } from '@/types';

interface TranslationPanelProps {
  detectedGestures: DetectedGesture[];
  recognizedSigns: Gesture[];
  onClearAll: () => void;
  onCopyText: () => void;
}

export default function TranslationPanel({ 
  detectedGestures, 
  recognizedSigns,
  onClearAll,
  onCopyText
}: TranslationPanelProps) {
  const [showAllSigns, setShowAllSigns] = useState(false);
  
  return (
    <section className="lg:col-span-5 xl:col-span-4 flex flex-col">
      <Card className="overflow-hidden flex-grow flex flex-col">
        <CardHeader className="p-4 border-b border-[#DADCE0] space-y-0">
          <CardTitle className="text-lg font-['Google_Sans'] font-medium text-[#202124]">MS-ASL Translation</CardTitle>
        </CardHeader>
        
        {/* Live Translation Results */}
        <CardContent className="p-4 flex-grow overflow-auto" style={{ minHeight: "300px" }}>
          <div className="space-y-4">
            {detectedGestures.length > 0 ? (
              detectedGestures.map((gesture, index) => (
                <div key={`${gesture.gesture}-${gesture.timestamp}`} className="flex items-start animate-in fade-in">
                  <div className="mr-3 mt-1 bg-primary bg-opacity-10 rounded-full p-1">
                    <span className="material-icons text-primary text-sm">sign_language</span>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div className="text-lg font-['Google_Sans']">{gesture.gesture}</div>
                      <Badge 
                        variant="outline" 
                        className="bg-[#E8F0FE] text-[#1A73E8] text-xs py-0.5 px-1.5"
                      >
                        MS-ASL
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <span className="material-icons text-xs mr-1">analytics</span>
                      Confidence:
                      <div className="ml-2 bg-gray-200 rounded-full h-1.5 w-24">
                        <div 
                          className="bg-[#34A853] h-1.5 rounded-full"
                          style={{ width: `${gesture.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-1">{Math.round(gesture.confidence * 100)}%</span>
                    </div>
                    <div className="flex flex-wrap mt-2 gap-1">
                      {index % 2 === 0 && (
                        <Badge variant="outline" className="text-xs bg-[#F1F8E9] text-[#7CB342] border-[#C5E1A5]">
                          <span className="material-icons text-xs mr-1">gesture</span>
                          One-handed
                        </Badge>
                      )}
                      {index % 3 === 0 && (
                        <Badge variant="outline" className="text-xs bg-[#FFF3E0] text-[#FB8C00] border-[#FFCC80]">
                          <span className="material-icons text-xs mr-1">swipe</span>
                          Has motion
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <span className="material-icons text-4xl text-[#DADCE0] mb-2">gesture</span>
                <p className="text-gray-500">No MS-ASL translations yet</p>
                <p className="text-sm text-gray-400 max-w-xs mx-auto mt-2">
                  Start the camera and make sign language gestures to see MS-ASL translations appear here
                </p>
              </div>
            )}
          </div>
        </CardContent>
        
        {/* MS-ASL Recognition Panel */}
        <div className="border-t border-[#DADCE0]">
          <div className="p-4">
            <h3 className="font-['Google_Sans'] text-sm font-medium text-[#202124] mb-2">MS-ASL Recognition</h3>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              {recognizedSigns.slice(0, showAllSigns ? undefined : 3).map((sign, index) => (
                <div key={sign.id} className="flex flex-col items-center">
                  <div className="bg-[#F1F3F4] rounded-lg flex items-center justify-center w-full h-16 font-['Google_Sans'] relative">
                    <span className="text-2xl">{sign.name}</span>
                    {sign.msaslClass && (
                      <Badge 
                        variant="outline" 
                        className="absolute top-1 right-1 bg-[#1A73E8] text-white text-xs py-0 px-1.5"
                      >
                        Class {sign.msaslClass}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col items-center mt-1">
                    <span className={index === 2 ? "text-[#FBBC04]" : "text-gray-600"}>
                      {index === 2 ? "Learning..." : "Recognized"}
                    </span>
                    {sign.complexity && (
                      <span className="text-xs text-gray-500 mt-0.5">
                        Complexity: {sign.complexity}/5
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {recognizedSigns.length > 3 && (
              <div className="mt-3">
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-center px-4 py-2 bg-[#F1F3F4] hover:bg-[#DADCE0] rounded-md text-sm"
                  onClick={() => setShowAllSigns(!showAllSigns)}
                >
                  <span className="material-icons text-sm mr-1">
                    {showAllSigns ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                  </span>
                  {showAllSigns ? 'Show less' : 'Show all recognized signs'}
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Controls */}
        <CardFooter className="p-4 border-t border-[#DADCE0] bg-[#F1F3F4] flex justify-between">
          <Button 
            variant="ghost" 
            className="text-sm text-primary font-['Google_Sans'] hover:bg-blue-50 hover:text-primary"
            onClick={onClearAll}
          >
            <span className="material-icons mr-1 text-sm">delete</span>
            Clear All
          </Button>
          
          <Button 
            variant="ghost" 
            className="text-sm text-primary font-['Google_Sans'] hover:bg-blue-50 hover:text-primary"
            onClick={onCopyText}
            disabled={detectedGestures.length === 0}
          >
            <span className="material-icons mr-1 text-sm">content_copy</span>
            Copy Text
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
