import { users, type User, type InsertUser, gestures, type Gesture, type InsertGesture } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Gesture related methods
  getAllGestures(): Promise<Gesture[]>;
  getGesturesByType(type: string): Promise<Gesture[]>;
  getGesture(id: number): Promise<Gesture | undefined>;
  getGestureByName(name: string): Promise<Gesture | undefined>;
  createGesture(gesture: InsertGesture): Promise<Gesture>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private gestures: Map<number, Gesture>;
  private userCurrentId: number;
  private gestureCurrentId: number;

  constructor() {
    this.users = new Map();
    this.gestures = new Map();
    this.userCurrentId = 1;
    this.gestureCurrentId = 1;
    
    // Seed with initial gestures
    this.seedGestures();
  }

  private seedGestures() {
    const alphabetGestures = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(letter => ({
      name: letter,
      type: "alphabet",
      description: `ASL sign for letter ${letter}`
    }));
    
    const phraseGestures = [
      { name: "Hello", type: "phrase", description: "Wave hand near face" },
      { name: "Thank You", type: "phrase", description: "Touch chin forward" },
      { name: "Please", type: "phrase", description: "Circular motion on chest" },
      { name: "Sorry", type: "phrase", description: "Fist circular on chest" },
      { name: "Help", type: "phrase", description: "Thumb up, palm out" },
      { name: "Yes", type: "phrase", description: "Nodding fist" },
      { name: "No", type: "phrase", description: "Index and middle finger extended, moving side to side" },
      { name: "Good", type: "phrase", description: "Flat hand from mouth forward" },
      { name: "Bad", type: "phrase", description: "Flat hand down from chin" },
      { name: "Love", type: "phrase", description: "Cross arms over chest" }
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
    const gesture: Gesture = { ...insertGesture, id };
    this.gestures.set(id, gesture);
    return gesture;
  }
}

export const storage = new MemStorage();
