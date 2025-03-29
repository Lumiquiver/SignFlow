import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PermissionDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PermissionDeniedModal({ isOpen, onClose }: PermissionDeniedModalProps) {
  const handleTryAgain = () => {
    window.location.reload();
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center text-[#EA4335]">
            <span className="material-icons mr-2">error_outline</span>
            Camera Access Denied
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[#202124]">
            To use sign language translation, please allow camera access in your browser settings.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="px-4 py-2 border border-[#DADCE0] rounded-md font-['Google_Sans'] text-sm bg-white">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            className="bg-primary text-white px-4 py-2 rounded-md font-['Google_Sans'] text-sm"
            onClick={handleTryAgain}
          >
            Try Again
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
