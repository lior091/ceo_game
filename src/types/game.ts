export type Action = 'handle' | 'delegate' | 'defer' | 'ignore';
export type GamePhase = 'start' | 'playing' | 'end';
export type VisualPhase = 'early' | 'mid' | 'late';
export type Urgency = 'high' | 'medium' | 'low';
export type ImpactArea = 'people' | 'product' | 'money';
export type EmotionalWeight = 'urgent' | 'neutral' | 'concerning';

export interface Message {
  id: string;
  text: string;
  urgency: Urgency;
  impactArea: ImpactArea;
  emotionalWeight: EmotionalWeight;
}

export interface Meters {
  teamTrust: number;      // 0-100, starts at 70
  businessHealth: number; // 0-100, starts at 60
  ceoStress: number;      // 0-100, starts at 30
}

export interface GameState {
  phase: GamePhase;
  timeRemaining: number;  // seconds (300 = 5 min)
  meters: Meters;
  endReason?: string | null;
  currentMessage: Message | null;
  inbox: Message[]; // additional waiting messages that have piled up
  messageHistory: { message: Message; action: Action; timestamp: number }[];
  messageQueue: Message[];
  startMeters: Meters; // Track starting values for reflection
}

export interface ScoreEntry {
  id: string;
  score: number;
  meters: Meters;
  createdAt: string; // ISO timestamp
}
