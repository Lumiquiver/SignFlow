import { pgTable, text, serial, integer, boolean, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const gestures = pgTable("gestures", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  type: text("type").notNull(), // "alphabet" or "phrase"
  description: text("description"),
  // New fields for improved recognition
  fingerPattern: jsonb("finger_pattern"), // [thumb, index, middle, ring, pinky] booleans
  handShape: text("hand_shape").default("unknown"), // closed, open, curved, etc.
  complexity: integer("complexity").default(1), // 1-5 scale of difficulty to recognize
  imageUrl: text("image_url"), // Reference image URL
});

export const gestureVariations = pgTable("gesture_variations", {
  id: serial("id").primaryKey(),
  gestureId: integer("gesture_id").notNull().references(() => gestures.id),
  fingerPattern: jsonb("finger_pattern").notNull(), // Alternative finger pattern
  confidence: real("confidence").default(0.8), // How reliable this variation is (0.0-1.0)
  notes: text("notes"), // Any special detection notes
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  gestureId: integer("gesture_id").references(() => gestures.id),
  recognitionRate: real("recognition_rate").default(0),
  practiceCount: integer("practice_count").default(0),
  lastPracticed: text("last_practiced"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGestureSchema = createInsertSchema(gestures).pick({
  name: true,
  type: true,
  description: true,
  fingerPattern: true,
  handShape: true,
  complexity: true,
  imageUrl: true,
});

export const insertGestureVariationSchema = createInsertSchema(gestureVariations).pick({
  gestureId: true,
  fingerPattern: true,
  confidence: true,
  notes: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGesture = z.infer<typeof insertGestureSchema>;
export type Gesture = typeof gestures.$inferSelect;
export type InsertGestureVariation = z.infer<typeof insertGestureVariationSchema>;
export type GestureVariation = typeof gestureVariations.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
