import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HQ_COLORS, TAB_BAR_HEIGHT, TYPE } from '../theme';

/**
 * HQ · VOTE · STAKE · ME. The active tab turns green and a small square
 * indicator slides above it.
 */
export function HqTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index]?.name;
  const activeIndex = Math.max(0, TABS.findIndex((tab) => tab.route === activeRoute));
  const slide = useSharedValue(activeIndex);

  useEffect(() => {
    slide.value = withTiming(activeIndex, { duration: 220, easing: Easing.out(Easing.cubic) });
  }, [activeIndex, slide]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: `${(slide.value + 0.5) * (100 / TABS.length)}%`,
  }));

  function handlePress(routeName: string) {
    const route = state.routes.find((item) => item.name === routeName);
    if (!route) return;

    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (activeRoute !== routeName && !event.defaultPrevented) {
      void Haptics.selectionAsync();
      navigation.navigate(route.name, route.params);
    }
  }

  return (
    <View style={[styles.bar, { height: TAB_BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom }]}>
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      {TABS.map((tab, index) => {
        const isActive = index === activeIndex;
        return (
          <Pressable
            key={tab.route}
            style={styles.tab}
            onPress={() => handlePress(tab.route)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <View pointerEvents="none">
              <Text style={[TYPE.display20, { color: isActive ? HQ_COLORS.green : HQ_COLORS.dim }]}>{tab.label}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const TABS: Array<{ route: string; label: string }> = [
  { route: 'index', label: 'HQ' },
  { route: 'governance', label: 'VOTE' },
  { route: 'power', label: 'STAKE' },
  { route: 'community', label: 'ME' },
];

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: HQ_COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: HQ_COLORS.line,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  indicator: {
    position: 'absolute',
    top: 10,
    width: 6,
    height: 6,
    marginLeft: -3,
    backgroundColor: HQ_COLORS.green,
  },
});
