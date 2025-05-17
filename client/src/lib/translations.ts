// Translations for the application

export type Language = 'zh' | 'en';

// Translation keys type
export interface TranslationKeys {
  [key: string]: string;
}

// All translations for the app
export const translations: Record<Language, TranslationKeys> = {
  zh: {
    // App title and common
    'app.title': '专注番茄钟',
    'app.loading': '加载中...',
    'app.save': '保存',
    'app.cancel': '取消',
    'app.delete': '删除',
    'app.edit': '编辑',
    'app.add': '添加',
    'app.close': '关闭',
    
    // Navigation
    'nav.timer': '计时器',
    'nav.tasks': '任务',
    'nav.stats': '统计',
    'nav.settings': '设置',
    
    // Timer Page
    'timer.title': '计时器设置',
    'timer.start': '开始',
    'timer.pause': '暂停',
    'timer.reset': '重置',
    'timer.focus': '专注',
    'timer.break': '休息',
    'timer.longBreak': '长休息',
    'timer.session': '专注次数',
    'timer.timeLeft': '剩余时间',
    'timer.nextSession': '下一个会话',
    'timer.finishSession': '会话已完成',
    
    // Timer Status Messages
    'timer.status.ready': '准备开始专注',
    'timer.status.focusing': '正在专注...',
    'timer.status.paused': '已暂停',
    'timer.status.break': '休息时间',
    'timer.status.longBreak': '长休息时间',
    
    // Tasks Page
    'tasks.title': '任务列表',
    'tasks.addTask': '添加任务',
    'tasks.noTasks': '没有任务',
    'tasks.completed': '已完成',
    'tasks.active': '进行中',
    'tasks.taskName': '任务名称',
    'tasks.addTaskPlaceholder': '添加新任务...',
    'tasks.markComplete': '标记为已完成',
    'tasks.markIncomplete': '标记为未完成',
    
    // Stats Page
    'stats.title': '统计数据',
    'stats.today': '今日',
    'stats.week': '本周',
    'stats.month': '本月',
    'stats.completedPomodoros': '已完成番茄数',
    'stats.totalFocusTime': '总专注时间',
    'stats.tasksCompleted': '已完成任务',
    'stats.minutesShort': '分钟',
    'stats.hoursShort': '小时',
    'stats.noData': '暂无数据',
    
    // Settings Page
    'settings.title': '设置',
    'settings.workDuration': '工作时长',
    'settings.breakDuration': '休息时长',
    'settings.longBreakDuration': '长休息时长',
    'settings.sessionsBeforeLongBreak': '长休息前的工作次数',
    'settings.autoStartBreaks': '自动开始休息',
    'settings.autoStartPomodoros': '休息后自动开始专注',
    'settings.language': '语言',
    'settings.minutes': '分钟',
    'settings.sessions': '次',
    'settings.darkMode': '深色模式',
    'settings.notifications': '通知提醒',
    'settings.sound': '声音提醒',
    'settings.saveSuccess': '设置已保存',
    
    // Language options
    'language.en': '英文 (English)',
    'language.zh': '中文 (Chinese)'
  },
  en: {
    // App title and common
    'app.title': 'Focus Pomodoro',
    'app.loading': 'Loading...',
    'app.save': 'Save',
    'app.cancel': 'Cancel',
    'app.delete': 'Delete',
    'app.edit': 'Edit',
    'app.add': 'Add',
    'app.close': 'Close',
    
    // Navigation
    'nav.timer': 'Timer',
    'nav.tasks': 'Tasks',
    'nav.stats': 'Stats',
    'nav.settings': 'Settings',
    
    // Timer Page
    'timer.title': 'Timer Settings',
    'timer.start': 'Start',
    'timer.pause': 'Pause',
    'timer.reset': 'Reset',
    'timer.focus': 'Focus',
    'timer.break': 'Break',
    'timer.longBreak': 'Long Break',
    'timer.session': 'Session',
    'timer.timeLeft': 'Time Left',
    'timer.nextSession': 'Next Session',
    'timer.finishSession': 'Session Completed',
    
    // Timer Status Messages
    'timer.status.ready': 'Ready to Focus',
    'timer.status.focusing': 'Focusing...',
    'timer.status.paused': 'Paused',
    'timer.status.break': 'Break Time',
    'timer.status.longBreak': 'Long Break Time',
    
    // Tasks Page
    'tasks.title': 'Task List',
    'tasks.addTask': 'Add Task',
    'tasks.noTasks': 'No Tasks',
    'tasks.completed': 'Completed',
    'tasks.active': 'Active',
    'tasks.taskName': 'Task Name',
    'tasks.addTaskPlaceholder': 'Add a new task...',
    'tasks.markComplete': 'Mark as complete',
    'tasks.markIncomplete': 'Mark as incomplete',
    
    // Stats Page
    'stats.title': 'Statistics',
    'stats.today': 'Today',
    'stats.week': 'This Week',
    'stats.month': 'This Month',
    'stats.completedPomodoros': 'Completed Pomodoros',
    'stats.totalFocusTime': 'Total Focus Time',
    'stats.tasksCompleted': 'Tasks Completed',
    'stats.minutesShort': 'min',
    'stats.hoursShort': 'hrs',
    'stats.noData': 'No data available',
    
    // Settings Page
    'settings.title': 'Settings',
    'settings.workDuration': 'Work Duration',
    'settings.breakDuration': 'Break Duration',
    'settings.longBreakDuration': 'Long Break Duration',
    'settings.sessionsBeforeLongBreak': 'Sessions Before Long Break',
    'settings.autoStartBreaks': 'Auto-start Breaks',
    'settings.autoStartPomodoros': 'Auto-start Pomodoros',
    'settings.language': 'Language',
    'settings.minutes': 'minutes',
    'settings.sessions': 'sessions',
    'settings.darkMode': 'Dark Mode',
    'settings.notifications': 'Notifications',
    'settings.sound': 'Sound Alerts',
    'settings.saveSuccess': 'Settings saved',
    
    // Language options
    'language.en': 'English',
    'language.zh': 'Chinese (中文)'
  }
};