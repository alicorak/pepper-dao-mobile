import { Redirect } from 'expo-router';

import { IS_HQ } from '@/config/design';
import { FloorScreen } from '@/designs/hq/screens/floor-screen';

// Basement floors (treasury, burn furnace) only exist in the HQ design
function NoFloor() {
  return <Redirect href="/" />;
}

export default IS_HQ ? FloorScreen : NoFloor;
