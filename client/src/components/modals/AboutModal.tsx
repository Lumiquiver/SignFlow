import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LucideInfo, LucideCode, LucideUsers, LucideBookOpen } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">About Sign Language Translator</DialogTitle>
          <DialogDescription>
            Bridging communication gaps through technology
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          <section className="flex items-start gap-4">
            <div className="mt-1 p-2 bg-primary/10 rounded-full">
              <LucideInfo className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Our Mission</h3>
              <p className="mt-1 text-muted-foreground">
                Our mission is to make communication more accessible for everyone by leveraging the power of 
                artificial intelligence and computer vision. We aim to break down barriers between the hearing and 
                deaf communities through intuitive, real-time sign language translation.
              </p>
            </div>
          </section>

          <section className="flex items-start gap-4">
            <div className="mt-1 p-2 bg-primary/10 rounded-full">
              <LucideCode className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Technology</h3>
              <p className="mt-1 text-muted-foreground">
                Our translator uses advanced TensorFlow.js and handpose models to detect and interpret 
                hand gestures in real-time. The application processes all data locally on your device, 
                ensuring privacy and quick response times. Our recognition system is trained on the Microsoft 
                American Sign Language Dataset (MS-ASL) for high accuracy.
              </p>
            </div>
          </section>

          <section className="flex items-start gap-4">
            <div className="mt-1 p-2 bg-primary/10 rounded-full">
              <LucideUsers className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Team</h3>
              <p className="mt-1 text-muted-foreground">
                Our diverse team includes software engineers, accessibility specialists, and sign language experts 
                working together to create the most accurate and user-friendly translation tool possible. We 
                collaborate with deaf communities to continually improve our service.
              </p>
            </div>
          </section>

          <section className="flex items-start gap-4">
            <div className="mt-1 p-2 bg-primary/10 rounded-full">
              <LucideBookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Ongoing Development</h3>
              <p className="mt-1 text-muted-foreground">
                We're constantly working to improve recognition accuracy, expand our sign vocabulary, and add 
                support for different sign languages from around the world. Our roadmap includes features like 
                two-way translation, offline support, and integration with communication platforms.
              </p>
            </div>
          </section>

          <div className="pt-2 text-sm text-center text-muted-foreground">
            <p>Version 1.0.0 • © 2025 Sign Language Translator</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}