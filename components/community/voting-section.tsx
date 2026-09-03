import { Text, View } from 'react-native';

import { ArticleCallout, ArticleCard } from './article-card';

interface TrackCardProps {
  name: string;
  duration: string;
  description: string;
  accent: string;
  quorum?: string;
}

function TrackCard(props: TrackCardProps) {
  const { name, duration, description, accent, quorum } = props;
  return (
    <View
      className="mb-3 border-2 border-[#1A2A22]"
      style={{
        shadowColor: '#000000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 2,
      }}
    >
      <View
        className="flex-row items-center justify-between border-b-2 border-[#1A2A22] px-3 py-1.5"
        style={{ backgroundColor: accent }}
      >
        <Text className="font-['PPNeueBit-Bold'] text-[14px] uppercase tracking-wider text-white">
          {name}
        </Text>
        <Text className="font-['PPNeueBit-Bold'] text-[12px] uppercase text-white">
          {duration}
        </Text>
      </View>
      <View className="bg-[#FAFAF7] px-3 py-3">
        <Text className="text-[12px] leading-[18px] text-[#11181C]">
          {description}
        </Text>
        {quorum ? (
          <Text className="mt-2 font-['PPNeueBit-Bold'] text-[11px] uppercase tracking-[2px] text-[#E54545]">
            Requires {quorum} Quorum
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function VotingSection() {
  return (
    <ArticleCard title="Governance & Voting" accentColor="#0080FF">
      <ArticleCallout
        label="Proposal Fee (anti-spam)"
        value="1,000,000,000,000 $PEPPER"
        hint="1 Trillion threshold to submit a formal on-chain proposal — enforced via the Aragon threshold plugin."
        background="#11181C"
      />

      <Text className="mb-2 mt-2 font-['PPNeueBit-Bold'] text-[14px] uppercase tracking-wider text-[#11181C]">
        The Voting Cycle
      </Text>
      <Text className="mb-4 text-[12px] leading-[18px] text-[#11181C]/80">
        Voting periods are hard-coded into smart-contract tracks to match a
        proposal&apos;s significance.
      </Text>

      <TrackCard
        name="Standard Track"
        duration="7 Days"
        description="Major treasury spending, protocol parameter changes, or Ministerial elections."
        accent="#1E4F3A"
      />
      <TrackCard
        name="Agile Track"
        duration="3 Days"
        description="Community initiatives and minor operational adjustments."
        accent="#FFC043"
      />
      <TrackCard
        name="Fast Track"
        duration="48 Hours"
        description="Critical security patches or urgent, time-sensitive treasury requests (partnerships with deadlines, emergency liquidity)."
        accent="#E54545"
        quorum="66%"
      />
    </ArticleCard>
  );
}
