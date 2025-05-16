import { useEffect } from "react";
import { usePomodoro } from "@/hooks/use-pomodoro";
import TimerCircle from "@/components/timer-circle";
import TaskList from "@/components/task-list";
import StatisticsCard from "@/components/statistics-card";
import { useQuery } from "@tanstack/react-query";
import { Settings, DailyStats } from "@shared/schema";

export default function Timer() {
  // Fetch user settings
  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  // Fetch daily stats
  const { data: stats } = useQuery<DailyStats>({
    queryKey: ["/api/stats/daily"],
  });

  // Initialize pomodoro timer with settings
  const { 
    timeLeft, 
    totalTime, 
    isRunning, 
    isWorkSession, 
    sessionCount, 
    status, 
    startTimer, 
    pauseTimer, 
    resetTimer 
  } = usePomodoro({
    workDuration: settings?.workDuration || 25 * 60,
    breakDuration: settings?.breakDuration || 5 * 60,
    longBreakDuration: settings?.longBreakDuration || 15 * 60,
    sessionsBeforeLongBreak: settings?.sessionsBeforeLongBreak || 4,
    autoStartBreaks: settings?.autoStartBreaks || false,
    autoStartPomodoros: settings?.autoStartPomodoros || false,
  });

  return (
    <>
      <header className="py-4 flex justify-between items-center">
        <h1 className="text-2xl font-medium text-primary dark:text-primary">Pomodoro Timer</h1>
      </header>

      <TimerCircle
        timeLeft={timeLeft}
        totalTime={totalTime}
        isRunning={isRunning}
        isWorkSession={isWorkSession}
        sessionCount={sessionCount}
        status={status}
        onStart={startTimer}
        onPause={pauseTimer}
        onReset={resetTimer}
      />

      <TaskList />

      <StatisticsCard 
        completedPomodoros={stats?.completedPomodoros || 0}
        totalFocusTime={stats?.totalFocusTime || 0}
      />

      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Productivity Tips</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl overflow-hidden shadow-md aspect-square">
            <img 
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600" 
              alt="Productive workspace with computer" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="rounded-xl overflow-hidden shadow-md aspect-square">
            <img 
              src="https://pixabay.com/get/g43bc57d13d6260a451c6569cb8c40bd1592f8ba76764ee7e00332e71c6315905cfe01cc4393eff1cd0cd023f788c0df9b8029433f9ae8b68c2df4cc84275ef99_1280.jpg" 
              alt="Time management concept" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </>
  );
}
