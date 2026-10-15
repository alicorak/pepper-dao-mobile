import { StyleSheet } from 'react-native';

import { FONTS } from '@/lib/fonts';

/**
 * Pepper Inc. HQ design tokens (Figma: "App v2 — Pepper Inc. HQ", v2.1 Dark 2 · Clean)
 *
 * Color rules: green = primary action / yes, red = no / burn / brand title,
 * yellow = CHZ & rewards only. No glows, no soft shadows.
 */
export const HQ_COLORS = {
  bg: '#0A0A0C',
  surface: '#131715',
  surfaceHi: '#1A201C',
  line: '#24302A',
  text: '#FFFFFF',
  muted: '#8A968F',
  dim: '#66726B',
  green: '#22E07A',
  red: '#FF3B4A',
  yellow: '#FFC800',
  scrim: 'rgba(0,0,0,0.72)',
} as const;

export const SPACE = {
  /** Page side margin */
  margin: 20,
  /** Gap between blocks on a screen */
  section: 20,
  /** Inner padding of cards */
  card: 16,
  /** Gap between label and content */
  tight: 8,
} as const;

/** Visible tab bar height above the home indicator */
export const TAB_BAR_HEIGHT = 58;

export const BANNER_HEIGHT = 120;

export const TYPE = StyleSheet.create({
  display72: { fontFamily: FONTS.display, fontSize: 72, lineHeight: 68, color: HQ_COLORS.text },
  display56: { fontFamily: FONTS.display, fontSize: 56, lineHeight: 54, color: HQ_COLORS.text },
  display44: { fontFamily: FONTS.display, fontSize: 44, lineHeight: 44, color: HQ_COLORS.text },
  display32: { fontFamily: FONTS.display, fontSize: 32, lineHeight: 32, color: HQ_COLORS.text },
  display30: { fontFamily: FONTS.display, fontSize: 30, lineHeight: 30, color: HQ_COLORS.text },
  display22: { fontFamily: FONTS.display, fontSize: 22, lineHeight: 24, color: HQ_COLORS.text },
  display20: { fontFamily: FONTS.display, fontSize: 20, lineHeight: 22, color: HQ_COLORS.text },
  display16: { fontFamily: FONTS.display, fontSize: 16, lineHeight: 18, letterSpacing: 0.6, color: HQ_COLORS.text },
  label: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: HQ_COLORS.muted,
  },
  meta: { fontFamily: FONTS.bodyMedium, fontSize: 12, lineHeight: 16, color: HQ_COLORS.text },
  body12: { fontFamily: FONTS.body, fontSize: 12, lineHeight: 16, color: HQ_COLORS.muted },
  body13: { fontFamily: FONTS.body, fontSize: 13, lineHeight: 19, color: HQ_COLORS.muted },
  body14: { fontFamily: FONTS.body, fontSize: 14, lineHeight: 21, color: HQ_COLORS.muted },
  medium14: { fontFamily: FONTS.bodyMedium, fontSize: 14, lineHeight: 20, color: HQ_COLORS.text },
  title15: { fontFamily: FONTS.bodySemiBold, fontSize: 15, lineHeight: 20, color: HQ_COLORS.text },
  title17: { fontFamily: FONTS.bodySemiBold, fontSize: 17, lineHeight: 22, color: HQ_COLORS.text },
  title22: { fontFamily: FONTS.bodySemiBold, fontSize: 22, lineHeight: 28, color: HQ_COLORS.text },
});
