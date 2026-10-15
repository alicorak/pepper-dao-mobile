import { Image } from 'expo-image';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUser } from '@/contexts/user-context';
import { REPUTATION_POINTS } from '@/lib/reputation';
import { shortenAddress } from '@/designs/thermal/lib/format';

import { EXPLORER_URL, HQ_IMAGES } from '../lib/floors';
import { BANNER_HEIGHT, HQ_COLORS, SPACE, TYPE } from '../theme';
import { Card, Chip } from './atoms';
import { HqButton } from './hq-button';

interface VoteSealedProps {
  option: 'YES' | 'NO' | 'ABSTAIN';
  proposalKey: string;
  txHash: string;
  onDone: () => void;
}

/** Receipt after a successful vote: the stamp slams down, then the steps tick in */
export function VoteSealed({ option, proposalKey, txHash, onDone }: VoteSealedProps) {
  const insets = useSafeAreaInsets();
  const { profile } = useUser();
  const stamp = useSharedValue(0);

  useEffect(() => {
    stamp.value = withSpring(1, { damping: 11, stiffness: 180, mass: 0.8 });
  }, [stamp]);

  const stampStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, stamp.value * 4),
    transform: [{ scale: 1.8 - stamp.value * 0.8 }, { rotate: '-3deg' }],
  }));

  const streak = profile?.current_streak_weeks ?? 0;
  const steps = ['Signed in your wallet', 'Sent to Chiliz Chain', `Confirmed · tx ${shortenAddress(txHash)}`];

  async function handleExplorer() {
    await openBrowserAsync(`${EXPLORER_URL}/tx/${txHash}`, { presentationStyle: WebBrowserPresentationStyle.AUTOMATIC });
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Image source={HQ_IMAGES.ministers} style={styles.banner} contentFit="cover" />

      <View style={styles.content}>
        <Animated.View style={[styles.stamp, stampStyle]}>
          <Text style={[TYPE.display56, { color: HQ_COLORS.green }]}>VOTE SEALED</Text>
          <Text style={TYPE.display22}>{`${option} · ${proposalKey}`}</Text>
        </Animated.View>

        <Card style={{ gap: 12 }}>
          {steps.map((step, index) => (
            <Animated.View key={step} style={styles.step}>
              <View style={styles.check} />
              <Text style={TYPE.medium14}>{step}</Text>
            </Animated.View>
          ))}
        </Card>

        <Animated.View style={{ gap: 12, alignItems: 'center' }}>
          <View style={styles.rewards}>
            <Chip label={`+${REPUTATION_POINTS.VOTE} REP`} color={HQ_COLORS.green} />
            {streak > 0 ? <Chip label={`STREAK ${streak} WK`} color={HQ_COLORS.yellow} /> : null}
          </View>
          <Text style={[TYPE.body14, { textAlign: 'center' }]}>Your ballot is now framed on your office wall.</Text>
        </Animated.View>
      </View>

      <View style={[styles.actions, { paddingBottom: insets.bottom + 16 }]}>
        <HqButton label="BACK TO HALL" onPress={onDone} />
        <HqButton label="VIEW ON CHILISCAN" variant="secondary" size="medium" onPress={() => void handleExplorer()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: HQ_COLORS.bg,
  },
  banner: {
    width: '100%',
    height: BANNER_HEIGHT,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACE.margin,
    paddingTop: 32,
    gap: 28,
  },
  stamp: {
    alignSelf: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: HQ_COLORS.green,
    paddingHorizontal: 22,
    paddingVertical: 12,
    backgroundColor: HQ_COLORS.bg,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  check: {
    width: 10,
    height: 10,
    backgroundColor: HQ_COLORS.green,
  },
  rewards: {
    flexDirection: 'row',
    gap: 8,
  },
  actions: {
    gap: 10,
    paddingHorizontal: SPACE.margin,
  },
});
