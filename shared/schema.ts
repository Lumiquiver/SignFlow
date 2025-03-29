import { pgTable, text, serial, integer, boolean, jsonb, real, timestamp, varchar, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User accounts and preferences
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
  preferredHandedness: text("preferred_handedness").default("right"), // right or left handed
  preferredDialect: text("preferred_dialect").default("standard"), // regional dialect preference
  skillLevel: text("skill_level").default("beginner"), // beginner, intermediate, advanced
});

// MS-ASL gesture dictionary with enhanced ML attributes
export const gestures = pgTable("gestures", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  type: text("type").notNull(), // "alphabet", "phrase", "word", "number"
  category: text("category"), // MS-ASL category (e.g., "common", "question", "time", "greetings")
  description: text("description"),
  
  // MS-ASL recognition attributes (for ML model)
  fingerPattern: jsonb("finger_pattern"), // [thumb, index, middle, ring, pinky] booleans
  handShape: text("hand_shape").default("unknown"), // closed, open, curved, pinched, etc.
  hasMotion: boolean("has_motion").default(false), // If the sign includes movement
  motionType: text("motion_type"), // Linear, circular, zigzag, etc.
  motionDirection: text("motion_direction"), // up, down, left, right, forward, backward
  isTwoHanded: boolean("is_two_handed").default(false), // If requires two hands
  dominantHand: text("dominant_hand").default("right"), // Which hand is primary in two-handed signs
  nonDominantHandShape: text("non_dominant_hand_shape"), // Shape of non-dominant hand
  faceExpression: text("face_expression"), // If the sign includes facial expression
  bodyMovement: text("body_movement"), // Any body movements involved
  
  // MS-ASL dataset specific attributes
  complexity: integer("complexity").default(1), // 1-5 scale of difficulty to recognize
  msaslClass: integer("msasl_class"), // MS-ASL dataset class identifier
  msaslVariant: integer("msasl_variant"), // MS-ASL variant within the class
  confidence: real("confidence").default(0.8), // Base confidence for this sign
  
  // Learning resources
  imageUrl: text("image_url"), // Reference image URL
  videoUrl: text("video_url"), // Reference video for motion-based signs
  examples: jsonb("examples"), // Example sentences or contexts
  similarSigns: jsonb("similar_signs"), // Signs that look similar (for disambiguation)
  
  // ML model parameters
  featureVector: jsonb("feature_vector"), // For ML feature extraction
  detectionThreshold: real("detection_threshold").default(0.8), // Minimum confidence to report
  falsePositiveRate: real("false_positive_rate"), // Historical false positive rate
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Variations of gestures for improved recognition accuracy
export const gestureVariations = pgTable("gesture_variations", {
  id: serial("id").primaryKey(),
  gestureId: integer("gesture_id").notNull().references(() => gestures.id),
  fingerPattern: jsonb("finger_pattern").notNull(), // Alternative finger pattern
  handPose: jsonb("hand_pose"), // 3D coordinates of key hand joints
  confidence: real("confidence").default(0.8), // How reliable this variation is (0.0-1.0)
  notes: text("notes"), // Any special detection notes
  regionSpecific: text("region_specific"), // For region-specific variations
  userContributed: boolean("user_contributed").default(false), // If added by community
  verified: boolean("verified").default(false), // If verified by experts
  createdAt: timestamp("created_at").defaultNow(),
});

// User-specific training samples for personalization
export const userTrainingSamples = pgTable("user_training_samples", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  gestureId: integer("gesture_id").notNull().references(() => gestures.id),
  handPose: jsonb("hand_pose").notNull(), // Specific hand pose from this user
  fingerPattern: jsonb("finger_pattern"), // User's specific finger pattern
  confidenceScore: real("confidence_score"), // Confidence of matching
  createdAt: timestamp("created_at").defaultNow(),
});

// User learning progress tracking
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  gestureId: integer("gesture_id").references(() => gestures.id),
  recognitionRate: real("recognition_rate").default(0), // Success rate 0.0-1.0
  practiceCount: integer("practice_count").default(0), // How many times practiced
  masteryLevel: integer("mastery_level").default(0), // 0-5 mastery rating
  lastPracticed: text("last_practiced"), // Store as ISO string for now
  nextReviewDate: text("next_review_date"), // Store as ISO string for now
});

// Recognition sessions
export const recognitionSessions = pgTable("recognition_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  deviceInfo: text("device_info"), // Browser/device information
  totalGestures: integer("total_gestures").default(0),
  successfulRecognitions: integer("successful_recognitions").default(0),
});

// Individual gesture recognition attempts for analytics
export const recognitionAttempts = pgTable("recognition_attempts", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => recognitionSessions.id),
  gestureId: integer("gesture_id").references(() => gestures.id),
  timestamp: timestamp("timestamp").defaultNow(),
  successful: boolean("successful").default(false),
  confidence: real("confidence"), // Model confidence
  actualGesture: integer("actual_gesture").references(() => gestures.id), // What user was actually signing
  handPose: jsonb("hand_pose"), // Recorded hand pose for this attempt
  processingTime: real("processing_time"), // Time taken to recognize (ms)
});

// Model performance metrics with ML feedback loops
export const modelMetrics = pgTable("model_metrics", {
  id: serial("id").primaryKey(),
  modelVersion: text("model_version").notNull(),
  metricsDate: timestamp("metrics_date").defaultNow(),
  accuracy: real("accuracy"),
  precision: real("precision"),
  recall: real("recall"),
  f1Score: real("f1_score"),
  confusionMatrix: jsonb("confusion_matrix"),
  topConfusedPairs: jsonb("top_confused_pairs"),
});

// Gesture Learning Paths for curriculum
export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  difficulty: text("difficulty").default("beginner"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Gestures included in each learning path
export const learningPathGestures = pgTable("learning_path_gestures", {
  id: serial("id").primaryKey(),
  pathId: integer("path_id").notNull().references(() => learningPaths.id),
  gestureId: integer("gesture_id").notNull().references(() => gestures.id),
  order: integer("order").notNull(),
  isRequired: boolean("is_required").default(true)
});

// MS-ASL dataset relationships
export const gestureRelationships = pgTable("gesture_relationships", {
  id: serial("id").primaryKey(),
  gestureId1: integer("gesture_id_1").notNull().references(() => gestures.id),
  gestureId2: integer("gesture_id_2").notNull().references(() => gestures.id),
  relationshipType: text("relationship_type").notNull(), // synonyms, antonyms, variants
  strength: real("strength").default(1.0), // Relationship strength 0.0-1.0
});

// Create insert schemas for user input validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  preferredHandedness: true,
  preferredDialect: true,
  skillLevel: true,
});

export const insertGestureSchema = createInsertSchema(gestures).pick({
  name: true,
  type: true,
  category: true,
  description: true,
  fingerPattern: true,
  handShape: true,
  hasMotion: true,
  motionType: true,
  motionDirection: true,
  isTwoHanded: true,
  dominantHand: true,
  nonDominantHandShape: true,
  faceExpression: true,
  bodyMovement: true,
  complexity: true,
  msaslClass: true,
  msaslVariant: true,
  confidence: true,
  imageUrl: true,
  videoUrl: true,
  examples: true,
  similarSigns: true,
  featureVector: true,
  detectionThreshold: true,
});

export const insertGestureVariationSchema = createInsertSchema(gestureVariations).pick({
  gestureId: true,
  fingerPattern: true,
  handPose: true,
  confidence: true,
  notes: true,
  regionSpecific: true,
  userContributed: true,
});

export const insertUserTrainingSampleSchema = createInsertSchema(userTrainingSamples).pick({
  userId: true,
  gestureId: true,
  handPose: true,
  fingerPattern: true,
  confidenceScore: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).pick({
  userId: true,
  gestureId: true,
  recognitionRate: true,
  practiceCount: true,
  masteryLevel: true,
  lastPracticed: true,
  nextReviewDate: true,
});

// Create types for TypeScript usage
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGesture = z.infer<typeof insertGestureSchema>;
export type Gesture = typeof gestures.$inferSelect;

export type InsertGestureVariation = z.infer<typeof insertGestureVariationSchema>;
export type GestureVariation = typeof gestureVariations.$inferSelect;

export type InsertUserTrainingSample = z.infer<typeof insertUserTrainingSampleSchema>;
export type UserTrainingSample = typeof userTrainingSamples.$inferSelect;

export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;

export type RecognitionSession = typeof recognitionSessions.$inferSelect;
export type RecognitionAttempt = typeof recognitionAttempts.$inferSelect;
export type ModelMetric = typeof modelMetrics.$inferSelect;
export type LearningPath = typeof learningPaths.$inferSelect;
export type GestureRelationship = typeof gestureRelationships.$inferSelect;
