import { ActivityIndicator, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { HQ_COLORS, TYPE } from '../theme';
import { Touchable } from './atoms';

interface HqButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Two button styles only: solid green (the one action that matters on the
 * screen) and outlined (everything else).
 */
export function HqButton({ label, onPress, variant = 'primary', size = 'large', disabled, loading, style }: HqButtonProps) {
  const isPrimary = variant === 'primary';
  const isInactive = disabled || loading;
  const textColor = isPrimary ? HQ_COLORS.bg : HQ_COLORS.text;

  return (
    <Touchable
      onPress={onPress}
      disabled={isInactive}
      pressedOpacity={0.75}
      style={[
        styles.base,
        { height: HEIGHTS[size], paddingHorizontal: size === 'small' ? 14 : 18 },
        isPrimary ? styles.primary : styles.secondary,
        isInactive && styles.inactive,
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={textColor} /> : null}
      <Text style={[size === 'small' ? TYPE.display20 : TYPE.display22, { color: textColor }]} numberOfLines={1}>
        {label}
      </Text>
    </Touchable>
  );
}

type Variant = 'primary' | 'secondary';
type Size = 'large' | 'medium' | 'small';

const HEIGHTS: Record<Size, number> = {
  large: 52,
  medium: 44,
  small: 36,
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primary: {
    backgroundColor: HQ_COLORS.green,
  },
  secondary: {
    borderWidth: 1,
    borderColor: HQ_COLORS.line,
  },
  inactive: {
    opacity: 0.4,
  },
});
