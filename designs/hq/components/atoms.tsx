import { type ReactNode, useEffect } from 'react';
import { Pressable, type PressableProps, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { usePressFeedback } from '@/designs/thermal/hooks/use-press-feedback';

import { HQ_COLORS, SPACE, TYPE } from '../theme';

interface TouchableProps extends Omit<PressableProps, 'style' | 'children'> {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  pressedOpacity?: number;
}

/**
 * Pressable with a fade on press. NativeWind's Pressable interop drops
 * function-style props, so the feedback lives on an inner animated view.
 * No press delay: quick taps must always land.
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
      {/* Children never take the touch (nested Text was swallowing taps); the Pressable does */}
      <Animated.View pointerEvents="none" style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  /** Highlights the card border (e.g. the selected or most urgent item) */
  accent?: string;
}

/** The one surface: dark panel, 1px line, sharp corners, no shadow */
export function Card({ children, style, onPress, accent }: CardProps) {
  const cardStyle = [styles.card, accent ? { borderColor: accent } : null, style];

  if (!onPress) return <View style={cardStyle}>{children}</View>;

  return (
    <Touchable onPress={onPress} pressedOpacity={0.75} style={cardStyle}>
      {children}
    </Touchable>
  );
}

interface SectionLabelProps {
  label: string;
  right?: string;
  rightColor?: string;
  onRightPress?: () => void;
}

export function SectionLabel({ label, right, rightColor, onRightPress }: SectionLabelProps) {
  const rightText = right ? <Text style={[TYPE.meta, { color: rightColor ?? HQ_COLORS.muted }]}>{right}</Text> : null;

  return (
    <View style={styles.between}>
      <Text style={TYPE.label}>{label}</Text>
      {rightText && onRightPress ? (
        <Touchable onPress={onRightPress} hitSlop={10}>
          {rightText}
        </Touchable>
      ) : (
        rightText
      )}
    </View>
  );
}

export interface Stat {
  label: string;
  value: string;
  unit?: string;
  color?: string;
}

/** Three equal columns: label, big pixel number, unit */
export function StatRow({ stats }: { stats: Array<Stat> }) {
  return (
    <View style={styles.statRow}>
      {stats.map((stat) => (
        <View key={stat.label} style={styles.stat}>
          <Text style={TYPE.label} numberOfLines={1}>
            {stat.label}
          </Text>
          <Text style={[TYPE.display30, stat.color ? { color: stat.color } : null]} numberOfLines={1} adjustsFontSizeToFit>
            {stat.value}
          </Text>
          {stat.unit ? (
            <Text style={[TYPE.body12, { color: HQ_COLORS.dim }]} numberOfLines={1}>
              {stat.unit}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

interface ListRowProps {
  title: string;
  titleColor?: string;
  subtitle?: string;
  right?: string;
  rightColor?: string;
  onPress?: () => void;
  isLast?: boolean;
}

/** Plain list row with a hairline divider — used for history, moves, closed votes */
export function ListRow({ title, titleColor, subtitle, right, rightColor, onPress, isLast }: ListRowProps) {
  const content = (
    <View style={[styles.listRow, !isLast && styles.listDivider]}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[TYPE.title15, titleColor ? { color: titleColor } : null]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={TYPE.body12} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <Text style={[TYPE.meta, styles.rowRight, { color: rightColor ?? HQ_COLORS.muted }]}>{right}</Text> : null}
    </View>
  );

  if (!onPress) return content;
  return <Touchable onPress={onPress}>{content}</Touchable>;
}

interface ProgressBarProps {
  progress: number;
  color: string;
  height?: number;
  delay?: number;
}

/** Track + fill that grows in on mount */
export function ProgressBar({ progress, color, height = 6, delay = 120 }: ProgressBarProps) {
  const grow = useSharedValue(0);
  const clamped = Math.min(1, Math.max(0, progress));

  useEffect(() => {
    grow.value = withDelay(delay, withTiming(clamped, { duration: 700, easing: Easing.out(Easing.cubic) }));
  }, [clamped, delay, grow]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${grow.value * 100}%` }));

  return (
    <View style={[styles.track, { height }]}>
      <Animated.View style={[{ height, backgroundColor: color, minWidth: clamped > 0 ? 2 : 0 }, fillStyle]} />
    </View>
  );
}

/** Yes / no split bar: green left, red right, 2px gap */
export function SplitBar({ yes, no, height = 8 }: { yes: number; no: number; height?: number }) {
  const total = yes + no;
  if (total <= 0) return <View style={[styles.track, { height }]} />;

  return (
    <View style={[styles.split, { height }]}>
      <View style={{ flex: yes, backgroundColor: HQ_COLORS.green }} />
      <View style={{ flex: no, backgroundColor: HQ_COLORS.red }} />
    </View>
  );
}

interface SegmentedProps<T extends string> {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[styles.segment, isActive && { backgroundColor: HQ_COLORS.green }]}
            onPress={() => {
              if (isActive) return;
              void Haptics.selectionAsync();
              onChange(option.value);
            }}
          >
            <View pointerEvents="none">
              <Text style={[TYPE.display20, { color: isActive ? HQ_COLORS.bg : HQ_COLORS.muted }]}>{option.label}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Small outlined pill, e.g. "TREASURY", "+10 REP" */
export function Chip({ label, color = HQ_COLORS.muted }: { label: string; color?: string }) {
  return (
    <View style={[styles.chip, { borderColor: color === HQ_COLORS.muted ? HQ_COLORS.line : color }]}>
      <Text style={[TYPE.display16, { color }]}>{label}</Text>
    </View>
  );
}

export function Notice({ title, message, color = HQ_COLORS.red }: { title: string; message?: string; color?: string }) {
  return (
    <View style={[styles.notice, { borderLeftColor: color }]}>
      <Text style={[TYPE.label, { color }]}>{title}</Text>
      {message ? <Text style={TYPE.body13}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: HQ_COLORS.surface,
    borderWidth: 1,
    borderColor: HQ_COLORS.line,
    padding: SPACE.card,
    gap: 10,
  },
  between: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flex: 1,
    gap: 2,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    minHeight: 56,
  },
  listDivider: {
    borderBottomWidth: 1,
    borderBottomColor: HQ_COLORS.line,
  },
  rowRight: {
    letterSpacing: 0.5,
  },
  track: {
    width: '100%',
    backgroundColor: HQ_COLORS.line,
    overflow: 'hidden',
  },
  split: {
    flexDirection: 'row',
    gap: 2,
    width: '100%',
  },
  segmented: {
    flexDirection: 'row',
    height: 40,
    backgroundColor: HQ_COLORS.surface,
    borderWidth: 1,
    borderColor: HQ_COLORS.line,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  notice: {
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: HQ_COLORS.surface,
    borderLeftWidth: 3,
  },
});
