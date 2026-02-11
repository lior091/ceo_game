import { Action, Meters, Message } from '../types/game';

interface PlayerProfile {
  speedFocus: number;     // Handled now + ignored
  caution: number;        // Deferred + delegated
  teamFocus: number;      // Preserved team trust
  businessFocus: number;  // Preserved business health
}

export function getPlayerProfile(
  history: { message: Message; action: Action }[]
): PlayerProfile {
  let speedFocus = 0;
  let caution = 0;
  let teamFocus = 0;
  let businessFocus = 0;

  for (const entry of history) {
    const { action, message } = entry;
    const weight = message.urgency === 'high' ? 2 : message.urgency === 'low' ? 0.5 : 1;

    if (action === 'handle' || action === 'ignore') {
      speedFocus += weight;
    }
    if (action === 'defer' || action === 'delegate') {
      caution += weight;
    }
    if (message.impactArea === 'people' && (action === 'handle' || action === 'delegate')) {
      teamFocus += weight;
    }
    if (message.impactArea === 'money' || message.impactArea === 'product') {
      if (action === 'handle') {
        businessFocus += weight;
      }
    }
  }

  return { speedFocus, caution, teamFocus, businessFocus };
}

export function getReflection(
  meters: Meters,
  profile: PlayerProfile,
  startMeters: Meters
): string {
  const teamDelta = meters.teamTrust - startMeters.teamTrust;
  const businessDelta = meters.businessHealth - startMeters.businessHealth;
  const stressLevel = meters.ceoStress;

  // High business, low team
  if (businessDelta > 10 && teamDelta < -10) {
    return "You chose profit. Your team noticed.";
  }

  // High team, low business
  if (teamDelta > 5 && businessDelta < -10) {
    return "You protected your people. The numbers suffered.";
  }

  // High stress, low both
  if (stressLevel > 80 && (meters.teamTrust < 40 || meters.businessHealth < 40)) {
    return "You didn't survive. You crashed.";
  }

  // Balanced approach
  if (Math.abs(teamDelta) < 15 && Math.abs(businessDelta) < 15 && stressLevel < 70) {
    return "You made real trade-offs. That's leadership.";
  }

  // Speed focus
  if (profile.speedFocus > profile.caution * 1.5) {
    return "You prioritized speed over everything. The cost was high.";
  }

  // Caution focus
  if (profile.caution > profile.speedFocus * 1.5) {
    return "You were cautious. Too cautious. Momentum was lost.";
  }

  // Early end (meters at 0)
  if (meters.teamTrust === 0 || meters.businessHealth === 0) {
    return "You didn't make it. Sometimes one decision ends everything.";
  }

  // High stress
  if (stressLevel > 90) {
    return "You burned out but stayed profitable.";
  }

  // Default
  return "You survived. Barely.";
}

// Overall numeric score for a round, higher = better.
// Based on: time survived + final Team, Business, and (low) Stress.
export function calculateScore(
  meters: Meters,
  _profile: PlayerProfile,
  _startMeters: Meters,
  durationSeconds: number,
): number {
  const TOTAL_TIME = 300;

  // Normalize each component to 0–1
  const teamNorm = meters.teamTrust / 100;               // high is good
  const businessNorm = meters.businessHealth / 100;      // high is good
  const stressNorm = 1 - meters.ceoStress / 100;         // low stress is good
  const timeNorm = Math.max(0, Math.min(1, durationSeconds / TOTAL_TIME)); // survive longer is good

  // Weighted blend
  const quality =
    0.35 * teamNorm +
    0.35 * businessNorm +
    0.20 * stressNorm +
    0.10 * timeNorm;

  // Scale to an easy-to-read range
  const score = quality * 1000;

  return Math.max(0, Math.round(score));
}
