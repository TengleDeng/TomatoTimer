// Format time as MM:SS
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Format focus time for display in statistics (e.g., "1h 15m")
export function formatFocusTime(seconds: number): string {
  if (seconds === 0) return "0m";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
}

// Format session type
export function formatSessionType(type: string): string {
  if (type === 'work') return 'Focus';
  if (type === 'break') return 'Short Break';
  if (type === 'longBreak') return 'Long Break';
  return type;
}

// Try to play a notification sound
export function playNotificationSound() {
  try {
    const audio = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-software-interface-alert-notification-258.mp3");
    audio.volume = 0.5;
    audio.play();
  } catch (error) {
    console.error("Failed to play notification sound:", error);
  }
}

// Request browser notification permission
export function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return Promise.resolve(false);
  }
  
  if (Notification.permission === 'granted') {
    return Promise.resolve(true);
  }
  
  if (Notification.permission !== 'denied') {
    return Notification.requestPermission().then(permission => {
      return permission === 'granted';
    });
  }
  
  return Promise.resolve(false);
}

// Send a browser notification
export function sendNotification(title: string, options: NotificationOptions = {}) {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: 'https://img.icons8.com/color/48/000000/tomato.png',
      ...options
    });
    
    return notification;
  }
  
  return null;
}
