import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import { CONSTITUTION, type ConstitutionArticle } from '@/designs/thermal/lib/constitution';

import { Touchable } from '../components/atoms';
import { HqScreen } from '../components/hq-screen';
import { HQ_COLORS, TYPE } from '../theme';

/**
 * RULEBOOK — the Pepper DAO constitution as a simple accordion.
 */
export function RulebookScreen() {
  const [openNumber, setOpenNumber] = useState<string | null>('01');

  function toggle(number: string) {
    void Haptics.selectionAsync();
    setOpenNumber((current) => (current === number ? null : number));
  }

  return (
    <HqScreen hasTabBar={false} header={{ floor: 'PEPPER DAO', title: 'RULEBOOK', fallback: '/community' }}>
      <Text style={TYPE.body14}>The shared promise behind the Pepper People: identity, rights, parliament, voting and treasury.</Text>
      <View>
        {CONSTITUTION.map((article, index) => (
          <Article
            key={article.number}
            article={article}
            isOpen={openNumber === article.number}
            isLast={index === CONSTITUTION.length - 1}
            onToggle={() => toggle(article.number)}
          />
        ))}
      </View>
    </HqScreen>
  );
}

interface ArticleProps {
  article: ConstitutionArticle;
  isOpen: boolean;
  isLast: boolean;
  onToggle: () => void;
}

function Article({ article, isOpen, isLast, onToggle }: ArticleProps) {
  return (
    <Animated.View layout={LinearTransition.duration(200)} style={[styles.article, !isLast && styles.divider]}>
      <Touchable onPress={onToggle} style={styles.head}>
        <Text style={[TYPE.display22, { color: article.locked ? HQ_COLORS.red : HQ_COLORS.green, width: 30 }]}>{article.number}</Text>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={TYPE.title15}>{article.title}</Text>
          <Text style={TYPE.body12} numberOfLines={isOpen ? undefined : 1}>
            {article.summary}
          </Text>
        </View>
        <Text style={[TYPE.display22, { color: HQ_COLORS.muted }]}>{isOpen ? '−' : '+'}</Text>
      </Touchable>

      {isOpen ? (
        <Animated.View entering={FadeIn.duration(200)} style={styles.body}>
          {article.body ? <Text style={TYPE.body14}>{article.body}</Text> : null}
          {article.points?.map((point) => (
            <View key={point.label} style={{ gap: 2 }}>
              <Text style={[TYPE.label, { color: article.locked ? HQ_COLORS.red : HQ_COLORS.text }]}>{point.label}</Text>
              <Text style={TYPE.body13}>{point.text}</Text>
            </View>
          ))}
          {article.quote ? (
            <View style={styles.quote}>
              <Text style={TYPE.body13}>{article.quote}</Text>
            </View>
          ) : null}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  article: {
    paddingVertical: 12,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: HQ_COLORS.line,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  body: {
    gap: 12,
    paddingTop: 12,
    paddingLeft: 42,
  },
  quote: {
    borderLeftWidth: 3,
    borderLeftColor: HQ_COLORS.green,
    paddingLeft: 12,
  },
});
