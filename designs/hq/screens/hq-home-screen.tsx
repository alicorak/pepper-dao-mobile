import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useWallet } from '@/contexts/wallet-context';
import { useGovernanceProposals } from '@/hooks/use-governance';
import { usePepperTokenMetrics } from '@/hooks/use-pepper-token-metrics';
import { useStaking } from '@/hooks/use-staking';
import { calculateBurnedFromOriginalSupply } from '@/lib/pepper-metrics';
import { formatCompact, tokenToNumber } from '@/designs/thermal/lib/format';
import { isLiveProposal } from '@/designs/thermal/lib/proposal';

import { Card, StatRow, Touchable } from '../components/atoms';
import { HqButton } from '../components/hq-button';
import { HqScreen } from '../components/hq-screen';
import { PepperTower } from '../components/pepper-tower';
import { HQ_COLORS, TYPE } from '../theme';

/**
 * HQ — the Pepper Inc. building. Each floor is a section of the app; the
 * card below points at whatever needs you right now.
 */
export function HqHomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { metrics, isFetching, refetch } = usePepperTokenMetrics();
  const { data: proposals, refetch: refetchProposals } = useGovernanceProposals({});

  const { openCount, needsYou } = useMemo(() => {
    const live = (proposals ?? []).filter((proposal) => proposal.status === 'ACTIVE');
    const unvoted = live.filter((proposal) => proposal.type === 'PEP' && !hasVoted(proposal.userVote?.voteOption));
    return { openCount: live.length, needsYou: unvoted.length };
  }, [proposals]);

  const pendingCount = (proposals ?? []).filter(isLiveProposal).length - openCount;
  const decimals = metrics?.decimals ?? 18;
  const burned = metrics ? Number(calculateBurnedFromOriginalSupply(metrics.totalSupply, decimals)) : null;

  function handleRefresh() {
    refetch();
    void refetchProposals();
  }

  return (
    <HqScreen refreshing={isFetching && Boolean(metrics)} onRefresh={handleRefresh}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[TYPE.display44, { color: HQ_COLORS.red }]}>PEPPER INC.</Text>
          <Text style={[TYPE.label, { color: HQ_COLORS.dim }]}>NIGHT SHIFT</Text>
        </View>
        <BalanceBadge />
      </View>

      <PepperTower width={Math.min(width - 72, 360)} openVotes={openCount} />

      <Animated.View>
        <Card style={styles.floorCard}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[TYPE.label, { color: HQ_COLORS.green }]}>3F · MINISTERS HALL</Text>
            <Text style={TYPE.title17} numberOfLines={1}>
              {getHallMessage(openCount, needsYou, pendingCount)}
            </Text>
          </View>
          <HqButton label="VOTE" size="medium" onPress={() => router.navigate('/governance')} />
        </Card>
      </Animated.View>

      <Animated.View>
        <StatRow
          stats={[
            {
              label: 'TREASURY',
              value: metrics ? formatCompact(tokenToNumber(metrics.treasuryChzBalance, 18)) : '–',
              unit: 'CHZ',
              color: HQ_COLORS.yellow,
            },
            {
              label: 'STAKED',
              value: metrics?.hasStakedData ? formatCompact(tokenToNumber(metrics.stakedAmount, decimals)) : '–',
              unit: 'PEPPER',
            },
            { label: 'BURNT', value: burned !== null ? formatCompact(burned) : '–', unit: 'PEPPER', color: HQ_COLORS.red },
          ]}
        />
      </Animated.View>
    </HqScreen>
  );
}

/** Your PEPPER (wallet + staked), or a connect prompt */
function BalanceBadge() {
  const { isConnected, connect } = useWallet();
  const { formattedWalletBalance, formattedStakedBalance, isLoading } = useStaking();

  if (!isConnected) {
    return (
      <Touchable onPress={() => void connect()} style={styles.connect} hitSlop={8}>
        <View style={styles.connectDot} />
        <Text style={TYPE.display20}>CONNECT</Text>
      </Touchable>
    );
  }

  const total = (parseFloat(formattedWalletBalance) || 0) + (parseFloat(formattedStakedBalance) || 0);

  return (
    <View style={{ alignItems: 'flex-end' }}>
      <Text style={TYPE.display30}>{isLoading ? '…' : formatCompact(total)}</Text>
      <Text style={TYPE.label}>PEPPER</Text>
    </View>
  );
}

function getHallMessage(openCount: number, needsYou: number, pendingCount: number): string {
  if (needsYou === 1) return '1 vote needs you';
  if (needsYou > 1) return `${needsYou} votes need you`;
  if (openCount > 0) return 'You voted on everything';
  if (pendingCount > 0) return `${pendingCount} vote${pendingCount === 1 ? '' : 's'} opening soon`;
  return 'No open votes right now';
}

function hasVoted(option: string | undefined): boolean {
  return Boolean(option) && option !== 'NONE';
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingTop: 8,
  },
  floorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  connect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: HQ_COLORS.line,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
  },
  connectDot: {
    width: 6,
    height: 6,
    backgroundColor: HQ_COLORS.red,
  },
});
