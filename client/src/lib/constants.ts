// Timer defaults (in seconds)
export const DEFAULT_WORK_DURATION = 25 * 60; // 25 minutes
export const DEFAULT_BREAK_DURATION = 5 * 60; // 5 minutes
export const DEFAULT_LONG_BREAK_DURATION = 15 * 60; // 15 minutes
export const DEFAULT_SESSIONS_BEFORE_LONG_BREAK = 4;

// Session types
export const SESSION_TYPES = {
  WORK: 'work',
  BREAK: 'break',
  LONG_BREAK: 'longBreak'
};

// Status messages
export const STATUS_MESSAGES = {
  READY: 'Ready to start',
  FOCUSING: 'Focusing...',
  BREAK: 'Take a break!',
  PAUSED: 'Paused',
  COMPLETED: 'Session complete! Start next?'
};

// Audio
export const AUDIO_NOTIFICATIONS = {
  SESSION_COMPLETE: 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-alert-notification-258.mp3',
  BREAK_COMPLETE: 'https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3'
};

// LocalStorage keys
export const STORAGE_KEYS = {
  THEME: 'pomodoro-theme',
  SETTINGS: 'pomodoro-settings'
};
