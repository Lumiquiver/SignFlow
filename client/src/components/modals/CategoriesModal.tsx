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
import { LucideAlertCircle } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("alphabet");

  // Reset to default tab when reopening
  useEffect(() => {
    if (isOpen) {
      setActiveTab("alphabet");
    }
  }, [isOpen]);

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

  // Group words by category
  const wordCategories = wordGestures 
    ? Object.entries(
        wordGestures.reduce((acc, gesture) => {
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
        phraseGestures.reduce((acc, gesture) => {
          const category = gesture.category || "General";
          if (!acc[category]) acc[category] = [];
          acc[category].push(gesture);
          return acc;
        }, {} as Record<string, Gesture[]>)
      )
    : [];

  const handleGestureClick = (gesture: Gesture) => {
    if (onSelectGesture) {
      onSelectGesture(gesture);
      onClose();
    }
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
        <div>
          <p className="font-medium text-foreground">{gesture.name}</p>
          {gesture.description && (
            <p className="text-xs text-muted-foreground">{gesture.description}</p>
          )}
        </div>
        {gesture.complexity !== undefined && (
          <Badge variant={gesture.complexity < 3 ? "outline" : (gesture.complexity < 7 ? "secondary" : "destructive")}>
            {gesture.complexity < 3 ? 'Easy' : (gesture.complexity < 7 ? 'Medium' : 'Hard')}
          </Badge>
        )}
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
          <p>No categories found</p>
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Sign Language Categories</DialogTitle>
          <DialogDescription>
            Browse and learn different sign language gestures by category
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="alphabet">Alphabet</TabsTrigger>
            <TabsTrigger value="words">Words</TabsTrigger>
            <TabsTrigger value="phrases">Phrases</TabsTrigger>
          </TabsList>
          
          <TabsContent value="alphabet" className="mt-4">
            <ScrollArea className="h-[50vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {renderGestureList(alphabetGestures, loadingAlphabet)}
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
      </DialogContent>
    </Dialog>
  );
}