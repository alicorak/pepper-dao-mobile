import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useUser } from '@/contexts/user-context';
import { useActivities } from '@/hooks/use-activities';
import { RANK_IMAGES } from '@/lib/rank-images';
import { getEventTitle } from '@/lib/reputation';
import type { Activity, Profile } from '@/types/user';

import { BlinkDot, DashedDivider, Touchable } from '../components/atoms';
import { CornerBrackets } from '../components/corner-brackets';
import { HowToEarnSheet } from '../components/how-to-earn-sheet';
import { Panel } from '../components/panel';
import { HeatPepper, PixelArt } from '../components/pixel-art';
import { getHeatBarColors, PixelBar } from '../components/pixel-bar';
import { PixelButton } from '../components/pixel-button';
import { PIXEL_CORE_VARIANTS, PixelCore, type PixelCoreVariant } from '../components/pixel-core';
import { useRankUp } from '../components/rank-up-overlay';
import { StakeSheet } from '../components/stake-sheet';
import { ThermalScreen } from '../components/thermal-screen';
import { WalletChip } from '../components/wallet-chip';
import { useCountUp } from '../hooks/use-count-up';
import { useFocusKey } from '../hooks/use-focus-key';
import { formatDayMonth, formatInteger } from '../lib/format';
import {
  formatShu,
  getHeatProgress,
  getRankLabel,
  getRetentionTier,
  HEAT_LEVELS,
  MAX_HEAT_LEVEL,
  RETENTION_TIERS,
} from '../lib/heat-levels';
import { SPACE, THERMAL_COLORS, TYPE } from '../theme';

/**
 * POWER — your heat signature: the camera locks onto your rank art, the
 * thermal scale shows where you sit, and the heat log lists what earned it.
 */
export function PowerScreen() {
  const { profile, isLoading } = useUser();
  const [isStakeOpen, setIsStakeOpen] = useState(false);
  const [isHowToOpen, setIsHowToOpen] = useState(false);
  const [coreVariant, setCoreVariant] = useState<PixelCoreVariant>('flicker');

  return (
    <ThermalScreen preset="power">
      {isLoading && !profile ? (
        <View style={styles.center}>
          <ActivityIndicator color={THERMAL_COLORS.gold} />
          <Text style={[TYPE.label10, { color: 'rgba(255,255,255,0.6)' }]}>CALIBRATING SENSOR…</Text>
        </View>
      ) : null}

      {!isLoading && !profile ? (
        <Panel>
          <Text style={TYPE.display24}>No heat signature</Text>
          <Text style={TYPE.body13}>Connect your wallet to start building heat.</Text>
          <WalletChip />
        </Panel>
      ) : null}

      {profile ? (
        <>
          <CoreVariantTabs value={coreVariant} onChange={setCoreVariant} />
          <HeatCamera profile={profile} variant={coreVariant} />
          <RetentionPanel profile={profile} />
          <Animated.View style={[styles.row, { gap: 12 }]}>
            <PixelButton label="STAKE PEPPER" variant="gold" style={{ flex: 1 }} onPress={() => setIsStakeOpen(true)} />
            <PixelButton label="HOW TO EARN" variant="outline" style={{ flex: 1 }} onPress={() => setIsHowToOpen(true)} />
          </Animated.View>
          <HeatLog profile={profile} />
        </>
      ) : null}

      <StakeSheet visible={isStakeOpen} onClose={() => setIsStakeOpen(false)} />
      {profile ? <HowToEarnSheet visible={isHowToOpen} profile={profile} onClose={() => setIsHowToOpen(false)} /> : null}
    </ThermalScreen>
  );
}

/** Temporary picker to compare background animations — remove once one is chosen */
function CoreVariantTabs({ value, onChange }: { value: PixelCoreVariant; onChange: (variant: PixelCoreVariant) => void }) {
  return (
    <View style={[styles.row, { gap: 8, flexWrap: 'wrap' }]}>
      {PIXEL_CORE_VARIANTS.map((option) => {
        const isActive = option.value === value;
        return (
          <Touchable
            key={option.value}
            hitSlop={8}
            onPress={() => onChange(option.value)}
            style={[styles.variantTab, isActive && styles.variantTabActive]}
          >
            <View pointerEvents="none">
              <Text style={[TYPE.label10, { color: isActive ? THERMAL_COLORS.void : 'rgba(255,255,255,0.7)' }]}>
                {option.label}
              </Text>
            </View>
          </Touchable>
        );
      })}
    </View>
  );
}

function HeatCamera({ profile, variant }: { profile: Profile; variant: PixelCoreVariant }) {
  const { width } = useWindowDimensions();
  const focusKey = useFocusKey();
  const { preview } = useRankUp();
  const heat = getHeatProgress(profile);
  const animatedShu = useCountUp(heat.shu, 1500);
  const stageWidth = width - 32;
  const centerX = stageWidth / 2;

  return (
    <View style={{ height: STAGE_HEIGHT }}>
      <View style={[StyleSheet.absoluteFill, { left: -16, right: -16 }]}>
        <PixelCore
          width={width}
          height={STAGE_HEIGHT}
          centerX={width / 2}
          centerY={ART_CENTER_Y}
          intensity={(heat.current.level - 1) / (MAX_HEAT_LEVEL - 1)}
          variant={variant}
        />
      </View>

      {/* Same hero pattern as Pulse: status row above, viewfinder below */}
      <Animated.View style={styles.stageHud}>
        <View style={[styles.row, { gap: 6 }]}>
          <BlinkDot />
          <Text style={TYPE.meta18}>REC · PEPPER-CAM 02</Text>
        </View>
        <WalletChip />
      </Animated.View>

      <View style={styles.viewfinder} pointerEvents="none">
        <CornerBrackets size={16} focusKey={focusKey} />
      </View>

      <FloatingArt profile={profile} centerX={centerX} />
      <Crosshair centerX={centerX} />
      <ThermalScale levelIndex={heat.current.level - 1} />
      <YouCallout shu={heat.shu} centerX={centerX} />

      <View style={styles.readout}>
        <Text style={[TYPE.label10, { color: 'rgba(255,255,255,0.6)' }]}>YOUR HEAT · SCOVILLE READING</Text>
        <Pressable onLongPress={preview} delayLongPress={600}>
          <View style={[styles.row, { alignItems: 'flex-end', gap: 8 }]}>
            <Text style={[TYPE.display72, styles.dropShadow]}>{formatInteger(animatedShu)}</Text>
            <Text style={[TYPE.label15, styles.dropShadowSmall, { marginBottom: 8 }]}>SHU</Text>
          </View>
        </Pressable>
        <View style={[styles.row, { gap: 8 }]}>
          <HeatPepper level={heat.current} width={18} />
          <Text style={[TYPE.meta20, { color: THERMAL_COLORS.gold }]}>
            {`${heat.current.name} · ${getRankLabel(profile.rank)} · HEAT ${heat.current.level}/${MAX_HEAT_LEVEL}`}
          </Text>
        </View>
      </View>
    </View>
  );
}

function FloatingArt({ profile, centerX }: { profile: Profile; centerX: number }) {
  const enter = useSharedValue(0);

  useEffect(() => {
    enter.value = withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) });
  }, [enter]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: enter.value }));

  return (
    <Animated.View style={[styles.art, { left: centerX - ART_SIZE / 2 }, animatedStyle]}>
      <Image source={RANK_IMAGES[profile.rank] as number} style={{ width: ART_SIZE, height: ART_SIZE, opacity: 0.95 }} contentFit="contain" />
    </Animated.View>
  );
}

function Crosshair({ centerX }: { centerX: number }) {
  const spin = useSharedValue(0);

  // Slow opacity pulse only — no rotation or scaling
  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [spin]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: 0.5 + spin.value * 0.4 }));

  return (
    <Animated.View pointerEvents="none" style={[styles.crosshair, { left: centerX - 14 }, animatedStyle]}>
      <PixelArt name="crosshair" />
    </Animated.View>
  );
}

function YouCallout({ shu, centerX }: { shu: number; centerX: number }) {
  return (
    <View
     
      pointerEvents="none"
      style={[styles.callout, { left: centerX + 39 }]}
    >
      <View style={{ marginTop: 30 }}>
        <PixelArt name="leader" />
      </View>
      <View style={styles.calloutBox}>
        <Text style={[TYPE.label10, { color: THERMAL_COLORS.void }]}>YOU</Text>
        <Text style={[TYPE.meta18, { color: THERMAL_COLORS.void }]}>{`${formatInteger(shu)} SHU`}</Text>
      </View>
    </View>
  );
}

/** Right-hand thermal scale: cells fill bottom-up, then the marker slides to your level */
function ThermalScale({ levelIndex }: { levelIndex: number }) {
  const marker = useSharedValue(0);

  useEffect(() => {
    marker.value = withDelay(400, withTiming(levelIndex, { duration: 420, easing: Easing.out(Easing.cubic) }));
  }, [levelIndex, marker]);

  const markerStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -marker.value * LEVEL_STEP }] }));

  return (
    <View pointerEvents="none" style={styles.scale}>
      <View style={styles.scaleLabels}>
        {LEVEL_LIST.map((level, index) => (
          <Text
            key={level.rank}
            style={[
              TYPE.meta16,
              styles.scaleLabel,
              { bottom: index * LEVEL_STEP - 2, color: index === levelIndex ? THERMAL_COLORS.white : 'rgba(255,255,255,0.55)' },
            ]}
          >
            {`${level.name} ${formatShu(level.shu)}`}
          </Text>
        ))}
      </View>
      <View style={{ gap: 2 }}>
        {SCALE_COLORS.map((color, index) => (
          <ScaleCell key={index} color={color} delay={(SCALE_COLORS.length - index) * 8} />
        ))}
      </View>
      <Animated.Text style={[TYPE.label12, styles.scaleMarker, { color: THERMAL_COLORS.cream }, markerStyle]}>{'<'}</Animated.Text>
    </View>
  );
}

function ScaleCell({ color, delay }: { color: string; delay: number }) {
  const lit = useSharedValue(0);

  useEffect(() => {
    lit.value = withDelay(delay, withTiming(1, { duration: 120 }));
  }, [delay, lit]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: 0.1 + lit.value * 0.9 }));

  return <Animated.View style={[{ width: 12, height: 7, backgroundColor: color }, animatedStyle]} />;
}

function RetentionPanel({ profile }: { profile: Profile }) {
  const heat = getHeatProgress(profile);
  const weeks = profile.current_streak_weeks;
  const tier = getRetentionTier(weeks);
  const tierIndex = RETENTION_TIERS.indexOf(tier);
  const repProgress = heat.targetPoints === null ? 1 : heat.targetPoints > 0 ? profile.reputation_points / heat.targetPoints : 0;

  return (
    <Panel index={1}>
      <View style={styles.between}>
        <View style={[styles.row, { gap: 10 }]}>
          <FlickerFlame />
          <View>
            <Text style={[TYPE.label10, { color: 'rgba(255,255,255,0.6)' }]}>HEAT RETENTION</Text>
            <Text style={TYPE.display32}>{weeks === 1 ? '1 WEEK' : `${weeks} WEEKS`}</Text>
          </View>
        </View>
        <WeeklyHeat weeks={weeks} />
      </View>

      <View style={[styles.row, { gap: 4 }]}>
        {RETENTION_TIERS.map((item, index) => {
          const isActive = index === tierIndex;
          const isPast = index < tierIndex;
          return (
            <View
              key={item}
              style={[
                styles.tier,
                { backgroundColor: isActive ? THERMAL_COLORS.orange : isPast ? THERMAL_COLORS.ghost : 'rgba(255,255,255,0.05)' },
              ]}
            >
              <Text
                style={[
                  TYPE.label10,
                  { color: isActive ? THERMAL_COLORS.void : isPast ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)' },
                ]}
              >
                {item}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.between}>
        <Text style={TYPE.meta16}>
          {heat.next ? `TARGET: ${heat.next.name} ${formatShu(heat.next.shu)} SHU` : 'MAX HEAT REACHED'}
        </Text>
        <Text style={[TYPE.meta16, { color: THERMAL_COLORS.gold }]}>
          {heat.targetPoints ? `${profile.reputation_points}/${heat.targetPoints} REP` : `${profile.reputation_points} REP`}
        </Text>
      </View>
      <PixelBar colors={getHeatBarColors(repProgress)} height={8} delay={400} />
    </Panel>
  );
}

function FlickerFlame() {
  const flick = useSharedValue(0);

  useEffect(() => {
    flick.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [flick]);

  // Gentle glow instead of a jittery scale flicker
  const animatedStyle = useAnimatedStyle(() => ({ opacity: 0.8 + flick.value * 0.2 }));

  return (
    <Animated.View style={animatedStyle}>
      <PixelArt name="flameLarge" />
    </Animated.View>
  );
}

/** Six weekly columns that rise as the streak grows */
function WeeklyHeat({ weeks }: { weeks: number }) {
  return (
    <View style={[styles.row, { gap: 4, alignItems: 'flex-end' }]}>
      {WEEK_COLORS.map((color, column) => {
        const isFilled = column < weeks;
        const height = isFilled ? Math.min(6, 2 + column) : 6;
        return (
          <View key={column} style={{ gap: 2 }}>
            {Array.from({ length: 6 }, (_, row) => {
              const fromBottom = 5 - row;
              const visible = fromBottom < height;
              return (
                <Animated.View
                  key={row}
                 
                  style={{
                    width: 10,
                    height: 6,
                    backgroundColor: !visible ? 'transparent' : isFilled ? color : THERMAL_COLORS.ghost,
                  }}
                />
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

function HeatLog({ profile }: { profile: Profile }) {
  const { records: activities, isLoading } = useActivities({ profileId: profile.id, limit: 12 });

  return (
    <Panel index={4} padding={0} gap={0}>
      <View style={[styles.between, styles.logRow]}>
        <Text style={TYPE.label10}>HEAT LOG</Text>
        <Text style={[TYPE.meta16, { color: 'rgba(255,255,255,0.6)' }]}>{`${profile.reputation_points} REP TOTAL`}</Text>
      </View>
      {isLoading && activities.length === 0 ? (
        <View style={styles.logRow}>
          <ActivityIndicator color={THERMAL_COLORS.gold} />
        </View>
      ) : null}
      {!isLoading && activities.length === 0 ? (
        <>
          <DashedDivider />
          <View style={styles.logRow}>
            <Text style={[TYPE.meta16, { color: 'rgba(255,255,255,0.6)' }]}>No heat yet — vote on a proposal to spark it.</Text>
          </View>
        </>
      ) : null}
      {activities.map((activity, index) => (
        <Animated.View key={activity.id}>
          <DashedDivider />
          <View style={[styles.row, styles.logRow, { gap: 12 }]}>
            <Text style={[TYPE.display24, { width: 40, color: getLogColor(activity) }]}>{getLogPoints(activity)}</Text>
            <Text style={[TYPE.meta18, { flex: 1, color: 'rgba(255,255,255,0.85)' }]} numberOfLines={1}>
              {getLogTitle(activity)}
            </Text>
            <Text style={[TYPE.meta16, { color: 'rgba(255,255,255,0.4)' }]}>{formatDayMonth(activity.created_at)}</Text>
          </View>
        </Animated.View>
      ))}
    </Panel>
  );
}

function getLogPoints(activity: Activity): string {
  if (activity.event_type === 'RANK_UP') return 'UP';
  if (activity.points === 0) return '·';
  return activity.points > 0 ? `+${activity.points}` : `${activity.points}`;
}

function getLogColor(activity: Activity): string {
  if (activity.event_type === 'RANK_UP') return THERMAL_COLORS.gold;
  if (activity.event_type === 'STREAK_MILESTONE') return THERMAL_COLORS.orange;
  if (activity.points < 0) return THERMAL_COLORS.blue;
  return THERMAL_COLORS.cream;
}

function getLogTitle(activity: Activity): string {
  switch (activity.event_type) {
    case 'RANK_UP':
      return activity.rank_after ? `RANK UP > ${getRankLabel(activity.rank_after)}` : 'RANK UP';
    case 'STREAK_MILESTONE': {
      const weeks = (activity.metadata as { weeks?: number })?.weeks ?? 0;
      return `STREAK BONUS · ${weeks} WEEKS`;
    }
    case 'VOTE':
    case 'FIRST_VOTE':
      return activity.proposal_id !== null ? `VOTED · #${activity.proposal_id}` : 'VOTED';
    case 'WALLET_CONNECTED':
      return 'WALLET LINKED';
    default:
      return getEventTitle(activity).toUpperCase();
  }
}

const STAGE_HEIGHT = 508;
const ART_SIZE = 110;
const ART_CENTER_Y = 273;
const LEVEL_STEP = 72;
const VIEWFINDER_TOP = 44;

const LEVEL_LIST = Object.values(HEAT_LEVELS);

const SCALE_COLORS = [
  ...Array(5).fill(THERMAL_COLORS.cream),
  ...Array(5).fill(THERMAL_COLORS.gold),
  ...Array(5).fill(THERMAL_COLORS.orange),
  ...Array(5).fill(THERMAL_COLORS.red),
  ...Array(5).fill(THERMAL_COLORS.magenta),
  ...Array(5).fill(THERMAL_COLORS.violet),
  ...Array(5).fill(THERMAL_COLORS.indigo),
  ...Array(5).fill(THERMAL_COLORS.navy),
] as Array<string>;

const WEEK_COLORS = [
  THERMAL_COLORS.violet,
  THERMAL_COLORS.magenta,
  THERMAL_COLORS.orange,
  THERMAL_COLORS.red,
  THERMAL_COLORS.gold,
  THERMAL_COLORS.cream,
];


const styles = StyleSheet.create({
  variantTab: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  variantTabActive: {
    backgroundColor: THERMAL_COLORS.gold,
    borderColor: THERMAL_COLORS.gold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  between: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  center: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 120,
  },
  stageHud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  art: {
    position: 'absolute',
    top: ART_CENTER_Y - ART_SIZE / 2,
  },
  crosshair: {
    position: 'absolute',
    top: ART_CENTER_Y - 14,
  },
  // Sits in the gap between the GHOST and HABANERO scale labels
  callout: {
    position: 'absolute',
    top: ART_CENTER_Y - 124,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  calloutBox: {
    backgroundColor: THERMAL_COLORS.cream,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: -2,
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  scale: {
    position: 'absolute',
    top: 70,
    right: 4,
    flexDirection: 'row',
    gap: 6,
  },
  scaleLabels: {
    position: 'absolute',
    right: 24,
    top: 0,
    bottom: 0,
    width: 160,
  },
  scaleLabel: {
    position: 'absolute',
    right: 0,
    textAlign: 'right',
  },
  scaleMarker: {
    position: 'absolute',
    right: -14,
    bottom: -2,
  },
  viewfinder: {
    position: 'absolute',
    top: VIEWFINDER_TOP,
    bottom: 6,
    left: 0,
    right: 0,
  },
  readout: {
    position: 'absolute',
    left: SPACE.panel,
    top: 372,
    gap: 6,
  },
  dropShadow: {
    textShadowColor: '#000000',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0.1,
  },
  dropShadowSmall: {
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0.1,
  },
  tier: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  logRow: {
    paddingHorizontal: SPACE.rowX,
    paddingVertical: SPACE.rowY,
  },
});
