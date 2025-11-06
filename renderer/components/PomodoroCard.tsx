import React, { useEffect, useCallback } from 'react';
import { useTimer } from '../context/TimerContext';
import { Play, Pause, RotateCcw, FastForward, Settings as SettingsIcon, Plus } from 'lucide-react';

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
        return 'text-red-500';
      case 'shortBreak':
        return 'text-green-500';
      case 'longBreak':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  }, [currentPhase]);
  const getPhaseDuration = useCallback(() => {
    switch (currentPhase) {
      case 'pomodoro':
        return settings.pomodoroDuration;
      case 'shortBreak':
        return settings.shortBreakDuration;
      case 'longBreak':
        return settings.longBreakDuration;
      default:
        console.error(`Unexpected phase: ${currentPhase}`);
        return settings.pomodoroDuration; // fallback to pomodoro duration
    }
  }, [currentPhase, settings]);

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
          {/* Radial progress bar */}
          <div className="relative size-60 flex flex-col items-center">
            <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-200 dark:text-neutral-700" strokeWidth="2"></circle>
              <circle cx="18" cy="18" r="16" fill="none" className={`stroke-current ${getPhaseColor()}`} strokeWidth="2" strokeDasharray="100" strokeDashoffset={`${ (timer / getPhaseDuration()) * 100}`} strokeLinecap="round"></circle>
            </svg>

            <div className="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2">
              <span className={`text-center text-5xl font-bold ${getPhaseColor()}`}>
    {formatTime(timer)}
              </span>
          
            </div>
              <div className={`absolute bottom-1/3  translate-y-1/2 text-md md:text-lg font-semibold ${getPhaseColor()} text-opacity-90 tracking-wide capitalize`}>
              {currentPhase.replace(/([A-Z])/g, ' $1').trim()} Time
            </div> 
          </div>
      
          <div className="flex flex-wrap justify-center gap-3 w-full">
            {!isRunning ? (
              <button
                onClick={startTimer}
                className="flex items-center justify-center gap-2 px-5 py-2 rounded-2xl border-2 border-blue-600 text-white font-bold text-md shadow-lg hover:border-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-opacity-75 min-w-[100px]"
              >
                <Play size={20} /> Start
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="flex items-center justify-center gap-2 px-5 py-2 rounded-2xl border-2 border-purple-600 text-white font-bold text-md shadow-lg hover:border-purple-700  transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-opacity-75 min-w-[100px]"
              >
                <Pause size={20} /> Pause
              </button>
            )}

            <button
              onClick={resetTimer}
              className="flex items-center justify-center gap-2 px-5 py-2 rounded-2xl bg-white bg-opacity-10 text-white font-bold text-md shadow-lg hover:bg-opacity-20 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50 min-w-[100px]"
            >
              <RotateCcw size={20} /> Reset
            </button>

            <button
              onClick={skipPhase}
              className="flex items-center justify-center gap-2 px-5 py-2 rounded-2xl bg-white bg-opacity-10 text-white font-bold text-md shadow-lg hover:bg-opacity-20 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50 min-w-[100px]"
            >
              <FastForward size={20} /> Skip
            </button>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-10 text-white hover:bg-opacity-20 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            aria-label="Toggle settings"
          >
            <SettingsIcon size={20} />
          </button>
      </div>
    )
    :
    (
        <div className="absolute top-0 left-0 w-full h-full p-6 flex flex-col items-center justify-center gap-4 animate-fade-in z-10">
          <h3 className="text-2xl font-bold text-white mb-1">Timer Settings</h3>
          <label className="flex flex-col items-center text-white w-full">
            Pomodoro (min): 
            <div className="flex items-center mt-1 justify-center space-x-2">
              
              <input
                type="number"
                name="pomodoroDuration"
                value={settings.pomodoroDuration / 60}
                onChange={handleSettingChange}
                className="mt-1 p-2 mb-1 rounded-lg bg-white bg-opacity-10 focus:outline-none focus:ring-1 focus:ring-blue-600 text-white placeholder-white::placeholder w-24 text-center"
                min="1"
              />
              <div className='flex flex-col justify-center items-center'>
              <button
                className="w-5 h-5 text-center bg-blue-600 text-xs text-white rounded-md hover:bg-blue-700 focus:outline-none"
                // onClick="this.parentNode.querySelector('input[type=number]').stepUp()"
                onClick = {() => {
                  const input = document.querySelector('input[name="pomodoroDuration"]') as HTMLInputElement;
                  input.stepUp();
                  handleSettingChange({ target: input } as React.ChangeEvent<HTMLInputElement>);
                }
                }
              >+</button>
              <button
                className="w-5 h-5 mt-1 border border-1 border-blue-600 text-xs text-white rounded-md hover:border-blue-700 focus:outline-none"
                // onClick= "this.parentNode.querySelector('input[type=number]').stepDown()"
                onClick = {() => {
                  const input = document.querySelector('input[name="pomodoroDuration"]') as HTMLInputElement;
                  input.stepDown();
                  handleSettingChange({ target: input } as React.ChangeEvent<HTMLInputElement>);
                }
                }
              >
                -
              </button>
              </div>
              
            </div>
          </label>
          <label className="flex flex-col items-center text-white w-full">
            Short Break (min):
            <div className="flex items-center mt-1 justify-center space-x-2">
              <input
                type="number"
                name="shortBreakDuration"
                value={settings.shortBreakDuration / 60}
                onChange={handleSettingChange}
                className="mt-1 p-2 mb-1 rounded-lg bg-white bg-opacity-10 focus:outline-none focus:ring-1 focus:ring-blue-600 text-white placeholder-white::placeholder w-24 text-center"
                min="1"
              />
              <div className='flex flex-col justify-center items-center'>
                <button
                  className="w-5 h-5 bg-blue-600 text-xs text-white rounded-md hover:bg-blue-700 focus:outline-none"
                  // onClick="this.parentNode.querySelector('input[type=number]').stepUp()"
                  onClick = {() => {
                    const input = document.querySelector('input[name="shortBreakDuration"]') as HTMLInputElement;
                    input.stepUp();
                    handleSettingChange({ target: input } as React.ChangeEvent<HTMLInputElement>);
                  }
                  }
                >
                  +
                </button>
                <button
                  className="w-5 h-5 mt-1 border border-1 border-blue-600 text-xs text-white rounded-md hover:border-blue-700 focus:outline-none"
                  // onClick= "this.parentNode.querySelector('input[type=number]').stepDown()"
                  onClick = {() => {
                    const input = document.querySelector('input[name="shortBreakDuration"]') as HTMLInputElement;
                    input.stepDown();
                    handleSettingChange({ target: input } as React.ChangeEvent<HTMLInputElement>);
                  }
                  }
                >
                  -
                </button>
              </div>
            </div>
          </label>
          <label className="flex flex-col items-center text-white w-full">
            Long Break (min):
            <div className="flex items-center mt-1 justify-center space-x-2">
            <input
              type="number"
              name="longBreakDuration"
              value={settings.longBreakDuration / 60}
              onChange={handleSettingChange}
              className="mt-1 p-2 mb-1 rounded-lg bg-white bg-opacity-10 focus:outline-none focus:ring-1 focus:ring-blue-600 text-white placeholder-white::placeholder w-24 text-center"
              min="1"
            />
            <div className='flex flex-col justify-center items-center'>
                <button
                  className="w-5 h-5 bg-blue-600 text-xs text-white rounded-md hover:bg-blue-700 focus:outline-none"
                  // onClick="this.parentNode.querySelector('input[type=number]').stepUp()"
                  onClick = {() => {
                    const input = document.querySelector('input[name="longBreakDuration"]') as HTMLInputElement;
                    input.stepUp();
                    handleSettingChange({ target: input } as React.ChangeEvent<HTMLInputElement>);
                  }
                  }
                >
                  +
                </button>
                <button
                  className="w-5 h-5 mt-1 border border-1 border-blue-600 text-xs text-white rounded-md hover:border-blue-700 focus:outline-none"
                  // onClick= "this.parentNode.querySelector('input[type=number]').stepDown()"
                  onClick = {() => {
                    const input = document.querySelector('input[name="longBreakDuration"]') as HTMLInputElement;
                    input.stepDown();
                    handleSettingChange({ target: input } as React.ChangeEvent<HTMLInputElement>);
                  }
                  }
                >
                  -
                </button>
              </div>
            </div>
          </label>
          <button
            onClick={() => setShowSettings(false)}
            className="px-6 py-2 rounded-2xl border-2 border-orange-500 text-white font-bold text-md shadow-lg hover:border-orange-600 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300 focus:ring-opacity-75"
          >
            Close
          </button>
        </div>
    )}
    </div>
  );
};

export default PomodoroCard;