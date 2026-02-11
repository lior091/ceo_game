import { Meters, Message, Action, ScoreEntry } from '../types/game';
import { getPlayerProfile, getReflection } from '../lib/reflections';

interface EndScreenProps {
  meters: Meters;
  startMeters: Meters;
  messageHistory: { message: Message; action: Action; timestamp: number }[];
  endReason?: string | null;
  score: number | null;
  leaderboard: ScoreEntry[];
  onPlayAgain: () => void;
}

export default function EndScreen({
  meters,
  startMeters,
  messageHistory,
  endReason,
  score,
  leaderboard,
  onPlayAgain,
}: EndScreenProps) {
  const profile = getPlayerProfile(messageHistory);
  const reflection = getReflection(meters, profile, startMeters);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">GAME OVER</h2>
        
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-lg font-medium text-gray-700">Team Trust</span>
            <span className="text-lg font-semibold text-gray-900">{Math.round(meters.teamTrust)}/100</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-lg font-medium text-gray-700">Business Health</span>
            <span className="text-lg font-semibold text-gray-900">{Math.round(meters.businessHealth)}/100</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-lg font-medium text-gray-700">CEO Stress</span>
            <span className="text-lg font-semibold text-gray-900">{Math.round(meters.ceoStress)}/100</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8 space-y-4">
          {endReason && (
            <p className="text-sm font-semibold uppercase tracking-wide text-danger text-center">
              {endReason}
            </p>
          )}
          <p className="text-xl text-gray-800 text-center italic leading-relaxed">
            {reflection}
          </p>
          {score !== null && (
            <p className="text-lg text-center text-gray-700">
              Your score: <span className="font-bold text-navy">{score}</span>
            </p>
          )}
        </div>

        {leaderboard.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">Top Runs (this browser)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 pr-4 font-semibold text-gray-700">#</th>
                    <th className="py-2 pr-4 font-semibold text-gray-700">Score</th>
                    <th className="py-2 pr-4 font-semibold text-gray-700">Team</th>
                    <th className="py-2 pr-4 font-semibold text-gray-700">Business</th>
                    <th className="py-2 pr-4 font-semibold text-gray-700">Stress</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr key={entry.id} className="border-b border-gray-100 last:border-b-0">
                      <td className="py-1 pr-4 text-gray-600">{index + 1}</td>
                      <td className="py-1 pr-4 font-semibold text-gray-900">{entry.score}</td>
                      <td className="py-1 pr-4 text-gray-700">{Math.round(entry.meters.teamTrust)}</td>
                      <td className="py-1 pr-4 text-gray-700">{Math.round(entry.meters.businessHealth)}</td>
                      <td className="py-1 pr-4 text-gray-700">{Math.round(entry.meters.ceoStress)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={onPlayAgain}
            className="px-8 py-4 bg-navy text-white text-xl font-semibold rounded-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl min-w-[200px] min-h-[48px]"
            aria-label="Play Again"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
