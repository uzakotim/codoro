import React from 'react'
import { TimerProvider } from '../context/TimerContext';
import PomodoroCard from '../components/PomodoroCard';

export default function HomePage() {
  return (
     <TimerProvider>
      <div className="w-full h-full flex items-center justify-center">
          <PomodoroCard />
      </div>
    </TimerProvider>
  )
}
