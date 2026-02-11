# CEO Simulator - Technical Specification

## Overview

A 5-minute real-time decision-making game where players respond to inbox messages by choosing one of four actions. Built for rapid prototyping in a 90-minute workshop sprint.

**Stack:** React/TypeScript, Tailwind CSS, Vite
**Scope:** MVP - single playable game loop
**Build Time Target:** 90 minutes

---

## Project Structure

```
ceo-simulator/
├── src/
│   ├── App.tsx                 # Main game component
│   ├── components/
│   │   ├── Game.tsx            # Game state & logic
│   │   ├── MessageBox.tsx       # Current inbox message display
│   │   ├── MeterDisplay.tsx     # Team Trust, Business Health, CEO Stress
│   │   ├── ActionButtons.tsx    # Handle Now, Delegate, Defer, Ignore
│   │   ├── Timer.tsx            # 5-minute countdown
│   │   ├── EndScreen.tsx        # Final metrics & reflection
│   │   └── StartScreen.tsx      # Welcome/instructions
│   ├── lib/
│   │   ├── messages.ts          # Message generation & AI integration
│   │   ├── gameLogic.ts         # Meter calculations & state updates
│   │   └── reflections.ts       # End-game reflection text
│   ├── types/
│   │   └── game.ts              # TypeScript interfaces
│   ├── styles/
│   │   └── globals.css          # Tailwind config & custom styles
│   └── main.tsx
├── index.html
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## Core Types

```typescript
// src/types/game.ts

export type Action = 'handle' | 'delegate' | 'defer' | 'ignore';
export type GamePhase = 'start' | 'playing' | 'end';
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
  currentMessage: Message | null;
  messageHistory: { message: Message; action: Action }[];
  messageQueue: Message[];
}
```

---

## Component Architecture

### App.tsx
Entry point. Renders Game component.

```typescript
export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Game />
    </div>
  );
}
```

---

### Game.tsx
Main game orchestrator. Handles:
- Game state management (useState)
- Timer logic (useEffect with interval)
- Message delivery & queue
- Action handling & meter updates
- Phase transitions (start → playing → end)

**Key Functions:**
- `initializeGame()` - Set up starting state
- `tick()` - Called every 100ms to handle timer & message delivery
- `handleAction(action: Action)` - Process player decision
- `getNextMessage()` - Pull from queue or generate new
- `updateMeters(action, message)` - Calculate consequences
- `getGamePhase()` - Return current UI phase (early/mid/late game)

**State Structure:**
```typescript
const [gameState, setGameState] = useState<GameState>({
  phase: 'start',
  timeRemaining: 300,
  meters: { teamTrust: 70, businessHealth: 60, ceoStress: 30 },
  currentMessage: null,
  messageHistory: [],
  messageQueue: []
});
```

---

### StartScreen.tsx
Simple intro screen with "Play" button.

**Display:**
- Title: "CEO Simulator"
- Subtitle: "5 minutes. Inbox never stops."
- "Start Game" button

---

### MessageBox.tsx
Displays the current inbox message. Updates when player acts.

**Props:**
- `message: Message`
- `timeRemaining: number` (for visual intensity)

**Dynamic Styling:**
- 0–1 min: Large, calm typography, soft colors
- 1–3 min: Medium intensity, neutral colors
- 3–5 min: High contrast, urgent red accents

**Content:**
```
┌─────────────────────────────┐
│      [Message text here]    │
│    (60-100 characters)      │
└─────────────────────────────┘
```

---

### ActionButtons.tsx
Four buttons: Handle Now, Delegate, Defer, Ignore.

**Props:**
- `onAction: (action: Action) => void`
- `disabled: boolean`
- `gamePhase: 'early' | 'mid' | 'late'`

**Layout:**
```
┌──────────────┬──────────────┐
│ Handle Now   │   Delegate   │
├──────────────┼──────────────┤
│    Defer     │    Ignore    │
└──────────────┴──────────────┘
```

**Behavior:**
- Buttons disabled during message animation
- Disabled also during end screen
- Click triggers `onAction()`

**Styling Progression:**
- Early game: Spacious, soft button styling
- Mid game: Tighter spacing, neutral gray
- Late game: Bold borders, high contrast

---

### MeterDisplay.tsx
Shows three meters: Team Trust (teal), Business Health (gold), CEO Stress (red).

**Props:**
- `meters: Meters`
- `gamePhase: 'early' | 'mid' | 'late'`

**Layout:**
```
Team Trust:      [████████░░░░░░░░]  70/100
Business Health: [██████░░░░░░░░░░░]  60/100
CEO Stress:      [███░░░░░░░░░░░░░░]  30/100
```

**Behavior:**
- Update smoothly (animate bars over 300ms)
- Show numeric values
- Color changes at thresholds:
  - < 25: Red (danger)
  - 25–75: Normal (yellow/teal/gray)
  - > 75: Red (overload)

---

### Timer.tsx
Countdown timer showing time remaining.

**Props:**
- `timeRemaining: number` (seconds)
- `gamePhase: 'early' | 'mid' | 'late'`

**Display Format:**
```
4:32  (minutes:seconds)
```

**Styling Progression:**
- Early game: Large, calm gray
- Mid game: Medium, neutral gray
- Late game: Large, pulsing red (every second)

---

### EndScreen.tsx
Displays final metrics and a reflective summary.

**Props:**
- `meters: Meters`
- `onPlayAgain: () => void`

**Display:**
```
┌─────────────────────────────┐
│     GAME OVER               │
├─────────────────────────────┤
│ Team Trust:      70/100     │
│ Business Health: 60/100     │
│ CEO Stress:      30/100     │
├─────────────────────────────┤
│ [Reflection text here]      │
│ (Generated based on meters) │
├─────────────────────────────┤
│ [Play Again Button]         │
└─────────────────────────────┘
```

**Reflection Logic:**
- Analyze meter delta (start → end)
- Determine dominant strategy: speed, caution, delegation, chaos
- Return appropriate summary (see `reflections.ts`)

---

## Game Logic

### Message Delivery & Timing

**Message Frequency:**
- 0–60 sec: 1 message per 10 seconds (6 total)
- 60–180 sec: 1 message per 6 seconds (20 total)
- 180–300 sec: 1 message per 3 seconds (40 total)
- Total: ~70 messages per 5-minute game

**Queue System:**
- Pre-generate 70 messages at game start (batch API call to Claude or hardcoded)
- Store in `messageQueue`
- Deliver on schedule based on elapsed time

**Implementation:**
```typescript
function getMessageDeliverySchedule(totalTime = 300) {
  const schedule = [];
  let time = 5; // First message at 5 sec
  
  while (time < totalTime) {
    schedule.push(time);
    if (time < 60) time += 10;
    else if (time < 180) time += 6;
    else time += 3;
  }
  return schedule;
}
```

---

### Meter Updates

**Action Consequences Table:**

| Action    | Immediate         | Delayed              | Trigger |
|-----------|-------------------|----------------------|---------|
| Handle    | Stress +10        | Business +15         | @2 min  |
| Delegate  | Stress -5         | Team Trust -8        | @3 min  |
| Defer     | Stress -3         | Business -10         | @4 min  |
| Ignore    | Stress -8         | Team Trust -15, Business -10 | @end |

**Modifiers by Message Urgency:**
- High urgency: +30% impact
- Medium urgency: +0% impact (baseline)
- Low urgency: -30% impact

**Implementation:**
```typescript
function updateMeters(currentMeters: Meters, action: Action, message: Message): Meters {
  const baseEffects = {
    handle: { stress: +10, business: 0, team: 0 },
    delegate: { stress: -5, business: 0, team: 0 },
    defer: { stress: -3, business: 0, team: 0 },
    ignore: { stress: -8, business: 0, team: 0 }
  };

  const urgencyModifier = message.urgency === 'high' ? 1.3 : message.urgency === 'low' ? 0.7 : 1;
  const effects = baseEffects[action];

  return {
    stress: Math.max(0, Math.min(100, currentMeters.ceoStress + effects.stress * urgencyModifier)),
    business: Math.max(0, Math.min(100, currentMeters.businessHealth + effects.business * urgencyModifier)),
    team: Math.max(0, Math.min(100, currentMeters.teamTrust + effects.team * urgencyModifier))
  };
}
```

**Delayed Effects:**
- Trigger at fixed times during game (2 min, 3 min, 4 min, end)
- Look up player's past 2–3 actions at trigger time
- Apply delayed consequences to matching action types

---

### Vibe Design (Visual Intensity)

**Game phases based on time remaining:**

```typescript
function getGamePhase(timeRemaining: number): 'early' | 'mid' | 'late' {
  if (timeRemaining > 180) return 'early'; // 5:00 – 3:00
  if (timeRemaining > 60) return 'mid';    // 3:00 – 1:00
  return 'late';                           // 1:00 – 0:00
}
```

**Early Game (Calm):**
- Background: Light slate/cream
- Typography: Large, soft gray
- Buttons: Rounded, spacious padding
- Message box: Centered, generous whitespace
- Meters: Soft teal, gold, gray bars
- Animation: Slow (300ms transitions)

**Mid Game (Neutral):**
- Background: Slightly darker slate
- Typography: Medium, neutral charcoal
- Buttons: Tighter spacing, sharp corners
- Message box: Same width, less padding
- Meters: Same colors, no animation delay
- Animation: Normal (200ms transitions)

**Late Game (Urgent):**
- Background: Dark navy (#1E2761)
- Typography: Bold white, red accents
- Buttons: High contrast (dark bg, white text), minimal padding
- Message box: Full width, urgent red border
- Meters: Animated bars, red for danger zones
- Animation: Fast (100ms transitions), timer pulses

---

## Message System

### Message Generation

**Two Options:**

#### Option A: AI-Generated (Preferred for Polish)
- Pre-generate 70 messages at game start
- Call Claude API with prompt:
  ```
  Generate 70 unique, emotionally loaded CEO inbox messages.
  Each message should be 60–100 characters and fit one line.
  Vary tone: urgent, casual, passive-aggressive.
  Do not name specific people.
  Return as JSON array: [{ text, urgency, impactArea, emotionalWeight }]
  ```
- Store in state, deliver on schedule

#### Option B: Hardcoded Messages (Fast for MVP)
- Define 70 hardcoded messages in `messages.ts`
- Randomly shuffle at game start
- Examples:
  ```
  "Customer churn spiked after the last release."
  "The board wants an update. Today."
  "Two senior engineers are in conflict."
  "A competitor just announced something big."
  "Your CFO needs to talk. Now."
  "The team says they're burned out."
  ```

**Implementation (Hardcoded):**
```typescript
// src/lib/messages.ts

const MESSAGES = [
  {
    text: "Customer churn spiked after the last release.",
    urgency: 'high' as const,
    impactArea: 'product' as const,
    emotionalWeight: 'urgent' as const
  },
  // ... 69 more
];

export function generateMessages(): Message[] {
  return MESSAGES.map((msg, idx) => ({
    id: `msg-${idx}`,
    text: msg.text,
    urgency: msg.urgency,
    impactArea: msg.impactArea,
    emotionalWeight: msg.emotionalWeight
  }));
}
```

---

## End Game Reflection

### Reflection Logic

Analyze final meters vs. starting values. Determine player's strategy profile.

```typescript
// src/lib/reflections.ts

interface PlayerProfile {
  speedFocus: number;     // Handled now + ignored
  caution: number;        // Deferred + delegated
  teamFocus: number;      // Preserved team trust
  businessFocus: number;  // Preserved business health
}

function getPlayerProfile(history: { message: Message; action: Action }[]): PlayerProfile {
  // Count action types & their outcomes
  // Weight by message importance
  // Return profile scores
}

function getReflection(meters: Meters, profile: PlayerProfile): string {
  // Return appropriate reflection based on profile & final metrics
  // Examples:
  // "You prioritized speed over people."
  // "You protected your team but lost momentum."
  // "You survived. Barely."
  // "You burned out but stayed profitable."
}
```

### Reflection Examples

```
High Business + Low Team:   "You chose profit. Your team noticed."
High Team + Low Business:   "You protected your people. The numbers suffered."
High Stress + Low Both:     "You didn't survive. You crashed."
Balanced:                   "You made real trade-offs. That's leadership."
Early End (Team/Bus = 0):   "You didn't make it. Sometimes one decision ends everything."
```

---

## Development Checklist

### Phase 1: Foundation (20 min)
- [ ] Set up React + TypeScript + Tailwind + Vite
- [ ] Create basic project structure
- [ ] Define all TypeScript types
- [ ] Build App.tsx skeleton

### Phase 2: Core Components (30 min)
- [ ] StartScreen.tsx (simple button)
- [ ] MessageBox.tsx (static message display)
- [ ] ActionButtons.tsx (4 buttons, handle click)
- [ ] MeterDisplay.tsx (3 meters, static values)
- [ ] Timer.tsx (countdown display)

### Phase 3: Game Logic (20 min)
- [ ] Implement Game.tsx with useState & useEffect
- [ ] Timer countdown logic (tick every 100ms)
- [ ] Message queue & delivery schedule
- [ ] Action handling & meter updates
- [ ] Game phase transitions (start → playing → end)

### Phase 4: Styling & Vibe (15 min)
- [ ] Tailwind color palette (navy, teal, gold, red)
- [ ] Apply phase-based styling to all components
- [ ] Add smooth transitions & animations
- [ ] Test visual progression (early → mid → late)

### Phase 5: Polish & Test (5 min)
- [ ] EndScreen.tsx (final metrics + reflection)
- [ ] Play a full game, test edge cases
- [ ] Verify meter math & timing
- [ ] Fine-tune animations & colors

---

## Styling System

### Color Palette

```css
--navy: #1E2761      /* Dark backgrounds, bold text */
--teal: #00A896      /* Team Trust, primary accent */
--gold: #FFC857      /* Business Health, secondary accent */
--red: #E63946       /* CEO Stress, danger */
--cream: #F5F5F5     /* Light backgrounds, early game */
--slate: #E2E8F0     /* Light text backgrounds, mid game */
--dark: #1F2937      /* Dark text, late game */
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        navy: '#1E2761',
        teal: '#00A896',
        gold: '#FFC857',
        danger: '#E63946'
      },
      animation: {
        pulse: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        meter: 'meter 0.3s ease-out'
      },
      keyframes: {
        meter: {
          '0%': { width: 'var(--from)' },
          '100%': { width: 'var(--to)' }
        }
      }
    }
  }
};
```

---

## API Integration (Optional)

If using Claude to generate messages:

```typescript
// src/lib/messages.ts

async function generateMessagesWithAI(): Promise<Message[]> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Generate 70 unique CEO inbox messages as JSON. Each message should be 60–100 characters, emotionally loaded, and ambiguous. Return as: [{ text: string, urgency: 'high'|'medium'|'low', impactArea: 'people'|'product'|'money', emotionalWeight: 'urgent'|'neutral'|'concerning' }]`
      }]
    })
  });
  
  const data = await response.json();
  return JSON.parse(data.content[0].text);
}
```

**Note:** For MVP, hardcoded messages are faster. Save API integration for polish phase.

---

## Testing & Debug

### Debug Mode
Add to Game.tsx:

```typescript
const DEBUG = true; // Set to false for production

useEffect(() => {
  if (DEBUG) {
    console.log('Game State:', gameState);
    console.log('Time:', formatTime(gameState.timeRemaining));
  }
}, [gameState]);
```

### Test Scenarios
- [ ] Timer counts down correctly (5:00 → 0:00)
- [ ] Messages arrive on schedule
- [ ] Meters update per action
- [ ] Delayed effects trigger correctly
- [ ] Game transitions to end screen at 0:00
- [ ] Visual intensity changes at phase transitions
- [ ] Play again resets game state

---

## Performance Notes

- Messages pre-generated at start (no runtime lag)
- State updates batched (useCallback on expensive functions)
- Animations use CSS transitions (not JS)
- No network requests during gameplay (if using hardcoded messages)

---

## Edge Cases

1. **Meter reaches 0 or 100:** Game continues, reflection updates tone
2. **Multiple actions in quick succession:** Queue them, process in order
3. **Action clicked after game ends:** Ignore (buttons disabled)
4. **Resize window:** UI should stay responsive (test on mobile)

---

## Cursor AI Prompts

### Prompt 1: "Build the entire game from this spec"
```
Build a React CEO Simulator game based on this technical spec.
- 5-minute countdown timer
- Inbox messages with 4 action buttons
- Three meters (Team Trust, Business Health, CEO Stress)
- Dynamic styling that changes based on time (early/mid/late game)
- Use Tailwind CSS, TypeScript
- Keep code modular (separate components)
- Deploy to Vercel or GitHub Pages
```

### Prompt 2: "Generate 70 realistic CEO inbox messages"
```
Generate an array of 70 unique, short CEO inbox messages for a decision game.
Each message should be 60–100 characters, emotionally loaded, and ambiguous.
Vary the tone (urgent, casual, passive-aggressive).
Do not name specific people—use generics like "A senior engineer" or "The board."
Return as JSON: [{ text, urgency: 'high'|'medium'|'low', impactArea: 'people'|'product'|'money', emotionalWeight: 'urgent'|'neutral'|'concerning' }]
```

### Prompt 3: "Generate end-game reflections"
```
Create 20 unique, reflective end-game summaries for a CEO simulator game.
Each summary should be 1–2 sentences and mirror the player's decisions back to them.
Base them on meter profiles: high business/low team, high team/low business, balanced, etc.
Examples:
- "You chose profit. Your team noticed."
- "You protected your people. The numbers suffered."
- "You survived. Barely."
Return as a TypeScript object mapping profile types to reflection text.
```

---

## Deployment

### Quick Deploy to Vercel
```bash
npm install -g vercel
vercel
# Follow prompts, select Vite project
```

### Or Build & Deploy Static
```bash
npm run build
# Upload dist/ folder to GitHub Pages or Netlify
```

---

## Success Criteria

By the end of this sprint:
- [ ] Game is playable end-to-end (5 min, 70 messages, all 4 actions work)
- [ ] Meters update correctly based on actions
- [ ] Timer counts down and triggers end screen at 0:00
- [ ] UI transforms from calm → urgent as time runs out
- [ ] End screen shows final metrics & reflection
- [ ] No console errors or warnings
- [ ] Works on desktop & mobile

---

## Notes for Cursor AI

This spec is designed for rapid development. Feel free to:
- Simplify components if needed
- Use hardcoded messages instead of API calls
- Combine smaller components if it's faster
- Skip animations in Phase 1, add later if time permits

The goal is a **playable MVP in 90 minutes**, not a polished product. Ship something that works, then iterate.
