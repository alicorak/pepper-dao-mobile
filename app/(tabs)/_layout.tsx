import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs, usePathname } from 'expo-router';
import { useEffect } from 'react';

import { PixelTabBar } from '@/components/ui/pixel-tab-bar';
import { IS_HQ, IS_THERMAL, pickDesign } from '@/config/design';
import { HqTabBar } from '@/designs/hq/components/hq-tab-bar';
import { HQ_COLORS } from '@/designs/hq/theme';
import { ModeSelectorTabBar } from '@/designs/thermal/components/mode-selector-tab-bar';
import { THERMAL_COLORS } from '@/designs/thermal/theme';
import { STORAGE_KEYS, StorageService } from '@/lib/storage';

export default function TabLayout() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      StorageService.setString(STORAGE_KEYS.ACTIVE_TAB, pathname);
    }
  }, [pathname]);

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Render every tab at startup so the first visit isn't a blank scene
        lazy: false,
        ...(SCENE_BACKGROUND ? { sceneStyle: { backgroundColor: SCENE_BACKGROUND } } : {}),
      }}
    >
      <Tabs.Screen name="index" options={{ title: IS_HQ ? 'HQ' : 'Pulse' }} />
      <Tabs.Screen name="governance" options={{ title: IS_HQ ? 'Vote' : 'Decide' }} />
      <Tabs.Screen name="power" options={{ title: IS_HQ ? 'Stake' : 'Power' }} />
      <Tabs.Screen name="community" options={{ title: IS_HQ ? 'Me' : 'Community', href: IS_THERMAL ? null : undefined }} />
    </Tabs>
  );
}

function TabBar(props: BottomTabBarProps) {
  if (IS_HQ) return <HqTabBar {...props} />;
  if (IS_THERMAL) return <ModeSelectorTabBar {...props} />;
  return <PixelTabBar {...props} />;
}

const SCENE_BACKGROUND = pickDesign<string | null>({
  legacy: null,
  thermal: THERMAL_COLORS.void,
  hq: HQ_COLORS.bg,
});
