import { Text, View } from 'react-native';

import { ArticleCard } from './article-card';

export function PreambleSection() {
  return (
    <ArticleCard eyebrow="Preamble" title="We Are The Pepper People" accentColor="#E54545">
      <Text className="mb-3 text-[13px] leading-[19px] text-[#11181C]">
        Pepper DAO is created by the community, for the community. A united
        movement within the Chiliz Ecosystem, building a future that&apos;s
        transparent, fun, and spicy — just like the Pepper community.
      </Text>
      <View className="border-l-4 border-[#E54545] bg-[#F3F6F4] px-3 py-2">
        <Text className="text-[12px] italic leading-[18px] text-[#11181C]">
          As $PEPPER becomes the platform token of Kayen.finance, this
          Constitution is the shared promise to grow together, protect the
          $PEPPER economy, and ensure every voice matters.
        </Text>
      </View>
    </ArticleCard>
  );
}
