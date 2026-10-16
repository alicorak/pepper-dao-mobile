import { pickDesign } from '@/config/design';
import { LegacyCreateProposalScreen } from '@/designs/legacy/screens/create-proposal-screen';
import { CreateProposalScreen } from '@/designs/thermal/screens/create-proposal-screen';

export default pickDesign({ legacy: LegacyCreateProposalScreen, thermal: CreateProposalScreen, hq: LegacyCreateProposalScreen });
