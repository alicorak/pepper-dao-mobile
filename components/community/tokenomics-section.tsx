import { Text, View } from 'react-native';

import { ArticleBullet, ArticleCallout, ArticleCard } from './article-card';

export function TokenomicsSection() {
  return (
    <ArticleCard title="Identity, Purpose & Power" accentColor="#1E4F3A">
      <Text className="mb-4 text-[13px] leading-[20px] text-[#11181C]">
        Pepper DAO is a decentralized community-powered organization within the
        Chiliz ecosystem. Not a corporate office — a parliament of participation
        coordinated through the DAO portal.
      </Text>

      <View className="mb-5 border-2 border-dashed border-[#1A2A22] bg-[#FAFAF7] px-3 py-3">
        <Text className="mb-2 font-['PPNeueBit-Bold'] text-[10px] uppercase tracking-[2px] text-[#11181C]/60">
          Regulatory Classification
        </Text>
        <Text className="text-[12px] leading-[18px] text-[#11181C]">
          The $PEPPER airdrop does not constitute an &ldquo;investment of money&rdquo;
          under the Howey test. Value is derived from supply, demand, and
          community utility — not the managerial efforts of others.
        </Text>
      </View>

      <Text className="mb-3 font-['PPNeueBit-Bold'] text-[14px] uppercase tracking-wider text-[#11181C]">
        Tokenomics & Supply
      </Text>

      <ArticleCallout
        label="Total Supply (Fixed)"
        value="8,888,888,888,000,000 $PEPPER"
        hint="8,888.8 Quadrillion — high-supply community asset for maximum distribution."
      />

      <ArticleCallout
        label="ve-Governance"
        value="Aragon veLocker"
        hint="Lock $PEPPER to earn vePEPPER voting power. Longer locks yield more power via the Curve ve-model."
        background="#1E4F3A"
      />

      <ArticleCallout
        label="Buyback & Burn Engine"
        value="25% of Kayen.finance DEX Fees"
        hint="50% buyback / 50% burn — automatic, on every trade. Keeps the $PEPPER economy healthy."
        background="#E54545"
      />

      <View className="mt-2">
        <ArticleBullet>
          Through the DAO portal, $PEPPER holders elect Ministers, create
          proposals, support initiatives, make themselves heard, and safeguard
          the $PEPPER treasury.
        </ArticleBullet>
      </View>
    </ArticleCard>
  );
}
