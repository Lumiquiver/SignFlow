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
  
  // Get gestures by type (alphabet or phrase)
  app.get("/api/gestures/type/:type", async (req, res) => {
    try {
      const { type } = req.params;
      if (!type || (type !== "alphabet" && type !== "phrase")) {
        return res.status(400).json({ message: "Invalid gesture type. Must be 'alphabet' or 'phrase'." });
      }
      
      const gestures = await storage.getGesturesByType(type);
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
