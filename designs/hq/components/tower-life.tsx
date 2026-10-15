import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { HQ_IMAGES } from '../lib/floors';

interface TowerLifeProps {
  /** Rendered width of the 960×1280 tower art */
  width: number;
}

/**
 * Ambient life inside the pepper tower: the elevator rides between floors,
 * lamps flicker, monitors refresh, seedlings sparkle, gold glints and the
 * furnace burns. Everything sits on the art's 8px pixel grid and only fades
 * or steps — nothing bounces.
 */
export function TowerLife({ width }: TowerLifeProps) {
  const scale = width / ART_WIDTH;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {LAMPS.map((lamp, index) => (
        <LampGlow key={index} lamp={lamp} scale={scale} index={index} />
      ))}
      {MONITORS.map((monitor, index) => (
        <MonitorFlicker key={index} box={monitor} scale={scale} index={index} />
      ))}
      {SPROUTS.map((sprout, index) => (
        <SproutSpark key={index} at={sprout} scale={scale} index={index} />
      ))}
      {GLINTS.map((glint, index) => (
        <GoldGlint key={index} at={glint} scale={scale} index={index} />
      ))}
      {FLAMES.map((flame, index) => (
        <FlameCell key={index} cell={flame} scale={scale} index={index} />
      ))}
      <Elevator scale={scale} />
    </View>
  );
}

/** Elevator car: rides 3F → B2 and back, pausing at each floor, moving in 8px steps */
function Elevator({ scale }: { scale: number }) {
  const y = useSharedValue(ELEVATOR_STOPS[0]);

  useEffect(() => {
    const down = ELEVATOR_STOPS.slice(1);
    const up = ELEVATOR_STOPS.slice(0, -1).reverse();
    const legs = [...down, ...up].flatMap((stop) => [
      withTiming(stop, { duration: 1300, easing: Easing.inOut(Easing.quad) }),
      withDelay(1700, withTiming(stop, { duration: 0 })),
    ]);
    y.value = withDelay(1200, withRepeat(withSequence(...legs), -1));
  }, [y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: Math.round(y.value / PIXEL) * PIXEL * scale }],
  }));

  return (
    <Animated.View
      style={[
        { position: 'absolute', left: CAR.x * scale, top: 0, width: CAR.w * scale, height: CAR.h * scale },
        style,
      ]}
    >
      <Image source={HQ_IMAGES.elevatorCar} style={StyleSheet.absoluteFill} contentFit="fill" />
    </Animated.View>
  );
}

/** Warm light cone under each ceiling lamp, with an irregular flicker */
function LampGlow({ lamp, scale, index }: { lamp: Box; scale: number; index: number }) {
  const glow = useFlicker(index * 410, LAMP_FLICKER, 260);
  const style = useAnimatedStyle(() => ({ opacity: glow.value }));
  const path = getConePath(lamp);

  return (
    <Animated.View
      style={[{ position: 'absolute', left: lamp.x * scale, top: lamp.y * scale, width: lamp.w * scale, height: lamp.h * scale }, style]}
    >
      <Svg width={lamp.w * scale} height={lamp.h * scale} viewBox={`0 0 ${lamp.w} ${lamp.h}`}>
        <Path d={path} fill="#FFE6A8" />
      </Svg>
    </Animated.View>
  );
}

/** Monitors: steady glow with an occasional refresh blink */
function MonitorFlicker({ box, scale, index }: { box: Box; scale: number; index: number }) {
  const flash = useSharedValue(0);

  useEffect(() => {
    flash.value = withDelay(
      600 + index * 900,
      withRepeat(
        withSequence(
          withTiming(0.55, { duration: 70 }),
          withTiming(0, { duration: 70 }),
          withTiming(0.35, { duration: 70 }),
          withTiming(0, { duration: 240 }),
          withTiming(0, { duration: 2600 + index * 700 }),
        ),
        -1,
      ),
    );
  }, [flash, index]);

  const style = useAnimatedStyle(() => ({ opacity: flash.value }));

  return (
    <Animated.View
      style={[
        { position: 'absolute', left: box.x * scale, top: box.y * scale, width: box.w * scale, height: box.h * scale, backgroundColor: '#FFFFFF' },
        style,
      ]}
    />
  );
}

/** Seed vault: a green spark drifts up from a seedling and fades */
function SproutSpark({ at, scale, index }: { at: Point; scale: number; index: number }) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      400 + index * 1300,
      withRepeat(withSequence(withTiming(1, { duration: 2400, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 0 }), withTiming(0, { duration: 2800 })), -1),
    );
  }, [t, index]);

  const style = useAnimatedStyle(() => ({
    opacity: t.value === 0 ? 0 : 1 - t.value,
    transform: [{ translateY: -Math.round((t.value * 40) / PIXEL) * PIXEL * scale }],
  }));

  return (
    <Animated.View
      style={[
        { position: 'absolute', left: at.x * scale, top: at.y * scale, width: PIXEL * scale, height: PIXEL * scale, backgroundColor: '#C8FF8A' },
        style,
      ]}
    />
  );
}

/** Treasury: a four-point glint pops on the gold piles */
function GoldGlint({ at, scale, index }: { at: Point; scale: number; index: number }) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      800 + index * 1100,
      withRepeat(withSequence(withTiming(1, { duration: 180 }), withTiming(0, { duration: 420 }), withTiming(0, { duration: 2600 + index * 500 })), -1),
    );
  }, [t, index]);

  const style = useAnimatedStyle(() => ({ opacity: t.value }));
  const cell = PIXEL * scale;

  return (
    <Animated.View style={[{ position: 'absolute', left: (at.x - PIXEL) * scale, top: (at.y - PIXEL) * scale, width: cell * 3, height: cell * 3 }, style]}>
      <View style={{ position: 'absolute', left: cell, top: 0, width: cell, height: cell * 3, backgroundColor: '#FFF6C8' }} />
      <View style={{ position: 'absolute', left: 0, top: cell, width: cell * 3, height: cell, backgroundColor: '#FFF6C8' }} />
    </Animated.View>
  );
}

/** Furnace: flame tips above the burners appear and vanish on their own rhythm */
function FlameCell({ cell, scale, index }: { cell: FlameSpec; scale: number; index: number }) {
  const glow = useFlicker(index * 90, cell.pattern, 120);
  const style = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <Animated.View
      style={[
        { position: 'absolute', left: cell.x * scale, top: cell.y * scale, width: PIXEL * scale, height: PIXEL * scale, backgroundColor: cell.color },
        style,
      ]}
    />
  );
}

/** Loops through opacity steps with a fixed step time — an irregular flicker */
function useFlicker(delay: number, steps: Array<number>, stepMs: number): SharedValue<number> {
  const value = useSharedValue(steps[0] ?? 0);

  useEffect(() => {
    value.value = withDelay(
      delay,
      withRepeat(withSequence(...steps.map((step) => withTiming(step, { duration: stepMs, easing: Easing.linear }))), -1),
    );
  }, [value, delay, steps, stepMs]);

  return value;
}

/** Pixel-stepped triangle from the lamp at the top centre down to the floor */
function getConePath(lamp: Box): string {
  const rows = Math.floor(lamp.h / PIXEL);
  const parts: Array<string> = [];
  for (let row = 1; row < rows; row += 1) {
    const half = Math.min(lamp.w / 2, Math.ceil((row / rows) * (lamp.w / 2) / PIXEL) * PIXEL);
    const left = lamp.w / 2 - half;
    parts.push(`M${left} ${row * PIXEL}h${half * 2}v${PIXEL}h-${half * 2}z`);
  }
  return parts.join('');
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Point {
  x: number;
  y: number;
}

interface FlameSpec extends Point {
  color: string;
  pattern: Array<number>;
}

// All coordinates are in the 960×1280 source art (8px cells)
const ART_WIDTH = 960;
const PIXEL = 8;

const CAR = { x: 464, w: 40, h: 72 };
/** Car top at each floor: 3F, 2F, 1F, B1, B2 */
const ELEVATOR_STOPS = [336, 528, 720, 912, 1112];

const LAMPS: Array<Box> = [
  { x: 240, y: 232, w: 88, h: 96 },
  { x: 640, y: 232, w: 88, h: 96 },
  { x: 224, y: 440, w: 96, h: 80 },
  { x: 648, y: 440, w: 96, h: 80 },
  { x: 224, y: 632, w: 104, h: 80 },
  { x: 640, y: 632, w: 104, h: 80 },
  { x: 224, y: 824, w: 104, h: 80 },
  { x: 640, y: 824, w: 72, h: 80 },
];

const LAMP_FLICKER = [0.1, 0.16, 0.08, 0.14, 0.05, 0.13];

const MONITORS: Array<Box> = [
  { x: 128, y: 504, w: 32, h: 24 },
  { x: 288, y: 504, w: 32, h: 24 },
  { x: 584, y: 504, w: 32, h: 24 },
  { x: 760, y: 504, w: 32, h: 24 },
];

const SPROUTS: Array<Point> = [
  { x: 144, y: 656 },
  { x: 384, y: 744 },
  { x: 624, y: 656 },
  { x: 744, y: 744 },
];

const GLINTS: Array<Point> = [
  { x: 320, y: 936 },
  { x: 600, y: 944 },
  { x: 184, y: 872 },
  { x: 416, y: 960 },
];

const FLAME_COLORS = ['#FF7A1A', '#FF2E3F', '#FFC800'];
const FLAMES: Array<FlameSpec> = [360, 384, 408, 432, 512, 536, 560, 584].flatMap((x, column) => [
  {
    x,
    y: 1128,
    color: FLAME_COLORS[column % 3],
    pattern: column % 2 === 0 ? [1, 0.2, 0.9, 0, 0.7, 1, 0.1] : [0.3, 1, 0, 0.8, 1, 0.2, 0.6],
  },
  {
    x,
    y: 1120,
    color: '#FF2E3F',
    pattern: column % 2 === 0 ? [0, 0.8, 0, 0, 0.6, 0, 0.9] : [0.7, 0, 0, 0.9, 0, 0.5, 0],
  },
]);
