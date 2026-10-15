import * as Haptics from 'expo-haptics';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Modal, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useUser } from '@/contexts/user-context';
import { RANK_ORDER } from '@/lib/reputation';
import { StorageService } from '@/lib/storage';
import type { Rank } from '@/types/user';

import { formatInteger } from '../lib/format';
import { formatShu, getHeatLevel, getNextHeatLevel, getRankLabel, MAX_HEAT_LEVEL } from '../lib/heat-levels';
import { THERMAL_COLORS, TYPE } from '../theme';
import { HeatPepper } from './pixel-art';
import { PixelButton } from './pixel-button';

interface RankUpContextValue {
  /** Shows the overlay for the current rank (or a demo jump) without a real rank change */
  preview: () => void;
}

const RankUpContext = createContext<RankUpContextValue>({ preview: () => undefined });

/**
 * Watches the profile rank and plays the LEVEL UP overlay whenever it rises.
 * The last seen rank is persisted so the celebration plays exactly once.
 */
export function RankUpProvider({ children }: { children: ReactNode }) {
  const { profile } = useUser();
  const [transition, setTransition] = useState<RankTransition | null>(null);

  useEffect(() => {
    if (!profile) return;

    const storageKey = `${LAST_RANK_KEY}:${profile.id}`;
    const lastRank = StorageService.getString(storageKey) as Rank | undefined;
    StorageService.setString(storageKey, profile.rank);

    if (!lastRank || !RANK_ORDER.includes(lastRank)) return;
    if (RANK_ORDER.indexOf(profile.rank) > RANK_ORDER.indexOf(lastRank)) {
      setTransition({ from: lastRank, to: profile.rank });
    }
  }, [profile]);

  const preview = useCallback(() => {
    const to = profile?.rank && profile.rank !== 'OBSERVER' ? profile.rank : 'PARTICIPANT';
    const from = RANK_ORDER[Math.max(0, RANK_ORDER.indexOf(to) - 1)];
    setTransition({ from, to });
  }, [profile?.rank]);

  const value = useMemo(() => ({ preview }), [preview]);

  return (
    <RankUpContext.Provider value={value}>
      {children}
      <RankUpOverlay transition={transition} onClose={() => setTransition(null)} />
    </RankUpContext.Provider>
  );
}

export function useRankUp(): RankUpContextValue {
  return useContext(RankUpContext);
}

interface RankUpOverlayProps {
  transition: RankTransition | null;
  onClose: () => void;
}

function RankUpOverlay({ transition, onClose }: RankUpOverlayProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    if (!transition) return;
    const timer = setTimeout(() => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 650);
    return () => clearTimeout(timer);
  }, [transition]);

  if (!transition) return null;

  const level = getHeatLevel(transition.to);
  const next = getNextHeatLevel(transition.to);

  async function handleShare() {
    await Share.share({
      message: `My heat just hit ${level.name} (${formatInteger(level.shu)} SHU) on Pepper DAO 🌶️ ${getRankLabel(transition!.to)} · HEAT ${level.level}/${MAX_HEAT_LEVEL}`,
    });
  }

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(200)} style={[styles.root, { width, height }]}>
        <HeatBurst width={width} height={height} />
        <Sparks width={width} height={height} />

        <View style={[styles.center, { top: height * 0.17 }]}>
          <Animated.View entering={FadeIn.duration(300).delay(300)} style={styles.badge}>
            <Text style={[TYPE.label10, { color: THERMAL_COLORS.gold }]}>NEW HEAT LEVEL UNLOCKED</Text>
          </Animated.View>

          <BouncingPepper levelRank={transition.to} />

          <Animated.Text entering={FadeIn.duration(320).delay(500)} style={[TYPE.display72, styles.ink, { marginTop: 10 }]}>
            LEVEL UP
          </Animated.Text>
          <Animated.Text entering={FadeIn.duration(300).delay(620)} style={[TYPE.meta26, styles.ink]}>
            {`${getRankLabel(transition.from)}  >  ${getRankLabel(transition.to)}`}
          </Animated.Text>

          <Animated.View entering={FadeIn.duration(320).delay(740)}>
            <View>
              <View style={[styles.cardShadow]} />
              <View style={styles.card}>
                <Text style={[TYPE.display40, { color: THERMAL_COLORS.cream }]}>{level.name}</Text>
                <Text style={[TYPE.meta20, { color: THERMAL_COLORS.orange }]}>
                  {`${formatInteger(level.shu)} SHU · HEAT ${level.level} / ${MAX_HEAT_LEVEL}`}
                </Text>
                <Text style={[TYPE.label10, { color: 'rgba(255,255,255,0.6)' }]}>
                  {next ? `NEXT: ${next.name} · ${formatShu(next.shu)} SHU` : 'MAXIMUM HEAT REACHED'}
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>

        <Animated.View
          entering={FadeIn.duration(320).delay(900)}
          style={[styles.actions, { bottom: insets.bottom + 24 }]}
        >
          <PixelButton label="CONTINUE >" variant="void" onPress={onClose} />
          <PixelButton label="SHARE MY HEAT" variant="paper" onPress={() => void handleShare()} />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function BouncingPepper({ levelRank }: { levelRank: Rank }) {
  const drop = useSharedValue(0);

  useEffect(() => {
    drop.value = withDelay(250, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
  }, [drop]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: drop.value,
    transform: [{ translateY: (1 - drop.value) * -24 }],
  }));

  return (
    <Animated.View style={[{ paddingVertical: 8 }, animatedStyle]}>
      <View>
        <View style={{ position: 'absolute', left: 6, top: 6 }}>
          <HeatPepper level={getHeatLevel(levelRank)} silhouette={THERMAL_COLORS.void} />
        </View>
        <HeatPepper level={getHeatLevel(levelRank)} />
      </View>
    </Animated.View>
  );
}

/** Concentric pixel rings that burst outward, hottest in the middle */
function HeatBurst({ width, height }: { width: number; height: number }) {
  const rings = useMemo(() => {
    const centerX = width / 2;
    const centerY = height * 0.45;
    return BURST_RINGS.map((ring) => ({
      color: ring.color,
      d: pixelEllipse(centerX, centerY, (ring.size * width) / 2, (ring.size * height * 0.92) / 2),
    }));
  }, [width, height]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: THERMAL_COLORS.void }]} />
      {rings.map((ring, index) => (
        <BurstRing key={ring.color} index={index} d={ring.d} color={ring.color} width={width} height={height} />
      ))}
    </View>
  );
}

interface BurstRingProps {
  index: number;
  d: string;
  color: string;
  width: number;
  height: number;
}

function BurstRing({ index, d, color, width, height }: BurstRingProps) {
  const scale = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    const delay = (BURST_RINGS.length - index) * 55;
    scale.value = withDelay(delay, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
    pulse.value = withDelay(
      1300 + index * 90,
      withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, [index, scale, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: height * -0.05 }, { scale: scale.value * (1 + pulse.value * 0.025) }, { translateY: height * 0.05 }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
      <Svg width={width} height={height}>
        <Path d={d} fill={color} />
      </Svg>
    </Animated.View>
  );
}

/** Floating ember squares */
function Sparks({ width, height }: { width: number; height: number }) {
  const sparks = useMemo(
    () =>
      SPARK_SEEDS.map(([x, y, size], index) => ({
        x: (x / 402) * width,
        y: (y / 874) * height,
        size,
        color: index % 3 === 0 ? THERMAL_COLORS.gold : THERMAL_COLORS.cream,
        index,
      })),
    [width, height],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {sparks.map((spark) => (
        <Spark key={spark.index} {...spark} />
      ))}
    </View>
  );
}

interface SparkProps {
  x: number;
  y: number;
  size: number;
  color: string;
  index: number;
}

function Spark({ x, y, size, color, index }: SparkProps) {
  const rise = useSharedValue(0);

  useEffect(() => {
    rise.value = withDelay(
      500 + (index % 7) * 140,
      withRepeat(
        withSequence(withTiming(1, { duration: 1800 + (index % 5) * 300, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 0 })),
        -1,
      ),
    );
  }, [index, rise]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: rise.value < 0.05 ? rise.value * 20 : 1 - rise.value,
    transform: [{ translateY: -rise.value * 90 }, { translateX: Math.sin(rise.value * 6 + index) * 6 }],
  }));

  return (
    <Animated.View
      style={[{ position: 'absolute', left: x, top: y, width: size, height: size, backgroundColor: color }, animatedStyle]}
    />
  );
}

/** Ellipse rasterised onto a 12pt grid, as one path */
function pixelEllipse(centerX: number, centerY: number, radiusX: number, radiusY: number): string {
  const parts: Array<string> = [];
  const startY = Math.floor((centerY - radiusY) / BURST_CELL) * BURST_CELL;
  const startX = Math.floor((centerX - radiusX) / BURST_CELL) * BURST_CELL;

  for (let y = startY; y < centerY + radiusY; y += BURST_CELL) {
    for (let x = startX; x < centerX + radiusX; x += BURST_CELL) {
      const dx = (x + BURST_CELL / 2 - centerX) / radiusX;
      const dy = (y + BURST_CELL / 2 - centerY) / radiusY;
      if (dx * dx + dy * dy <= 1) {
        parts.push(`M${x} ${y}h${BURST_CELL}v${BURST_CELL}h-${BURST_CELL}z`);
      }
    }
  }
  return parts.join('');
}

interface RankTransition {
  from: Rank;
  to: Rank;
}

const LAST_RANK_KEY = 'thermal:last_rank';
const BURST_CELL = 12;

const BURST_RINGS: Array<{ size: number; color: string }> = [
  { size: 1.5, color: THERMAL_COLORS.navy },
  { size: 1.32, color: THERMAL_COLORS.indigo },
  { size: 1.14, color: THERMAL_COLORS.violet },
  { size: 0.98, color: THERMAL_COLORS.magenta },
  { size: 0.84, color: THERMAL_COLORS.red },
  { size: 0.7, color: THERMAL_COLORS.orange },
  { size: 0.56, color: THERMAL_COLORS.gold },
  { size: 0.43, color: THERMAL_COLORS.cream },
];

const SPARK_SEEDS: Array<[number, number, number]> = [
  [130, 640, 8], [270, 540, 8], [140, 600, 4], [360, 680, 4], [360, 590, 4], [330, 300, 4],
  [370, 480, 8], [20, 250, 4], [160, 190, 8], [260, 770, 4], [240, 220, 8], [340, 540, 4],
  [200, 590, 8], [280, 240, 4], [310, 740, 4], [30, 360, 4], [390, 210, 4], [50, 770, 8],
  [350, 60, 8], [90, 620, 8], [350, 480, 4], [80, 490, 4], [220, 580, 4], [280, 610, 4],
];

const styles = StyleSheet.create({
  root: {
    backgroundColor: THERMAL_COLORS.void,
    overflow: 'hidden',
  },
  center: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    backgroundColor: THERMAL_COLORS.void,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  ink: {
    color: THERMAL_COLORS.void,
  },
  card: {
    backgroundColor: THERMAL_COLORS.void,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  cardShadow: {
    position: 'absolute',
    left: 6,
    top: 6,
    right: -6,
    bottom: -6,
    backgroundColor: THERMAL_COLORS.red,
  },
  actions: {
    position: 'absolute',
    left: 16,
    right: 16,
    gap: 14,
  },
});
