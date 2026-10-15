import { Redirect, useLocalSearchParams } from 'expo-router';

import { FurnaceScreen } from './furnace-screen';
import { TreasuryScreen } from './treasury-screen';

/** Basement floors reached from the HQ elevator: /floor/treasury, /floor/furnace */
export function FloorScreen() {
  const { floor } = useLocalSearchParams<{ floor: string }>();

  if (floor === 'treasury') return <TreasuryScreen />;
  if (floor === 'furnace') return <FurnaceScreen />;
  return <Redirect href="/" />;
}
