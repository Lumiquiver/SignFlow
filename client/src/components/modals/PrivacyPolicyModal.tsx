import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Privacy Policy</DialogTitle>
          <DialogDescription>
            Last updated: March 29, 2025
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <section>
            <h3 className="text-lg font-semibold">1. Data Collection</h3>
            <p>We collect minimal data to provide our sign language translation services. The data we collect includes:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Camera data during live sessions (not stored)</li>
              <li>Optional user preference settings</li>
              <li>Performance and error logs</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold">2. Camera Data Usage</h3>
            <p>Our sign language translator uses your device's camera to detect hand gestures in real-time. This video data is:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Processed locally on your device</li>
              <li>Never recorded or transmitted to our servers</li>
              <li>Not stored or persisted in any way</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold">3. Data Sharing</h3>
            <p>We do not share your personal information with third parties. Anonymous usage statistics may be shared for service improvement purposes.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">4. User Rights</h3>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Access personal information we have about you</li>
              <li>Request deletion of your data</li>
              <li>Opt out of certain data collection</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold">5. Children's Privacy</h3>
            <p>This service is not directed to children under 13. We do not knowingly collect personal information from children under 13.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">6. Changes to This Policy</h3>
            <p>We may update our Privacy Policy from time to time. Any changes will be posted on this page.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">7. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact us at privacy@signlanguagetranslator.com</p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}