import { pickDesign } from '@/config/design';
import { LegacyProposalDetailScreen } from '@/designs/legacy/screens/proposal-detail-screen';
import { ProposalScreen } from '@/designs/hq/screens/proposal-screen';
import { ProposalDetailScreen } from '@/designs/thermal/screens/proposal-detail-screen';

export default pickDesign({ legacy: LegacyProposalDetailScreen, thermal: ProposalDetailScreen, hq: ProposalScreen });
