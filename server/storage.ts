import { 
  users, type User, type InsertUser, 
  gestures, type Gesture, type InsertGesture,
  gestureVariations, type GestureVariation, type InsertGestureVariation,
  userProgress, type UserProgress, type InsertUserProgress,
  userTrainingSamples, type UserTrainingSample, type InsertUserTrainingSample,
  recognitionSessions, type RecognitionSession,
  recognitionAttempts, type RecognitionAttempt,
  modelMetrics, type ModelMetric,
  learningPaths, type LearningPath,
  learningPathGestures,
  gestureRelationships, type GestureRelationship
} from "@shared/schema";
import { eq, and, or, like, desc, sql, inArray } from 'drizzle-orm';
import { db } from './db';

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSkillLevel(id: number, skillLevel: string): Promise<User | undefined>;
  
  // Basic gesture methods
  getAllGestures(): Promise<Gesture[]>;
  getGesturesByType(type: string): Promise<Gesture[]>;
  getGesturesByCategory(category: string): Promise<Gesture[]>;
  getGesturesByComplexity(minComplexity: number, maxComplexity: number): Promise<Gesture[]>;
  searchGestures(query: string): Promise<Gesture[]>;
  getGesture(id: number): Promise<Gesture | undefined>;
  getGestureByName(name: string): Promise<Gesture | undefined>;
  createGesture(gesture: InsertGesture): Promise<Gesture>;
  updateGesture(id: number, gesture: Partial<InsertGesture>): Promise<Gesture | undefined>;
  
  // Advanced gesture methods for improved MS-ASL recognition
  getGestureVariations(gestureId: number): Promise<GestureVariation[]>;
  addGestureVariation(variation: InsertGestureVariation): Promise<GestureVariation>;
  updateGestureFingerPattern(id: number, fingerPattern: boolean[]): Promise<Gesture | undefined>;
  getSimilarGestures(gestureId: number): Promise<Gesture[]>;
  getGesturesByHandShape(handShape: string): Promise<Gesture[]>;
  getMotionBasedGestures(): Promise<Gesture[]>;
  getTwoHandedGestures(): Promise<Gesture[]>;
  
  // User training and personalization
  addUserTrainingSample(sample: InsertUserTrainingSample): Promise<UserTrainingSample>;
  getUserTrainingSamples(userId: number, gestureId?: number): Promise<UserTrainingSample[]>;
  
  // User progress tracking
  getUserProgress(userId: number): Promise<UserProgress[]>;
  updateUserProgress(userId: number, gestureId: number, data: Partial<InsertUserProgress>): Promise<UserProgress>;
  getRecommendedGestures(userId: number, count?: number): Promise<Gesture[]>;
  
  // Learning paths
  getAllLearningPaths(): Promise<LearningPath[]>;
  getLearningPathGestures(pathId: number): Promise<Gesture[]>;
  
  // Analytics and model performance
  recordRecognitionAttempt(sessionId: number, gestureId: number, successful: boolean, confidence: number, actualGestureId?: number): Promise<void>;
  getRecognitionStats(userId?: number, timeRange?: {start: Date, end: Date}): Promise<any>;
  updateModelMetrics(metrics: Partial<ModelMetric>): Promise<ModelMetric>;
  getLatestModelMetrics(): Promise<ModelMetric | undefined>;
  
  // Database setup
  setupDatabase(): Promise<void>;
}

// PostgreSQL implementation of storage
export class PostgresStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // Basic gesture methods
  async getAllGestures(): Promise<Gesture[]> {
    return await db.select().from(gestures);
  }
  
  async getGesturesByType(type: string): Promise<Gesture[]> {
    return await db.select().from(gestures).where(eq(gestures.type, type));
  }
  
  async getGesture(id: number): Promise<Gesture | undefined> {
    const result = await db.select().from(gestures).where(eq(gestures.id, id));
    return result[0];
  }
  
  async getGestureByName(name: string): Promise<Gesture | undefined> {
    const result = await db.select().from(gestures).where(eq(gestures.name, name));
    return result[0];
  }
  
  async createGesture(insertGesture: InsertGesture): Promise<Gesture> {
    const result = await db.insert(gestures).values(insertGesture).returning();
    return result[0];
  }
  
  async updateGesture(id: number, gestureData: Partial<InsertGesture>): Promise<Gesture | undefined> {
    try {
      const result = await db.update(gestures)
        .set(gestureData)
        .where(eq(gestures.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error updating gesture:", error);
      return undefined;
    }
  }
  
  // Advanced gesture methods
  async getGestureVariations(gestureId: number): Promise<GestureVariation[]> {
    return await db.select()
      .from(gestureVariations)
      .where(eq(gestureVariations.gestureId, gestureId));
  }
  
  async addGestureVariation(variation: InsertGestureVariation): Promise<GestureVariation> {
    const result = await db.insert(gestureVariations)
      .values(variation)
      .returning();
    return result[0];
  }
  
  async updateGestureFingerPattern(id: number, fingerPattern: boolean[]): Promise<Gesture | undefined> {
    try {
      const result = await db.update(gestures)
        .set({ fingerPattern: JSON.stringify(fingerPattern) })
        .where(eq(gestures.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error updating finger pattern:", error);
      return undefined;
    }
  }
  
  // Database setup and seeding
  async setupDatabase(): Promise<void> {
    try {
      // Check if we have any gestures already
      const existingGestures = await this.getAllGestures();
      
      if (existingGestures.length === 0) {
        console.log("Seeding database with initial MS-ASL gestures...");
        await this.seedGestures();
      } else {
        console.log(`Database already contains ${existingGestures.length} gestures`);
      }
    } catch (error) {
      console.error("Error setting up database:", error);
    }
  }
  
  // Seed database with MS-ASL gestures
  private async seedGestures() {
    // MS-ASL alphabet with accurate finger patterns
    const alphabetData: InsertGesture[] = [
      {
        name: 'A',
        type: 'alphabet',
        category: 'basic',
        description: 'Fist with thumb at side',
        fingerPattern: [true, false, false, false, false],
        handShape: 'fist',
        hasMotion: false,
        isTwoHanded: false,
        faceExpression: null,
        complexity: 1,
        msaslClass: 1,
        imageUrl: null,
        videoUrl: null
      },
      {
        name: 'B',
        type: 'alphabet',
        category: 'basic',
        description: 'Flat hand with fingers together, thumb tucked',
        fingerPattern: [false, true, true, true, true],
        handShape: 'flat',
        hasMotion: false,
        isTwoHanded: false,
        faceExpression: null,
        complexity: 1,
        msaslClass: 2,
        imageUrl: null,
        videoUrl: null
      },
      {
        name: 'C',
        type: 'alphabet',
        category: 'basic',
        description: 'Curved hand in C shape',
        fingerPattern: [false, false, false, false, false],
        handShape: 'curved',
        hasMotion: false,
        isTwoHanded: false,
        faceExpression: null,
        complexity: 2,
        msaslClass: 3,
        imageUrl: null,
        videoUrl: null
      },
      {
        name: 'D',
        type: 'alphabet',
        category: 'basic',
        description: 'Index finger pointing up, other fingers curled, thumb against fingers',
        fingerPattern: [true, true, false, false, false],
        handShape: 'pointing',
        hasMotion: false,
        isTwoHanded: false,
        faceExpression: null,
        complexity: 2,
        msaslClass: 4,
        imageUrl: null,
        videoUrl: null
      },
      {
        name: 'E',
        type: 'alphabet',
        category: 'basic',
        description: 'Fingers curled, thumb across palm',
        fingerPattern: [false, false, false, false, false],
        handShape: 'curled',
        hasMotion: false,
        isTwoHanded: false,
        faceExpression: null,
        complexity: 2,
        msaslClass: 5,
        imageUrl: null,
        videoUrl: null
      }
    ];
    
    // Add the rest of the alphabet
    for (const letter of "FGHIJKLMNOPQRSTUVWXYZ".split("")) {
      alphabetData.push({
        name: letter,
        type: 'alphabet',
        category: 'basic',
        description: `MS-ASL sign for letter ${letter}`,
        fingerPattern: null,
        handShape: 'unknown',
        hasMotion: false,
        isTwoHanded: false,
        faceExpression: null,
        complexity: 2,
        msaslClass: alphabetData.length + 1,
        imageUrl: null,
        videoUrl: null
      });
    }
    
    // MS-ASL common phrases
    const phraseData: InsertGesture[] = [
      {
        name: 'Hello',
        type: 'phrase',
        category: 'greeting',
        description: 'Wave hand near face, palm facing out',
        fingerPattern: [true, true, true, true, true],
        handShape: 'open',
        hasMotion: true,
        isTwoHanded: false,
        faceExpression: 'smile',
        complexity: 1,
        msaslClass: 100,
        imageUrl: null,
        videoUrl: null
      },
      {
        name: 'Thank You',
        type: 'phrase',
        category: 'courtesy',
        description: 'Flat hand touching chin then moving outward',
        fingerPattern: [true, false, false, false, false],
        handShape: 'flat',
        hasMotion: true,
        isTwoHanded: false,
        faceExpression: 'smile',
        complexity: 2,
        msaslClass: 101,
        imageUrl: null,
        videoUrl: null
      },
      {
        name: 'Please',
        type: 'phrase',
        category: 'courtesy',
        description: 'Flat hand circling on chest',
        fingerPattern: [true, false, false, false, false],
        handShape: 'flat',
        hasMotion: true,
        isTwoHanded: false,
        faceExpression: null,
        complexity: 2,
        msaslClass: 102,
        imageUrl: null,
        videoUrl: null
      },
      {
        name: 'Sorry',
        type: 'phrase',
        category: 'courtesy',
        description: 'Fist circling on chest',
        fingerPattern: [false, false, false, false, false],
        handShape: 'fist',
        hasMotion: true,
        isTwoHanded: false,
        faceExpression: 'concerned',
        complexity: 2,
        msaslClass: 103,
        imageUrl: null,
        videoUrl: null
      },
      {
        name: 'Help',
        type: 'phrase',
        category: 'needs',
        description: 'Fist on palm, moving upward together',
        fingerPattern: [true, true, false, false, false],
        handShape: 'mixed',
        hasMotion: true,
        isTwoHanded: true,
        faceExpression: 'concerned',
        complexity: 3,
        msaslClass: 104,
        imageUrl: null,
        videoUrl: null
      }
    ];
    
    // Add more MS-ASL common words
    const commonWords: InsertGesture[] = [
      {
        name: 'Yes',
        type: 'word',
        category: 'response',
        description: 'Fist nodding up and down, like a head nod',
        fingerPattern: [true, false, false, false, false],
        handShape: 'fist',
        hasMotion: true,
        isTwoHanded: false,
        faceExpression: 'affirmative',
        complexity: 1,
        msaslClass: 200,
        imageUrl: null,
        videoUrl: null
      },
      {
        name: 'No',
        type: 'word',
        category: 'response',
        description: 'Index and middle finger extended, hand pivoting at wrist',
        fingerPattern: [true, true, true, false, false],
        handShape: 'pointing',
        hasMotion: true,
        isTwoHanded: false,
        faceExpression: 'negative',
        complexity: 1,
        msaslClass: 201,
        imageUrl: null,
        videoUrl: null
      },
      {
        name: 'Good',
        type: 'word',
        category: 'descriptive',
        description: 'Flat hand from mouth moving outward',
        fingerPattern: [true, false, false, false, false],
        handShape: 'flat',
        hasMotion: true,
        isTwoHanded: false,
        faceExpression: 'positive',
        complexity: 1,
        msaslClass: 202,
        imageUrl: null,
        videoUrl: null
      },
      {
        name: 'Bad',
        type: 'word',
        category: 'descriptive',
        description: 'Flat hand from chin moving down and outward',
        fingerPattern: [true, false, false, false, false],
        handShape: 'flat',
        hasMotion: true,
        isTwoHanded: false,
        faceExpression: 'negative',
        complexity: 1,
        msaslClass: 203,
        imageUrl: null,
        videoUrl: null
      },
      {
        name: 'Love',
        type: 'word',
        category: 'emotional',
        description: 'Cross arms over chest, hands in fists, touching opposite shoulders',
        fingerPattern: [false, false, false, false, false],
        handShape: 'fist',
        hasMotion: false,
        isTwoHanded: true,
        faceExpression: 'warm',
        complexity: 2,
        msaslClass: 204,
        imageUrl: null,
        videoUrl: null
      }
    ];
    
    // MS-ASL specific words (more complex signs from the dataset)
    const msaslSpecific: InsertGesture[] = [
      {
        name: 'Computer',
        type: 'word',
        category: 'technology',
        description: 'Both hands typing motion, palms down',
        fingerPattern: [true, true, true, true, true],
        handShape: 'curved',
        hasMotion: true,
        isTwoHanded: true,
        faceExpression: null,
        complexity: 2,
        msaslClass: 300,
        imageUrl: null,
        videoUrl: null
      },
      {
        name: 'School',
        type: 'word',
        category: 'education',
        description: 'Clapping hands twice',
        fingerPattern: [true, true, true, true, true],
        handShape: 'flat',
        hasMotion: true,
        isTwoHanded: true,
        faceExpression: null,
        complexity: 2,
        msaslClass: 301,
        imageUrl: null,
        videoUrl: null
      },
      {
        name: 'Work',
        type: 'word',
        category: 'activity',
        description: 'Fists stacked and twisting',
        fingerPattern: [false, false, false, false, false],
        handShape: 'fist',
        hasMotion: true,
        isTwoHanded: true,
        faceExpression: null,
        complexity: 2,
        msaslClass: 302,
        imageUrl: null,
        videoUrl: null
      },
      {
        name: 'Friend',
        type: 'word',
        category: 'relationship',
        description: 'Index fingers hooked together, then reversed',
        fingerPattern: [true, true, false, false, false],
        handShape: 'pointing',
        hasMotion: true,
        isTwoHanded: true,
        faceExpression: 'friendly',
        complexity: 3,
        msaslClass: 303,
        imageUrl: null,
        videoUrl: null
      },
      {
        name: 'Family',
        type: 'word',
        category: 'relationship',
        description: 'Both hands with fingers extended, circling each other',
        fingerPattern: [true, true, true, true, true],
        handShape: 'open',
        hasMotion: true,
        isTwoHanded: true,
        faceExpression: 'warm',
        complexity: 3,
        msaslClass: 304,
        imageUrl: null,
        videoUrl: null
      }
    ];
    
    // Insert all the gestures
    console.log("Inserting alphabet gestures...");
    for (const gesture of alphabetData) {
      await this.createGesture(gesture);
    }
    
    console.log("Inserting phrase gestures...");
    for (const gesture of phraseData) {
      await this.createGesture(gesture);
    }
    
    console.log("Inserting common word gestures...");
    for (const gesture of commonWords) {
      await this.createGesture(gesture);
    }
    
    console.log("Inserting MS-ASL specific gestures...");
    for (const gesture of msaslSpecific) {
      await this.createGesture(gesture);
    }
    
    console.log("Database seeding complete with MS-ASL data");
  }
}

// Fallback in-memory storage for development
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private gestures: Map<number, Gesture>;
  private variations: Map<number, GestureVariation[]>;
  private userCurrentId: number;
  private gestureCurrentId: number;
  private variationCurrentId: number;

  constructor() {
    this.users = new Map();
    this.gestures = new Map();
    this.variations = new Map();
    this.userCurrentId = 1;
    this.gestureCurrentId = 1;
    this.variationCurrentId = 1;
  }

  async setupDatabase(): Promise<void> {
    this.seedGestures();
  }

  private seedGestures() {
    // The same data as PostgreSQL storage but in memory - adapted for MS-ASL
    const alphabetGestures = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(letter => ({
      name: letter,
      type: "alphabet",
      category: "basic",
      description: `MS-ASL sign for letter ${letter}`,
      fingerPattern: null,
      handShape: "unknown",
      hasMotion: false,
      isTwoHanded: false,
      faceExpression: null,
      complexity: 1,
      msaslClass: 0,
      imageUrl: null,
      videoUrl: null
    }));
    
    const phraseGestures = [
      { 
        name: "Hello", 
        type: "phrase", 
        category: "greeting",
        description: "Wave hand near face", 
        fingerPattern: [true, true, true, true, true], 
        handShape: "open", 
        hasMotion: true,
        isTwoHanded: false,
        faceExpression: "smile",
        complexity: 1,
        msaslClass: 100,
        imageUrl: null,
        videoUrl: null
      },
      { 
        name: "Thank You", 
        type: "phrase", 
        category: "courtesy",
        description: "Touch chin forward", 
        fingerPattern: [true, false, false, false, false], 
        handShape: "flat", 
        hasMotion: true,
        isTwoHanded: false,
        faceExpression: "smile",
        complexity: 2,
        msaslClass: 101,
        imageUrl: null,
        videoUrl: null
      },
      { 
        name: "Please", 
        type: "phrase", 
        category: "courtesy",
        description: "Circular motion on chest", 
        fingerPattern: [true, false, false, false, false], 
        handShape: "flat", 
        hasMotion: true,
        isTwoHanded: false,
        faceExpression: null,
        complexity: 2,
        msaslClass: 102,
        imageUrl: null,
        videoUrl: null
      },
      { 
        name: "Sorry", 
        type: "phrase", 
        category: "courtesy",
        description: "Fist circular on chest", 
        fingerPattern: [false, false, false, false, false], 
        handShape: "fist", 
        hasMotion: true,
        isTwoHanded: false,
        faceExpression: "concerned",
        complexity: 2,
        msaslClass: 103,
        imageUrl: null,
        videoUrl: null
      },
      { 
        name: "Help", 
        type: "phrase", 
        category: "needs",
        description: "Thumb up, palm out", 
        fingerPattern: [true, true, false, false, false], 
        handShape: "mixed", 
        hasMotion: true,
        isTwoHanded: true,
        faceExpression: "concerned",
        complexity: 3,
        msaslClass: 104,
        imageUrl: null,
        videoUrl: null
      }
    ];
    
    // Add more words from MS-ASL dataset
    const wordGestures = [
      { 
        name: "Yes", 
        type: "word", 
        category: "response",
        description: "Nodding fist", 
        fingerPattern: [true, false, false, false, false], 
        handShape: "fist", 
        hasMotion: true,
        isTwoHanded: false,
        faceExpression: "affirmative",
        complexity: 1,
        msaslClass: 200,
        imageUrl: null,
        videoUrl: null
      },
      { 
        name: "No", 
        type: "word", 
        category: "response",
        description: "Index and middle finger extended, moving side to side", 
        fingerPattern: [true, true, true, false, false], 
        handShape: "pointing", 
        hasMotion: true,
        isTwoHanded: false,
        faceExpression: "negative",
        complexity: 2,
        msaslClass: 201,
        imageUrl: null,
        videoUrl: null
      },
      { 
        name: "Good", 
        type: "word", 
        category: "descriptive",
        description: "Flat hand from mouth forward", 
        fingerPattern: [true, false, false, false, false], 
        handShape: "flat", 
        hasMotion: true,
        isTwoHanded: false,
        faceExpression: "positive",
        complexity: 1,
        msaslClass: 202,
        imageUrl: null,
        videoUrl: null
      },
      { 
        name: "Bad", 
        type: "word", 
        category: "descriptive",
        description: "Flat hand down from chin", 
        fingerPattern: [true, false, false, false, false], 
        handShape: "flat", 
        hasMotion: true,
        isTwoHanded: false,
        faceExpression: "negative",
        complexity: 1,
        msaslClass: 203,
        imageUrl: null,
        videoUrl: null
      },
      { 
        name: "Love", 
        type: "word", 
        category: "emotional",
        description: "Cross arms over chest", 
        fingerPattern: [true, false, false, false, false], 
        handShape: "crossed", 
        hasMotion: false,
        isTwoHanded: true,
        faceExpression: "warm",
        complexity: 3,
        msaslClass: 204,
        imageUrl: null,
        videoUrl: null
      }
    ];
    
    [...alphabetGestures, ...phraseGestures, ...wordGestures].forEach(g => {
      this.createGesture(g);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getAllGestures(): Promise<Gesture[]> {
    return Array.from(this.gestures.values());
  }
  
  async getGesturesByType(type: string): Promise<Gesture[]> {
    return Array.from(this.gestures.values()).filter(gesture => gesture.type === type);
  }
  
  async getGesture(id: number): Promise<Gesture | undefined> {
    return this.gestures.get(id);
  }
  
  async getGestureByName(name: string): Promise<Gesture | undefined> {
    return Array.from(this.gestures.values()).find(
      (gesture) => gesture.name === name,
    );
  }
  
  async createGesture(insertGesture: InsertGesture): Promise<Gesture> {
    const id = this.gestureCurrentId++;
    // Ensure all required properties have values with proper defaults for MS-ASL schema
    const gesture: Gesture = { 
      ...insertGesture, 
      id,
      category: insertGesture.category || null,
      description: insertGesture.description || null,
      fingerPattern: insertGesture.fingerPattern || null,
      handShape: insertGesture.handShape || null,
      hasMotion: insertGesture.hasMotion !== undefined ? insertGesture.hasMotion : false,
      isTwoHanded: insertGesture.isTwoHanded !== undefined ? insertGesture.isTwoHanded : false,
      faceExpression: insertGesture.faceExpression || null,
      complexity: insertGesture.complexity || 1,
      msaslClass: insertGesture.msaslClass || 0,
      imageUrl: insertGesture.imageUrl || null,
      videoUrl: insertGesture.videoUrl || null
    };
    this.gestures.set(id, gesture);
    return gesture;
  }
  
  async updateGesture(id: number, gestureData: Partial<InsertGesture>): Promise<Gesture | undefined> {
    const existingGesture = this.gestures.get(id);
    if (!existingGesture) {
      return undefined;
    }
    
    // Update the existing gesture with new data
    const updatedGesture: Gesture = {
      ...existingGesture,
      ...gestureData,
      // Make sure these fields are properly handled
      hasMotion: gestureData.hasMotion !== undefined ? gestureData.hasMotion : existingGesture.hasMotion,
      isTwoHanded: gestureData.isTwoHanded !== undefined ? gestureData.isTwoHanded : existingGesture.isTwoHanded,
      fingerPattern: gestureData.fingerPattern !== undefined ? gestureData.fingerPattern : existingGesture.fingerPattern,
    };
    
    this.gestures.set(id, updatedGesture);
    return updatedGesture;
  }
  
  async getGestureVariations(gestureId: number): Promise<GestureVariation[]> {
    return this.variations.get(gestureId) || [];
  }
  
  async addGestureVariation(variation: InsertGestureVariation): Promise<GestureVariation> {
    const id = this.variationCurrentId++;
    // Ensure all required properties have values for MS-ASL schema
    const newVariation: GestureVariation = { 
      ...variation, 
      id,
      fingerPattern: variation.fingerPattern, // This is required
      gestureId: variation.gestureId, // This is required
      confidence: variation.confidence || 0.8,
      notes: variation.notes || null,
      regionSpecific: variation.regionSpecific || null
    };
    
    if (!this.variations.has(variation.gestureId)) {
      this.variations.set(variation.gestureId, []);
    }
    
    const variations = this.variations.get(variation.gestureId)!;
    variations.push(newVariation);
    
    return newVariation;
  }
  
  async updateGestureFingerPattern(id: number, fingerPattern: boolean[]): Promise<Gesture | undefined> {
    const gesture = this.gestures.get(id);
    if (!gesture) return undefined;
    
    const updatedGesture = { ...gesture, fingerPattern };
    this.gestures.set(id, updatedGesture);
    return updatedGesture;
  }
}

// Choose the right storage implementation based on environment
// Add implementation for missing methods in PostgresStorage
// User methods
PostgresStorage.prototype.updateUserSkillLevel = async function(id: number, skillLevel: string): Promise<User | undefined> {
  try {
    const result = await db.update(users)
      .set({ skillLevel })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error("Error updating user skill level:", error);
    return undefined;
  }
};

// Advanced gesture search/query methods
PostgresStorage.prototype.getGesturesByCategory = async function(category: string): Promise<Gesture[]> {
  return await db.select().from(gestures).where(eq(gestures.category, category));
};

PostgresStorage.prototype.getGesturesByComplexity = async function(minComplexity: number, maxComplexity: number): Promise<Gesture[]> {
  return await db.select().from(gestures)
    .where(
      and(
        sql`${gestures.complexity} >= ${minComplexity}`,
        sql`${gestures.complexity} <= ${maxComplexity}`
      )
    );
};

PostgresStorage.prototype.searchGestures = async function(query: string): Promise<Gesture[]> {
  return await db.select().from(gestures)
    .where(
      or(
        like(gestures.name, `%${query}%`),
        like(gestures.description, `%${query}%`),
        like(gestures.category, `%${query}%`)
      )
    );
};

PostgresStorage.prototype.updateGesture = async function(id: number, gesture: Partial<InsertGesture>): Promise<Gesture | undefined> {
  try {
    const result = await db.update(gestures)
      .set(gesture)
      .where(eq(gestures.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error("Error updating gesture:", error);
    return undefined;
  }
};

// MS-ASL specific methods
PostgresStorage.prototype.getSimilarGestures = async function(gestureId: number): Promise<Gesture[]> {
  // First check if there are explicit relationships defined
  const relationships = await db.select()
    .from(gestureRelationships)
    .where(eq(gestureRelationships.gestureId1, gestureId));
  
  if (relationships.length > 0) {
    const relatedIds = relationships.map(r => r.gestureId2);
    return await db.select().from(gestures).where(inArray(gestures.id, relatedIds));
  }
  
  // Otherwise, find by similar properties
  const targetGesture = await this.getGesture(gestureId);
  if (!targetGesture) return [];
  
  return await db.select().from(gestures)
    .where(
      and(
        eq(gestures.type, targetGesture.type),
        eq(gestures.hasMotion, targetGesture.hasMotion),
        sql`${gestures.id} != ${gestureId}`
      )
    )
    .limit(5);
};

PostgresStorage.prototype.getGesturesByHandShape = async function(handShape: string): Promise<Gesture[]> {
  return await db.select().from(gestures).where(eq(gestures.handShape, handShape));
};

PostgresStorage.prototype.getMotionBasedGestures = async function(): Promise<Gesture[]> {
  return await db.select().from(gestures).where(eq(gestures.hasMotion, true));
};

PostgresStorage.prototype.getTwoHandedGestures = async function(): Promise<Gesture[]> {
  return await db.select().from(gestures).where(eq(gestures.isTwoHanded, true));
};

// User training
PostgresStorage.prototype.addUserTrainingSample = async function(sample: InsertUserTrainingSample): Promise<UserTrainingSample> {
  const result = await db.insert(userTrainingSamples)
    .values(sample)
    .returning();
  return result[0];
};

PostgresStorage.prototype.getUserTrainingSamples = async function(userId: number, gestureId?: number): Promise<UserTrainingSample[]> {
  if (gestureId) {
    return await db.select()
      .from(userTrainingSamples)
      .where(
        and(
          eq(userTrainingSamples.userId, userId),
          eq(userTrainingSamples.gestureId, gestureId)
        )
      );
  }
  return await db.select()
    .from(userTrainingSamples)
    .where(eq(userTrainingSamples.userId, userId));
};

// User progress tracking
PostgresStorage.prototype.getUserProgress = async function(userId: number): Promise<UserProgress[]> {
  return await db.select()
    .from(userProgress)
    .where(eq(userProgress.userId, userId));
};

PostgresStorage.prototype.updateUserProgress = async function(userId: number, gestureId: number, data: Partial<InsertUserProgress>): Promise<UserProgress> {
  // Check if progress record exists
  const existing = await db.select()
    .from(userProgress)
    .where(
      and(
        eq(userProgress.userId, userId),
        eq(userProgress.gestureId, gestureId)
      )
    );
  
  if (existing.length > 0) {
    // Update existing record
    const result = await db.update(userProgress)
      .set(data)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.gestureId, gestureId)
        )
      )
      .returning();
    return result[0];
  } else {
    // Create new record
    const newRecord = {
      userId,
      gestureId,
      ...data
    };
    const result = await db.insert(userProgress)
      .values(newRecord)
      .returning();
    return result[0];
  }
};

PostgresStorage.prototype.getRecommendedGestures = async function(userId: number, count: number = 5): Promise<Gesture[]> {
  // Get user's progress
  const userProgressData = await this.getUserProgress(userId);
  
  // If user has no progress, recommend beginner gestures
  if (userProgressData.length === 0) {
    return await db.select()
      .from(gestures)
      .where(eq(gestures.complexity, 1))
      .limit(count);
  }
  
  // Find gestures the user hasn't practiced yet or practiced least
  const practiced = new Set(userProgressData.map(p => p.gestureId));
  
  // First try to find gestures not practiced yet
  if (practiced.size > 0) {
    const unpracticedGestures = await db.select()
      .from(gestures)
      .where(sql`${gestures.id} NOT IN (${Array.from(practiced).join(',')})`)
      .limit(count);
    
    if (unpracticedGestures.length >= count) {
      return unpracticedGestures;
    }
    
    // If not enough unpracticed gestures, add some from least practiced
    const remaining = count - unpracticedGestures.length;
    const leastPracticed = await db.select()
      .from(gestures)
      .innerJoin(userProgress, eq(gestures.id, userProgress.gestureId))
      .where(eq(userProgress.userId, userId))
      .orderBy(userProgress.practiceCount)
      .limit(remaining);
    
    return [...unpracticedGestures, ...leastPracticed];
  }
  
  // Fallback to complexity-based recommendation
  return await db.select()
    .from(gestures)
    .orderBy(gestures.complexity)
    .limit(count);
};

// Learning paths
PostgresStorage.prototype.getAllLearningPaths = async function(): Promise<LearningPath[]> {
  return await db.select().from(learningPaths);
};

PostgresStorage.prototype.getLearningPathGestures = async function(pathId: number): Promise<Gesture[]> {
  const result = await db.select()
    .from(learningPathGestures)
    .innerJoin(gestures, eq(learningPathGestures.gestureId, gestures.id))
    .where(eq(learningPathGestures.pathId, pathId))
    .orderBy(learningPathGestures.order);
  
  return result.map(r => ({
    id: r.gestures.id,
    name: r.gestures.name,
    type: r.gestures.type,
    category: r.gestures.category,
    description: r.gestures.description,
    fingerPattern: r.gestures.fingerPattern,
    handShape: r.gestures.handShape,
    hasMotion: r.gestures.hasMotion,
    motionType: r.gestures.motionType,
    motionDirection: r.gestures.motionDirection,
    isTwoHanded: r.gestures.isTwoHanded,
    dominantHand: r.gestures.dominantHand,
    nonDominantHandShape: r.gestures.nonDominantHandShape,
    faceExpression: r.gestures.faceExpression,
    bodyMovement: r.gestures.bodyMovement,
    complexity: r.gestures.complexity,
    msaslClass: r.gestures.msaslClass,
    msaslVariant: r.gestures.msaslVariant,
    confidence: r.gestures.confidence,
    imageUrl: r.gestures.imageUrl,
    videoUrl: r.gestures.videoUrl,
    examples: r.gestures.examples,
    similarSigns: r.gestures.similarSigns,
    featureVector: r.gestures.featureVector,
    detectionThreshold: r.gestures.detectionThreshold,
    falsePositiveRate: r.gestures.falsePositiveRate,
    createdAt: r.gestures.createdAt,
    updatedAt: r.gestures.updatedAt
  }));
};

// Analytics
PostgresStorage.prototype.recordRecognitionAttempt = async function(
  sessionId: number, 
  gestureId: number, 
  successful: boolean, 
  confidence: number, 
  actualGestureId?: number
): Promise<void> {
  await db.insert(recognitionAttempts)
    .values({
      sessionId,
      gestureId,
      successful,
      confidence,
      actualGesture: actualGestureId,
    });
  
  // Update session stats
  await db.update(recognitionSessions)
    .set({
      totalGestures: sql`${recognitionSessions.totalGestures} + 1`,
      successfulRecognitions: successful 
        ? sql`${recognitionSessions.successfulRecognitions} + 1` 
        : recognitionSessions.successfulRecognitions
    })
    .where(eq(recognitionSessions.id, sessionId));
};

PostgresStorage.prototype.getRecognitionStats = async function(
  userId?: number, 
  timeRange?: {start: Date, end: Date}
): Promise<any> {
  let query = db.select({
    totalAttempts: sql`COUNT(*)`,
    successfulAttempts: sql`SUM(CASE WHEN ${recognitionAttempts.successful} THEN 1 ELSE 0 END)`,
    avgConfidence: sql`AVG(${recognitionAttempts.confidence})`,
    avgProcessingTime: sql`AVG(${recognitionAttempts.processingTime})`
  })
  .from(recognitionAttempts)
  .innerJoin(recognitionSessions, eq(recognitionAttempts.sessionId, recognitionSessions.id));
  
  // Apply filters
  if (userId) {
    query = query.where(eq(recognitionSessions.userId, userId));
  }
  
  if (timeRange) {
    query = query.where(
      and(
        sql`${recognitionAttempts.timestamp} >= ${timeRange.start.toISOString()}`,
        sql`${recognitionAttempts.timestamp} <= ${timeRange.end.toISOString()}`
      )
    );
  }
  
  const [result] = await query;
  return result;
};

PostgresStorage.prototype.updateModelMetrics = async function(metrics: Partial<ModelMetric>): Promise<ModelMetric> {
  const metricData = {
    modelVersion: metrics.modelVersion || '1.0',
    accuracy: metrics.accuracy,
    precision: metrics.precision,
    recall: metrics.recall,
    f1Score: metrics.f1Score,
    confusionMatrix: metrics.confusionMatrix,
    topConfusedPairs: metrics.topConfusedPairs
  };
  
  const result = await db.insert(modelMetrics)
    .values(metricData)
    .returning();
  
  return result[0];
};

PostgresStorage.prototype.getLatestModelMetrics = async function(): Promise<ModelMetric | undefined> {
  const result = await db.select()
    .from(modelMetrics)
    .orderBy(desc(modelMetrics.metricsDate))
    .limit(1);
  
  return result[0];
};

// Also add stubs for MemStorage but we'll focus on the PostgreSQL implementation
for (const method of [
  'updateUserSkillLevel', 'getGesturesByCategory', 'getGesturesByComplexity', 
  'searchGestures', 'updateGesture', 'getSimilarGestures', 'getGesturesByHandShape',
  'getMotionBasedGestures', 'getTwoHandedGestures', 'addUserTrainingSample',
  'getUserTrainingSamples', 'getUserProgress', 'updateUserProgress',
  'getRecommendedGestures', 'getAllLearningPaths', 'getLearningPathGestures',
  'recordRecognitionAttempt', 'getRecognitionStats', 'updateModelMetrics',
  'getLatestModelMetrics'
]) {
  if (!MemStorage.prototype[method]) {
    MemStorage.prototype[method] = async function(...args: any[]) {
      console.warn(`Method ${method} not implemented in MemStorage`);
      return method.startsWith('get') ? [] : undefined;
    };
  }
}

// Force PostgreSQL for our MS-ASL enhanced application
const usePostgres = process.env.DATABASE_URL && process.env.DATABASE_URL.length > 0;
export const storage = usePostgres ? new PostgresStorage() : new MemStorage();
