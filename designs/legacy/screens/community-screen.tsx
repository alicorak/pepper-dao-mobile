import { ScrollView, Text, View } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import {
  ParliamentSection,
  PreambleSection,
  RedLinesSection,
  RightsSection,
  TokenomicsSection,
  TreasuryGrowthSection,
  VotingSection,
} from '@/components/community';

const FOREST_GREEN = '#1E4F3A';

export function LegacyCommunityScreen() {
  return (
    <ThemedView className="flex-1" style={{ backgroundColor: FOREST_GREEN }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 64, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5">
          <Text className="font-['PPNeueBit-Bold'] text-[10px] uppercase tracking-[3px] text-[#FFC043]">
            Pepper DAO
          </Text>
          <Text className="font-['PPNeueBit-Bold'] text-[34px] uppercase tracking-wider text-white">
            Constitution
          </Text>
          <Text className="mt-1 text-[12px] text-white/80">
            The shared promise that binds the Pepper People — identity, rights,
            parliament, voting, red lines, and treasury.
          </Text>
        </View>

        <PreambleSection />
        <TokenomicsSection />
        <RightsSection />
        <ParliamentSection />
        <VotingSection />
        <RedLinesSection />
        <TreasuryGrowthSection />

        <View className="mt-2 items-center">
          <Text className="font-['PPNeueBit-Bold'] text-[10px] uppercase tracking-[3px] text-white/50">
            🌶  Long live the Pepper People  🌶
          </Text>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
