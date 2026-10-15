import { pickDesign } from '@/config/design';
import { LegacyHomeScreen } from '@/designs/legacy/screens/home-screen';
import { HqHomeScreen } from '@/designs/hq/screens/hq-home-screen';
import { PulseScreen } from '@/designs/thermal/screens/pulse-screen';

export default pickDesign({ legacy: LegacyHomeScreen, thermal: PulseScreen, hq: HqHomeScreen });
