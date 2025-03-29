import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGestureSchema, insertGestureVariationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes for gesture data
  
  // Get all gestures
  app.get("/api/gestures", async (req, res) => {
    try {
      const gestures = await storage.getAllGestures();
      res.json(gestures);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
      
      // Get all gestures and filter by category (since we don't have direct storage method for this)
      const allGestures = await storage.getAllGestures();
      const filteredGestures = allGestures.filter(g => g.category === category);
      
      res.json(filteredGestures);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get gestures by motion capability (for MS-ASL)
  app.get("/api/gestures/motion/:hasMotion", async (req, res) => {
    try {
      const hasMotion = req.params.hasMotion === 'true';
      
      // Get all gestures and filter by motion capability
      const allGestures = await storage.getAllGestures();
      const filteredGestures = allGestures.filter(g => g.hasMotion === hasMotion);
      
      res.json(filteredGestures);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get gestures by hands required (for MS-ASL)
  app.get("/api/gestures/hands/:twoHanded", async (req, res) => {
    try {
      const isTwoHanded = req.params.twoHanded === 'true';
      
      // Get all gestures and filter by hands required
      const allGestures = await storage.getAllGestures();
      const filteredGestures = allGestures.filter(g => g.isTwoHanded === isTwoHanded);
      
      res.json(filteredGestures);
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

  const httpServer = createServer(app);

  return httpServer;
}
