import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { THERMAL_COLORS } from '../theme';

interface HeatBurstProps {
  width: number;
  height: number;
  /** Vertical centre of the burst as a fraction of the height (0.45 = Rank Up) */
  centerY?: number;
  /** Replays the burst-out animation when changed */
  burstKey?: number;
}

/** Concentric pixel rings that burst outward, hottest in the middle */
export function HeatBurst({ width, height, centerY = 0.45, burstKey = 0 }: HeatBurstProps) {
  const rings = useMemo(() => {
    const cx = width / 2;
    const cy = height * centerY;
    return BURST_RINGS.map((ring) => ({
      color: ring.color,
      d: pixelEllipse(cx, cy, (ring.size * width) / 2, (ring.size * height * 0.92) / 2),
    }));
  }, [width, height, centerY]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: THERMAL_COLORS.void }]} />
      {rings.map((ring, index) => (
        <BurstRing
          key={ring.color}
          index={index}
          d={ring.d}
          color={ring.color}
          width={width}
          height={height}
          burstKey={burstKey}
        />
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
  burstKey: number;
}

function BurstRing({ index, d, color, width, height, burstKey }: BurstRingProps) {
  const scale = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    const delay = (BURST_RINGS.length - index) * 55;
    scale.value = 0;
    scale.value = withDelay(delay, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
    pulse.value = withDelay(
      1300 + index * 90,
      withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, [index, scale, pulse, burstKey]);

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

interface SparksProps {
  width: number;
  height: number;
}

/** Floating ember squares */
export function Sparks({ width, height }: SparksProps) {
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
