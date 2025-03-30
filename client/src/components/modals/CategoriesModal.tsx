import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Gesture } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  LucideAlertCircle, 
  LucideBookOpen, 
  LucideStar, 
  LucideFilter, 
  LucideSearch,
  LucideCheck,
  LucideArrowLeft,
  LucidePlay,
  LucideInfo,
  LucideRefreshCw,
  LucideBookmark,
  LucideBookmarkPlus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGesture?: (gesture: Gesture) => void;
}

export default function CategoriesModal({ 
  isOpen, 
  onClose,
  onSelectGesture
}: CategoriesModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("alphabet");
  const [viewMode, setViewMode] = useState<"browse" | "learn" | "detail">("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGesture, setSelectedGesture] = useState<Gesture | null>(null);
  const [learningProgress, setLearningProgress] = useState<Record<number, number>>({});
  const [bookmarkedGestures, setBookmarkedGestures] = useState<number[]>([]);
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false);

  // Reset to default tab when reopening
  useEffect(() => {
    if (isOpen) {
      setActiveTab("alphabet");
      setViewMode("browse");
      setSearchQuery("");
      setSelectedGesture(null);
    }
  }, [isOpen]);

  // Load bookmarked gestures from localStorage
  useEffect(() => {
    if (isOpen) {
      try {
        const bookmarkedString = localStorage.getItem('bookmarkedGestures');
        if (bookmarkedString) {
          setBookmarkedGestures(JSON.parse(bookmarkedString));
        }
        
        const progressString = localStorage.getItem('learningProgress');
        if (progressString) {
          setLearningProgress(JSON.parse(progressString));
        }
      } catch (error) {
        console.error("Failed to load bookmarks from localStorage:", error);
      }
    }
  }, [isOpen]);

  const saveBookmarks = (bookmarks: number[]) => {
    try {
      localStorage.setItem('bookmarkedGestures', JSON.stringify(bookmarks));
    } catch (error) {
      console.error("Failed to save bookmarks to localStorage:", error);
    }
  };

  const saveLearningProgress = (progress: Record<number, number>) => {
    try {
      localStorage.setItem('learningProgress', JSON.stringify(progress));
    } catch (error) {
      console.error("Failed to save learning progress to localStorage:", error);
    }
  };

  const { data: alphabetGestures, isLoading: loadingAlphabet } = useQuery<Gesture[]>({
    queryKey: ["/api/gestures/type/alphabet"],
    enabled: isOpen
  });

  const { data: wordGestures, isLoading: loadingWords } = useQuery<Gesture[]>({
    queryKey: ["/api/gestures/type/word"],
    enabled: isOpen
  });

  const { data: phraseGestures, isLoading: loadingPhrases } = useQuery<Gesture[]>({
    queryKey: ["/api/gestures/type/phrase"],
    enabled: isOpen
  });

  // Filter and group gestures
  const filterGestures = (gestures: Gesture[] | undefined) => {
    if (!gestures) return [];
    
    return gestures.filter(gesture => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        gesture.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (gesture.description && gesture.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Difficulty filter
      const matchesDifficulty = filterDifficulty === "all" ||
        (filterDifficulty === "easy" && gesture.complexity !== undefined && gesture.complexity < 3) ||
        (filterDifficulty === "medium" && gesture.complexity !== undefined && gesture.complexity >= 3 && gesture.complexity < 7) ||
        (filterDifficulty === "hard" && gesture.complexity !== undefined && gesture.complexity >= 7);
      
      // Bookmarked filter
      const matchesBookmark = !showOnlyBookmarked || bookmarkedGestures.includes(gesture.id);
      
      return matchesSearch && matchesDifficulty && matchesBookmark;
    });
  };

  // Group words by category
  const wordCategories = wordGestures 
    ? Object.entries(
        filterGestures(wordGestures).reduce((acc, gesture) => {
          const category = gesture.category || "General";
          if (!acc[category]) acc[category] = [];
          acc[category].push(gesture);
          return acc;
        }, {} as Record<string, Gesture[]>)
      )
    : [];

  // Group phrases by category
  const phraseCategories = phraseGestures 
    ? Object.entries(
        filterGestures(phraseGestures).reduce((acc, gesture) => {
          const category = gesture.category || "General";
          if (!acc[category]) acc[category] = [];
          acc[category].push(gesture);
          return acc;
        }, {} as Record<string, Gesture[]>)
      )
    : [];

  const filteredAlphabetGestures = filterGestures(alphabetGestures);

  const handleGestureClick = (gesture: Gesture) => {
    if (viewMode === "browse") {
      if (onSelectGesture) {
        onSelectGesture(gesture);
        onClose();
      }
    } else if (viewMode === "learn") {
      setSelectedGesture(gesture);
      setViewMode("detail");
    }
  };

  const handleBookmarkToggle = (gestureId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const newBookmarked = bookmarkedGestures.includes(gestureId)
      ? bookmarkedGestures.filter(id => id !== gestureId)
      : [...bookmarkedGestures, gestureId];
    
    setBookmarkedGestures(newBookmarked);
    saveBookmarks(newBookmarked);
    
    toast({
      title: bookmarkedGestures.includes(gestureId) ? "Bookmark Removed" : "Gesture Bookmarked",
      description: bookmarkedGestures.includes(gestureId) 
        ? "This gesture has been removed from your bookmarks" 
        : "This gesture has been added to your bookmarks for easy access",
    });
  };

  const markAsLearned = (gestureId: number) => {
    const newProgress = { ...learningProgress, [gestureId]: 100 };
    setLearningProgress(newProgress);
    saveLearningProgress(newProgress);
    
    toast({
      title: "Progress Updated",
      description: "This gesture has been marked as learned",
    });
  };

  const updateLearningProgress = (gestureId: number, progressValue: number) => {
    const newProgress = { ...learningProgress, [gestureId]: progressValue };
    setLearningProgress(newProgress);
    saveLearningProgress(newProgress);
  };

  const resetProgress = (gestureId: number) => {
    const newProgress = { ...learningProgress };
    delete newProgress[gestureId];
    setLearningProgress(newProgress);
    saveLearningProgress(newProgress);
    
    toast({
      title: "Progress Reset",
      description: "Learning progress for this gesture has been reset",
    });
  };

  const renderGestureList = (gestures: Gesture[] | undefined, isLoading: boolean) => {
    if (isLoading) {
      return Array(8).fill(0).map((_, i) => (
        <div key={i} className="mb-3">
          <Skeleton className="h-8 w-full" />
        </div>
      ));
    }

    if (!gestures || gestures.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
          <LucideAlertCircle className="h-10 w-10 mb-2" />
          <p>No gestures found in this category</p>
        </div>
      );
    }

    return gestures.map(gesture => (
      <div 
        key={gesture.id}
        className="flex items-center justify-between p-2.5 rounded-md hover:bg-primary/5 cursor-pointer"
        onClick={() => handleGestureClick(gesture)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground">{gesture.name}</p>
            {viewMode === "learn" && learningProgress[gesture.id] === 100 && (
              <LucideCheck className="h-4 w-4 text-green-500" />
            )}
          </div>
          {gesture.description && (
            <p className="text-xs text-muted-foreground">{gesture.description}</p>
          )}
          {viewMode === "learn" && (
            <Progress 
              value={learningProgress[gesture.id] || 0} 
              className="h-1 mt-1"
            />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {gesture.complexity !== undefined && (
            <Badge variant={gesture.complexity < 3 ? "outline" : (gesture.complexity < 7 ? "secondary" : "destructive")}>
              {gesture.complexity < 3 ? 'Easy' : (gesture.complexity < 7 ? 'Medium' : 'Hard')}
            </Badge>
          )}
          
          {viewMode === "learn" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => handleBookmarkToggle(gesture.id, e)}
            >
              {bookmarkedGestures.includes(gesture.id) ? (
                <LucideBookmark className="h-4 w-4 text-primary" />
              ) : (
                <LucideBookmarkPlus className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    ));
  };

  const renderCategoryGroups = (categories: [string, Gesture[]][], isLoading: boolean) => {
    if (isLoading) {
      return Array(3).fill(0).map((_, i) => (
        <div key={i} className="mb-4">
          <Skeleton className="h-6 w-40 mb-2" />
          {Array(3).fill(0).map((_, j) => (
            <Skeleton key={j} className="h-8 w-full mb-2" />
          ))}
        </div>
      ));
    }

    if (!categories || categories.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
          <LucideAlertCircle className="h-10 w-10 mb-2" />
          <p>No categories found matching your filters</p>
        </div>
      );
    }

    return categories.map(([category, gestures]) => (
      <div key={category} className="mb-6">
        <h3 className="font-semibold text-lg mb-2 text-primary">{category}</h3>
        <div className="space-y-1">
          {renderGestureList(gestures, false)}
        </div>
      </div>
    ));
  };

  const renderGestureDetail = () => {
    if (!selectedGesture) return null;
    
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="icon" onClick={() => setViewMode("learn")}>
            <LucideArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold text-primary">{selectedGesture.name}</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="aspect-video bg-primary/5 rounded-lg flex items-center justify-center relative overflow-hidden">
              {selectedGesture.imageUrl ? (
                <img 
                  src={selectedGesture.imageUrl} 
                  alt={selectedGesture.name} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <LucideInfo className="h-10 w-10 mx-auto mb-2" />
                  <p>No image available</p>
                </div>
              )}
            </div>
            
            {selectedGesture.videoUrl && (
              <Button className="w-full gap-2">
                <LucidePlay className="h-4 w-4" />
                Play Tutorial Video
              </Button>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
              <p>{selectedGesture.description}</p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Details</h3>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <span className="text-xs text-muted-foreground">Type:</span>
                  <p className="font-medium">{selectedGesture.type}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Category:</span>
                  <p className="font-medium">{selectedGesture.category || "General"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Complexity:</span>
                  <p className="font-medium">
                    {selectedGesture.complexity !== undefined ? (
                      selectedGesture.complexity < 3 ? 'Easy' : 
                      (selectedGesture.complexity < 7 ? 'Medium' : 'Hard')
                    ) : 'Unknown'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Hand shape:</span>
                  <p className="font-medium">{selectedGesture.handShape || "Not specified"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Has motion:</span>
                  <p className="font-medium">{selectedGesture.hasMotion ? "Yes" : "No"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Two-handed:</span>
                  <p className="font-medium">{selectedGesture.isTwoHanded ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Learning Progress</h3>
              <Progress 
                value={learningProgress[selectedGesture.id] || 0} 
                className="h-2 mt-2"
              />
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => resetProgress(selectedGesture.id)}
                >
                  <LucideRefreshCw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => markAsLearned(selectedGesture.id)}
                  className="ml-auto"
                >
                  <LucideCheck className="h-4 w-4 mr-1" />
                  Mark as Learned
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <Button
              variant={bookmarkedGestures.includes(selectedGesture.id) ? "secondary" : "outline"}
              className="w-full"
              onClick={(e) => handleBookmarkToggle(selectedGesture.id, e)}
            >
              {bookmarkedGestures.includes(selectedGesture.id) ? (
                <>
                  <LucideBookmark className="h-4 w-4 mr-2" />
                  Remove Bookmark
                </>
              ) : (
                <>
                  <LucideBookmarkPlus className="h-4 w-4 mr-2" />
                  Add to Bookmarks
                </>
              )}
            </Button>
            
            <Button
              variant="default"
              className="w-full"
              onClick={() => {
                if (onSelectGesture) {
                  onSelectGesture(selectedGesture);
                  onClose();
                }
              }}
            >
              Practice This Gesture
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
            {viewMode === "browse" ? "Sign Language Categories" : "Learn Sign Language"}
          </DialogTitle>
          <DialogDescription>
            {viewMode === "browse" 
              ? "Browse and learn different sign language gestures by category" 
              : "Track your progress as you learn different signs and gestures"
            }
          </DialogDescription>
        </DialogHeader>
        
        {viewMode === "detail" ? (
          renderGestureDetail()
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Button
                variant={viewMode === "browse" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("browse")}
                className="flex items-center gap-1"
              >
                <LucideBookOpen className="h-4 w-4" />
                Browse
              </Button>
              <Button
                variant={viewMode === "learn" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("learn")}
                className="flex items-center gap-1"
              >
                <LucideStar className="h-4 w-4" />
                Learning Mode
              </Button>
              
              <div className="ml-auto flex items-center gap-2">
                <div className="relative">
                  <LucideSearch className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <Input
                    placeholder="Search gestures..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-[200px]"
                  />
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const menu = document.getElementById('filterMenu');
                    if (menu) {
                      menu.classList.toggle('hidden');
                    }
                  }}
                >
                  <LucideFilter className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div id="filterMenu" className="hidden mb-4 p-3 bg-muted/50 rounded-md">
              <h3 className="font-medium mb-2">Filters</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <h4 className="text-sm font-medium mb-1.5">Difficulty</h4>
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      variant={filterDifficulty === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterDifficulty("all")}
                      className="h-7 text-xs"
                    >
                      All
                    </Button>
                    <Button
                      variant={filterDifficulty === "easy" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterDifficulty("easy")}
                      className="h-7 text-xs"
                    >
                      Easy
                    </Button>
                    <Button
                      variant={filterDifficulty === "medium" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterDifficulty("medium")}
                      className="h-7 text-xs"
                    >
                      Medium
                    </Button>
                    <Button
                      variant={filterDifficulty === "hard" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterDifficulty("hard")}
                      className="h-7 text-xs"
                    >
                      Hard
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1.5">Other</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={showOnlyBookmarked ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowOnlyBookmarked(!showOnlyBookmarked)}
                      className="h-7 text-xs flex items-center gap-1"
                    >
                      <LucideBookmark className="h-3 w-3" />
                      {showOnlyBookmarked ? "All Gestures" : "Bookmarked Only"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="alphabet">Alphabet</TabsTrigger>
                <TabsTrigger value="words">Words</TabsTrigger>
                <TabsTrigger value="phrases">Phrases</TabsTrigger>
              </TabsList>
              
              <TabsContent value="alphabet" className="mt-4">
                <ScrollArea className="h-[50vh]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {renderGestureList(filteredAlphabetGestures, loadingAlphabet)}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="words" className="mt-4">
                <ScrollArea className="h-[50vh]">
                  {renderCategoryGroups(wordCategories, loadingWords)}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="phrases" className="mt-4">
                <ScrollArea className="h-[50vh]">
                  {renderCategoryGroups(phraseCategories, loadingPhrases)}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}