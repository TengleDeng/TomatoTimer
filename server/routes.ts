import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertSessionSchema, insertSettingsSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware for Zod validation errors
  const handleZodError = (err: unknown, res: Response) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ 
        message: "Validation error", 
        errors: validationError.details 
      });
    }
    return res.status(500).json({ message: "Internal server error" });
  };

  // Task routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const tasks = await storage.getTasks(userId);
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updates = insertTaskSchema.partial().parse(req.body);
      const updatedTask = await storage.updateTask(id, updates);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteTask(id);
      
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Session routes
  app.get("/api/sessions", async (req, res) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      let sessions;
      
      if (req.query.date) {
        const date = new Date(req.query.date as string);
        sessions = await storage.getSessionsByDate(userId, date);
      } else {
        sessions = await storage.getSessions(userId);
      }
      
      res.json(sessions);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(sessionData);
      
      // Update daily stats when a new session is created
      if (sessionData.type === 'work') {
        if (sessionData.userId !== null) {
          await storage.updateDailyStats(sessionData.userId, {
            completedPomodoros: 1,
            totalFocusTime: sessionData.duration
          });
        }
      }
      
      res.status(201).json(session);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.put("/api/sessions/:id/complete", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const endTime = new Date();
      const updatedSession = await storage.updateSession(id, endTime);
      
      if (!updatedSession) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      res.json(updatedSession);
    } catch (err) {
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const settings = await storage.getSettings(userId);
      
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const settingsData = insertSettingsSchema.parse(req.body);
      const settings = await storage.createSettings(settingsData);
      res.status(201).json(settings);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const userId = req.body.userId;
      const updates = insertSettingsSchema.partial().parse(req.body);
      const updatedSettings = await storage.updateSettings(userId, updates);
      
      if (!updatedSettings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      
      res.json(updatedSettings);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // Stats routes
  app.get("/api/stats/daily", async (req, res) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      let date;
      
      if (req.query.date) {
        date = new Date(req.query.date as string);
      }
      
      const stats = await storage.getDailyStats(userId, date);
      
      if (!stats) {
        return res.json({
          completedPomodoros: 0,
          totalFocusTime: 0,
          tasksCompleted: 0
        });
      }
      
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
