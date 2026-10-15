import { pickDesign } from '@/config/design';
import { LegacyGovernanceScreen } from '@/designs/legacy/screens/governance-screen';
import { MinistersHallScreen } from '@/designs/hq/screens/ministers-hall-screen';
import { DecideScreen } from '@/designs/thermal/screens/decide-screen';

export default pickDesign({ legacy: LegacyGovernanceScreen, thermal: DecideScreen, hq: MinistersHallScreen });
