import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PrivacyPolicyModal from '@/components/modals/PrivacyPolicyModal';
import TermsOfServiceModal from '@/components/modals/TermsOfServiceModal';
import AboutModal from '@/components/modals/AboutModal';
import ContactModal from '@/components/modals/ContactModal';
import CategoriesModal from '@/components/modals/CategoriesModal';
import HelpModal from '@/components/modals/HelpModal';
import SettingsModal from '@/components/modals/SettingsModal';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Modal visibility states
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  return (
    <>
      <header className="bg-white shadow-sm border-b border-[#DADCE0]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="material-icons text-primary mr-3">sign_language</span>
            <h1 className="font-['Google_Sans'] text-xl font-medium text-[#202124]">MS-ASL Translator</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="bg-[#F1F3F4] hover:bg-[#DADCE0] text-[#202124] border-none"
              onClick={() => setIsCategoriesModalOpen(true)}
            >
              <span className="material-icons text-sm mr-1">category</span>
              <span className="font-['Google_Sans'] text-sm">Categories</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-[#F1F3F4] hover:bg-[#DADCE0] text-[#202124] border-none"
              onClick={() => setIsHelpModalOpen(true)}
            >
              <span className="material-icons text-sm mr-1">help_outline</span>
              <span className="font-['Google_Sans'] text-sm">Help</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-[#F1F3F4] hover:bg-[#DADCE0] text-[#202124] border-none"
              onClick={() => setIsSettingsModalOpen(true)}
            >
              <span className="material-icons text-sm mr-1">settings</span>
              <span className="font-['Google_Sans'] text-sm">Settings</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <span className="material-icons">more_vert</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsAboutModalOpen(true)}>
                  <span className="material-icons text-sm mr-2">info</span>
                  About
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsContactModalOpen(true)}>
                  <span className="material-icons text-sm mr-2">mail</span>
                  Contact
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsPrivacyModalOpen(true)}>
                  <span className="material-icons text-sm mr-2">privacy_tip</span>
                  Privacy Policy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsTermsModalOpen(true)}>
                  <span className="material-icons text-sm mr-2">gavel</span>
                  Terms of Service
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                onClick={() => {
                  setIsCategoriesModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="material-icons text-sm mr-2">category</span>
                <span className="font-['Google_Sans']">Categories</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="justify-start"
                onClick={() => {
                  setIsHelpModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="material-icons text-sm mr-2">help_outline</span>
                <span className="font-['Google_Sans']">Help</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="justify-start"
                onClick={() => {
                  setIsSettingsModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="material-icons text-sm mr-2">settings</span>
                <span className="font-['Google_Sans']">Settings</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="justify-start"
                onClick={() => {
                  setIsAboutModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="material-icons text-sm mr-2">info</span>
                <span className="font-['Google_Sans']">About</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="justify-start"
                onClick={() => {
                  setIsContactModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="material-icons text-sm mr-2">mail</span>
                <span className="font-['Google_Sans']">Contact</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="justify-start"
                onClick={() => {
                  setIsPrivacyModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="material-icons text-sm mr-2">privacy_tip</span>
                <span className="font-['Google_Sans']">Privacy Policy</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="justify-start"
                onClick={() => {
                  setIsTermsModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="material-icons text-sm mr-2">gavel</span>
                <span className="font-['Google_Sans']">Terms of Service</span>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <PrivacyPolicyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
      />
      
      <TermsOfServiceModal 
        isOpen={isTermsModalOpen} 
        onClose={() => setIsTermsModalOpen(false)} 
      />
      
      <AboutModal 
        isOpen={isAboutModalOpen} 
        onClose={() => setIsAboutModalOpen(false)} 
      />
      
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
      
      <CategoriesModal 
        isOpen={isCategoriesModalOpen} 
        onClose={() => setIsCategoriesModalOpen(false)} 
      />
      
      <HelpModal 
        isOpen={isHelpModalOpen} 
        onClose={() => setIsHelpModalOpen(false)} 
      />
      
      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
      />
    </>
  );
}
