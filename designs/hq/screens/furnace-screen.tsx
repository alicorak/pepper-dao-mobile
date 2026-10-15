import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { PEPPER_ORIGINAL_SUPPLY } from '@/config/pepper-token';
import { usePepperTokenMetrics } from '@/hooks/use-pepper-token-metrics';
import { calculateBurnedFromOriginalSupply } from '@/lib/pepper-metrics';
import { useCountUp } from '@/designs/thermal/hooks/use-count-up';
import { formatCompact, tokenToNumber } from '@/designs/thermal/lib/format';

import { Card, ListRow, ProgressBar, SectionLabel } from '../components/atoms';
import { HqScreen } from '../components/hq-screen';
import { HQ_IMAGES } from '../lib/floors';
import { HQ_COLORS, TYPE } from '../theme';

/**
 * B2 · BURN FURNACE — how much PEPPER is gone for good, and where the rest of
 * the supply sits.
 */
export function FurnaceScreen() {
  const { metrics, isFetching, refetch } = usePepperTokenMetrics();
  const decimals = metrics?.decimals ?? 18;
  const original = Number(PEPPER_ORIGINAL_SUPPLY);
  const burned = metrics ? Number(calculateBurnedFromOriginalSupply(metrics.totalSupply, decimals)) : 0;
  const burnedShare = original > 0 ? burned / original : 0;
  const animatedBurned = useCountUp(burned, 1300);

  const supply = metrics
    ? [
        { label: 'Current supply', value: tokenToNumber(metrics.totalSupply, decimals) },
        { label: 'Staked', value: tokenToNumber(metrics.stakedAmount, decimals) },
        { label: 'In the treasury', value: tokenToNumber(metrics.treasuryBalance, decimals) },
        { label: 'Circulating', value: tokenToNumber(metrics.circulatingSupply, decimals) },
      ]
    : [];

  return (
    <HqScreen
      hasTabBar={false}
      header={{ floor: 'B2', title: 'BURN FURNACE' }}
      banner={HQ_IMAGES.furnace}
      refreshing={isFetching && Boolean(metrics)}
      onRefresh={() => refetch()}
    >
      <View style={{ gap: 2 }}>
        <Text style={TYPE.label}>BURNT FOREVER</Text>
        <Text style={[TYPE.display72, { color: HQ_COLORS.red }]} numberOfLines={1} adjustsFontSizeToFit>
          {metrics ? formatCompact(animatedBurned) : '–'}
        </Text>
        <Text style={TYPE.body13}>{`PEPPER · ${formatPercent(burnedShare * 100)} of max supply`}</Text>
      </View>

      <Animated.View>
        <Card>
          <View style={styles.between}>
            <Text style={TYPE.label}>MAX SUPPLY</Text>
            <Text style={TYPE.display20}>{formatCompact(original)}</Text>
          </View>
          <ProgressBar progress={Math.max(burnedShare, 0.01)} color={HQ_COLORS.red} height={10} />
          <Text style={TYPE.body12}>Every burn lowers the supply for everyone holding PEPPER.</Text>
        </Card>
      </Animated.View>

      {supply.length > 0 ? (
        <View>
          <SectionLabel label="WHERE THE SUPPLY SITS" />
          {supply.map((item, index) => (
            <ListRow
              key={item.label}
              title={item.label}
              right={`${formatCompact(item.value)} · ${formatPercent((item.value / original) * 100)}`}
              rightColor={HQ_COLORS.text}
              isLast={index === supply.length - 1}
            />
          ))}
        </View>
      ) : null}
    </HqScreen>
  );
}

function formatPercent(percent: number): string {
  if (!Number.isFinite(percent) || percent <= 0) return '0%';
  if (percent < 0.01) return `${percent.toFixed(4)}%`;
  return `${percent.toFixed(percent < 10 ? 2 : 1)}%`;
}

const styles = StyleSheet.create({
  between: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
});
