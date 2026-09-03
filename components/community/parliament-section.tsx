import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ArticleCard } from './article-card';

interface MinisterRoleProps {
  title: string;
  description: string;
  accent: string;
}

function MinisterRole(props: MinisterRoleProps) {
  const { title, description, accent } = props;
  return (
    <View
      className="mb-3 border-2 border-[#1A2A22] bg-[#FAFAF7]"
      style={{
        shadowColor: '#000000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 2,
      }}
    >
      <View
        className="flex-row items-center justify-between border-b-2 border-[#1A2A22] px-3 py-2.5"
        style={{ backgroundColor: accent }}
      >
        <Text className="font-['PPNeueBit-Bold'] text-[14px] uppercase tracking-wider text-white">
          {title}
        </Text>
        <View className="border border-white/60 px-1.5 py-0.5">
          <Text className="font-['PPNeueBit-Bold'] text-[9px] uppercase tracking-[2px] text-white">
            Election Pending
          </Text>
        </View>
      </View>
      <View className="px-3 py-3">
        <Text className="text-[12px] leading-[18px] text-[#11181C]">
          {description}
        </Text>
      </View>
    </View>
  );
}

const CODE_OF_CONDUCT: Array<{ title: string; body: string }> = [
  {
    title: 'Integrity & Honesty',
    body: 'Act with total honesty; never use the position for personal financial gain or private "side deals".',
  },
  {
    title: 'Transparency',
    body: 'Provide mandatory monthly reports on activities and spending. Missing three reports triggers an automatic confidence vote.',
  },
  {
    title: 'Constitutional Fidelity',
    body: 'Protect the "Red Lines" and the core principles of the Pepper DAO.',
  },
  {
    title: 'No Gatekeeping',
    body: 'Encourage open participation; avoid any elitist behavior.',
  },
  {
    title: 'Professional Conflict Management',
    body: 'Disclose conflicts of interest, abstain or recuse where appropriate, avoid related discussions.',
  },
  {
    title: 'Removal',
    body: 'Ministers can be removed at any time by a 60% community vote if they fail to uphold these standards.',
  },
];

export function ParliamentSection() {
  const [open, setOpen] = useState(false);

  return (
    <ArticleCard title="The Pepper Parliament" accentColor="#1E4F3A">
      <Text className="mb-4 text-[13px] leading-[20px] text-[#11181C]">
        Three (3) elected Ministers organize the vibes and the votes. The
        Pillars: Prime, Treasury, and Publicity.
      </Text>

      <MinisterRole
        title="Prime Minister"
        description="Coordinates governance processes, schedules votes, and ensures communication flow across the DAO."
        accent="#E54545"
      />
      <MinisterRole
        title="Treasury Minister"
        description="Manages the treasury, spending, and financial reporting — every penny visible to the community."
        accent="#1E4F3A"
      />
      <MinisterRole
        title="Publicity Minister"
        description="Runs Pepper's social channels day-to-day: content, amplification, announcements, and growth."
        accent="#FFC043"
      />

      <Pressable
        onPress={() => setOpen((v) => !v)}
        className="mt-2 flex-row items-center justify-between border-2 border-[#1A2A22] bg-[#F3F6F4] px-3 py-2 active:translate-x-[1px] active:translate-y-[1px]"
      >
        <Text className="font-['PPNeueBit-Bold'] text-[13px] uppercase tracking-wider text-[#11181C]">
          Ministerial Code of Conduct
        </Text>
        <Text className="font-['PPNeueBit-Bold'] text-[14px] text-[#11181C]">
          {open ? '−' : '+'}
        </Text>
      </Pressable>

      {open ? (
        <View className="mt-2 border-2 border-[#1A2A22] bg-[#FAFAF7] px-3 py-3">
          {CODE_OF_CONDUCT.map((item, i) => (
            <View key={item.title} className={i === CODE_OF_CONDUCT.length - 1 ? '' : 'mb-3'}>
              <Text className="mb-1 font-['PPNeueBit-Bold'] text-[12px] uppercase tracking-wider text-[#E54545]">
                {i + 1}. {item.title}
              </Text>
              <Text className="text-[12px] leading-[18px] text-[#11181C]">
                {item.body}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </ArticleCard>
  );
}
