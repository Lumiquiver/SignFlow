import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsOfServiceModal({ isOpen, onClose }: TermsOfServiceModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Terms of Service</DialogTitle>
          <DialogDescription>
            Last updated: March 29, 2025
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <section>
            <h3 className="text-lg font-semibold">1. Acceptance of Terms</h3>
            <p>By accessing or using our sign language translation service, you agree to be bound by these Terms of Service and our Privacy Policy.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">2. Description of Service</h3>
            <p>Our service provides real-time sign language translation through computer vision technology. The service may be updated or modified periodically.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">3. User Responsibilities</h3>
            <p>Users of our service agree to:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Provide accurate information when requested</li>
              <li>Use the service in accordance with applicable laws</li>
              <li>Not attempt to disrupt or compromise the service</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold">4. Intellectual Property</h3>
            <p>All content, features, and functionality of our service are owned by us and protected by international copyright, trademark, and other intellectual property laws.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">5. Disclaimers</h3>
            <p>Our service is provided "as is" without any warranties. We do not guarantee 100% accuracy in translations and the service should not be relied upon in critical situations.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">6. Limitation of Liability</h3>
            <p>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">7. Changes to Terms</h3>
            <p>We may revise these Terms of Service at any time. Continued use of the service after such changes constitutes your acceptance of the new terms.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">8. Governing Law</h3>
            <p>These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.</p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}