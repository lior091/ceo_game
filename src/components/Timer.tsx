import { VisualPhase } from '../types/game';

interface TimerProps {
  timeRemaining: number;
  gamePhase: VisualPhase;
}

export default function Timer({ timeRemaining, gamePhase }: TimerProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const phaseStyles = {
    early: 'text-2xl sm:text-4xl text-gray-600 font-light',
    mid: 'text-xl sm:text-3xl text-gray-700 font-medium',
    late: `text-3xl sm:text-5xl text-danger font-bold ${timeRemaining % 2 === 0 ? 'animate-pulse' : ''}`
  };

  return (
    <div className={`${phaseStyles[gamePhase]} transition-all duration-300`}>
      {formattedTime}
    </div>
  );
}
