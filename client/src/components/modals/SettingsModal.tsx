import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { LucideSettings, LucideCamera, LucideMonitor, LucideSparkles, LucideShield, LucideTrash2, LucideSave } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("camera");
  
  // Camera settings
  const [cameraSettings, setCameraSettings] = useState({
    resolution: "720p",
    frameRate: 30,
    showBoundingBox: true,
    showLandmarks: false,
    flipCamera: true
  });
  
  // Recognition settings
  const [recognitionSettings, setRecognitionSettings] = useState({
    confidenceThreshold: 65,
    requiredMatches: 2,
    showConfidenceScore: true,
    adaptiveThreshold: true,
    ignoreBriefDetections: true
  });
  
  // Display settings
  const [displaySettings, setDisplaySettings] = useState({
    theme: "system",
    fontSize: 16,
    highContrast: false,
    animateTransitions: true,
    showDebugInfo: false
  });
  
  // Advanced settings
  const [advancedSettings, setAdvancedSettings] = useState({
    useExperimentalFeatures: false,
    powerSaveMode: false,
    offlineMode: false,
    analyticsEnabled: true
  });
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    saveSessions: false,
    shareImprovementData: false,
    rememberSettings: true,
    useLocalProcessing: true
  });

  const handleSaveSettings = () => {
    // Here we would normally save settings to user preferences
    // For demo, we'll just show a toast
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated",
    });
    onClose();
  };

  const handleResetSettings = () => {
    // Reset settings to defaults
    setCameraSettings({
      resolution: "720p",
      frameRate: 30,
      showBoundingBox: true,
      showLandmarks: false,
      flipCamera: true
    });
    
    setRecognitionSettings({
      confidenceThreshold: 65,
      requiredMatches: 2,
      showConfidenceScore: true,
      adaptiveThreshold: true,
      ignoreBriefDetections: true
    });
    
    setDisplaySettings({
      theme: "system",
      fontSize: 16,
      highContrast: false,
      animateTransitions: true,
      showDebugInfo: false
    });
    
    setAdvancedSettings({
      useExperimentalFeatures: false,
      powerSaveMode: false,
      offlineMode: false,
      analyticsEnabled: true
    });
    
    setPrivacySettings({
      saveSessions: false,
      shareImprovementData: false,
      rememberSettings: true,
      useLocalProcessing: true
    });
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults",
    });
  };

  return (
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
  );
}