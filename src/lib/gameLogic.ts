import { Action, Message, Meters, VisualPhase } from '../types/game';

export function getGamePhase(timeRemaining: number): VisualPhase {
  if (timeRemaining > 180) return 'early'; // 5:00 – 3:00
  if (timeRemaining > 60) return 'mid';    // 3:00 – 1:00
  return 'late';                           // 1:00 – 0:00
}

export function getMessageDeliverySchedule(totalTime = 300): number[] {
  const schedule = [];
  // Start messages quickly, then ramp up frequency
  let time = 1.5; // First message ~1.5 sec in
  
  while (time < totalTime) {
    schedule.push(time);
    if (time < 60) {
      // 0–1 minute: 1 msg every 4s
      time += 4;
    } else if (time < 180) {
      // 1–3 minutes: 1 msg every 3s
      time += 3;
    } else {
      // 3–5 minutes: 1 msg every 2s
      time += 2;
    }
  }
  
  return schedule;
}

export function updateMeters(
  currentMeters: Meters,
  action: Action,
  message: Message
): Meters {
  const baseEffects: Record<Action, { stress: number; business: number; team: number }> = {
    handle:   { stress: +10, business: 0,  team: 0 },
    // Delegating relieves you but visibly costs some trust immediately
    delegate: { stress: -5,  business: 0,  team: -4 },
    // Deferring nudges both business and trust down a bit
    defer:    { stress: -3,  business: -3, team: -2 },
    // Ignoring clearly hurts both business and trust
    ignore:   { stress: -8,  business: -5, team: -5 }
  };

  const urgencyModifier = message.urgency === 'high' ? 1.3 : message.urgency === 'low' ? 0.7 : 1;
  const effects = baseEffects[action];

  return {
    teamTrust: Math.max(0, Math.min(100, currentMeters.teamTrust + effects.team * urgencyModifier)),
    businessHealth: Math.max(0, Math.min(100, currentMeters.businessHealth + effects.business * urgencyModifier)),
    ceoStress: Math.max(0, Math.min(100, currentMeters.ceoStress + effects.stress * urgencyModifier))
  };
}

export function applyDelayedEffects(
  meters: Meters,
  history: { message: Message; action: Action; timestamp: number }[],
  triggerTime: number,
  elapsedTime: number
): Meters {
  let updatedMeters = { ...meters };
  
  // Look back at actions in the relevant time window
  const relevantActions = history.filter(
    entry => elapsedTime - entry.timestamp <= 120 // Last 2 minutes
  );

  // Apply delayed effects based on action type
  for (const entry of relevantActions) {
    const { action, message } = entry;
    const urgencyModifier = message.urgency === 'high' ? 1.3 : message.urgency === 'low' ? 0.7 : 1;

    switch (action) {
      case 'handle':
        // Business +15 at 2 min mark
        if (triggerTime === 120) {
          updatedMeters.businessHealth = Math.max(0, Math.min(100, 
            updatedMeters.businessHealth + 15 * urgencyModifier));
        }
        break;
      case 'delegate':
        // Team Trust -8 at 3 min mark
        if (triggerTime === 180) {
          updatedMeters.teamTrust = Math.max(0, Math.min(100,
            updatedMeters.teamTrust - 8 * urgencyModifier));
        }
        break;
      case 'defer':
        // Business -10 at 4 min mark
        if (triggerTime === 240) {
          updatedMeters.businessHealth = Math.max(0, Math.min(100,
            updatedMeters.businessHealth - 10 * urgencyModifier));
        }
        break;
      case 'ignore':
        // Team Trust -15 & Business -10 at end
        if (triggerTime === 300 || elapsedTime >= 300) {
          updatedMeters.teamTrust = Math.max(0, Math.min(100,
            updatedMeters.teamTrust - 15 * urgencyModifier));
          updatedMeters.businessHealth = Math.max(0, Math.min(100,
            updatedMeters.businessHealth - 10 * urgencyModifier));
        }
        break;
    }
  }

  return updatedMeters;
}
