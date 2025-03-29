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
        console.log("Seeding database with initial ASL gestures...");
        await this.seedGestures();
      } else {
        console.log(`Database already contains ${existingGestures.length} gestures`);
      }
    } catch (error) {
      console.error("Error setting up database:", error);
    }
  }
  
  // Seed database with accurate ASL gestures
  private async seedGestures() {
    // ASL alphabet with accurate finger patterns
    const alphabetData: InsertGesture[] = [
      {
        name: 'A',
        type: 'alphabet',
        description: 'Fist with thumb at side',
        fingerPattern: [true, false, false, false, false],
        handShape: 'fist',
        complexity: 1
      },
      {
        name: 'B',
        type: 'alphabet',
        description: 'Flat hand with fingers together, thumb tucked',
        fingerPattern: [false, true, true, true, true],
        handShape: 'flat',
        complexity: 1
      },
      {
        name: 'C',
        type: 'alphabet',
        description: 'Curved hand in C shape',
        fingerPattern: [false, false, false, false, false],
        handShape: 'curved',
        complexity: 2
      },
      {
        name: 'D',
        type: 'alphabet',
        description: 'Index finger pointing up, other fingers curled, thumb against fingers',
        fingerPattern: [true, true, false, false, false],
        handShape: 'pointing',
        complexity: 2
      },
      {
        name: 'E',
        type: 'alphabet',
        description: 'Fingers curled, thumb across palm',
        fingerPattern: [false, false, false, false, false],
        handShape: 'curled',
        complexity: 2
      }
    ];
    
    // Just add a few to start
    for (const letter of "FGHIJKLMNOPQRSTUVWXYZ".split("")) {
      alphabetData.push({
        name: letter,
        type: 'alphabet',
        description: `ASL sign for letter ${letter}`,
        fingerPattern: null, // Will be filled in later for accuracy
        handShape: 'unknown',
        complexity: 2
      });
    }
    
    // Common phrases with more accurate patterns
    const phraseData: InsertGesture[] = [
      {
        name: 'Hello',
        type: 'phrase',
        description: 'Open hand, palm facing out, fingers spread, move side to side',
        fingerPattern: [true, true, true, true, true],
        handShape: 'open',
        complexity: 1
      },
      {
        name: 'Thank You',
        type: 'phrase',
        description: 'Touch lips with fingertips then move hand outward',
        fingerPattern: [true, false, false, false, false],
        handShape: 'flat',
        complexity: 2
      },
      {
        name: 'Please',
        type: 'phrase',
        description: 'Circular motion on chest with flat hand',
        fingerPattern: [true, false, false, false, false],
        handShape: 'flat',
        complexity: 2
      },
      {
        name: 'Sorry',
        type: 'phrase',
        description: 'Closed fist making circular motion on chest',
        fingerPattern: [false, false, false, false, false],
        handShape: 'fist',
        complexity: 2
      },
      {
        name: 'Help',
        type: 'phrase',
        description: 'Closed fist with thumb up, placed on open palm',
        fingerPattern: [true, true, false, false, false],
        handShape: 'mixed',
        complexity: 3
      }
    ];
    
    // Just add a few more basic phrases
    const otherPhrases = ["Yes", "No", "Good", "Bad", "Love"];
    for (const phrase of otherPhrases) {
      phraseData.push({
        name: phrase,
        type: 'phrase',
        description: `ASL sign for "${phrase}"`,
        fingerPattern: null, // Will be filled in later
        handShape: 'unknown',
        complexity: 2
      });
    }
    
    // Insert all the gestures
    console.log("Inserting alphabet gestures...");
    for (const gesture of alphabetData) {
      await this.createGesture(gesture);
    }
    
    console.log("Inserting phrase gestures...");
    for (const gesture of phraseData) {
      await this.createGesture(gesture);
    }
    
    console.log("Database seeding complete");
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
    // The same data as PostgreSQL storage but in memory
    const alphabetGestures = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(letter => ({
      name: letter,
      type: "alphabet",
      description: `ASL sign for letter ${letter}`,
      fingerPattern: null,
      handShape: "unknown",
      complexity: 1
    }));
    
    const phraseGestures = [
      { name: "Hello", type: "phrase", description: "Wave hand near face", fingerPattern: [true, true, true, true, true], handShape: "open", complexity: 1 },
      { name: "Thank You", type: "phrase", description: "Touch chin forward", fingerPattern: [true, false, false, false, false], handShape: "flat", complexity: 2 },
      { name: "Please", type: "phrase", description: "Circular motion on chest", fingerPattern: [true, false, false, false, false], handShape: "flat", complexity: 2 },
      { name: "Sorry", type: "phrase", description: "Fist circular on chest", fingerPattern: [false, false, false, false, false], handShape: "fist", complexity: 2 },
      { name: "Help", type: "phrase", description: "Thumb up, palm out", fingerPattern: [true, true, false, false, false], handShape: "mixed", complexity: 3 },
      { name: "Yes", type: "phrase", description: "Nodding fist", fingerPattern: [true, false, false, false, false], handShape: "fist", complexity: 1 },
      { name: "No", type: "phrase", description: "Index and middle finger extended, moving side to side", fingerPattern: [true, true, true, false, false], handShape: "pointing", complexity: 2 },
      { name: "Good", type: "phrase", description: "Flat hand from mouth forward", fingerPattern: [true, false, false, false, false], handShape: "flat", complexity: 1 },
      { name: "Bad", type: "phrase", description: "Flat hand down from chin", fingerPattern: [true, false, false, false, false], handShape: "flat", complexity: 1 },
      { name: "Love", type: "phrase", description: "Cross arms over chest", fingerPattern: [true, false, false, false, false], handShape: "crossed", complexity: 3 }
    ];
    
    [...alphabetGestures, ...phraseGestures].forEach(g => {
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
    // Ensure all required properties have values
    const gesture: Gesture = { 
      ...insertGesture, 
      id,
      description: insertGesture.description || null,
      fingerPattern: insertGesture.fingerPattern || null,
      handShape: insertGesture.handShape || null,
      complexity: insertGesture.complexity || null,
      imageUrl: null // Default value for imageUrl
    };
    this.gestures.set(id, gesture);
    return gesture;
  }
  
  async getGestureVariations(gestureId: number): Promise<GestureVariation[]> {
    return this.variations.get(gestureId) || [];
  }
  
  async addGestureVariation(variation: InsertGestureVariation): Promise<GestureVariation> {
    const id = this.variationCurrentId++;
    // Ensure all required properties have values
    const newVariation: GestureVariation = { 
      ...variation, 
      id,
      confidence: variation.confidence || null,
      notes: variation.notes || null
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
