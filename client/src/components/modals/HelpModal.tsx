import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LucideHelpCircle, LucideCamera, LucideHand, LucideRefreshCw, LucideWifi, LucideShield } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <LucideHelpCircle className="h-6 w-6" /> Help & FAQ
          </DialogTitle>
          <DialogDescription>
            Frequently asked questions and guides to help you get the most out of the Sign Language Translator
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
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
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium">Poor recognition accuracy</h5>
                    <ul className="list-disc pl-5 text-sm">
                      <li>Ensure you have good lighting</li>
                      <li>Keep your hand in frame and make clear gestures</li>
                      <li>Hold signs steady for 1-2 seconds</li>
                      <li>Use a plain, non-distracting background</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium">Application is slow</h5>
                    <ul className="list-disc pl-5 text-sm">
                      <li>Close other resource-intensive applications</li>
                      <li>Try using a more powerful device</li>
                      <li>Ensure you have a stable internet connection</li>
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
                  </ul>
                  <p className="text-sm text-muted-foreground mt-2">
                    For more details, please review our complete Privacy Policy.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <div className="mt-6 text-sm text-center text-muted-foreground">
          <p>Still need help? <a href="#" className="text-primary hover:underline" onClick={(e) => {e.preventDefault(); onClose();}}>Contact our support team</a></p>
        </div>
      </DialogContent>
    </Dialog>
  );
}