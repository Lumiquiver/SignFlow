import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  LucideHelpCircle, 
  LucideCamera, 
  LucideHand, 
  LucideRefreshCw, 
  LucideWifi, 
  LucideShield, 
  LucideBookOpen,
  LucidePlay,
  LucideGraduationCap,
  LucideSettings,
  LucideVideo,
  LucideArrowRight,
  LucideDownload,
  LucideUserCheck,
  LucideAlertTriangle
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<"faq" | "tutorials" | "tips">("faq");
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const tutorialVideos = [
    {
      id: "getting-started",
      title: "Getting Started with Sign Language Translator",
      thumbnail: "https://placehold.co/400x225?text=Getting+Started",
      duration: "3:45",
      level: "Beginner"
    },
    {
      id: "alphabet-basics",
      title: "ASL Alphabet Basics",
      thumbnail: "https://placehold.co/400x225?text=Alphabet+Basics",
      duration: "5:20",
      level: "Beginner"
    },
    {
      id: "common-phrases",
      title: "Essential Everyday Phrases",
      thumbnail: "https://placehold.co/400x225?text=Common+Phrases",
      duration: "4:15",
      level: "Intermediate"
    },
    {
      id: "hand-positioning",
      title: "Proper Hand Positioning for Better Recognition",
      thumbnail: "https://placehold.co/400x225?text=Hand+Positioning",
      duration: "2:50",
      level: "Beginner"
    },
    {
      id: "advanced-signs",
      title: "Advanced Sign Combinations",
      thumbnail: "https://placehold.co/400x225?text=Advanced+Signs",
      duration: "7:10",
      level: "Advanced"
    },
    {
      id: "learning-path",
      title: "Creating Your Sign Learning Path",
      thumbnail: "https://placehold.co/400x225?text=Learning+Path",
      duration: "4:30",
      level: "Intermediate"
    }
  ];

  const renderVideoPlayer = () => {
    if (!activeVideo) return null;
    
    const video = tutorialVideos.find(v => v.id === activeVideo);
    if (!video) return null;
    
    return (
      <div className="mt-4 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setActiveVideo(null)}>
            <LucideArrowRight className="h-4 w-4 rotate-180" />
            Back to tutorials
          </Button>
          <h3 className="text-lg font-semibold">{video.title}</h3>
        </div>
        
        <div className="aspect-video bg-black/90 rounded-md flex items-center justify-center">
          <div className="text-center">
            <LucideVideo className="h-16 w-16 mx-auto mb-2 text-primary/50" />
            <p className="text-sm text-muted-foreground">
              Video tutorials are not available in the demo version.
            </p>
            <Button className="mt-4" variant="outline" onClick={() => setActiveVideo(null)}>
              Return to tutorial list
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <LucideHelpCircle className="h-6 w-6" /> Help Center
          </DialogTitle>
          <DialogDescription>
            Find guides, tutorials, and answers to help you get the most out of the Sign Language Translator
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "faq" | "tutorials" | "tips")} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <LucideBookOpen className="h-4 w-4" />
              <span>FAQ</span>
            </TabsTrigger>
            <TabsTrigger value="tutorials" className="flex items-center gap-2">
              <LucidePlay className="h-4 w-4" />
              <span>Video Tutorials</span>
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center gap-2">
              <LucideGraduationCap className="h-4 w-4" />
              <span>Learning Tips</span>
            </TabsTrigger>
          </TabsList>
          
          {/* FAQ Tab */}
          <TabsContent value="faq" className="mt-4">
            {!activeVideo && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="getting-started">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <LucideCamera className="h-5 w-5 text-primary" />
                      <span>Getting Started</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-7">
                      <h4 className="font-medium">How to use the translator:</h4>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Allow camera access when prompted</li>
                        <li>Position your hand in the center of the camera view</li>
                        <li>Make sign language gestures clearly and hold them steady</li>
                        <li>The recognized signs will appear in the translation panel</li>
                        <li>Use the buttons to clear or copy the translated text</li>
                      </ol>
                      <p className="text-sm text-muted-foreground mt-2">
                        Note: Good lighting and a plain background will improve recognition accuracy.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="gestures">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <LucideHand className="h-5 w-5 text-primary" />
                      <span>Supported Gestures</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-7">
                      <p>
                        Our translator currently supports the following types of signs:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Alphabet:</strong> A-Z fingerspelling</li>
                        <li><strong>Common words:</strong> Frequently used words in conversation</li>
                        <li><strong>Basic phrases:</strong> Greetings and simple expressions</li>
                      </ul>
                      <p className="text-sm text-muted-foreground mt-2">
                        Use the "Categories" button to browse all available signs by category.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="troubleshooting">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <LucideRefreshCw className="h-5 w-5 text-primary" />
                      <span>Troubleshooting</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pl-7">
                      <h4 className="font-medium">Common Issues:</h4>
                      
                      <div>
                        <h5 className="font-medium">Camera not working</h5>
                        <ul className="list-disc pl-5 text-sm">
                          <li>Check that you've granted camera permissions in your browser</li>
                          <li>Try refreshing the page</li>
                          <li>Make sure no other application is using your camera</li>
                          <li>On mobile devices, ensure the browser has camera permissions in your device settings</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium">Poor recognition accuracy</h5>
                        <ul className="list-disc pl-5 text-sm">
                          <li>Ensure you have good lighting (natural light or well-lit environment)</li>
                          <li>Keep your hand centered in frame and make clear, deliberate gestures</li>
                          <li>Hold signs steady for 1-2 seconds to improve detection</li>
                          <li>Use a plain, non-distracting background (single-color walls work best)</li>
                          <li>Adjust the confidence threshold in Settings if needed</li>
                          <li>Try using the Learning Mode to practice specific gestures</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium">Application is slow</h5>
                        <ul className="list-disc pl-5 text-sm">
                          <li>Close other resource-intensive applications or browser tabs</li>
                          <li>Try using a more powerful device if available</li>
                          <li>Ensure you have a stable internet connection</li>
                          <li>Enable "Power Save Mode" in Settings for better performance on lower-end devices</li>
                          <li>Reduce camera resolution in Settings to improve performance</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium">Specific sign recognition problems</h5>
                        <ul className="list-disc pl-5 text-sm">
                          <li>Make sure your hand is well-lit and clearly visible</li>
                          <li>Practice using the "Categories" section and Learning Mode</li>
                          <li>Some signs may look similar - try adjusting your hand position slightly</li>
                          <li>Signs that require motion are more challenging to recognize - move deliberately</li>
                          <li>Two-handed signs currently have limited support - focus on single-hand signs first</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="connection">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <LucideWifi className="h-5 w-5 text-primary" />
                      <span>Connection Requirements</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-7">
                      <p>
                        The Sign Language Translator requires an internet connection initially to load, but most processing happens locally on your device. For optimal performance:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Use a stable internet connection when first loading the application</li>
                        <li>Once loaded, the translator will continue working even with intermittent connectivity</li>
                        <li>The model works best on modern browsers (Chrome, Firefox, Safari, Edge)</li>
                        <li>Enable "Offline Mode" in Settings to cache resources for offline use</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="privacy">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <LucideShield className="h-5 w-5 text-primary" />
                      <span>Privacy & Data</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-7">
                      <p>
                        We take your privacy seriously:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>All video processing happens locally on your device</li>
                        <li>Your camera feed is never sent to our servers</li>
                        <li>We don't store your translations or video data</li>
                        <li>The application uses cookies only for essential functionality</li>
                        <li>Learning progress is stored in your browser's local storage</li>
                        <li>You can control data sharing in the Privacy settings</li>
                      </ul>
                      <p className="text-sm text-muted-foreground mt-2">
                        For more details, please review our complete Privacy Policy.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="customization">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <LucideSettings className="h-5 w-5 text-primary" />
                      <span>Customization Options</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-7">
                      <p>
                        The Sign Language Translator offers several customization options:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Camera Settings:</strong> Adjust resolution, frame rate, and display options</li>
                        <li><strong>Recognition Settings:</strong> Modify confidence threshold and detection parameters</li>
                        <li><strong>Display Settings:</strong> Change theme, font size, and visual preferences</li>
                        <li><strong>Advanced Settings:</strong> Enable experimental features and performance options</li>
                        <li><strong>Privacy Settings:</strong> Control data usage and storage preferences</li>
                      </ul>
                      <p className="text-sm text-muted-foreground mt-2">
                        Access these options by clicking the "Settings" button in the top menu.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </TabsContent>
          
          {/* Video Tutorials Tab */}
          <TabsContent value="tutorials" className="mt-4">
            {activeVideo ? (
              renderVideoPlayer()
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tutorialVideos.map(video => (
                  <div 
                    key={video.id} 
                    className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setActiveVideo(video.id)}
                  >
                    <div className="relative aspect-video bg-muted">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                        <LucidePlay className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                      <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                        {video.level}
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm line-clamp-2">{video.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 text-center">
              <Button variant="outline" className="gap-2">
                <LucideDownload className="h-4 w-4" />
                Download All Tutorials (PDF Guide)
              </Button>
            </div>
          </TabsContent>
          
          {/* Learning Tips Tab */}
          <TabsContent value="tips" className="mt-4">
            <div className="space-y-6">
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2 mb-2">
                  <LucideGraduationCap className="h-5 w-5" />
                  Getting the Most Out of Sign Language Translator
                </h3>
                <p className="mb-4">
                  Learning sign language takes practice and patience. Here are our top tips for effective learning and better recognition results.
                </p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="font-semibold text-primary flex items-center gap-2">
                    <LucideUserCheck className="h-5 w-5" />
                    Practice Techniques
                  </h3>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">1. Start with the basics</h4>
                    <p className="text-sm text-muted-foreground">
                      Begin with the alphabet and simple words. Master these before moving to more complex phrases.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">2. Practice regularly</h4>
                    <p className="text-sm text-muted-foreground">
                      Short, frequent practice sessions (15-20 minutes) are more effective than occasional long sessions.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">3. Use the Learning Mode</h4>
                    <p className="text-sm text-muted-foreground">
                      Track your progress with our Learning Mode. Bookmark gestures you find challenging and practice them specifically.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">4. Practice with a purpose</h4>
                    <p className="text-sm text-muted-foreground">
                      Focus on signs relevant to your daily life or specific contexts you're interested in.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-primary flex items-center gap-2">
                    <LucideAlertTriangle className="h-5 w-5" />
                    Common Mistakes to Avoid
                  </h3>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">1. Rushing through signs</h4>
                    <p className="text-sm text-muted-foreground">
                      Make deliberate, clear gestures. Hold each sign for 1-2 seconds for better recognition.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">2. Inconsistent hand position</h4>
                    <p className="text-sm text-muted-foreground">
                      Keep your hand at a consistent distance from the camera. Too close or too far can reduce accuracy.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">3. Poor lighting conditions</h4>
                    <p className="text-sm text-muted-foreground">
                      Ensure your hand is well-lit and clearly visible against the background.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">4. Forgetting finger positioning</h4>
                    <p className="text-sm text-muted-foreground">
                      Pay attention to the exact finger positions. Small differences can change the meaning entirely.
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h3 className="font-semibold text-primary">Learning Resources</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <LucideArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm"><strong>Learning Mode:</strong> Use our built-in learning tracking system to monitor your progress</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <LucideArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm"><strong>Video Tutorials:</strong> Watch our tutorial videos for proper hand positioning and movement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <LucideArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm"><strong>Categories:</strong> Browse through our comprehensive library of gestures by category</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <LucideArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm"><strong>External Resources:</strong> Consider joining community classes or online forums to practice with others</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 text-sm text-center text-muted-foreground">
          <p>Still need help? <a href="#" className="text-primary hover:underline" onClick={(e) => {e.preventDefault(); onClose();}}>Contact our support team</a></p>
        </div>
      </DialogContent>
    </Dialog>
  );
}