import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BANNER_HEIGHT, HQ_COLORS, SPACE, TAB_BAR_HEIGHT, TYPE } from '../theme';
import { Touchable } from './atoms';

interface HqScreenProps {
  children: ReactNode;
  /** Floor header: back chip, floor tag and title */
  header?: FloorHeaderProps;
  /** Full-bleed pixel-art room under the header */
  banner?: number;
  /** Tab screens leave room for the tab bar; stack screens for the home indicator */
  hasTabBar?: boolean;
  /** Extra bottom space for a docked action bar */
  bottomSpace?: number;
  /** Rendered above the scroll view (docked buttons) */
  overlay?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}

/**
 * Every HQ screen: status bar spacing, an optional floor header + room
 * banner, then the content column with 20px side margins.
 */
export function HqScreen({
  children,
  header,
  banner,
  hasTabBar = true,
  bottomSpace = 0,
  overlay,
  refreshing = false,
  onRefresh,
}: HqScreenProps) {
  const insets = useSafeAreaInsets();
  const bottom = (hasTabBar ? TAB_BAR_HEIGHT : 0) + insets.bottom + bottomSpace + 28;

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 4, paddingBottom: bottom }}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={HQ_COLORS.green}
              colors={[HQ_COLORS.green]}
              progressBackgroundColor={HQ_COLORS.surface}
            />
          ) : undefined
        }
      >
        {header ? <FloorHeader {...header} /> : null}
        {banner ? (
          <Animated.View>
            <Image source={banner} style={styles.banner} contentFit="cover" />
          </Animated.View>
        ) : null}
        <View style={[styles.content, { paddingTop: header || banner ? SPACE.section : 8 }]}>{children}</View>
      </ScrollView>
      {overlay}
    </View>
  );
}

export interface FloorHeaderProps {
  floor: string;
  title: string;
  /** Where the back chip goes when there is no history (tab screens go to HQ) */
  fallback?: string;
  right?: ReactNode;
  hideBack?: boolean;
}

export function FloorHeader({ floor, title, fallback = '/', right, hideBack }: FloorHeaderProps) {
  const router = useRouter();

  function handleBack() {
    if (router.canGoBack()) router.back();
    else router.navigate(fallback as never);
  }

  return (
    <View style={styles.header}>
      {hideBack ? null : (
        <Touchable onPress={handleBack} hitSlop={8} style={styles.back} accessibilityLabel="Back">
          <Text style={[TYPE.display30, styles.backGlyph]}>‹</Text>
        </Touchable>
      )}
      <View style={{ flex: 1 }}>
        <Text style={[TYPE.display16, { color: HQ_COLORS.green }]} numberOfLines={1}>
          {floor}
        </Text>
        <Text style={TYPE.display32} numberOfLines={1} adjustsFontSizeToFit>
          {title}
        </Text>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: HQ_COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: SPACE.margin,
    paddingVertical: 8,
    minHeight: 60,
  },
  back: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: HQ_COLORS.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGlyph: {
    marginTop: -4,
  },
  banner: {
    width: '100%',
    height: BANNER_HEIGHT,
    backgroundColor: HQ_COLORS.bg,
  },
  content: {
    paddingHorizontal: SPACE.margin,
    gap: SPACE.section,
  },
});
