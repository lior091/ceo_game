import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Action, Meters, ScoreEntry } from '../types/game';
import { generateMessages } from '../lib/messages';
import { getGamePhase, getMessageDeliverySchedule, updateMeters, applyDelayedEffects } from '../lib/gameLogic';
import { getPlayerProfile, calculateScore } from '../lib/reflections';
import StartScreen from './StartScreen';
import Timer from './Timer';
import MeterDisplay from './MeterDisplay';
import MessageBox from './MessageBox';
import ActionButtons from './ActionButtons';
import EndScreen from './EndScreen';

const INITIAL_METERS: Meters = {
  teamTrust: 70,
  businessHealth: 60,
  ceoStress: 30,
};

const TOTAL_TIME = 300; // 5 minutes in seconds
const TICK_SECONDS = 0.1;

// Passive pressure when messages are waiting and player hesitates
// (slowed down to feel less punishing)
const WAIT_STRESS_PER_SECOND = 0.7;      // CEO stress creeps up more gently
const WAIT_BUSINESS_PER_SECOND = -0.4;   // Business health erodes more slowly

export default function Game() {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'start',
    timeRemaining: TOTAL_TIME,
    meters: INITIAL_METERS,
    endReason: null,
    currentMessage: null,
    inbox: [],
    messageHistory: [],
    messageQueue: [],
    startMeters: INITIAL_METERS,
  });

  const [messageSchedule, setMessageSchedule] = useState<number[]>([]);
  const [deliveredMessages, setDeliveredMessages] = useState<Set<number>>(new Set());
  const processedDelaysRef = useRef<Set<number>>(new Set());
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const hasRecordedScoreRef = useRef(false);

  // Load leaderboard from localStorage on first mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ceo_simulator_leaderboard');
      if (stored) {
        const parsed = JSON.parse(stored) as ScoreEntry[];
        setLeaderboard(parsed);
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  // Initialize game
  const initializeGame = useCallback(() => {
    const messages = generateMessages();
    const schedule = getMessageDeliverySchedule(TOTAL_TIME);
    
    setGameState({
      phase: 'playing',
      timeRemaining: TOTAL_TIME,
      meters: INITIAL_METERS,
      endReason: null,
      currentMessage: null,
      inbox: [],
      messageHistory: [],
      messageQueue: messages,
      startMeters: INITIAL_METERS,
    });
    setMessageSchedule(schedule);
    setDeliveredMessages(new Set());
    processedDelaysRef.current = new Set();
    setCurrentScore(null);
    hasRecordedScoreRef.current = false;
  }, []);

  // Timer tick
  useEffect(() => {
    if (gameState.phase !== 'playing') return;

    const interval = setInterval(() => {
      setGameState((prev) => {
        const newTimeRemaining = Math.max(0, prev.timeRemaining - TICK_SECONDS);
        const newElapsed = TOTAL_TIME - newTimeRemaining;

        // Check for delayed effects
        const delayTriggers = [120, 180, 240, 300];
        let updatedMeters = { ...prev.meters };
        
        for (const trigger of delayTriggers) {
          if (newElapsed >= trigger && !processedDelaysRef.current.has(trigger)) {
            updatedMeters = applyDelayedEffects(
              updatedMeters,
              prev.messageHistory,
              trigger,
              newElapsed
            );
            processedDelaysRef.current.add(trigger);
          }
        }

        // Passive \"inbox pressure\" scales with how many messages are waiting (pile up)
        const waitingCount = (prev.currentMessage ? 1 : 0) + prev.inbox.length;
        if (waitingCount > 0) {
          const stressDelta = WAIT_STRESS_PER_SECOND * TICK_SECONDS * waitingCount;
          const businessDelta = WAIT_BUSINESS_PER_SECOND * TICK_SECONDS * waitingCount;

          updatedMeters = {
            ...updatedMeters,
            ceoStress: Math.max(0, Math.min(100, updatedMeters.ceoStress + stressDelta)),
            businessHealth: Math.max(0, Math.min(100, updatedMeters.businessHealth + businessDelta)),
          };
        }

        // Early game over: if 2 or more metrics are in a \"critical\" bad zone
        // - CEO Stress: high is bad (>= 95)
        // - Business Health & Team Trust: low is bad (<= 5)
        const isStressBad = updatedMeters.ceoStress >= 95;
        const isTeamBad = updatedMeters.teamTrust <= 5;
        const isBusinessBad = updatedMeters.businessHealth <= 5;
        const badCount = [isStressBad, isTeamBad, isBusinessBad].filter(Boolean).length;

        if (badCount >= 2) {
          let reason = 'Two of your metrics reached critical levels.';
          if (isStressBad && isTeamBad && isBusinessBad) {
            reason = 'You burned out, lost the team, and the business stalled.';
          } else if (isStressBad && isTeamBad) {
            reason = 'You burned out and your team lost trust.';
          } else if (isStressBad && isBusinessBad) {
            reason = 'You burned out while the business was collapsing.';
          } else if (isTeamBad && isBusinessBad) {
            reason = 'The company ran out of trust and health.';
          }

          return {
            ...prev,
            phase: 'end',
            timeRemaining: newTimeRemaining,
            meters: updatedMeters,
            endReason: reason,
          };
        }

        // Time up
        if (newTimeRemaining <= 0) {
          return {
            ...prev,
            phase: 'end',
            timeRemaining: 0,
            meters: updatedMeters,
            endReason: 'Time is up. Five minutes of decisions are behind you.',
          };
        }

        return {
          ...prev,
          timeRemaining: newTimeRemaining,
          meters: updatedMeters,
        };
      });
    }, 100); // Update every 100ms

    return () => clearInterval(interval);
  }, [gameState.phase]);

  // Message delivery
  useEffect(() => {
    if (gameState.phase !== 'playing' || messageSchedule.length === 0) return;

    const checkMessageDelivery = () => {
      setGameState((prev) => {
        if (prev.messageQueue.length === 0) return prev;
        
        const currentElapsed = TOTAL_TIME - prev.timeRemaining;
        const nextMessageIndex = messageSchedule.findIndex(
          (time) => time <= currentElapsed && !deliveredMessages.has(time)
        );

        if (nextMessageIndex !== -1) {
          const nextMessageTime = messageSchedule[nextMessageIndex];
          setDeliveredMessages((prevDelivered) => new Set(prevDelivered).add(nextMessageTime));

          const [nextMessage, ...restQueue] = prev.messageQueue;

          // If there's no current message, show this one. Otherwise, it piles up in the inbox.
          if (!prev.currentMessage) {
            return {
              ...prev,
              currentMessage: nextMessage,
              messageQueue: restQueue,
            };
          }

          return {
            ...prev,
            inbox: [...prev.inbox, nextMessage],
            messageQueue: restQueue,
          };
        }

        return prev;
      });
    };

    const interval = setInterval(checkMessageDelivery, 100);
    return () => clearInterval(interval);
  }, [gameState.phase, gameState.timeRemaining, gameState.currentMessage, gameState.messageQueue, messageSchedule, deliveredMessages]);

  // When a round ends, compute score and update leaderboard
  useEffect(() => {
    if (gameState.phase !== 'end' || hasRecordedScoreRef.current) return;

    hasRecordedScoreRef.current = true;

    const durationSeconds = TOTAL_TIME - gameState.timeRemaining;

    const profile = getPlayerProfile(
      gameState.messageHistory.map(({ message, action }) => ({ message, action }))
    );
    const score = calculateScore(gameState.meters, profile, gameState.startMeters, durationSeconds);
    setCurrentScore(score);

    const entry: ScoreEntry = {
      id: `${Date.now()}`,
      score,
      meters: gameState.meters,
      createdAt: new Date().toISOString(),
    };

    setLeaderboard((prev) => {
      const next = [...prev, entry].sort((a, b) => b.score - a.score).slice(0, 10);
      try {
        localStorage.setItem('ceo_simulator_leaderboard', JSON.stringify(next));
      } catch {
        // ignore storage failures
      }
      return next;
    });
  }, [gameState.phase, gameState.meters, gameState.messageHistory, gameState.startMeters]);

  // Handle action
  const handleAction = useCallback((action: Action) => {
    if (gameState.phase !== 'playing' || !gameState.currentMessage) return;

    setGameState((prev) => {
      if (!prev.currentMessage) return prev;
      
      const updatedMeters = updateMeters(prev.meters, action, prev.currentMessage);
      const timestamp = TOTAL_TIME - prev.timeRemaining;

       const [nextFromInbox, ...restInbox] = prev.inbox;

      return {
        ...prev,
        meters: updatedMeters,
        currentMessage: nextFromInbox ?? null, // Move next piled-up message (if any) into focus
        inbox: restInbox,
        messageHistory: [
          ...prev.messageHistory,
          {
            message: prev.currentMessage,
            action,
            timestamp,
          },
        ],
      };
    });
  }, [gameState.phase, gameState.currentMessage]);

  // Get visual phase
  const visualPhase = getGamePhase(gameState.timeRemaining);

  // Render based on phase
  if (gameState.phase === 'start') {
    return <StartScreen onStart={initializeGame} />;
  }

  if (gameState.phase === 'end') {
    return (
      <EndScreen
        meters={gameState.meters}
        startMeters={gameState.startMeters}
        messageHistory={gameState.messageHistory}
        endReason={gameState.endReason}
        score={currentScore}
        leaderboard={leaderboard}
        onPlayAgain={initializeGame}
      />
    );
  }

  // Playing phase - email inbox layout
  const inboxCount = (gameState.currentMessage ? 1 : 0) + gameState.inbox.length;
  const visibleInbox = [
    ...(gameState.currentMessage ? [gameState.currentMessage] : []),
    ...gameState.inbox,
  ].slice(0, 15);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top bar */}
      <header className="h-14 flex items-center justify-between px-6 bg-slate-900 text-slate-50 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-wide">CEO Mail</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/40">
            Simulator
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Timer timeRemaining={Math.ceil(gameState.timeRemaining)} gamePhase={visualPhase} />
          <div className="hidden sm:flex items-center gap-4 text-xs text-slate-200">
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-teal-400" />
              <span>Team</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-gold" />
              <span>Business</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-danger" />
              <span>Stress</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main inbox layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar / left column: meters + inbox list */}
        <aside className="w-80 max-w-xs border-r border-slate-200 bg-white flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <MeterDisplay meters={gameState.meters} gamePhase={visualPhase} />
          </div>
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 text-xs text-slate-600 bg-slate-50">
            <span className="font-semibold uppercase tracking-wide">Inbox</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
              {inboxCount} messages
            </span>
          </div>
          <div className="flex-1 overflow-auto">
            {visibleInbox.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No messages. Enjoy the quiet.
              </div>
            ) : (
              <ul>
                {visibleInbox.map((msg) => {
                  const isActive = gameState.currentMessage && msg.id === gameState.currentMessage.id;
                  return (
                    <li
                      key={msg.id}
                      className={`px-4 py-3 border-b border-slate-100 text-sm cursor-default ${
                        isActive
                          ? 'bg-slate-100 font-semibold text-slate-900'
                          : 'bg-white hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="truncate">
                          {msg.impactArea === 'people' && 'People'}
                          {msg.impactArea === 'product' && 'Product'}
                          {msg.impactArea === 'money' && 'Money'}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-slate-200 text-slate-500 uppercase">
                          {msg.urgency}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate">
                        {msg.text}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* Right column: reading pane + actions */}
        <main className="flex-1 flex flex-col bg-slate-50">
          <div className="flex-1 p-4">
            <MessageBox
              message={gameState.currentMessage}
              timeRemaining={gameState.timeRemaining}
              inboxCount={inboxCount}
            />
          </div>

          <div className="border-t border-slate-200 bg-white px-4 py-3 flex flex-col gap-3">
            <ActionButtons
              onAction={handleAction}
              disabled={gameState.currentMessage === null}
              gamePhase={visualPhase}
            />

            {/* Give Up / Restart - Panic Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={initializeGame}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wide
                           bg-danger text-white rounded-full shadow-md
                           hover:bg-red-600 hover:shadow-lg
                           active:scale-95 transition-transform transition-shadow transition-colors
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger"
              >
                Panic: Give Up & Restart
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
