import { Text, View } from 'react-native';

import { ArticleCard } from './article-card';

export function TreasuryGrowthSection() {
  return (
    <ArticleCard title="Treasury & Growth" accentColor="#1E4F3A">
      <Text className="mb-4 text-[13px] leading-[20px] text-[#11181C]">
        The DAO treasury comes from the Community/Pepper allocation and
        potential future partnerships. How it is used is subject to the
        decisions of Pepper DAO.
      </Text>
      <View className="border-2 border-[#1A2A22] bg-[#1E4F3A] px-3 py-3">
        <Text className="mb-2 font-['PPNeueBit-Bold'] text-[12px] uppercase tracking-wider text-white">
          Transparency over Secrecy
        </Text>
        <Text className="text-[12px] leading-[18px] text-white/90">
          Every penny spent is visible for all to see. No hidden deals, no
          private spending — ever.
        </Text>
      </View>
    </ArticleCard>
  );
}
