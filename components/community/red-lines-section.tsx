import { Text, View } from 'react-native';

import { ArticleCard } from './article-card';

interface RedLineProps {
  title: string;
  body: string;
}

function RedLine(props: RedLineProps) {
  const { title, body } = props;
  return (
    <View className="mb-3 border-l-4 border-[#E54545] bg-[#FAFAF7] px-3 py-3">
      <Text className="mb-2 font-['PPNeueBit-Bold'] text-[12px] uppercase tracking-wider text-[#E54545]">
        {title}
      </Text>
      <Text className="text-[12px] leading-[18px] text-[#11181C]">
        {body}
      </Text>
    </View>
  );
}

export function RedLinesSection() {
  return (
    <ArticleCard title="The Red Lines" accentColor="#E54545">
      <Text className="mb-4 text-[13px] leading-[20px] text-[#11181C]">
        Fundamental safeguards of the ecosystem. These cannot be altered by
        standard community proposals.
      </Text>

      <RedLine
        title="Inflation Cadence"
        body="The permanent Community/Pepper allocation must be spent gradually and strategically to protect the token and the project's health."
      />
      <RedLine
        title="Core Protocol Rules"
        body="Voters cannot stop or fundamentally change the automated Buyback & Burn Engine."
      />
      <RedLine
        title="Treasury Limits"
        body="Any single vote spending above a community-set threshold requires a 66% super-majority."
      />
    </ArticleCard>
  );
}
