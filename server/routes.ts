import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGestureSchema, insertGestureVariationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Raw test endpoint that bypasses Vite middleware
  app.get("/api-test-endpoint", (_req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send(JSON.stringify({ message: "Test endpoint success", timestamp: new Date().toISOString() }));
  });
  // API Routes for gesture data
  
  // Get all gestures
  app.get("/api/gestures", async (req, res) => {
    try {
      const gestures = await storage.getAllGestures();
      res.setHeader('Content-Type', 'application/json');
      res.json(gestures);
    } catch (error: any) {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ message: error.message });
    }
  });
  
  // Direct API endpoint for raw JSON data
  app.get("/api/raw/gestures", async (_req, res) => {
    try {
      const gestures = await storage.getAllGestures();
      // Force API response as text/plain to avoid HTML rendering
      res.setHeader('Content-Type', 'text/plain');
      res.send(JSON.stringify(gestures, null, 2));
    } catch (error: any) {
      res.setHeader('Content-Type', 'text/plain');
      res.status(500).send(JSON.stringify({ message: error.message }, null, 2));
    }
  });
  
  // Direct API endpoint for raw gesture by ID
  app.get("/api/raw/gestures/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.setHeader('Content-Type', 'text/plain');
        return res.status(400).send(JSON.stringify({ message: "Invalid gesture ID" }, null, 2));
      }
      
      const gesture = await storage.getGesture(id);
      if (!gesture) {
        res.setHeader('Content-Type', 'text/plain');
        return res.status(404).send(JSON.stringify({ message: "Gesture not found" }, null, 2));
      }
      
      res.setHeader('Content-Type', 'text/plain');
      res.send(JSON.stringify(gesture, null, 2));
    } catch (error: any) {
      res.setHeader('Content-Type', 'text/plain');
      res.status(500).send(JSON.stringify({ message: error.message }, null, 2));
    }
  });
  
  // Direct API endpoint for raw updates
  app.patch("/api/raw/gestures/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.setHeader('Content-Type', 'text/plain');
        return res.status(400).send(JSON.stringify({ message: "Invalid gesture ID" }, null, 2));
      }
      
      // Find the gesture first
      const existingGesture = await storage.getGesture(id);
      if (!existingGesture) {
        res.setHeader('Content-Type', 'text/plain');
        return res.status(404).send(JSON.stringify({ message: "Gesture not found" }, null, 2));
      }
      
      // For now, we're trusting the input since we're just for updates from our application
      const updatedGesture = await storage.updateGesture(id, req.body);
      
      // Force text/plain to prevent HTML rendering
      res.setHeader('Content-Type', 'text/plain');
      res.send(JSON.stringify(updatedGesture, null, 2));
    } catch (error: any) {
      res.setHeader('Content-Type', 'text/plain');
      res.status(500).send(JSON.stringify({ message: error.message }, null, 2));
    }
  });
  
  // Get gestures by type (alphabet, phrase, or word for MS-ASL)
  app.get("/api/gestures/type/:type", async (req, res) => {
    try {
      const { type } = req.params;
      if (!type || (type !== "alphabet" && type !== "phrase" && type !== "word")) {
        return res.status(400).json({ message: "Invalid gesture type. Must be 'alphabet', 'phrase', or 'word'." });
      }
      
      const gestures = await storage.getGesturesByType(type);
      res.json(gestures);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get gestures by category (new for MS-ASL)
  app.get("/api/gestures/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      if (!category) {
        return res.status(400).json({ message: "Category parameter is required" });
      }
      
      // Use the dedicated storage method for better performance
      const gestures = await storage.getGesturesByCategory(category);
      
      res.json(gestures);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get gestures by motion capability (for MS-ASL)
  app.get("/api/gestures/motion/:hasMotion", async (req, res) => {
    try {
      const hasMotion = req.params.hasMotion === 'true';
      
      // Use the dedicated storage method for better performance
      const gestures = hasMotion ? 
        await storage.getMotionBasedGestures() : 
        await storage.getAllGestures().then(g => g.filter(item => !item.hasMotion));
      
      res.json(gestures);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get gestures by hands required (for MS-ASL)
  app.get("/api/gestures/hands/:twoHanded", async (req, res) => {
    try {
      const isTwoHanded = req.params.twoHanded === 'true';
      
      // Use the dedicated storage method for better performance
      const gestures = isTwoHanded ? 
        await storage.getTwoHandedGestures() : 
        await storage.getAllGestures().then(g => g.filter(item => !item.isTwoHanded));
      
      res.json(gestures);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get a specific gesture by id
  app.get("/api/gestures/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid gesture ID" });
      }
      
      const gesture = await storage.getGesture(id);
      if (!gesture) {
        return res.status(404).json({ message: "Gesture not found" });
      }
      
      res.json(gesture);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get a specific gesture by name
  app.get("/api/gestures/name/:name", async (req, res) => {
    try {
      const { name } = req.params;
      if (!name) {
        return res.status(400).json({ message: "Gesture name is required" });
      }
      
      const gesture = await storage.getGestureByName(name);
      if (!gesture) {
        return res.status(404).json({ message: "Gesture not found" });
      }
      
      res.json(gesture);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get gestures by MS-ASL class ID
  app.get("/api/gestures/msasl/:classId", async (req, res) => {
    try {
      const classId = parseInt(req.params.classId);
      if (isNaN(classId)) {
        return res.status(400).json({ message: "Invalid MS-ASL class ID" });
      }
      
      // Get all gestures and filter by MS-ASL class ID
      const allGestures = await storage.getAllGestures();
      const filteredGestures = allGestures.filter(g => g.msaslClass === classId);
      
      if (filteredGestures.length === 0) {
        return res.status(404).json({ message: "No gestures found with the specified MS-ASL class ID" });
      }
      
      res.json(filteredGestures);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create a new gesture
  app.post("/api/gestures", async (req, res) => {
    try {
      const validatedData = insertGestureSchema.parse(req.body);
      const newGesture = await storage.createGesture(validatedData);
      res.status(201).json(newGesture);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update a gesture
  app.patch("/api/gestures/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid gesture ID" });
      }
      
      // Find the gesture first
      const existingGesture = await storage.getGesture(id);
      if (!existingGesture) {
        return res.status(404).json({ message: "Gesture not found" });
      }
      
      // For now, we're trusting the input since we're just for updates from our application
      const updatedGesture = await storage.updateGesture(id, req.body);
      
      // Make sure we set the content type explicitly to prevent express from serving HTML
      res.setHeader('Content-Type', 'application/json');
      res.json(updatedGesture);
    } catch (error: any) {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update a gesture's finger pattern (for improved recognition)
  app.patch("/api/gestures/:id/fingerpattern", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid gesture ID" });
      }
      
      const { fingerPattern } = req.body;
      if (!Array.isArray(fingerPattern) || fingerPattern.length !== 5) {
        return res.status(400).json({ 
          message: "Invalid finger pattern. Must be an array of 5 boolean values." 
        });
      }
      
      const updatedGesture = await storage.updateGestureFingerPattern(id, fingerPattern);
      
      if (!updatedGesture) {
        return res.status(404).json({ message: "Gesture not found" });
      }
      
      res.json(updatedGesture);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get variations for a specific gesture
  app.get("/api/gestures/:id/variations", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid gesture ID" });
      }
      
      const variations = await storage.getGestureVariations(id);
      res.json(variations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Add a variation for a gesture
  app.post("/api/gestures/:id/variations", async (req, res) => {
    try {
      const gestureId = parseInt(req.params.id);
      if (isNaN(gestureId)) {
        return res.status(400).json({ message: "Invalid gesture ID" });
      }
      
      // Make sure the gesture exists first
      const gesture = await storage.getGesture(gestureId);
      if (!gesture) {
        return res.status(404).json({ message: "Gesture not found" });
      }
      
      // Validate the request body
      const validatedData = insertGestureVariationSchema.parse({
        ...req.body,
        gestureId
      });
      
      const newVariation = await storage.addGestureVariation(validatedData);
      res.status(201).json(newVariation);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Get similar gestures for MS-ASL related signs
  app.get("/api/gestures/:id/similar", async (req, res) => {
    try {
      const gestureId = parseInt(req.params.id);
      if (isNaN(gestureId)) {
        return res.status(400).json({ message: "Invalid gesture ID" });
      }
      
      const similarGestures = await storage.getSimilarGestures(gestureId);
      res.json(similarGestures);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get gestures by hand shape for MS-ASL
  app.get("/api/gestures/handshape/:shape", async (req, res) => {
    try {
      const { shape } = req.params;
      if (!shape) {
        return res.status(400).json({ message: "Hand shape parameter is required" });
      }
      
      const gestures = await storage.getGesturesByHandShape(shape);
      res.json(gestures);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get gestures by complexity level for learning progression
  app.get("/api/gestures/complexity/:min/:max", async (req, res) => {
    try {
      const min = parseInt(req.params.min);
      const max = parseInt(req.params.max);
      
      if (isNaN(min) || isNaN(max)) {
        return res.status(400).json({ message: "Min and max complexity must be valid numbers" });
      }
      
      if (min < 1 || max > 5 || min > max) {
        return res.status(400).json({ message: "Min must be ≥ 1, max must be ≤ 5, and min must be ≤ max" });
      }
      
      const gestures = await storage.getGesturesByComplexity(min, max);
      res.json(gestures);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Search gestures by keywords
  app.get("/api/gestures/search/:query", async (req, res) => {
    try {
      const { query } = req.params;
      if (!query || query.trim().length === 0) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const gestures = await storage.searchGestures(query);
      res.json(gestures);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get learning paths for organized learning
  app.get("/api/learningpaths", async (req, res) => {
    try {
      const paths = await storage.getAllLearningPaths();
      res.json(paths);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get gestures for a specific learning path
  app.get("/api/learningpaths/:id/gestures", async (req, res) => {
    try {
      const pathId = parseInt(req.params.id);
      if (isNaN(pathId)) {
        return res.status(400).json({ message: "Invalid learning path ID" });
      }
      
      const gestures = await storage.getLearningPathGestures(pathId);
      res.json(gestures);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get recommended gestures for a user based on their progress
  app.get("/api/users/:userId/recommended", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const count = req.query.count ? parseInt(req.query.count as string) : 5;
      
      const recommendedGestures = await storage.getRecommendedGestures(userId, count);
      res.json(recommendedGestures);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get model performance metrics
  app.get("/api/metrics/model", async (req, res) => {
    try {
      const metrics = await storage.getLatestModelMetrics();
      res.json(metrics || { message: "No metrics data available" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
