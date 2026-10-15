import { type ReactNode, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HQ_COLORS, SPACE, TYPE } from '../theme';
import { Touchable } from './atoms';

interface HqSheetProps {
  visible: boolean;
  onClose: () => void;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Buttons pinned to the bottom */
  footer?: ReactNode;
  /** Blocks closing while a transaction is in flight */
  locked?: boolean;
}

/** Bottom sheet used for every HQ overlay (stake form, info). */
export function HqSheet({ visible, onClose, eyebrow, title, subtitle, children, footer, locked = false }: HqSheetProps) {
  const [isMounted, setIsMounted] = useState(visible);
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const offset = useSharedValue(height);
  const scrim = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      offset.value = height;
      offset.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
      scrim.value = withTiming(1, { duration: 200 });
    } else if (isMounted) {
      scrim.value = withTiming(0, { duration: 160 });
      offset.value = withTiming(height, { duration: 200, easing: Easing.in(Easing.quad) }, (finished) => {
        if (finished) runOnJS(setIsMounted)(false);
      });
    }
  }, [visible, height, isMounted, offset, scrim]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: offset.value }] }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrim.value }));

  function requestClose() {
    if (!locked) onClose();
  }

  if (!isMounted) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={requestClose}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, scrimStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={requestClose} />
      </Animated.View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard} pointerEvents="box-none">
        <Animated.View style={[styles.sheet, { maxHeight: height - insets.top - 24 }, sheetStyle]}>
          <View style={styles.header}>
            <Text style={[TYPE.label, { color: HQ_COLORS.green }]}>{eyebrow}</Text>
            <Touchable onPress={requestClose} hitSlop={12} style={[styles.close, locked && { opacity: 0.3 }]}>
              <Text style={TYPE.display20}>X</Text>
            </Touchable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={{ gap: 4 }}>
              <Text style={TYPE.display32}>{title}</Text>
              {subtitle ? <Text style={TYPE.body13}>{subtitle}</Text> : null}
            </View>
            {children}
          </ScrollView>
          {footer ? <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>{footer}</View> : null}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    backgroundColor: HQ_COLORS.scrim,
  },
  keyboard: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: HQ_COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: HQ_COLORS.line,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACE.margin,
    paddingTop: 16,
  },
  close: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: HQ_COLORS.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: SPACE.margin,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: SPACE.margin,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: HQ_COLORS.line,
  },
});
