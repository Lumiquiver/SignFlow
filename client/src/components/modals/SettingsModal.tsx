import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LucideSettings, 
  LucideCamera, 
  LucideMonitor, 
  LucideSparkles, 
  LucideShield, 
  LucideTrash2, 
  LucideSave, 
  LucideRotateCw,
  LucideAlertCircle,
  LucideCheck,
  LucideX
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
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

// Define types for our settings
interface CameraSettings {
  resolution: string;
  frameRate: number;
  showBoundingBox: boolean;
  showLandmarks: boolean;
  flipCamera: boolean;
}

interface RecognitionSettings {
  confidenceThreshold: number;
  requiredMatches: number;
  showConfidenceScore: boolean;
  adaptiveThreshold: boolean;
  ignoreBriefDetections: boolean;
}

interface DisplaySettings {
  theme: string;
  fontSize: number;
  highContrast: boolean;
  animateTransitions: boolean;
  showDebugInfo: boolean;
}

interface AdvancedSettings {
  useExperimentalFeatures: boolean;
  powerSaveMode: boolean;
  offlineMode: boolean;
  analyticsEnabled: boolean;
}

interface PrivacySettings {
  saveSessions: boolean;
  shareImprovementData: boolean;
  rememberSettings: boolean;
  useLocalProcessing: boolean;
}

// Define the props for the SettingsModal component
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: {
    camera: CameraSettings;
    recognition: RecognitionSettings;
    display: DisplaySettings;
    advanced: AdvancedSettings;
    privacy: PrivacySettings;
  }) => void;
}

// Define default settings for initial state and resets
const defaultCameraSettings: CameraSettings = {
  resolution: "720p",
  frameRate: 30,
  showBoundingBox: true,
  showLandmarks: false,
  flipCamera: true
};

const defaultRecognitionSettings: RecognitionSettings = {
  confidenceThreshold: 65,
  requiredMatches: 2,
  showConfidenceScore: true,
  adaptiveThreshold: true,
  ignoreBriefDetections: true
};

const defaultDisplaySettings: DisplaySettings = {
  theme: "system",
  fontSize: 16,
  highContrast: false,
  animateTransitions: true,
  showDebugInfo: false
};

const defaultAdvancedSettings: AdvancedSettings = {
  useExperimentalFeatures: false,
  powerSaveMode: false,
  offlineMode: false,
  analyticsEnabled: true
};

const defaultPrivacySettings: PrivacySettings = {
  saveSessions: false,
  shareImprovementData: false,
  rememberSettings: true,
  useLocalProcessing: true
};

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  onSettingsChange 
}: SettingsModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("camera");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [settingsApplied, setSettingsApplied] = useState(false);
  
  // Camera settings
  const [cameraSettings, setCameraSettings] = useState<CameraSettings>(defaultCameraSettings);
  
  // Recognition settings
  const [recognitionSettings, setRecognitionSettings] = useState<RecognitionSettings>(defaultRecognitionSettings);
  
  // Display settings
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(defaultDisplaySettings);
  
  // Advanced settings
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>(defaultAdvancedSettings);
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(defaultPrivacySettings);

  // Original settings to compare for unsaved changes
  const [originalSettings, setOriginalSettings] = useState({
    camera: { ...defaultCameraSettings },
    recognition: { ...defaultRecognitionSettings },
    display: { ...defaultDisplaySettings },
    advanced: { ...defaultAdvancedSettings },
    privacy: { ...defaultPrivacySettings }
  });

  // Load settings from localStorage if enabled
  useEffect(() => {
    if (isOpen) {
      loadSettings();
      setHasUnsavedChanges(false);
      setSettingsApplied(false);
    }
  }, [isOpen]);

  // Track unsaved changes
  useEffect(() => {
    if (isOpen && !settingsApplied) {
      const hasChanges = 
        JSON.stringify(cameraSettings) !== JSON.stringify(originalSettings.camera) ||
        JSON.stringify(recognitionSettings) !== JSON.stringify(originalSettings.recognition) ||
        JSON.stringify(displaySettings) !== JSON.stringify(originalSettings.display) ||
        JSON.stringify(advancedSettings) !== JSON.stringify(originalSettings.advanced) ||
        JSON.stringify(privacySettings) !== JSON.stringify(originalSettings.privacy);
      
      setHasUnsavedChanges(hasChanges);
    }
  }, [
    cameraSettings, 
    recognitionSettings, 
    displaySettings, 
    advancedSettings, 
    privacySettings, 
    originalSettings,
    settingsApplied,
    isOpen
  ]);

  const loadSettings = () => {
    try {
      // Check if we should load saved settings
      const savedPreference = localStorage.getItem('rememberSettings');
      const shouldRememberSettings = savedPreference ? JSON.parse(savedPreference) : true;
      
      if (shouldRememberSettings) {
        // Camera settings
        const savedCamera = localStorage.getItem('cameraSettings');
        const cameraSetting = savedCamera ? JSON.parse(savedCamera) : defaultCameraSettings;
        setCameraSettings(cameraSetting);
        
        // Recognition settings
        const savedRecognition = localStorage.getItem('recognitionSettings');
        const recognitionSetting = savedRecognition ? JSON.parse(savedRecognition) : defaultRecognitionSettings;
        setRecognitionSettings(recognitionSetting);
        
        // Display settings
        const savedDisplay = localStorage.getItem('displaySettings');
        const displaySetting = savedDisplay ? JSON.parse(savedDisplay) : defaultDisplaySettings;
        setDisplaySettings(displaySetting);
        
        // Advanced settings
        const savedAdvanced = localStorage.getItem('advancedSettings');
        const advancedSetting = savedAdvanced ? JSON.parse(savedAdvanced) : defaultAdvancedSettings;
        setAdvancedSettings(advancedSetting);
        
        // Privacy settings
        const savedPrivacy = localStorage.getItem('privacySettings');
        const privacySetting = savedPrivacy ? JSON.parse(savedPrivacy) : defaultPrivacySettings;
        setPrivacySettings(privacySetting);
        
        // Set original settings for change detection
        setOriginalSettings({
          camera: { ...cameraSetting },
          recognition: { ...recognitionSetting },
          display: { ...displaySetting },
          advanced: { ...advancedSetting },
          privacy: { ...privacySetting }
        });
      } else {
        // Use defaults if not remembering settings
        resetToDefaults(false);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      // Fallback to defaults if there's an error
      resetToDefaults(false);
    }
  };

  const saveSettings = () => {
    try {
      // Store the settings if remember settings is enabled
      if (privacySettings.rememberSettings) {
        localStorage.setItem('cameraSettings', JSON.stringify(cameraSettings));
        localStorage.setItem('recognitionSettings', JSON.stringify(recognitionSettings));
        localStorage.setItem('displaySettings', JSON.stringify(displaySettings));
        localStorage.setItem('advancedSettings', JSON.stringify(advancedSettings));
        localStorage.setItem('privacySettings', JSON.stringify(privacySettings));
        localStorage.setItem('rememberSettings', JSON.stringify(privacySettings.rememberSettings));
      }
      
      // Apply theme changes
      if (displaySettings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (displaySettings.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      
      // Apply font size
      document.documentElement.style.fontSize = `${displaySettings.fontSize}px`;
      
      // Apply high contrast if enabled
      if (displaySettings.highContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
      
      // Call the onSettingsChange callback if provided
      if (onSettingsChange) {
        onSettingsChange({
          camera: cameraSettings,
          recognition: recognitionSettings,
          display: displaySettings,
          advanced: advancedSettings,
          privacy: privacySettings
        });
      }
      
      // Update original settings to reflect the saved values
      setOriginalSettings({
        camera: { ...cameraSettings },
        recognition: { ...recognitionSettings },
        display: { ...displaySettings },
        advanced: { ...advancedSettings },
        privacy: { ...privacySettings }
      });
      
      setHasUnsavedChanges(false);
      setSettingsApplied(true);
      
      // Show success toast
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error Saving Settings",
        description: "There was a problem saving your preferences",
        variant: "destructive"
      });
    }
  };

  const handleSaveSettings = () => {
    saveSettings();
    setHasUnsavedChanges(false);
    setSettingsApplied(false);
    toast({
      title: "Settings saved",
      description: "Your preferences have been saved.",
      variant: "default",
    });
    onClose();
  };

  const handleApplyChanges = () => {
    saveSettings();
    setSettingsApplied(true);
    toast({
      title: "Settings applied",
      description: "Changes have been applied. Save to keep them permanently.",
      variant: "default",
    });
  };


  const resetToDefaults = (showToast = true) => {
    // Reset settings to defaults
    setCameraSettings({ ...defaultCameraSettings });
    setRecognitionSettings({ ...defaultRecognitionSettings });
    setDisplaySettings({ ...defaultDisplaySettings });
    setAdvancedSettings({ ...defaultAdvancedSettings });
    setPrivacySettings({ ...defaultPrivacySettings });
    
    // Update original settings 
    setOriginalSettings({
      camera: { ...defaultCameraSettings },
      recognition: { ...defaultRecognitionSettings },
      display: { ...defaultDisplaySettings },
      advanced: { ...defaultAdvancedSettings },
      privacy: { ...defaultPrivacySettings }
    });
    
    if (showToast) {
      toast({
        title: "Settings Reset",
        description: "All settings have been reset to defaults",
      });
    }
  };

  const handleResetSettings = () => {
    resetToDefaults();
  };
  
  const handleDeleteAllData = () => {
    try {
      // Clear all saved settings and data from localStorage
      localStorage.clear();
      
      // Reset to defaults
      resetToDefaults(false);
      
      toast({
        title: "Data Deleted",
        description: "All saved data has been removed from this device",
        variant: "default"
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting data:", error);
      toast({
        title: "Error Deleting Data",
        description: "There was a problem removing saved data",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
              <LucideSettings className="h-6 w-6" /> Settings
            </DialogTitle>
            <DialogDescription>
              Customize your Sign Language Translator experience
            </DialogDescription>
          </DialogHeader>
          
          {hasUnsavedChanges && !settingsApplied && (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 p-3 rounded-md flex items-center gap-3 mb-4">
              <LucideAlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div className="flex-1 text-sm text-yellow-800 dark:text-yellow-200">
                You have unsaved changes. Apply changes to see their effect or save to keep them.
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-shrink-0 bg-white dark:bg-transparent"
                onClick={handleApplyChanges}
              >
                Apply
              </Button>
            </div>
          )}
          
          {settingsApplied && (
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 p-3 rounded-md flex items-center gap-3 mb-4">
              <LucideCheck className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div className="flex-1 text-sm text-green-800 dark:text-green-200">
                Settings applied successfully. Click Save to keep these changes.
              </div>
            </div>
          )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="camera" className="flex items-center gap-1">
              <LucideCamera className="h-4 w-4" />
              <span className="hidden sm:inline">Camera</span>
            </TabsTrigger>
            <TabsTrigger value="recognition" className="flex items-center gap-1">
              <LucideSparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Recognition</span>
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center gap-1">
              <LucideMonitor className="h-4 w-4" />
              <span className="hidden sm:inline">Display</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-1">
              <LucideSettings className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-1">
              <LucideShield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Camera Settings */}
          <TabsContent value="camera" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label>Camera Resolution</Label>
                <Select 
                  value={cameraSettings.resolution} 
                  onValueChange={(value) => setCameraSettings({...cameraSettings, resolution: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select resolution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="480p">480p (SD)</SelectItem>
                    <SelectItem value="720p">720p (HD)</SelectItem>
                    <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Frame Rate</Label>
                  <span className="text-sm">{cameraSettings.frameRate} fps</span>
                </div>
                <Slider 
                  value={[cameraSettings.frameRate]} 
                  min={15} 
                  max={60}
                  step={5}
                  onValueChange={(value) => setCameraSettings({...cameraSettings, frameRate: value[0]})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="showBoundingBox">Show Hand Bounding Box</Label>
                <Switch 
                  id="showBoundingBox" 
                  checked={cameraSettings.showBoundingBox}
                  onCheckedChange={(checked) => setCameraSettings({...cameraSettings, showBoundingBox: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="showLandmarks">Show Hand Landmarks</Label>
                <Switch 
                  id="showLandmarks" 
                  checked={cameraSettings.showLandmarks}
                  onCheckedChange={(checked) => setCameraSettings({...cameraSettings, showLandmarks: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="flipCamera">Flip Camera Horizontally</Label>
                <Switch 
                  id="flipCamera" 
                  checked={cameraSettings.flipCamera}
                  onCheckedChange={(checked) => setCameraSettings({...cameraSettings, flipCamera: checked})}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Recognition Settings */}
          <TabsContent value="recognition" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Confidence Threshold</Label>
                  <span className="text-sm">{recognitionSettings.confidenceThreshold}%</span>
                </div>
                <Slider 
                  value={[recognitionSettings.confidenceThreshold]} 
                  min={50} 
                  max={95}
                  step={5}
                  onValueChange={(value) => setRecognitionSettings({...recognitionSettings, confidenceThreshold: value[0]})}
                />
                <p className="text-xs text-muted-foreground">
                  Lower values will detect more gestures but may be less accurate.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Required Consecutive Matches</Label>
                  <span className="text-sm">{recognitionSettings.requiredMatches}</span>
                </div>
                <Slider 
                  value={[recognitionSettings.requiredMatches]} 
                  min={1} 
                  max={5}
                  step={1}
                  onValueChange={(value) => setRecognitionSettings({...recognitionSettings, requiredMatches: value[0]})}
                />
                <p className="text-xs text-muted-foreground">
                  How many times a gesture must be consecutively detected before recognition.
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="showConfidenceScore">Show Confidence Score</Label>
                <Switch 
                  id="showConfidenceScore" 
                  checked={recognitionSettings.showConfidenceScore}
                  onCheckedChange={(checked) => setRecognitionSettings({...recognitionSettings, showConfidenceScore: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="adaptiveThreshold">Use Adaptive Threshold</Label>
                <Switch 
                  id="adaptiveThreshold" 
                  checked={recognitionSettings.adaptiveThreshold}
                  onCheckedChange={(checked) => setRecognitionSettings({...recognitionSettings, adaptiveThreshold: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="ignoreBriefDetections">Ignore Brief Detections</Label>
                <Switch 
                  id="ignoreBriefDetections" 
                  checked={recognitionSettings.ignoreBriefDetections}
                  onCheckedChange={(checked) => setRecognitionSettings({...recognitionSettings, ignoreBriefDetections: checked})}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Display Settings */}
          <TabsContent value="display" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label>Theme</Label>
                <Select 
                  value={displaySettings.theme} 
                  onValueChange={(value) => setDisplaySettings({...displaySettings, theme: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Font Size</Label>
                  <span className="text-sm">{displaySettings.fontSize}px</span>
                </div>
                <Slider 
                  value={[displaySettings.fontSize]} 
                  min={12} 
                  max={24}
                  step={1}
                  onValueChange={(value) => setDisplaySettings({...displaySettings, fontSize: value[0]})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="highContrast">High Contrast Mode</Label>
                <Switch 
                  id="highContrast" 
                  checked={displaySettings.highContrast}
                  onCheckedChange={(checked) => setDisplaySettings({...displaySettings, highContrast: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="animateTransitions">Animate Transitions</Label>
                <Switch 
                  id="animateTransitions" 
                  checked={displaySettings.animateTransitions}
                  onCheckedChange={(checked) => setDisplaySettings({...displaySettings, animateTransitions: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="showDebugInfo">Show Debug Information</Label>
                <Switch 
                  id="showDebugInfo" 
                  checked={displaySettings.showDebugInfo}
                  onCheckedChange={(checked) => setDisplaySettings({...displaySettings, showDebugInfo: checked})}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="useExperimentalFeatures" className="block">Experimental Features</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable in-development recognition improvements
                  </p>
                </div>
                <Switch 
                  id="useExperimentalFeatures" 
                  checked={advancedSettings.useExperimentalFeatures}
                  onCheckedChange={(checked) => setAdvancedSettings({...advancedSettings, useExperimentalFeatures: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="powerSaveMode" className="block">Power Save Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Reduce processing for better battery life
                  </p>
                </div>
                <Switch 
                  id="powerSaveMode" 
                  checked={advancedSettings.powerSaveMode}
                  onCheckedChange={(checked) => setAdvancedSettings({...advancedSettings, powerSaveMode: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="offlineMode" className="block">Offline Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Save all resources locally for offline use
                  </p>
                </div>
                <Switch 
                  id="offlineMode" 
                  checked={advancedSettings.offlineMode}
                  onCheckedChange={(checked) => setAdvancedSettings({...advancedSettings, offlineMode: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="analyticsEnabled" className="block">Usage Analytics</Label>
                  <p className="text-xs text-muted-foreground">
                    Share anonymous usage data to improve the app
                  </p>
                </div>
                <Switch 
                  id="analyticsEnabled" 
                  checked={advancedSettings.analyticsEnabled}
                  onCheckedChange={(checked) => setAdvancedSettings({...advancedSettings, analyticsEnabled: checked})}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="saveSessions" className="block">Save Translation Sessions</Label>
                  <p className="text-xs text-muted-foreground">
                    Store your translation history locally
                  </p>
                </div>
                <Switch 
                  id="saveSessions" 
                  checked={privacySettings.saveSessions}
                  onCheckedChange={(checked) => setPrivacySettings({...privacySettings, saveSessions: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="shareImprovementData" className="block">Share Improvement Data</Label>
                  <p className="text-xs text-muted-foreground">
                    Help improve sign recognition (anonymous)
                  </p>
                </div>
                <Switch 
                  id="shareImprovementData" 
                  checked={privacySettings.shareImprovementData}
                  onCheckedChange={(checked) => setPrivacySettings({...privacySettings, shareImprovementData: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="rememberSettings" className="block">Remember Settings</Label>
                  <p className="text-xs text-muted-foreground">
                    Save preferences between sessions
                  </p>
                </div>
                <Switch 
                  id="rememberSettings" 
                  checked={privacySettings.rememberSettings}
                  onCheckedChange={(checked) => setPrivacySettings({...privacySettings, rememberSettings: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="useLocalProcessing" className="block">Process Locally Only</Label>
                  <p className="text-xs text-muted-foreground">
                    Never send camera data to external servers
                  </p>
                </div>
                <Switch 
                  id="useLocalProcessing" 
                  checked={privacySettings.useLocalProcessing}
                  onCheckedChange={(checked) => setPrivacySettings({...privacySettings, useLocalProcessing: checked})}
                />
              </div>
              
              <div className="pt-4 border-t">
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => {
                    toast({
                      title: "Data Cleared",
                      description: "All locally stored data has been cleared",
                    });
                  }}
                >
                  <LucideTrash2 className="h-4 w-4" />
                  Clear All Saved Data
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleResetSettings}
            className="flex items-center gap-1"
          >
            <LucideTrash2 className="h-4 w-4" />
            Reset to Defaults
          </Button>
          
          <Button 
            onClick={handleSaveSettings}
            className="flex items-center gap-1"
          >
            <LucideSave className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
      
      {/* Delete Data Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <LucideTrash2 className="h-5 w-5" />
              Delete All Saved Data
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove all your settings, learning progress, bookmarks, and any other saved data from this device. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="gap-2">
              <LucideX className="h-4 w-4" />
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAllData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              <LucideTrash2 className="h-4 w-4" />
              Delete All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}