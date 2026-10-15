import { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { THERMAL_COLORS } from '../theme';

interface PixelCoreProps {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  radiusX?: number;
  radiusY?: number;
  /** 0…1 — hotter cores reach further out and burn whiter */
  intensity?: number;
  /** Background animation style (temporary A/B/C pick on the Power screen) */
  variant?: PixelCoreVariant;
}

export type PixelCoreVariant = 'flicker' | 'ripple' | 'embers' | 'spread' | 'lift' | 'heartbeat' | 'shockwave';

export const PIXEL_CORE_VARIANTS: Array<{ value: PixelCoreVariant; label: string }> = [
  { value: 'flicker', label: '01 FLICKER' },
  { value: 'ripple', label: '02 RIPPLE' },
  { value: 'embers', label: '03 EMBERS' },
  { value: 'spread', label: '04 WAVE' },
  { value: 'lift', label: '05 GRID' },
  { value: 'heartbeat', label: '06 HEARTBEAT' },
  { value: 'shockwave', label: '07 SHOCKWAVE' },
];

/**
 * Pixelated heat core: 10pt cells colored by distance from the center plus
 * noise. Two differently-seeded frames cross-fade so the core flickers like
 * a live thermal reading.
 */
export function PixelCore({ variant = 'flicker', ...props }: PixelCoreProps) {
  if (variant === 'ripple') return <RippleCore {...props} />;
  if (variant === 'embers') return <EmberCore {...props} />;
  if (variant === 'spread') return <SpreadCore {...props} />;
  if (variant === 'lift') return <LiftCore {...props} />;
  if (variant === 'heartbeat') return <HeartbeatCore {...props} />;
  if (variant === 'shockwave') return <ShockwaveCore {...props} />;
  return <FlickerCore {...props} />;
}

type CoreProps = Omit<PixelCoreProps, 'variant'>;

function FlickerCore({
  width,
  height,
  centerX,
  centerY,
  radiusX = 125,
  radiusY = 170,
  intensity = 0.5,
}: CoreProps) {
  const flicker = useSharedValue(0);

  useEffect(() => {
    flicker.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [flicker]);

  const frameA = useMemo(
    () => buildFrame({ width, height, centerX, centerY, radiusX, radiusY, intensity, seed: 7 }),
    [width, height, centerX, centerY, radiusX, radiusY, intensity],
  );
  const frameB = useMemo(
    () => buildFrame({ width, height, centerX, centerY, radiusX, radiusY, intensity, seed: 23 }),
    [width, height, centerX, centerY, radiusX, radiusY, intensity],
  );

  const frameBStyle = useAnimatedStyle(() => ({ opacity: flicker.value }));

  return (
    <>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
        {frameA.map((layer) => (
          <Path key={layer.color} d={layer.d} fill={layer.color} />
        ))}
      </Svg>
      <Animated.View style={[StyleSheet.absoluteFill, frameBStyle]} pointerEvents="none">
        <Svg width={width} height={height}>
          {frameB.map((layer) => (
            <Path key={layer.color} d={layer.d} fill={layer.color} />
          ))}
        </Svg>
      </Animated.View>
    </>
  );
}

/**
 * Ripple: a slow heat wave rolls outward from the center. The noise stays
 * fixed and only the wave moves, stepped frame by frame like a sprite.
 */
function RippleCore({
  width,
  height,
  centerX,
  centerY,
  radiusX = 125,
  radiusY = 170,
  intensity = 0.5,
}: CoreProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: RIPPLE_DURATION, easing: Easing.linear }), -1, false);
  }, [progress]);

  const frames = useMemo(
    () =>
      Array.from({ length: RIPPLE_FRAMES }, (_, index) =>
        buildFrame({ width, height, centerX, centerY, radiusX, radiusY, intensity, seed: 7, noise: 0.2, wavePhase: index / RIPPLE_FRAMES }),
      ),
    [width, height, centerX, centerY, radiusX, radiusY, intensity],
  );

  return (
    <>
      {frames.map((frame, index) => (
        <SteppedFrame key={index} index={index} count={RIPPLE_FRAMES} progress={progress} frame={frame} width={width} height={height} />
      ))}
    </>
  );
}

/**
 * Wave: a stadium-style wave rolls from the core out to the stage edges.
 * Cells are grouped into concentric pixel rings; each ring's opacity rises
 * and falls smoothly as the crest passes, so the band moves as one piece.
 */
function SpreadCore({
  width,
  height,
  centerX,
  centerY,
  radiusX = 125,
  radiusY = 170,
  intensity = 0.5,
}: CoreProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: WAVE_DURATION, easing: Easing.linear }), -1, false);
  }, [progress]);

  const core = useMemo(
    () => buildFrame({ width, height, centerX, centerY, radiusX, radiusY, intensity, seed: 7 }),
    [width, height, centerX, centerY, radiusX, radiusY, intensity],
  );
  const { rings, travel } = useMemo(() => buildWaveRings(width, height, centerX, centerY), [width, height, centerX, centerY]);

  return (
    <>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
        {core.map((layer) => (
          <Path key={layer.color} d={layer.d} fill={layer.color} />
        ))}
      </Svg>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
        {rings.map((ring) => (
          <WaveRing key={ring.radius} d={ring.d} radius={ring.radius} travel={travel} progress={progress} />
        ))}
      </Svg>
    </>
  );
}

function WaveRing({ d, radius, travel, progress }: { d: string; radius: number; travel: number; progress: SharedValue<number> }) {
  const animatedProps = useAnimatedProps(() => {
    // Crest runs from just inside the center to past the far corner, leaving a rest gap
    const front = progress.value * travel - WAVE_BAND;
    const offset = (front - radius) / WAVE_BAND;
    let level = 0;
    if (offset > -1 && offset <= 0) level = 1 + offset;
    else if (offset > 0 && offset < 2.5) level = 1 - offset / 2.5;
    const eased = level * level * (3 - 2 * level);
    return { fillOpacity: eased * WAVE_PEAK_OPACITY };
  });

  return <AnimatedPath d={d} fill={THERMAL_COLORS.gold} animatedProps={animatedProps} />;
}

/** Bucket every cell by its distance from the center into CELL-wide rings */
function buildWaveRings(width: number, height: number, centerX: number, centerY: number) {
  const buckets = new Map<number, Array<string>>();
  let maxRadius = 0;

  for (let y = 0; y < height; y += CELL) {
    for (let x = 0; x < width; x += CELL) {
      const radius = Math.round(Math.hypot(x + CELL / 2 - centerX, y + CELL / 2 - centerY) / CELL) * CELL;
      maxRadius = Math.max(maxRadius, radius);
      const cells = buckets.get(radius) ?? [];
      cells.push(`M${x} ${y}h${CELL}v${CELL}h-${CELL}z`);
      buckets.set(radius, cells);
    }
  }

  const rings = Array.from(buckets.entries()).map(([radius, cells]) => ({ radius, d: cells.join('') }));
  return { rings, travel: maxRadius * 1.3 + WAVE_BAND * 3.5 };
}

/**
 * Grid wave: no heat core at all — just one color of pixels across the whole
 * stage. As the crest rolls from the center to the edges each pixel grows
 * from nothing to a full cell and shrinks back, so the wave reads as pixels
 * standing up in turn rather than colors changing.
 */
function LiftCore({ width, height, centerX, centerY }: CoreProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: GRID_WAVE_DURATION, easing: Easing.linear }), -1, false);
  }, [progress]);

  const { rings, travel } = useMemo(() => buildGridRings(width, height, centerX, centerY), [width, height, centerX, centerY]);

  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      {rings.map((ring) => (
        <GridRing key={ring.radius} radius={ring.radius} centers={ring.centers} travel={travel} progress={progress} />
      ))}
    </Svg>
  );
}

function GridRing({
  radius,
  centers,
  travel,
  progress,
}: {
  radius: number;
  centers: Array<number>;
  travel: number;
  progress: SharedValue<number>;
}) {
  const animatedProps = useAnimatedProps(() => {
    const front = progress.value * travel - GRID_WAVE_BAND;
    const offset = (front - radius) / GRID_WAVE_BAND;
    let level = 0;
    if (offset > -1 && offset <= 0) level = 1 + offset;
    else if (offset > 0 && offset < 2) level = 1 - offset / 2;
    const eased = level * level * (3 - 2 * level);
    if (eased < 0.03) return { d: 'M0 0' };

    // Each pixel grows from its own center, so the grid stays aligned
    const size = eased * GRID_DOT_MAX;
    const half = size / 2;
    let d = '';
    for (let i = 0; i < centers.length; i += 2) {
      d += `M${centers[i] - half} ${centers[i + 1] - half}h${size}v${size}h${-size}z`;
    }
    return { d };
  });

  return <AnimatedPath fill={THERMAL_COLORS.cream} fillOpacity={GRID_DOT_OPACITY} animatedProps={animatedProps} />;
}

/** Cell centers bucketed into CELL-wide rings around the center (flat x,y pairs) */
function buildGridRings(width: number, height: number, centerX: number, centerY: number) {
  const buckets = new Map<number, Array<number>>();
  let maxRadius = 0;

  for (let y = 0; y < height; y += CELL) {
    for (let x = 0; x < width; x += CELL) {
      const cx = x + CELL / 2;
      const cy = y + CELL / 2;
      const radius = Math.round(Math.hypot(cx - centerX, cy - centerY) / CELL) * CELL;
      maxRadius = Math.max(maxRadius, radius);
      const centers = buckets.get(radius) ?? [];
      centers.push(cx, cy);
      buckets.set(radius, centers);
    }
  }

  const rings = Array.from(buckets.entries()).map(([radius, centers]) => ({ radius, centers }));
  return { rings, travel: maxRadius * 1.25 + GRID_WAVE_BAND * 3 };
}

/**
 * Heartbeat: the pepper's heat pulses out in a lub-dub rhythm. Each pulse
 * is a ring of grid pixels that grow and shrink as the crest passes. Pixels
 * take the thermal glow's own hue at their distance, one notch deeper, so
 * the wave reads as the heat field breathing rather than a bright band.
 */
function HeartbeatCore({ width, height, centerX, centerY }: CoreProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: HEARTBEAT_DURATION, easing: Easing.linear }), -1, false);
  }, [progress]);

  const { rings, travel } = useMemo(() => buildGridRings(width, height, centerX, centerY), [width, height, centerX, centerY]);
  const maxRadius = rings.reduce((max, ring) => Math.max(max, ring.radius), 0);

  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      {rings.map((ring) => (
        <HeartbeatRing
          key={ring.radius}
          radius={ring.radius}
          centers={ring.centers}
          falloff={1 - (ring.radius / maxRadius) * 0.55}
          color={getFieldColor(ring.radius)}
          travel={travel}
          progress={progress}
        />
      ))}
    </Svg>
  );
}

function HeartbeatRing({
  radius,
  centers,
  falloff,
  color,
  travel,
  progress,
}: {
  radius: number;
  centers: Array<number>;
  falloff: number;
  color: string;
  travel: number;
  progress: SharedValue<number>;
}) {
  const animatedProps = useAnimatedProps(() => {
    // Sharp rise at the crest, long cooling tail behind it
    const pulse = (front: number) => {
      const offset = (front - radius) / HEARTBEAT_BAND;
      if (offset > -0.6 && offset <= 0) return 1 + offset / 0.6;
      if (offset > 0 && offset < 3) return 1 - offset / 3;
      return 0;
    };
    const first = pulse(progress.value * travel - HEARTBEAT_BAND);
    const second = pulse((progress.value - HEARTBEAT_GAP) * travel - HEARTBEAT_BAND) * 0.6;
    const heat = Math.max(first, second);
    const eased = heat * heat * (3 - 2 * heat);
    if (eased < 0.04) return { d: 'M0 0' };

    const size = eased * HEARTBEAT_DOT_MAX * falloff;
    const half = size / 2;
    let d = '';
    for (let i = 0; i < centers.length; i += 2) {
      d += `M${centers[i] - half} ${centers[i + 1] - half}h${size}v${size}h${-size}z`;
    }
    return { d };
  });

  return <AnimatedPath fill={color} fillOpacity={HEARTBEAT_OPACITY} animatedProps={animatedProps} />;
}

/** Thermal glow hue at a given distance from the core, one notch deeper than the background */
function getFieldColor(radius: number): string {
  const stop = FIELD_COLOR_STOPS.find((entry) => radius <= entry.radius);
  return stop?.color ?? THERMAL_COLORS.violet;
}

/**
 * Shockwave: a quiet dot-matrix field where nothing changes color or size.
 * The wave is pure motion — as the crest passes, each dot is pushed outward
 * from the core and eases back into place, like a ripple through sand.
 */
function ShockwaveCore({ width, height, centerX, centerY }: CoreProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: SHOCK_DURATION, easing: Easing.linear }), -1, false);
  }, [progress]);

  const { rings, travel } = useMemo(() => buildShockRings(width, height, centerX, centerY), [width, height, centerX, centerY]);

  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      {rings.map((ring) => (
        <ShockRing key={ring.radius} ring={ring} travel={travel} progress={progress} />
      ))}
    </Svg>
  );
}

interface ShockRingData {
  radius: number;
  /** Flat [x, y, ux, uy, …]: dot center plus unit vector pointing away from the core */
  dots: Array<number>;
  restPath: string;
  color: string;
}

function ShockRing({ ring, travel, progress }: { ring: ShockRingData; travel: number; progress: SharedValue<number> }) {
  const { radius, dots, restPath } = ring;

  const animatedProps = useAnimatedProps(() => {
    const front = progress.value * travel - SHOCK_BAND;
    const offset = (front - radius) / SHOCK_BAND;
    // Push out as the crest arrives, then a slow, slightly springy return
    let push = 0;
    if (offset > -1 && offset <= 0) {
      const t = 1 + offset;
      push = t * t * (3 - 2 * t);
    } else if (offset > 0 && offset < 3) {
      const t = offset / 3;
      push = Math.cos(t * Math.PI * 1.5) * (1 - t);
    }
    if (Math.abs(push) < 0.02) return { d: restPath };

    const shift = push * SHOCK_DISTANCE;
    const half = SHOCK_DOT / 2;
    let d = '';
    for (let i = 0; i < dots.length; i += 4) {
      const x = dots[i] + dots[i + 2] * shift - half;
      const y = dots[i + 1] + dots[i + 3] * shift - half;
      d += `M${x} ${y}h${SHOCK_DOT}v${SHOCK_DOT}h${-SHOCK_DOT}z`;
    }
    return { d };
  });

  return <AnimatedPath fill={ring.color} fillOpacity={SHOCK_OPACITY} animatedProps={animatedProps} />;
}

/** Sparse dot grid bucketed into rings, with each dot's outward direction precomputed */
function buildShockRings(width: number, height: number, centerX: number, centerY: number) {
  const buckets = new Map<number, Array<number>>();
  let maxRadius = 0;

  for (let y = SHOCK_SPACING / 2; y < height; y += SHOCK_SPACING) {
    for (let x = SHOCK_SPACING / 2; x < width; x += SHOCK_SPACING) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.hypot(dx, dy);
      const radius = Math.round(distance / CELL) * CELL;
      maxRadius = Math.max(maxRadius, radius);
      const dots = buckets.get(radius) ?? [];
      dots.push(x, y, distance > 0 ? dx / distance : 0, distance > 0 ? dy / distance : 0);
      buckets.set(radius, dots);
    }
  }

  const half = SHOCK_DOT / 2;
  const rings: Array<ShockRingData> = Array.from(buckets.entries()).map(([radius, dots]) => {
    let restPath = '';
    for (let i = 0; i < dots.length; i += 4) {
      restPath += `M${dots[i] - half} ${dots[i + 1] - half}h${SHOCK_DOT}v${SHOCK_DOT}h${-SHOCK_DOT}z`;
    }
    return { radius, dots, restPath, color: getFieldColor(radius) };
  });
  return { rings, travel: maxRadius * 1.25 + SHOCK_BAND * 4 };
}

function SteppedFrame({
  index,
  count,
  progress,
  frame,
  width,
  height,
}: {
  index: number;
  count: number;
  progress: SharedValue<number>;
  frame: ReturnType<typeof buildFrame>;
  width: number;
  height: number;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: Math.floor(progress.value * count) % count === index ? 1 : 0,
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]} pointerEvents="none">
      <Svg width={width} height={height}>
        {frame.map((layer) => (
          <Path key={layer.color} d={layer.d} fill={layer.color} />
        ))}
      </Svg>
    </Animated.View>
  );
}

/**
 * Embers: the core holds still and breathes very slowly while a handful of
 * pixel sparks drift up out of it and fade.
 */
function EmberCore({
  width,
  height,
  centerX,
  centerY,
  radiusX = 125,
  radiusY = 170,
  intensity = 0.5,
}: CoreProps) {
  const breath = useSharedValue(0);

  useEffect(() => {
    breath.value = withRepeat(withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [breath]);

  const frameA = useMemo(
    () => buildFrame({ width, height, centerX, centerY, radiusX, radiusY, intensity, seed: 7 }),
    [width, height, centerX, centerY, radiusX, radiusY, intensity],
  );
  const frameB = useMemo(
    () => buildFrame({ width, height, centerX, centerY, radiusX, radiusY, intensity: Math.min(1, intensity + 0.15), seed: 7 }),
    [width, height, centerX, centerY, radiusX, radiusY, intensity],
  );
  const embers = useMemo(() => buildEmbers(centerX, centerY, radiusX, radiusY), [centerX, centerY, radiusX, radiusY]);

  const frameBStyle = useAnimatedStyle(() => ({ opacity: breath.value * 0.7 }));

  return (
    <>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
        {frameA.map((layer) => (
          <Path key={layer.color} d={layer.d} fill={layer.color} />
        ))}
      </Svg>
      <Animated.View style={[StyleSheet.absoluteFill, frameBStyle]} pointerEvents="none">
        <Svg width={width} height={height}>
          {frameB.map((layer) => (
            <Path key={layer.color} d={layer.d} fill={layer.color} />
          ))}
        </Svg>
      </Animated.View>
      {embers.map((ember, index) => (
        <Ember key={index} {...ember} />
      ))}
    </>
  );
}

interface EmberSpec {
  x: number;
  y: number;
  size: number;
  rise: number;
  sway: number;
  duration: number;
  delay: number;
  color: string;
}

function Ember({ x, y, size, rise, sway, duration, delay, color }: EmberSpec) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false));
  }, [progress, delay, duration]);

  // Snap motion to a 4pt grid so sparks move like sprites, not vectors
  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const opacity = p < 0.15 ? p / 0.15 : Math.max(0, (1 - p) / 0.85);
    return {
      opacity: Math.round(opacity * 4) / 4,
      transform: [
        { translateX: Math.round((Math.sin(p * Math.PI * 2) * sway) / 4) * 4 },
        { translateY: -Math.round((p * rise) / 4) * 4 },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', left: x, top: y, width: size, height: size, backgroundColor: color }, animatedStyle]}
    />
  );
}

function buildEmbers(centerX: number, centerY: number, radiusX: number, radiusY: number): Array<EmberSpec> {
  const random = mulberry32(41);
  const colors = [THERMAL_COLORS.cream, THERMAL_COLORS.gold, THERMAL_COLORS.cream];
  return Array.from({ length: EMBER_COUNT }, (_, index) => ({
    // Start along the core's upper rim so sparks read against the cooler field
    x: Math.round((centerX + (random() - 0.5) * radiusX * 1.1) / 4) * 4,
    y: Math.round((centerY - radiusY * 0.55 + random() * 40) / 4) * 4,
    size: random() > 0.5 ? 8 : 6,
    rise: 140 + random() * 80,
    sway: 4 + random() * 8,
    duration: 4200 + random() * 2800,
    delay: index * 520,
    color: colors[index % colors.length],
  }));
}

interface FrameOptions {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
  intensity: number;
  seed: number;
  /** Noise amplitude; lower reads calmer */
  noise?: number;
  /** 0…1 phase of an outward heat wave; omit for no wave */
  wavePhase?: number;
}

/** One path per color keeps the SVG to a handful of nodes */
function buildFrame({ width, height, centerX, centerY, radiusX, radiusY, intensity, seed, noise = 0.32, wavePhase }: FrameOptions) {
  const random = mulberry32(seed);
  const paths = new Map<string, Array<string>>();
  const reach = 0.75 + intensity * 0.5;

  for (let y = 0; y < height; y += CELL) {
    for (let x = 0; x < width; x += CELL) {
      const dx = (x + CELL / 2 - centerX) / (radiusX * reach);
      const dy = (y + CELL / 2 - centerY) / (radiusY * reach);
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 1.15) continue;

      const wave = wavePhase === undefined ? 0 : Math.sin((distance * 2.4 - wavePhase) * Math.PI * 2) * 0.1;
      const heat = 1 - distance + (random() - 0.5) * noise + intensity * 0.08 + wave;
      const color = pickColor(heat);
      if (!color) continue;

      const cells = paths.get(color) ?? [];
      cells.push(`M${x} ${y}h${CELL}v${CELL}h-${CELL}z`);
      paths.set(color, cells);
    }
  }

  return Array.from(paths.entries()).map(([color, cells]) => ({ color, d: cells.join('') }));
}

function pickColor(heat: number): string | null {
  if (heat > 0.86) return THERMAL_COLORS.cream;
  if (heat > 0.7) return THERMAL_COLORS.gold;
  if (heat > 0.54) return THERMAL_COLORS.orange;
  if (heat > 0.38) return THERMAL_COLORS.red;
  if (heat > 0.26) return THERMAL_COLORS.magenta;
  return null;
}

/** Tiny deterministic PRNG so the core looks the same on every render */
function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CELL = 10;
const RIPPLE_FRAMES = 8;
const RIPPLE_DURATION = 3600;
const EMBER_COUNT = 9;
const WAVE_DURATION = 5200;
const WAVE_BAND = 40;
const WAVE_PEAK_OPACITY = 0.45;

const GRID_WAVE_DURATION = 4600;
const GRID_WAVE_BAND = 50;
const GRID_DOT_MAX = 8;
const GRID_DOT_OPACITY = 0.5;

const HEARTBEAT_DURATION = 4400;
const HEARTBEAT_GAP = 0.09;
const HEARTBEAT_BAND = 36;
const HEARTBEAT_DOT_MAX = 9;
const HEARTBEAT_OPACITY = 0.85;
const FIELD_COLOR_STOPS: Array<{ radius: number; color: string }> = [
  { radius: 90, color: THERMAL_COLORS.amber },
  { radius: 130, color: THERMAL_COLORS.orange },
  { radius: 170, color: THERMAL_COLORS.ember },
  { radius: 210, color: THERMAL_COLORS.red },
  { radius: 250, color: THERMAL_COLORS.crimson },
  { radius: 300, color: THERMAL_COLORS.magenta },
  { radius: 360, color: THERMAL_COLORS.plum },
];

const SHOCK_DURATION = 4200;
const SHOCK_BAND = 45;
const SHOCK_DISTANCE = 9;
const SHOCK_SPACING = 20;
const SHOCK_DOT = 5;
const SHOCK_OPACITY = 0.6;

const AnimatedPath = Animated.createAnimatedComponent(Path);
