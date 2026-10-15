import { pickDesign } from '@/config/design';
import { LegacyCommunityScreen } from '@/designs/legacy/screens/community-screen';
import { RulebookScreen as HqRulebookScreen } from '@/designs/hq/screens/rulebook-screen';
import { RulebookScreen } from '@/designs/thermal/screens/rulebook-screen';

export default pickDesign({ legacy: LegacyCommunityScreen, thermal: RulebookScreen, hq: HqRulebookScreen });
