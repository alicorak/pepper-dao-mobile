import { RANK_LABELS, RANK_ORDER, RANK_REQUIREMENTS } from '@/lib/reputation';
import type { Profile, Rank } from '@/types/user';

import { THERMAL_COLORS } from '../theme';

/**
 * Thermal Pixel presents the six reputation ranks as pepper "heat levels"
 * measured in Scoville Heat Units (SHU). Rank logic itself stays in
 * lib/reputation.ts — this file only maps it onto the thermal vocabulary.
 */
export interface HeatLevel {
  rank: Rank;
  name: string;
  shu: number;
  level: number;
  /** Pepper body color used to tint the pixel-art pepper */
  color: string;
  stemColor: string;
}

export const HEAT_LEVELS: Record<Rank, HeatLevel> = {
  OBSERVER: { rank: 'OBSERVER', name: 'BELL', shu: 0, level: 1, color: '#3FAE5A', stemColor: '#1E7A3A' },
  MEMBER: { rank: 'MEMBER', name: 'JALAPEÑO', shu: 8_000, level: 2, color: '#1E7A3A', stemColor: '#3FAE5A' },
  PARTICIPANT: { rank: 'PARTICIPANT', name: 'CAYENNE', shu: 50_000, level: 3, color: '#E54545', stemColor: '#2E8B45' },
  STEWARD: { rank: 'STEWARD', name: 'HABANERO', shu: 350_000, level: 4, color: THERMAL_COLORS.orange, stemColor: '#2E8B45' },
  INITIATOR: { rank: 'INITIATOR', name: 'GHOST', shu: 1_000_000, level: 5, color: THERMAL_COLORS.magenta, stemColor: '#2E8B45' },
  GOVERNOR: { rank: 'GOVERNOR', name: 'REAPER', shu: 1_600_000, level: 6, color: THERMAL_COLORS.crimson, stemColor: '#1E7A3A' },
};

export const MAX_HEAT_LEVEL = RANK_ORDER.length;

export function getHeatLevel(rank: Rank): HeatLevel {
  return HEAT_LEVELS[rank];
}

export function getNextHeatLevel(rank: Rank): HeatLevel | null {
  const index = RANK_ORDER.indexOf(rank);
  const next = RANK_ORDER[index + 1];
  return next ? HEAT_LEVELS[next] : null;
}

export function getRankLabel(rank: Rank): string {
  return RANK_LABELS[rank].toUpperCase();
}

export interface HeatProgress {
  current: HeatLevel;
  next: HeatLevel | null;
  /** 0…1 progress of reputation points towards the next rank */
  progress: number;
  /** Points required by the next rank (null at max rank) */
  targetPoints: number | null;
  shu: number;
}

/**
 * SHU interpolates between the current and next level by REP progress,
 * so it grows with every action but only crosses a level on an actual rank-up.
 */
export function getHeatProgress(profile: Profile): HeatProgress {
  const current = getHeatLevel(profile.rank);
  const next = getNextHeatLevel(profile.rank);

  if (!next) {
    const bonus = Math.max(0, profile.reputation_points - RANK_REQUIREMENTS.GOVERNOR.points) * 100;
    return { current, next, progress: 1, targetPoints: null, shu: current.shu + bonus };
  }

  const fromPoints = RANK_REQUIREMENTS[profile.rank].points;
  const targetPoints = RANK_REQUIREMENTS[next.rank].points;
  const span = Math.max(1, targetPoints - fromPoints);
  const raw = (profile.reputation_points - fromPoints) / span;
  const progress = Math.min(0.95, Math.max(0, raw));
  const shu = Math.round((current.shu + (next.shu - current.shu) * progress) / 100) * 100;

  return { current, next, progress, targetPoints, shu };
}

export function formatShu(shu: number): string {
  if (shu >= 1_000_000) return `${(shu / 1_000_000).toFixed(shu % 1_000_000 === 0 ? 0 : 1)}M`;
  if (shu >= 1_000) return `${Math.round(shu / 1_000)}K`;
  return `${shu}`;
}

/**
 * Heat retention tiers derived from the governance streak (weeks).
 */
export const RETENTION_TIERS = ['COLD', 'SPARK', 'HOT', 'BLAZE', 'INFERNO'] as const;
export type RetentionTier = (typeof RETENTION_TIERS)[number];

export function getRetentionTier(streakWeeks: number): RetentionTier {
  if (streakWeeks >= 8) return 'INFERNO';
  if (streakWeeks >= 4) return 'BLAZE';
  if (streakWeeks >= 2) return 'HOT';
  if (streakWeeks >= 1) return 'SPARK';
  return 'COLD';
}
