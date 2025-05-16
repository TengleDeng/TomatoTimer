import { 
  users, type User, type InsertUser,
  tasks, type Task, type InsertTask,
  sessions, type Session, type InsertSession,
  settings, type Settings, type InsertSettings,
  dailyStats, type DailyStats, type InsertDailyStats
} from "@shared/schema";

// Modify the interface with any CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Task methods
  getTasks(userId?: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Session methods
  getSessions(userId?: number): Promise<Session[]>;
  getSession(id: number): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, endTime: Date): Promise<Session | undefined>;
  getSessionsByDate(userId: number | undefined, date: Date): Promise<Session[]>;

  // Settings methods
  getSettings(userId?: number): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(userId: number | undefined, settings: Partial<InsertSettings>): Promise<Settings | undefined>;

  // Stats methods
  getDailyStats(userId?: number, date?: Date): Promise<DailyStats | undefined>;
  createOrUpdateDailyStats(stats: InsertDailyStats): Promise<DailyStats>;
  updateDailyStats(userId: number | undefined, updates: Partial<InsertDailyStats>): Promise<DailyStats | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private sessions: Map<number, Session>;
  private settings: Map<number, Settings>;
  private dailyStats: Map<string, DailyStats>;
  
  userCurrentId: number;
  taskCurrentId: number;
  sessionCurrentId: number;
  settingsCurrentId: number;
  dailyStatsCurrentId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.sessions = new Map();
    this.settings = new Map();
    this.dailyStats = new Map();
    
    this.userCurrentId = 1;
    this.taskCurrentId = 1;
    this.sessionCurrentId = 1;
    this.settingsCurrentId = 1;
    this.dailyStatsCurrentId = 1;

    // Create default user
    this.createUser({
      username: "demo",
      password: "demo"
    });

    // Create default settings for the demo user
    this.createSettings({
      userId: 1,
      workDuration: 25 * 60,
      breakDuration: 5 * 60,
      longBreakDuration: 15 * 60,
      sessionsBeforeLongBreak: 4,
      autoStartBreaks: true,
      autoStartPomodoros: true,
      darkMode: false
    });
  }

  // User methods
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

  // Task methods
  async getTasks(userId?: number): Promise<Task[]> {
    if (userId) {
      return Array.from(this.tasks.values()).filter(task => task.userId === userId);
    }
    return Array.from(this.tasks.values());
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskCurrentId++;
    const createdAt = new Date();
    const newTask: Task = { 
      id, 
      createdAt, 
      title: task.title, 
      completed: task.completed || false,
      userId: task.userId || null 
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask: Task = { ...task, ...updates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Session methods
  async getSessions(userId?: number): Promise<Session[]> {
    if (userId) {
      return Array.from(this.sessions.values()).filter(session => session.userId === userId);
    }
    return Array.from(this.sessions.values());
  }

  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async createSession(session: InsertSession): Promise<Session> {
    const id = this.sessionCurrentId++;
    const startTime = new Date();
    const newSession: Session = { 
      id, 
      startTime, 
      endTime: null, 
      type: session.type, 
      duration: session.duration,
      userId: session.userId || null 
    };
    this.sessions.set(id, newSession);
    return newSession;
  }

  async updateSession(id: number, endTime: Date): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updatedSession: Session = { ...session, endTime };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async getSessionsByDate(userId: number | undefined, date: Date): Promise<Session[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return Array.from(this.sessions.values()).filter(session => {
      const sessionDate = new Date(session.startTime);
      return (
        sessionDate >= startOfDay && 
        sessionDate <= endOfDay &&
        (userId === undefined || session.userId === userId)
      );
    });
  }

  // Settings methods
  async getSettings(userId?: number): Promise<Settings | undefined> {
    if (userId) {
      return Array.from(this.settings.values()).find(setting => setting.userId === userId);
    }
    
    // Return default settings if no userId is provided
    return Array.from(this.settings.values())[0];
  }

  async createSettings(settingsData: InsertSettings): Promise<Settings> {
    const id = this.settingsCurrentId++;
    const newSettings: Settings = { 
      id,
      userId: settingsData.userId || null,
      workDuration: settingsData.workDuration || 25 * 60,
      breakDuration: settingsData.breakDuration || 5 * 60,
      longBreakDuration: settingsData.longBreakDuration || 15 * 60,
      sessionsBeforeLongBreak: settingsData.sessionsBeforeLongBreak || 4,
      autoStartBreaks: settingsData.autoStartBreaks || false,
      autoStartPomodoros: settingsData.autoStartPomodoros || false,
      darkMode: settingsData.darkMode || false
    };
    this.settings.set(id, newSettings);
    return newSettings;
  }

  async updateSettings(userId: number | undefined, updates: Partial<InsertSettings>): Promise<Settings | undefined> {
    if (!userId) return undefined;
    
    const userSettings = Array.from(this.settings.values()).find(
      setting => setting.userId === userId
    );
    
    if (!userSettings) return undefined;
    
    const updatedSettings: Settings = { ...userSettings, ...updates };
    this.settings.set(userSettings.id, updatedSettings);
    return updatedSettings;
  }

  // Stats methods
  async getDailyStats(userId?: number, date?: Date): Promise<DailyStats | undefined> {
    date = date || new Date();
    const dateKey = this.getDateKey(userId || null, date);
    return this.dailyStats.get(dateKey);
  }

  async createOrUpdateDailyStats(stats: InsertDailyStats): Promise<DailyStats> {
    const date = new Date();
    const dateKey = this.getDateKey(stats.userId, date);
    
    const existingStats = this.dailyStats.get(dateKey);
    
    if (existingStats) {
      const updatedStats: DailyStats = {
        ...existingStats,
        completedPomodoros: stats.completedPomodoros !== undefined ? stats.completedPomodoros : existingStats.completedPomodoros,
        totalFocusTime: stats.totalFocusTime !== undefined ? stats.totalFocusTime : existingStats.totalFocusTime,
        tasksCompleted: stats.tasksCompleted !== undefined ? stats.tasksCompleted : existingStats.tasksCompleted
      };
      
      this.dailyStats.set(dateKey, updatedStats);
      return updatedStats;
    } else {
      const id = this.dailyStatsCurrentId++;
      const newStats: DailyStats = { 
        id, 
        date,
        userId: stats.userId || null,
        completedPomodoros: stats.completedPomodoros || 0,
        totalFocusTime: stats.totalFocusTime || 0,
        tasksCompleted: stats.tasksCompleted || 0
      };
      this.dailyStats.set(dateKey, newStats);
      return newStats;
    }
  }

  async updateDailyStats(userId: number | undefined, updates: Partial<InsertDailyStats>): Promise<DailyStats | undefined> {
    if (!userId) return undefined;
    
    const date = new Date();
    const dateKey = this.getDateKey(userId, date);
    
    const existingStats = this.dailyStats.get(dateKey);
    
    if (!existingStats) {
      const newStats: InsertDailyStats = {
        userId,
        completedPomodoros: updates.completedPomodoros || 0,
        totalFocusTime: updates.totalFocusTime || 0,
        tasksCompleted: updates.tasksCompleted || 0
      };
      
      return this.createOrUpdateDailyStats(newStats);
    }
    
    const updatedStats: DailyStats = { ...existingStats, ...updates };
    this.dailyStats.set(dateKey, updatedStats);
    return updatedStats;
  }

  // Helper method to generate a unique key for daily stats
  private getDateKey(userId: number | null | undefined, date: Date): string {
    const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return `${userId || 'anonymous'}-${formattedDate}`;
  }
}

export const storage = new MemStorage();
