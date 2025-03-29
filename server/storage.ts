import { 
  users, type User, type InsertUser, 
  gestures, type Gesture, type InsertGesture,
  gestureVariations, type GestureVariation, type InsertGestureVariation,
  userProgress, type UserProgress
} from "@shared/schema";
import { eq } from 'drizzle-orm';
import { db } from './db';

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Basic gesture methods
  getAllGestures(): Promise<Gesture[]>;
  getGesturesByType(type: string): Promise<Gesture[]>;
  getGesture(id: number): Promise<Gesture | undefined>;
  getGestureByName(name: string): Promise<Gesture | undefined>;
  createGesture(gesture: InsertGesture): Promise<Gesture>;
  
  // Advanced gesture methods for improved recognition
  getGestureVariations(gestureId: number): Promise<GestureVariation[]>;
  addGestureVariation(variation: InsertGestureVariation): Promise<GestureVariation>;
  updateGestureFingerPattern(id: number, fingerPattern: boolean[]): Promise<Gesture | undefined>;
  
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
const usePostgres = process.env.DATABASE_URL && process.env.DATABASE_URL.length > 0;
export const storage = usePostgres ? new PostgresStorage() : new MemStorage();
