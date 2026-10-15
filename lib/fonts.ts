import * as Font from 'expo-font';

export const FONTS = {
  pixel: 'PPNeueBit-Bold',
  sans: 'PPMondwest-Regular',
  // Thermal Pixel design (Design 1)
  display: 'Jersey15-Regular',
  label: 'Tiny5-Regular',
  body: 'Geist-Regular',
  bodyMedium: 'Geist-Medium',
  // Pepper Inc. HQ design (Design 2)
  bodySemiBold: 'Geist-SemiBold',
} as const;

export async function loadFontsAsync(): Promise<void> {
  await Font.loadAsync({
    [FONTS.pixel]: require('@/assets/fonts/PPNeueBit-Bold.otf'),
    [FONTS.sans]: require('@/assets/fonts/PPMondwest-Regular.otf'),
    [FONTS.display]: require('@expo-google-fonts/jersey-15/400Regular/Jersey15_400Regular.ttf'),
    [FONTS.label]: require('@expo-google-fonts/tiny5/400Regular/Tiny5_400Regular.ttf'),
    [FONTS.body]: require('@expo-google-fonts/geist/400Regular/Geist_400Regular.ttf'),
    [FONTS.bodyMedium]: require('@expo-google-fonts/geist/500Medium/Geist_500Medium.ttf'),
    [FONTS.bodySemiBold]: require('@expo-google-fonts/geist/600SemiBold/Geist_600SemiBold.ttf'),
  });
}
