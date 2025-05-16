import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  DEFAULT_WORK_DURATION,
  DEFAULT_BREAK_DURATION,
  DEFAULT_LONG_BREAK_DURATION,
  DEFAULT_SESSIONS_BEFORE_LONG_BREAK,
  SESSION_TYPES,
  STATUS_MESSAGES
} from '@/lib/constants';
import { playNotificationSound, requestNotificationPermission, sendNotification } from '@/lib/utils/timer';

interface TimerContextType {
  timeLeft: number;
  totalTime: number;
  isRunning: boolean;
  isWorkSession: boolean;
  sessionCount: number;
  status: string;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  updateSettings: (settings: {
    workDuration?: number;
    breakDuration?: number;
    longBreakDuration?: number;
    sessionsBeforeLongBreak?: number;
    autoStartBreaks?: boolean;
    autoStartPomodoros?: boolean;
  }) => void;
}

const defaultContext: TimerContextType = {
  timeLeft: DEFAULT_WORK_DURATION,
  totalTime: DEFAULT_WORK_DURATION,
  isRunning: false,
  isWorkSession: true,
  sessionCount: 1,
  status: STATUS_MESSAGES.READY,
  startTimer: () => {},
  pauseTimer: () => {},
  resetTimer: () => {},
  updateSettings: () => {},
};

const TimerContext = createContext<TimerContextType>(defaultContext);

export const useTimer = () => useContext(TimerContext);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_WORK_DURATION);
  const [totalTime, setTotalTime] = useState(DEFAULT_WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [sessionCount, setSessionCount] = useState(1);
  const [status, setStatus] = useState(STATUS_MESSAGES.READY);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  
  // Settings
  const [workDuration, setWorkDuration] = useState(DEFAULT_WORK_DURATION);
  const [breakDuration, setBreakDuration] = useState(DEFAULT_BREAK_DURATION);
  const [longBreakDuration, setLongBreakDuration] = useState(DEFAULT_LONG_BREAK_DURATION);
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(DEFAULT_SESSIONS_BEFORE_LONG_BREAK);
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(false);
  
  const queryClient = useQueryClient();

  // Request notification permission on first render
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Create a new session in the database
  const createSessionMutation = useMutation({
    mutationFn: async ({ type, duration }: { type: string; duration: number }) => {
      const res = await apiRequest("POST", "/api/sessions", {
        userId: 1, // Default demo user
        duration,
        type,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setCurrentSessionId(data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily"] });
    },
  });

  // Complete a session in the database
  const completeSessionMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PUT", `/api/sessions/${id}/complete`);
      return res.json();
    },
    onSuccess: () => {
      setCurrentSessionId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily"] });
    },
  });

  // Update settings
  const updateSettings = useCallback((settings: {
    workDuration?: number;
    breakDuration?: number;
    longBreakDuration?: number;
    sessionsBeforeLongBreak?: number;
    autoStartBreaks?: boolean;
    autoStartPomodoros?: boolean;
  }) => {
    if (settings.workDuration !== undefined) {
      setWorkDuration(settings.workDuration);
      if (isWorkSession && !isRunning) {
        setTimeLeft(settings.workDuration);
        setTotalTime(settings.workDuration);
      }
    }
    
    if (settings.breakDuration !== undefined) {
      setBreakDuration(settings.breakDuration);
      if (!isWorkSession && !isRunning && sessionCount % sessionsBeforeLongBreak !== 0) {
        setTimeLeft(settings.breakDuration);
        setTotalTime(settings.breakDuration);
      }
    }
    
    if (settings.longBreakDuration !== undefined) {
      setLongBreakDuration(settings.longBreakDuration);
      if (!isWorkSession && !isRunning && sessionCount % sessionsBeforeLongBreak === 0) {
        setTimeLeft(settings.longBreakDuration);
        setTotalTime(settings.longBreakDuration);
      }
    }
    
    if (settings.sessionsBeforeLongBreak !== undefined) {
      setSessionsBeforeLongBreak(settings.sessionsBeforeLongBreak);
    }
    
    if (settings.autoStartBreaks !== undefined) {
      setAutoStartBreaks(settings.autoStartBreaks);
    }
    
    if (settings.autoStartPomodoros !== undefined) {
      setAutoStartPomodoros(settings.autoStartPomodoros);
    }
  }, [isRunning, isWorkSession, sessionCount, sessionsBeforeLongBreak]);

  // Switch session type
  const switchSessionType = useCallback(() => {
    // Complete the current session if there is one
    if (currentSessionId !== null) {
      completeSessionMutation.mutate(currentSessionId);
    }

    // Determine if this should be a long break
    const shouldTakeLongBreak = isWorkSession && sessionCount % sessionsBeforeLongBreak === 0;
    
    // Switch session type and update counters
    if (isWorkSession) {
      // Work session completed, switch to break
      setIsWorkSession(false);
      const breakLength = shouldTakeLongBreak ? longBreakDuration : breakDuration;
      setTotalTime(breakLength);
      setTimeLeft(breakLength);
      setStatus(STATUS_MESSAGES.BREAK);
      
      // Notify user
      playNotificationSound();
      sendNotification("Break time!", {
        body: `Take a ${shouldTakeLongBreak ? 'long' : 'short'} break.`,
      });
      
      // Auto-start break if enabled
      if (autoStartBreaks) {
        createSessionMutation.mutate({
          type: 'break',
          duration: breakLength
        });
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    } else {
      // Break completed, switch to work
      setIsWorkSession(true);
      setSessionCount(prev => prev + 1);
      setTotalTime(workDuration);
      setTimeLeft(workDuration);
      setStatus(STATUS_MESSAGES.READY);
      
      // Notify user
      playNotificationSound();
      sendNotification("Focus time!", {
        body: "Time to get back to work.",
      });
      
      // Auto-start pomodoro if enabled
      if (autoStartPomodoros) {
        createSessionMutation.mutate({
          type: 'work',
          duration: workDuration
        });
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    }
  }, [
    isWorkSession, 
    sessionCount, 
    workDuration, 
    breakDuration, 
    longBreakDuration, 
    sessionsBeforeLongBreak,
    autoStartBreaks,
    autoStartPomodoros,
    currentSessionId,
    completeSessionMutation,
    createSessionMutation
  ]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            // Time's up, clear interval and switch session
            if (interval) clearInterval(interval);
            
            // Use setTimeout to ensure state updates before switching
            setTimeout(() => switchSessionType(), 0);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, switchSessionType]);

  // Start timer
  const startTimer = useCallback(() => {
    if (isRunning) return;
    
    setIsRunning(true);
    setStatus(isWorkSession ? STATUS_MESSAGES.FOCUSING : STATUS_MESSAGES.BREAK);
    
    // Create a new session in the database if not already running
    if (currentSessionId === null) {
      createSessionMutation.mutate({
        type: isWorkSession ? 'work' : 'break',
        duration: isWorkSession ? workDuration : breakDuration
      });
    }
  }, [
    isRunning, 
    isWorkSession, 
    currentSessionId, 
    workDuration, 
    breakDuration, 
    createSessionMutation
  ]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    if (!isRunning) return;
    
    setIsRunning(false);
    setStatus(STATUS_MESSAGES.PAUSED);
  }, [isRunning]);

  // Reset timer
  const resetTimer = useCallback(() => {
    // Complete the current session if there is one
    if (currentSessionId !== null) {
      completeSessionMutation.mutate(currentSessionId);
    }
    
    setIsRunning(false);
    setIsWorkSession(true);
    setTimeLeft(workDuration);
    setTotalTime(workDuration);
    setStatus(STATUS_MESSAGES.READY);
  }, [workDuration, currentSessionId, completeSessionMutation]);

  const value = {
    timeLeft,
    totalTime,
    isRunning,
    isWorkSession,
    sessionCount,
    status,
    startTimer,
    pauseTimer,
    resetTimer,
    updateSettings,
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};