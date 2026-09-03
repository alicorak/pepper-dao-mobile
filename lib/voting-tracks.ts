/**
 * Voting Track derivation
 *
 * The Pepper DAO Constitution defines three voting cycles:
 *   - Standard Track (7 days)  — major treasury / protocol / elections
 *   - Agile Track (3 days)     — community initiatives / minor adjustments
 *   - Fast Track (48 hours)    — critical security / urgent treasury (66% quorum)
 *
 * Since proposals carry an on-chain duration (endDate - startDate),
 * we bucket them into these tracks. Buckets are wider than nominal
 * to absorb small drift (block-time variance, off-by-a-few-minutes
 * configurations) so a "7-day" proposal whose effective duration is
 * 6d 23h 58m still reads as STANDARD rather than CUSTOM.
 */

export type VotingTrack = 'STANDARD' | 'AGILE' | 'FAST' | 'CUSTOM';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export function deriveVotingTrack(
  startDate: string,
  endDate: string,
): VotingTrack {
  const start = parseInt(startDate, 10);
  const end = parseInt(endDate, 10);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 'CUSTOM';
  }

  const durationMs = (end - start) * 1000;

  if (durationMs <= 60 * HOUR_MS) {
    return 'FAST';
  }
  if (durationMs <= 5 * DAY_MS) {
    return 'AGILE';
  }
  if (durationMs <= 9 * DAY_MS) {
    return 'STANDARD';
  }
  return 'CUSTOM';
}

export const VOTING_TRACK_LABELS: Record<VotingTrack, string> = {
  STANDARD: 'Standard',
  AGILE: 'Agile',
  FAST: 'Fast Track',
  CUSTOM: 'Custom',
};

export const VOTING_TRACK_DURATION_LABELS: Record<VotingTrack, string> = {
  STANDARD: '7 days',
  AGILE: '3 days',
  FAST: '48 hours',
  CUSTOM: 'Custom duration',
};

export function getVotingTrackLabel(track: VotingTrack): string {
  return VOTING_TRACK_LABELS[track];
}

export interface VotingTrackColors {
  background: string;
  text: string;
}

export function getVotingTrackColors(track: VotingTrack): VotingTrackColors {
  if (track === 'STANDARD') {
    return { background: '#1E4F3A', text: '#FFFFFF' };
  }
  if (track === 'AGILE') {
    return { background: '#FFC043', text: '#000000' };
  }
  if (track === 'FAST') {
    return { background: '#E54545', text: '#FFFFFF' };
  }
  return { background: '#4B5563', text: '#FFFFFF' };
}
