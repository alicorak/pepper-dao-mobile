import { pickDesign } from '@/config/design';
import { LegacyCommunityScreen } from '@/designs/legacy/screens/community-screen';
import { OfficeScreen } from '@/designs/hq/screens/office-screen';

// Thermal hides this tab and pushes /rulebook instead; HQ uses it for "ME" (your office)
export default pickDesign({ legacy: LegacyCommunityScreen, thermal: LegacyCommunityScreen, hq: OfficeScreen });
