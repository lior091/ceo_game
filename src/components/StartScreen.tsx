interface StartScreenProps {
  onStart: () => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="text-center px-4 sm:px-6 max-w-2xl w-full">
        <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-3 sm:mb-4">CEO Simulator</h1>
        <p className="text-xl sm:text-2xl text-gray-600 mb-6 sm:mb-8">5 minutes. Inbox never stops.</p>
        <p className="text-base sm:text-lg text-gray-500 mb-8 sm:mb-12">
          Being CEO is not about making the best decision—it's about making a decision under pressure.
        </p>
        <button
          onClick={onStart}
          className="px-6 sm:px-8 py-3 sm:py-4 bg-navy text-white text-lg sm:text-xl font-semibold rounded-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl min-w-[200px] min-h-[48px] touch-manipulation"
          aria-label="Start Game"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
