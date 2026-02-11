import { Message } from '../types/game';

interface MessageBoxProps {
  message: Message | null;
  timeRemaining: number;
  inboxCount: number;
}

export default function MessageBox({ message, timeRemaining, inboxCount }: MessageBoxProps) {
  const gamePhase = timeRemaining > 180 ? 'early' : timeRemaining > 60 ? 'mid' : 'late';

  const phaseStyles = {
    early: 'bg-white border border-slate-200 shadow-sm',
    mid: 'bg-white border border-slate-300 shadow-md',
    late: 'bg-slate-900 border border-danger shadow-lg text-white'
  };

  if (!message) {
    return (
      <div className={`${phaseStyles[gamePhase]} rounded-lg h-full flex flex-col items-center justify-center gap-2`}>
        <p className="text-sm text-slate-400">No email selected.</p>
        {inboxCount > 0 && (
          <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold bg-danger text-white rounded-full">
            Inbox piling up: {inboxCount}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`${phaseStyles[gamePhase]} transition-all duration-300 relative rounded-lg h-full flex flex-col`}
      role="region"
      aria-live="polite"
      aria-label="Current inbox message"
    >
      {inboxCount > 1 && (
        <span className="absolute -top-3 -right-3 inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold bg-danger text-white rounded-full shadow">
          {inboxCount}
        </span>
      )}

      {/* Header row like an email */}
      <div className="border-b border-slate-200 px-3 sm:px-4 py-2 flex items-center justify-between">
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase">From</span>
          <span className="text-xs sm:text-sm text-slate-800 truncate">
            {message.impactArea === 'people' && 'People Ops'}
            {message.impactArea === 'product' && 'Product & Engineering'}
            {message.impactArea === 'money' && 'Finance & Revenue'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 flex-shrink-0 ml-2">
          <span className="px-1.5 sm:px-2 py-0.5 rounded-full border border-slate-300 uppercase whitespace-nowrap">
            {message.urgency}
          </span>
        </div>
      </div>

      {/* Subject + body */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 space-y-2 flex-1 overflow-auto">
        <div className="font-semibold text-xs sm:text-sm text-slate-900">
          CEO: you need to make a call on this.
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          {message.text}
        </p>
      </div>
    </div>
  );
}
