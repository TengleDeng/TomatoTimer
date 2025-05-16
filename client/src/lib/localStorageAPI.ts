import { 
  Task, InsertTask, 
  Session, InsertSession, 
  Settings, InsertSettings, 
  DailyStats, InsertDailyStats 
} from "@shared/schema";

// Storage keys for localStorage
const STORAGE_KEYS = {
  TASKS: 'pomodoro-tasks',
  SESSIONS: 'pomodoro-sessions',
  SETTINGS: 'pomodoro-settings',
  DAILY_STATS: 'pomodoro-daily-stats',
};

// Default user ID for local storage
const DEFAULT_USER_ID = 1;

// Helper functions for localStorage operations
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting item from localStorage: ${key}`, error);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item in localStorage: ${key}`, error);
  }
}

// Format date to YYYY-MM-DD for use as keys
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Task methods
export const TasksAPI = {
  getTasks: (userId: number = DEFAULT_USER_ID): Promise<Task[]> => {
    return new Promise((resolve) => {
      const tasks = getItem<Task[]>(STORAGE_KEYS.TASKS, []);
      resolve(tasks.filter(task => task.userId === userId));
    });
  },

  getTask: (id: number): Promise<Task | undefined> => {
    return new Promise((resolve) => {
      const tasks = getItem<Task[]>(STORAGE_KEYS.TASKS, []);
      resolve(tasks.find(task => task.id === id));
    });
  },

  createTask: (task: InsertTask): Promise<Task> => {
    return new Promise((resolve) => {
      const tasks = getItem<Task[]>(STORAGE_KEYS.TASKS, []);
      const id = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
      const newTask: Task = {
        id,
        title: task.title,
        completed: task.completed || false,
        userId: task.userId || DEFAULT_USER_ID,
        createdAt: new Date()
      };
      
      tasks.push(newTask);
      setItem(STORAGE_KEYS.TASKS, tasks);
      resolve(newTask);
    });
  },

  updateTask: (id: number, updates: Partial<InsertTask>): Promise<Task | undefined> => {
    return new Promise((resolve) => {
      const tasks = getItem<Task[]>(STORAGE_KEYS.TASKS, []);
      const index = tasks.findIndex(task => task.id === id);
      
      if (index === -1) {
        resolve(undefined);
        return;
      }
      
      const updatedTask = { ...tasks[index], ...updates };
      tasks[index] = updatedTask;
      setItem(STORAGE_KEYS.TASKS, tasks);
      resolve(updatedTask);
    });
  },

  deleteTask: (id: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const tasks = getItem<Task[]>(STORAGE_KEYS.TASKS, []);
      const index = tasks.findIndex(task => task.id === id);
      
      if (index === -1) {
        resolve(false);
        return;
      }
      
      tasks.splice(index, 1);
      setItem(STORAGE_KEYS.TASKS, tasks);
      resolve(true);
    });
  }
};

// Session methods
export const SessionsAPI = {
  getSessions: (userId: number = DEFAULT_USER_ID): Promise<Session[]> => {
    return new Promise((resolve) => {
      const sessions = getItem<Session[]>(STORAGE_KEYS.SESSIONS, []);
      resolve(sessions.filter(session => session.userId === userId));
    });
  },

  getSession: (id: number): Promise<Session | undefined> => {
    return new Promise((resolve) => {
      const sessions = getItem<Session[]>(STORAGE_KEYS.SESSIONS, []);
      resolve(sessions.find(session => session.id === id));
    });
  },

  createSession: (session: InsertSession): Promise<Session> => {
    return new Promise((resolve) => {
      const sessions = getItem<Session[]>(STORAGE_KEYS.SESSIONS, []);
      const id = sessions.length > 0 ? Math.max(...sessions.map(s => s.id)) + 1 : 1;
      const newSession: Session = {
        id,
        type: session.type,
        duration: session.duration,
        userId: session.userId || DEFAULT_USER_ID,
        startTime: new Date(),
        endTime: null
      };
      
      sessions.push(newSession);
      setItem(STORAGE_KEYS.SESSIONS, sessions);
      
      // Update daily stats
      if (session.type === 'work') {
        DailyStatsAPI.updateDailyStats(session.userId, {
          completedPomodoros: 1,
          totalFocusTime: session.duration
        });
      }
      
      resolve(newSession);
    });
  },

  updateSession: (id: number, endTime: Date): Promise<Session | undefined> => {
    return new Promise((resolve) => {
      const sessions = getItem<Session[]>(STORAGE_KEYS.SESSIONS, []);
      const index = sessions.findIndex(session => session.id === id);
      
      if (index === -1) {
        resolve(undefined);
        return;
      }
      
      const updatedSession = { ...sessions[index], endTime };
      sessions[index] = updatedSession;
      setItem(STORAGE_KEYS.SESSIONS, sessions);
      resolve(updatedSession);
    });
  },

  getSessionsByDate: (userId: number = DEFAULT_USER_ID, date: Date): Promise<Session[]> => {
    return new Promise((resolve) => {
      const sessions = getItem<Session[]>(STORAGE_KEYS.SESSIONS, []);
      const dateStr = formatDate(date);
      
      resolve(sessions.filter(session => {
        const sessionDate = formatDate(new Date(session.startTime));
        return sessionDate === dateStr && session.userId === userId;
      }));
    });
  }
};

// Settings methods
export const SettingsAPI = {
  getSettings: (userId: number = DEFAULT_USER_ID): Promise<Settings | undefined> => {
    return new Promise((resolve) => {
      const allSettings = getItem<Settings[]>(STORAGE_KEYS.SETTINGS, []);
      let settings = allSettings.find(s => s.userId === userId);
      
      if (!settings && allSettings.length > 0) {
        // Return first settings if no user-specific settings found
        settings = allSettings[0];
      }
      
      // If no settings at all, create default settings
      if (!settings) {
        settings = {
          id: 1,
          userId: userId,
          workDuration: 25 * 60,
          breakDuration: 5 * 60,
          longBreakDuration: 15 * 60,
          sessionsBeforeLongBreak: 4,
          autoStartBreaks: false,
          autoStartPomodoros: false,
          darkMode: false
        };
        
        allSettings.push(settings);
        setItem(STORAGE_KEYS.SETTINGS, allSettings);
      }
      
      resolve(settings);
    });
  },

  createSettings: (settings: InsertSettings): Promise<Settings> => {
    return new Promise((resolve) => {
      const allSettings = getItem<Settings[]>(STORAGE_KEYS.SETTINGS, []);
      const id = allSettings.length > 0 ? Math.max(...allSettings.map(s => s.id)) + 1 : 1;
      
      const newSettings: Settings = {
        id,
        userId: settings.userId || DEFAULT_USER_ID,
        workDuration: settings.workDuration || 25 * 60,
        breakDuration: settings.breakDuration || 5 * 60,
        longBreakDuration: settings.longBreakDuration || 15 * 60,
        sessionsBeforeLongBreak: settings.sessionsBeforeLongBreak || 4,
        autoStartBreaks: settings.autoStartBreaks || false,
        autoStartPomodoros: settings.autoStartPomodoros || false,
        darkMode: settings.darkMode || false
      };
      
      allSettings.push(newSettings);
      setItem(STORAGE_KEYS.SETTINGS, allSettings);
      resolve(newSettings);
    });
  },

  updateSettings: (userId: number = DEFAULT_USER_ID, updates: Partial<InsertSettings>): Promise<Settings | undefined> => {
    return new Promise((resolve) => {
      const allSettings = getItem<Settings[]>(STORAGE_KEYS.SETTINGS, []);
      const index = allSettings.findIndex(s => s.userId === userId);
      
      if (index === -1) {
        // Create new settings if not found
        this.createSettings({ ...updates, userId }).then(resolve);
        return;
      }
      
      const updatedSettings = { ...allSettings[index], ...updates };
      allSettings[index] = updatedSettings;
      setItem(STORAGE_KEYS.SETTINGS, allSettings);
      resolve(updatedSettings);
    });
  }
};

// Daily stats methods
export const DailyStatsAPI = {
  getDailyStats: (userId: number = DEFAULT_USER_ID, date: Date = new Date()): Promise<DailyStats | undefined> => {
    return new Promise((resolve) => {
      const allStats = getItem<DailyStats[]>(STORAGE_KEYS.DAILY_STATS, []);
      const dateStr = formatDate(date);
      
      const stats = allStats.find(s => 
        s.userId === userId && formatDate(new Date(s.date)) === dateStr
      );
      
      if (!stats) {
        // Return empty stats
        resolve({
          id: 0,
          userId,
          date,
          completedPomodoros: 0,
          totalFocusTime: 0,
          tasksCompleted: 0
        });
        return;
      }
      
      resolve(stats);
    });
  },

  updateDailyStats: (userId: number = DEFAULT_USER_ID, updates: Partial<InsertDailyStats>): Promise<DailyStats | undefined> => {
    return new Promise((resolve) => {
      const allStats = getItem<DailyStats[]>(STORAGE_KEYS.DAILY_STATS, []);
      const date = new Date();
      const dateStr = formatDate(date);
      
      // Find existing stats for today
      const index = allStats.findIndex(s => 
        s.userId === userId && formatDate(new Date(s.date)) === dateStr
      );
      
      if (index === -1) {
        // Create new stats if not found
        const id = allStats.length > 0 ? Math.max(...allStats.map(s => s.id)) + 1 : 1;
        const newStats: DailyStats = {
          id,
          userId,
          date,
          completedPomodoros: updates.completedPomodoros || 0,
          totalFocusTime: updates.totalFocusTime || 0,
          tasksCompleted: updates.tasksCompleted || 0
        };
        
        allStats.push(newStats);
        setItem(STORAGE_KEYS.DAILY_STATS, allStats);
        resolve(newStats);
        return;
      }
      
      // Update existing stats
      const existingStats = allStats[index];
      const updatedStats: DailyStats = { 
        ...existingStats,
        completedPomodoros: (existingStats.completedPomodoros || 0) + (updates.completedPomodoros || 0),
        totalFocusTime: (existingStats.totalFocusTime || 0) + (updates.totalFocusTime || 0),
        tasksCompleted: (existingStats.tasksCompleted || 0) + (updates.tasksCompleted || 0)
      };
      
      allStats[index] = updatedStats;
      setItem(STORAGE_KEYS.DAILY_STATS, allStats);
      resolve(updatedStats);
    });
  }
};

// Export all APIs as a single object
export const LocalStorageAPI = {
  tasks: TasksAPI,
  sessions: SessionsAPI,
  settings: SettingsAPI,
  dailyStats: DailyStatsAPI
};