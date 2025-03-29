import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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

  const httpServer = createServer(app);

  return httpServer;
}
