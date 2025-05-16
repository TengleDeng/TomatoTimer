import { useEffect, useState } from "react";
import { formatTime } from "@/lib/utils/timer";

interface TimerCircleProps {
  timeLeft: number;
  totalTime: number;
  isRunning: boolean;
  isWorkSession: boolean;
  sessionCount: number;
  status: string;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export default function TimerCircle({
  timeLeft,
  totalTime,
  isRunning,
  isWorkSession,
  sessionCount,
  status,
  onStart,
  onPause,
  onReset
}: TimerCircleProps) {
  const [dashoffset, setDashoffset] = useState(0);
  
  // Constants for SVG circle
  const CIRCLE_RADIUS = 120;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
  
  useEffect(() => {
    // Calculate progress and update dash offset
    const percentage = timeLeft / totalTime;
    const newOffset = CIRCLE_CIRCUMFERENCE * (1 - percentage);
    setDashoffset(newOffset);
  }, [timeLeft, totalTime]);

  return (
    <div className="flex flex-col items-center justify-center flex-grow py-6">
      {/* Session Type Indicator */}
      <div className="mb-2 flex items-center">
        <span className="text-lg font-medium text-primary dark:text-primary">
          {isWorkSession ? "Focus Time" : "Break Time"}
        </span>
        <span className="mx-2">•</span>
        <span className="text-lg">Session {sessionCount}</span>
      </div>
      
      {/* Timer Circle */}
      <div className="relative my-8">
        <svg className="w-64 h-64">
          {/* Background Circle */}
          <circle
            cx="128"
            cy="128"
            r={CIRCLE_RADIUS}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="16"
            className="text-muted dark:text-muted"
          />
          {/* Progress Circle */}
          <circle
            cx="128"
            cy="128"
            r={CIRCLE_RADIUS}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="16"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={dashoffset}
            className={`progress-ring ${
              isWorkSession ? 'text-primary dark:text-primary' : 'text-accent dark:text-accent'
            }`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-light tabular-nums">{formatTime(timeLeft)}</span>
          <span className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
            {status}
          </span>
        </div>
      </div>
      
      {/* Timer Controls */}
      <div className="flex space-x-4">
        {!isRunning ? (
          <button 
            onClick={onStart}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full font-medium flex items-center justify-center transition-colors duration-200"
          >
            <span className="mdi mdi-play mr-2"></span>
            Start
          </button>
        ) : (
          <button 
            onClick={onPause}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground dark:bg-secondary dark:hover:bg-secondary/90 px-4 py-3 rounded-full font-medium flex items-center justify-center transition-colors duration-200"
          >
            <span className="mdi mdi-pause mr-2"></span>
            Pause
          </button>
        )}
        <button 
          onClick={onReset}
          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground dark:bg-secondary dark:hover:bg-secondary/90 px-4 py-3 rounded-full font-medium flex items-center justify-center transition-colors duration-200"
        >
          <span className="mdi mdi-restart mr-2"></span>
          Reset
        </button>
      </div>
    </div>
  );
}
