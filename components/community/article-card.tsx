import { type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';

interface ArticleCardProps {
  eyebrow?: string;
  title: string;
  accentColor?: string;
  children: ReactNode;
}

export function ArticleCard(props: ArticleCardProps) {
  const { eyebrow, title, accentColor = '#E54545', children } = props;

  return (
    <Card elevation="md" variant="default" className="mb-6">
      <View
        className="border-b-4 px-3 py-3"
        style={{ backgroundColor: accentColor, borderBottomColor: '#1A2A22' }}
      >
        {eyebrow ? (
          <Text
            className="mb-1 font-['PPNeueBit-Bold'] text-[10px] uppercase tracking-[2px] text-white/80"
          >
            {eyebrow}
          </Text>
        ) : null}
        <Text className="font-['PPNeueBit-Bold'] text-[20px] uppercase tracking-wider text-white">
          {title}
        </Text>
      </View>
      <View className="px-3 py-4">{children}</View>
    </Card>
  );
}

interface BulletProps {
  label?: string;
  children: ReactNode;
}

export function ArticleBullet(props: BulletProps) {
  const { label, children } = props;
  return (
    <View className="mb-3 flex-row">
      <Text className="mr-2 font-['PPNeueBit-Bold'] text-[14px] leading-[20px] text-[#E54545]">
        ▸
      </Text>
      <Text className="flex-1 text-[13px] leading-[20px] text-[#11181C]">
        {label ? (
          <Text className="font-bold text-[#11181C]">{label}: </Text>
        ) : null}
        {children}
      </Text>
    </View>
  );
}

interface CalloutProps {
  label: string;
  value: string;
  hint?: string;
  background?: string;
  textColor?: string;
}

export function ArticleCallout(props: CalloutProps) {
  const {
    label,
    value,
    hint,
    background = '#1E4F3A',
    textColor = '#FFFFFF',
  } = props;
  return (
    <View
      className="mb-4 border-2 px-3 py-3"
      style={{ backgroundColor: background, borderColor: '#1A2A22' }}
    >
      <Text
        className="mb-2 font-['PPNeueBit-Bold'] text-[10px] uppercase tracking-[2px]"
        style={{ color: textColor, opacity: 0.7 }}
      >
        {label}
      </Text>
      <Text
        className="font-['PPNeueBit-Bold'] text-[16px]"
        style={{ color: textColor }}
      >
        {value}
      </Text>
      {hint ? (
        <Text className="mt-2 text-[11px] leading-[16px]" style={{ color: textColor, opacity: 0.85 }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
