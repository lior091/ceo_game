import { Action, VisualPhase } from '../types/game';

interface ActionButtonsProps {
  onAction: (action: Action) => void;
  disabled: boolean;
  gamePhase: VisualPhase;
}

const actions: { action: Action; label: string; icon: string }[] = [
  { action: 'handle',   label: 'Handle Now', icon: '⚡' },      // act directly, fast
  { action: 'delegate', label: 'Delegate',   icon: '📤' },      // send to others
  { action: 'defer',    label: 'Defer',      icon: '⏳' },      // later
  { action: 'ignore',   label: 'Ignore',     icon: '🙈' },      // look away
];

export default function ActionButtons({ onAction, disabled, gamePhase }: ActionButtonsProps) {
  const phaseStyles = {
    early: 'rounded-xl p-6 text-lg font-medium shadow-md hover:shadow-lg',
    mid: 'rounded-lg p-4 text-base font-semibold shadow-sm hover:shadow-md',
    late: 'rounded p-3 text-sm font-bold shadow-lg border-2 border-white hover:border-danger'
  };

  const baseButtonStyles = {
    early: 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50',
    mid: 'bg-gray-100 text-gray-900 border border-gray-400 hover:bg-gray-200',
    late: 'bg-dark text-white border-white hover:bg-danger'
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: Action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        onAction(action);
      }
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      {actions.map(({ action, label, icon }) => (
        <button
          key={action}
          onClick={() => !disabled && onAction(action)}
          onKeyDown={(e) => handleKeyDown(e, action)}
          disabled={disabled}
          className={`
            ${phaseStyles[gamePhase]}
            ${baseButtonStyles[gamePhase]}
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            min-h-[48px] min-w-[120px]
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy
          `}
          aria-label={`${label} action`}
        >
          <span className="flex items-center justify-center gap-2">
            <span aria-hidden="true" className="text-lg">
              {icon}
            </span>
            <span>{label}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
