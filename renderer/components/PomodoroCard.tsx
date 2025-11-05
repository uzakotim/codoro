import React, { useEffect, useCallback } from 'react';
import { useTimer } from '../context/TimerContext';
import { Play, Pause, RotateCcw, FastForward, Settings as SettingsIcon } from 'lucide-react';

const PomodoroCard = () => {
  const {
    timer,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    skipPhase,
    currentPhase,
    settings,
    updateSettings,
  } = useTimer();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const getPhaseColor = useCallback(() => {
    switch (currentPhase) {
      case 'pomodoro':
        return 'from-red-500 to-pink-500';
      case 'shortBreak':
        return 'from-green-500 to-teal-500';
      case 'longBreak':
        return 'from-blue-500 to-indigo-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  }, [currentPhase]);

  const playSound = useCallback((type: string) => {
    // In a real app, you'd load actual audio files.
    // For this example, we'll just log.
    console.log(`Playing ${type} sound!`);
  }, []);

  useEffect(() => {
    if (timer === 0 && isRunning) {
      playSound('ding');
      const nextPhaseAction = () => {
        console.log(`Phase ${currentPhase} completed.`);
        skipPhase();
      };
      setTimeout(nextPhaseAction, 500);
    }
  }, [timer, isRunning, currentPhase, skipPhase, playSound]);

  // Simplified settings display/toggle for a compact card
  const [showSettings, setShowSettings] = React.useState(false);

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateSettings({
      ...settings,
      [name]: parseInt(value, 10) * 60 || 0,
    });
  };

  return (
    <div className="relative w-full max-w-sm backdrop-filter backdrop-blur-lg p-6 md:p-8 flex flex-col gap-6 items-center transform transition-all duration-300 ease-in-out hover:shadow-3xl hover:scale-[1.01]">
    
    {!showSettings ? (
    <div className="w-full flex flex-col items-center gap-6">
      <div className={`relative w-48 h-48 md:w-56 md:h-56 rounded-full flex items-center justify-center shadow-inner-lg transition-all duration-500 ease-in-out bg-gradient-to-br ${getPhaseColor()} border-4 border-white border-opacity-30`}>
        <div className="text-white font-mono text-5xl md:text-6xl font-bold drop-shadow-lg tracking-tight">
          {formatTime(timer)}
        </div>
        <div className="absolute bottom-5 text-md md:text-lg font-semibold text-white text-opacity-90 tracking-wide capitalize">
          {currentPhase.replace(/([A-Z])/g, ' $1').trim()} Time
        </div>
      </div>

   
      <div className="flex flex-wrap justify-center gap-3 w-full">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-md shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75 min-w-[100px]"
          >
            <Play size={20} /> Start
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-md shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-75 min-w-[100px]"
          >
            <Pause size={20} /> Pause
          </button>
        )}

        <button
          onClick={resetTimer}
          className="flex items-center justify-center gap-2 px-5 py-2 rounded-2xl bg-white bg-opacity-20 text-white font-bold text-md shadow-lg hover:bg-opacity-30 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50 min-w-[100px]"
        >
          <RotateCcw size={20} /> Reset
        </button>

        <button
          onClick={skipPhase}
          className="flex items-center justify-center gap-2 px-5 py-2 rounded-2xl bg-white bg-opacity-20 text-white font-bold text-md shadow-lg hover:bg-opacity-30 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50 min-w-[100px]"
        >
          <FastForward size={20} /> Skip
        </button>
      </div>

      <button
        onClick={() => setShowSettings(!showSettings)}
        className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
        aria-label="Toggle settings"
      >
        <SettingsIcon size={20} />
      </button>
    </div>)
    :
    (
        <div className="absolute top-0 left-0 w-full h-full p-6 flex flex-col items-center justify-center gap-4 animate-fade-in z-10">
          <h3 className="text-2xl font-bold text-white mb-2">Timer Settings</h3>
          <label className="flex flex-col items-center text-white w-full">
            Pomodoro (min):
            <input
              type="number"
              name="pomodoroDuration"
              value={settings.pomodoroDuration / 60}
              onChange={handleSettingChange}
              className="mt-1 p-2 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-pink-300 text-white placeholder-white::placeholder w-24 text-center"
              min="1"
            />
          </label>
          <label className="flex flex-col items-center text-white w-full">
            Short Break (min):
            <input
              type="number"
              name="shortBreakDuration"
              value={settings.shortBreakDuration / 60}
              onChange={handleSettingChange}
              className="mt-1 p-2 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-pink-300 text-white placeholder-white::placeholder w-24 text-center"
              min="1"
            />
          </label>
          <label className="flex flex-col items-center text-white w-full">
            Long Break (min):
            <input
              type="number"
              name="longBreakDuration"
              value={settings.longBreakDuration / 60}
              onChange={handleSettingChange}
              className="mt-1 p-2 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-pink-300 text-white placeholder-white::placeholder w-24 text-center"
              min="1"
            />
          </label>
          <button
            onClick={() => setShowSettings(false)}
            className="mt-4 px-6 py-2 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-md shadow-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300 focus:ring-opacity-75"
          >
            Close
          </button>
        </div>
    )}
    </div>
  );
};

export default PomodoroCard;