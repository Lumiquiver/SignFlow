import gestureData from '../data/gestures.json';
import type { Gesture } from '../types';

// This service mimics the backend API but uses static data instead
export const staticApiService = {
  // Get all gestures
  async getAllGestures(): Promise<Gesture[]> {
    return gestureData as Gesture[];
  },
  
  // Get gestures by type (alphabet, phrase, word)
  async getGesturesByType(type: string): Promise<Gesture[]> {
    return (gestureData as Gesture[]).filter(g => g.type === type);
  },
  
  // Get gestures by category
  async getGesturesByCategory(category: string): Promise<Gesture[]> {
    return (gestureData as Gesture[]).filter(g => g.category === category);
  },
  
  // Get a specific gesture by ID
  async getGesture(id: number): Promise<Gesture | undefined> {
    return (gestureData as Gesture[]).find(g => g.id === id);
  },
  
  // Get a specific gesture by name
  async getGestureByName(name: string): Promise<Gesture | undefined> {
    return (gestureData as Gesture[]).find(g => g.name.toLowerCase() === name.toLowerCase());
  },
  
  // Get gestures by complexity range
  async getGesturesByComplexity(min: number, max: number): Promise<Gesture[]> {
    return (gestureData as Gesture[]).filter(g => {
      // Only include gestures with complexity in the specified range
      return typeof g.complexity === 'number' && g.complexity >= min && g.complexity <= max;
    });
  },
  
  // Search gestures by name or description
  async searchGestures(query: string): Promise<Gesture[]> {
    const lowerQuery = query.toLowerCase();
    return (gestureData as Gesture[]).filter(
      g => g.name.toLowerCase().includes(lowerQuery) || 
           g.description.toLowerCase().includes(lowerQuery) ||
           (g.category && g.category.toLowerCase().includes(lowerQuery))
    );
  },
  
  // Get gestures by hand shape
  async getGesturesByHandShape(handShape: string): Promise<Gesture[]> {
    return (gestureData as Gesture[]).filter(g => g.handShape === handShape);
  },
  
  // Get gestures with motion
  async getMotionBasedGestures(): Promise<Gesture[]> {
    return (gestureData as Gesture[]).filter(g => g.hasMotion === true);
  },
  
  // Get two-handed gestures
  async getTwoHandedGestures(): Promise<Gesture[]> {
    return (gestureData as Gesture[]).filter(g => g.isTwoHanded === true);
  }
};