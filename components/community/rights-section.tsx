import { Text } from 'react-native';

import { ArticleBullet, ArticleCard } from './article-card';

export function RightsSection() {
  return (
    <ArticleCard title="Pepper People Rights" accentColor="#FFC043">
      <Text className="mb-4 text-[13px] leading-[20px] text-[#11181C]">
        Every $PEPPER holder can be a member of the DAO and has the following
        rights:
      </Text>

      <ArticleBullet label="Governance Access">
        Vote on proposals, community incentives, and decisions regarding Pepper
        DAO and Kayen.finance — including which Liquidity Pools receive Yield
        Promotions.
      </ArticleBullet>

      <ArticleBullet label="Proposal Submission">
        Formal proposals require the threshold defined in Article IV.
      </ArticleBullet>

      <ArticleBullet label="Early Access">
        Members may receive &ldquo;First Look&rdquo; beta access to features like limit
        orders and perpetuals on Kayen.
      </ArticleBullet>
    </ArticleCard>
  );
}
