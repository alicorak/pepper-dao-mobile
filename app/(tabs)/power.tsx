import { pickDesign } from '@/config/design';
import { LegacyPowerScreen } from '@/designs/legacy/screens/power-screen';
import { SeedVaultScreen } from '@/designs/hq/screens/seed-vault-screen';
import { PowerScreen } from '@/designs/thermal/screens/power-screen';

export default pickDesign({ legacy: LegacyPowerScreen, thermal: PowerScreen, hq: SeedVaultScreen });
