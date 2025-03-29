import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import CameraSection from '@/components/CameraSection';
import TranslationPanel from '@/components/TranslationPanel';
import PhrasesSection from '@/components/PhrasesSection';
import Footer from '@/components/Footer';
import PermissionDeniedModal from '@/components/PermissionDeniedModal';
import { DetectedGesture, Gesture } from '@/types';

export default function Home() {
  const [detectedGestures, setDetectedGestures] = useState<DetectedGesture[]>([]);
  const [isPermissionDeniedModalOpen, setIsPermissionDeniedModalOpen] = useState(false);
  
  // Fetch available gestures from API
  const { data: alphabetGestures = [] } = useQuery<Gesture[]>({
    queryKey: ['/api/gestures/type/alphabet'],
  });
  
  const { data: phraseGestures = [] } = useQuery<Gesture[]>({
    queryKey: ['/api/gestures/type/phrase'],
  });
  
  const allGestures = [...alphabetGestures, ...phraseGestures];
  
  // Handle new detected gestures
  const handleGestureDetected = (detectedGesture: DetectedGesture) => {
    setDetectedGestures(prev => 
      [detectedGesture, ...prev].slice(0, 20) // Keep last 20 gestures
    );
  };
  
  const handlePermissionDenied = () => {
    setIsPermissionDeniedModalOpen(true);
  };
  
  const clearDetectedGestures = () => {
    setDetectedGestures([]);
  };
  
  // Copy all detected gestures text to clipboard
  const copyToClipboard = () => {
    const text = detectedGestures
      .map(g => g.gesture)
      .join(' ');
    
    if (text) {
      navigator.clipboard.writeText(text)
        .catch(err => console.error('Failed to copy text: ', err));
    }
  };
  
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <CameraSection 
            onGestureDetected={handleGestureDetected}
            onPermissionDenied={handlePermissionDenied}
            availableGestures={allGestures}
          />
          
          <TranslationPanel 
            detectedGestures={detectedGestures}
            recognizedSigns={alphabetGestures.slice(0, 3)}
            onClearAll={clearDetectedGestures}
            onCopyText={copyToClipboard}
          />
        </div>
        
        <PhrasesSection phrases={phraseGestures} />
      </main>
      
      <Footer />
      
      <PermissionDeniedModal 
        isOpen={isPermissionDeniedModalOpen}
        onClose={() => setIsPermissionDeniedModalOpen(false)}
      />
    </div>
  );
}
