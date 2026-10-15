import { type ReactNode, useEffect } from 'react';
import { Pressable, type PressableProps, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { usePressFeedback } from '../hooks/use-press-feedback';
import { THERMAL_COLORS, TYPE } from '../theme';

interface TouchableProps extends Omit<PressableProps, 'style' | 'children'> {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  pressedOpacity?: number;
}

/**
 * Pressable with a static style and a fade on press. NativeWind's Pressable
 * interop drops function-style props, so press feedback lives in an inner view.
 */
export function Touchable({ children, style, pressedOpacity = 0.6, onPressIn, onPressOut, ...rest }: TouchableProps) {
  const { pressed, pressHandlers } = usePressFeedback();
  const animatedStyle = useAnimatedStyle(() => ({ opacity: 1 - pressed.value * (1 - pressedOpacity) }));

  return (
    <Pressable
      {...rest}
      onPressIn={(event) => {
        pressHandlers.onPressIn();
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressHandlers.onPressOut();
        onPressOut?.(event);
      }}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

interface TagProps {
  label: string;
  color?: string;
  textColor?: string;
  variant?: 'solid' | 'outline';
}

export function Tag({ label, color = THERMAL_COLORS.orange, textColor, variant = 'solid' }: TagProps) {
  const isOutline = variant === 'outline';

  return (
    <View
      style={[
        styles.tag,
        isOutline
          ? { borderWidth: 1, borderColor: color }
          : { backgroundColor: color },
      ]}
    >
      <Text style={[TYPE.label10, { color: textColor ?? (isOutline ? THERMAL_COLORS.white : THERMAL_COLORS.void) }]}>
        {label}
      </Text>
    </View>
  );
}

interface BlinkDotProps {
  color?: string;
  size?: number;
  /** ms per blink cycle */
  period?: number;
}

/** Square status LED that blinks like a REC light */
export function BlinkDot({ color = THERMAL_COLORS.red, size = 8, period = 1100 }: BlinkDotProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: period * 0.55 }),
        withTiming(0.15, { duration: 0 }),
        withTiming(0.15, { duration: period * 0.45 }),
        withTiming(1, { duration: 0 }),
      ),
      -1,
    );
  }, [opacity, period]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[{ width: size, height: size, backgroundColor: color }, animatedStyle]} />;
}

interface StatusLabelProps {
  label: string;
  dotColor?: string;
  blink?: boolean;
}

/** "■ LIVE NOW" section label */
export function StatusLabel({ label, dotColor = THERMAL_COLORS.red, blink = true }: StatusLabelProps) {
  return (
    <View style={styles.row6}>
      {blink ? <BlinkDot color={dotColor} /> : <View style={{ width: 8, height: 8, backgroundColor: dotColor }} />}
      <Text style={TYPE.label10}>{label}</Text>
    </View>
  );
}

interface ChevronLinkProps {
  label: string;
  onPress: () => void;
}

/** Gold "ALL PROPOSALS >" link — the chevron nudges right on a loop */
export function ChevronLink({ label, onPress }: ChevronLinkProps) {
  const nudge = useSharedValue(0);

  useEffect(() => {
    nudge.value = withRepeat(
      withSequence(
        withTiming(3, { duration: 380, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 380, easing: Easing.in(Easing.quad) }),
        withTiming(0, { duration: 1400 }),
      ),
      -1,
    );
  }, [nudge]);

  const chevronStyle = useAnimatedStyle(() => ({ transform: [{ translateX: nudge.value }] }));

  return (
    <Touchable
      hitSlop={10}
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      style={styles.row6}
    >
      <Text style={[TYPE.meta16, { color: THERMAL_COLORS.gold }]}>{label}</Text>
      <Animated.Text style={[TYPE.label12, { color: THERMAL_COLORS.gold }, chevronStyle]}>{'>'}</Animated.Text>
    </Touchable>
  );
}

interface BackLinkProps {
  label: string;
  onPress: () => void;
}

export function BackLink({ label, onPress }: BackLinkProps) {
  return (
    <Touchable
      hitSlop={12}
      pressedOpacity={0.5}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <Text style={[TYPE.meta18, { color: 'rgba(255,255,255,0.6)' }]}>{`< ${label}`}</Text>
    </Touchable>
  );
}

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

/** Segment / filter chip — gold when active (ALL · ADMIN · PEP, 24H · 7D …) */
export function FilterChip({ label, isActive, onPress }: FilterChipProps) {
  return (
    <Touchable
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      style={[
        styles.chip,
        isActive
          ? { backgroundColor: THERMAL_COLORS.gold, borderColor: THERMAL_COLORS.gold }
          : { borderColor: THERMAL_COLORS.border },
      ]}
    >
      <Text style={[TYPE.label10, { color: isActive ? THERMAL_COLORS.void : 'rgba(255,255,255,0.6)' }]}>{label}</Text>
    </Touchable>
  );
}

interface DashedDividerProps {
  thickness?: number;
  color?: string;
  dash?: number;
}

/** Dashed rule — RN can't dash a single border side reliably, so draw it */
export function DashedDivider({ thickness = 2, color = 'rgba(255,255,255,0.12)', dash = 4 }: DashedDividerProps) {
  return (
    <Svg height={thickness} width="100%">
      <Line
        x1="0"
        y1={thickness / 2}
        x2="100%"
        y2={thickness / 2}
        stroke={color}
        strokeWidth={thickness}
        strokeDasharray={[dash, dash]}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  row6: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
