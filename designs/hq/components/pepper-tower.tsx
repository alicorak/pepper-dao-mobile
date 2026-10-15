import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { BUILDING_RATIO, FLOORS, HQ_IMAGES, type Floor } from '../lib/floors';
import { HQ_COLORS, TYPE } from '../theme';
import { TowerLife } from './tower-life';

interface PepperTowerProps {
  width: number;
  /** Open votes shown in the speech bubble over the Ministers Hall */
  openVotes: number;
}

/**
 * The HQ cross-section, alive (see TowerLife). Every floor is a hotspot:
 * pressing it outlines the floor, names it, then rides the elevator to that screen.
 */
export function PepperTower({ width, openVotes }: PepperTowerProps) {
  const router = useRouter();
  const height = width / BUILDING_RATIO;
  const [pressed, setPressed] = useState<Floor | null>(null);

  function handleOpen(floor: Floor) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.navigate(floor.href as never);
  }

  return (
    <View style={{ width, height, alignSelf: 'center' }}>
      <Image source={HQ_IMAGES.buildingEmptyShaft} style={{ width, height }} contentFit="contain" />
      <TowerLife width={width} />

      {FLOORS.map((floor) => {
        const top = floor.band[0] * height;
        const bandHeight = (floor.band[1] - floor.band[0]) * height;
        const isPressed = pressed?.key === floor.key;
        return (
          <Pressable
            key={floor.key}
            accessibilityRole="button"
            accessibilityLabel={`${floor.key} ${floor.name}`}
            onPressIn={() => setPressed(floor)}
            onPressOut={() => setPressed(null)}
            onPress={() => handleOpen(floor)}
            style={[styles.hotspot, { top, height: bandHeight }]}
          >
            {isPressed ? (
              <Animated.View pointerEvents="none" entering={FadeIn.duration(80)} exiting={FadeOut.duration(160)} style={styles.highlight}>
                <View style={styles.floorTag}>
                  <Text style={[TYPE.display16, { color: HQ_COLORS.bg }]}>{`${floor.key} · ${floor.name}`}</Text>
                </View>
              </Animated.View>
            ) : null}
          </Pressable>
        );
      })}

      {openVotes > 0 ? <VotesBubble count={openVotes} top={height * 0.04} /> : null}
    </View>
  );
}

function VotesBubble({ count, top }: { count: number; top: number }) {
  const bob = useSharedValue(0);

  useEffect(() => {
    bob.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, [bob]);

  const bobStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));

  return (
    <Animated.View pointerEvents="none" style={[styles.bubble, { top }, bobStyle]}>
      <Text style={[TYPE.display20, { color: HQ_COLORS.bg }]}>{count === 1 ? '1 VOTE OPEN' : `${count} VOTES OPEN`}</Text>
      <View style={styles.bubbleTail} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hotspot: {
    position: 'absolute',
    left: '8%',
    right: '8%',
  },
  highlight: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: HQ_COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floorTag: {
    backgroundColor: HQ_COLORS.green,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  bubble: {
    position: 'absolute',
    right: 0,
    backgroundColor: HQ_COLORS.green,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -6,
    left: 12,
    width: 8,
    height: 6,
    backgroundColor: HQ_COLORS.green,
  },
});
