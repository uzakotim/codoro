import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getData, setData, deleteData, launchEditor } from './helpers';
import useSound from 'use-sound';

interface TimerContextType {
  timer: number;
  isRunning: boolean;
  currentPhase: string;
  settings: typeof defaultSettings;
  pomodoroCount: number;
  completedPomodoros: Date[];
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipPhase: () => void;
  updateSettings: (newSettings: Partial<typeof defaultSettings>) => void;
}
const TimerContext = createContext<TimerContextType | null>(null);

const defaultSettings = {
  pomodoroDuration: 25 * 60, // 25 minutes
  shortBreakDuration: 5 * 60,  // 5 minutes
  longBreakDuration: 15 * 60, // 15 minutes
  pomodorosBeforeLongBreak: 4,
  codeEditor: 'Visual Studio Code', // default code editor command
  focusOnShortcut: 'Enable Do Not Disturb',
  focusOffShortcut: 'Disable Do Not Disturb',
};

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
    const [settings, setSettings] = useState(defaultSettings);
    const [completedPomodoros, setCompletedPomodoros] = useState<Date[]>([]);

    const [currentPhase, setCurrentPhase] = useState('pomodoro'); // 'pomodoro', 'shortBreak', 'longBreak'
    const [timer, setTimer] = useState(settings.pomodoroDuration);
    const [isRunning, setIsRunning] = useState(false);
    const [pomodoroCount, setPomodoroCount] = useState(0); // Completed pomodoros in current cycle
    const [play] = useSound('/sounds/new-notification.mp3', { volume: 0.5 });

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const resetAll = async () => {
        await deleteData('pomodoroSettings');
        await deleteData('completedPomodoros');
        setSettings(defaultSettings);
        setCompletedPomodoros([]);
    };


    useEffect(() => {
        let active = true;

        (async () => {
            const savedSettings = await getData('pomodoroSettings', defaultSettings);
            const savedCompleted = await getData('completedPomodoros', []);

            if (!active) return;
            setSettings(savedSettings);
            setCompletedPomodoros(savedCompleted.map((time: string) => new Date(time)));
        })();

        return () => { active = false; };
    }, []);

    useEffect(() => {
        setData('pomodoroSettings', settings);
    }, [settings]);

    useEffect(() => {
        setData('completedPomodoros', completedPomodoros);
    }, [completedPomodoros]);

  // Effect to manage timer countdown
  useEffect(() => {
    if (isRunning && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      // Phase transition logic is now also triggered by `skipPhase` which is called when timer hits 0
      // Play sound
      play();
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timer,play]);

  // Effect to update timer when settings change or phase changes
  useEffect(() => {
    resetTimer(); // Ensure timer reflects new settings or current phase initial duration
  }, [currentPhase, settings]); // Depend on currentPhase and settings

  const startTimer = useCallback(() => {
    if (currentPhase === 'pomodoro') {
      console.log(`Starting pomodoro, launching editor: ${settings.codeEditor}`);
      launchEditor(settings.codeEditor); // Launch code editor when starting a pomodoro
    }
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    switch (currentPhase) {
      case 'pomodoro':
        setTimer(settings.pomodoroDuration);
        break;
      case 'shortBreak':
        setTimer(settings.shortBreakDuration);
        break;
      case 'longBreak':
        setTimer(settings.longBreakDuration);
        break;
      default:
        setTimer(settings.pomodoroDuration);
    }
  }, [currentPhase, settings]);

  const skipPhase = useCallback(() => {
    setIsRunning(false);
    let nextPhase = currentPhase;
    let nextTimer = 0;
    let nextPomodoroCount = pomodoroCount;

    if (currentPhase === 'pomodoro') {
      setCompletedPomodoros(prev => [...prev, new Date()]); // Mark pomodoro as completed
      nextPomodoroCount++;
      if (nextPomodoroCount % settings.pomodorosBeforeLongBreak === 0) {
        nextPhase = 'longBreak';
        nextTimer = settings.longBreakDuration;
      } else {
        nextPhase = 'shortBreak';
        nextTimer = settings.shortBreakDuration;
      }
    } else { // It's a break (shortBreak or longBreak)
      nextPhase = 'pomodoro';
      nextTimer = settings.pomodoroDuration;
      if (currentPhase === 'longBreak') {
        nextPomodoroCount = 0; // Reset pomodoro count after a long break cycle
      }
    }

    setCurrentPhase(nextPhase);
    setTimer(nextTimer);
    setPomodoroCount(nextPomodoroCount);

    // Optionally auto-start next phase:
    // setIsRunning(true);
  }, [currentPhase, pomodoroCount, settings]);

  const updateSettings = useCallback((newSettings) => {
    // Ensure durations are in seconds
    const updatedSettings = {
      ...newSettings,
      pomodoroDuration: newSettings.pomodoroDuration || defaultSettings.pomodoroDuration,
      shortBreakDuration: newSettings.shortBreakDuration || defaultSettings.shortBreakDuration,
      longBreakDuration: newSettings.longBreakDuration || defaultSettings.longBreakDuration,
      pomodorosBeforeLongBreak: newSettings.pomodorosBeforeLongBreak || defaultSettings.pomodorosBeforeLongBreak,
      codeEditor: newSettings.codeEditor || defaultSettings.codeEditor,
      focusOnShortcut: newSettings.focusOnShortcut || defaultSettings.focusOnShortcut,
      focusOffShortcut: newSettings.focusOffShortcut || defaultSettings.focusOffShortcut,
    };
    setSettings(updatedSettings);
    // The useEffect dependent on [currentPhase, settings] will handle timer update
  }, []);

  return (
    <TimerContext.Provider
      value={{
        timer,
        isRunning,
        currentPhase,
        settings,
        pomodoroCount,
        completedPomodoros,
        startTimer,
        pauseTimer,
        resetTimer,
        skipPhase,
        updateSettings,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
