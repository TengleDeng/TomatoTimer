import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table (remains the same from the template)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Tasks for Pomodoro
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  userId: integer("user_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  completed: true,
  userId: true,
});

// Pomodoro Sessions
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  duration: integer("duration").notNull(), // duration in seconds
  type: text("type").notNull(), // 'work' or 'break'
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  userId: true,
  duration: true,
  type: true,
});

// Settings for Pomodoro
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  workDuration: integer("work_duration").notNull().default(25 * 60), // default 25 minutes in seconds
  breakDuration: integer("break_duration").notNull().default(5 * 60), // default 5 minutes in seconds
  longBreakDuration: integer("long_break_duration").notNull().default(15 * 60), // default 15 minutes
  sessionsBeforeLongBreak: integer("sessions_before_long_break").notNull().default(4),
  autoStartBreaks: boolean("auto_start_breaks").notNull().default(true),
  autoStartPomodoros: boolean("auto_start_pomodoros").notNull().default(true),
  darkMode: boolean("dark_mode").notNull().default(false),
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  userId: true,
  workDuration: true,
  breakDuration: true,
  longBreakDuration: true,
  sessionsBeforeLongBreak: true,
  autoStartBreaks: true,
  autoStartPomodoros: true,
  darkMode: true,
});

// Daily Stats
export const dailyStats = pgTable("daily_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  date: timestamp("date").notNull().defaultNow(),
  completedPomodoros: integer("completed_pomodoros").notNull().default(0),
  totalFocusTime: integer("total_focus_time").notNull().default(0), // total focus time in seconds
  tasksCompleted: integer("tasks_completed").notNull().default(0),
});

export const insertDailyStatsSchema = createInsertSchema(dailyStats).pick({
  userId: true,
  completedPomodoros: true,
  totalFocusTime: true,
  tasksCompleted: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

export type DailyStats = typeof dailyStats.$inferSelect;
export type InsertDailyStats = z.infer<typeof insertDailyStatsSchema>;
