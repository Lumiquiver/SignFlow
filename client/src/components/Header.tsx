import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <header className="bg-white shadow-sm border-b border-[#DADCE0]">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="material-icons text-primary mr-3">sign_language</span>
          <h1 className="font-['Google_Sans'] text-xl font-medium text-[#202124]">Sign Language Translator</h1>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <Button 
            variant="outline" 
            className="bg-[#F1F3F4] hover:bg-[#DADCE0] text-[#202124] border-none"
          >
            <span className="material-icons text-sm mr-1">help_outline</span>
            <span className="font-['Google_Sans'] text-sm">Help</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-[#F1F3F4] hover:bg-[#DADCE0] text-[#202124] border-none"
          >
            <span className="material-icons text-sm mr-1">settings</span>
            <span className="font-['Google_Sans'] text-sm">Settings</span>
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="material-icons">menu</span>
        </Button>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 py-2 border-t border-[#DADCE0] bg-white">
          <div className="flex flex-col space-y-2">
            <Button 
              variant="ghost" 
              className="justify-start"
            >
              <span className="material-icons text-sm mr-2">help_outline</span>
              <span className="font-['Google_Sans']">Help</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="justify-start"
            >
              <span className="material-icons text-sm mr-2">settings</span>
              <span className="font-['Google_Sans']">Settings</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
