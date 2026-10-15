import { Text } from 'react-native';

import { useWallet } from '@/contexts/wallet-context';

import { TYPE } from '../theme';
import { Card } from './atoms';
import { HqButton } from './hq-button';

/** Shown in place of personal data until a wallet is connected */
export function ConnectCard({ title, message }: { title: string; message: string }) {
  const { connect } = useWallet();

  return (
    <Card>
      <Text style={TYPE.title17}>{title}</Text>
      <Text style={TYPE.body13}>{message}</Text>
      <HqButton label="CONNECT WALLET" size="medium" onPress={() => void connect()} />
    </Card>
  );
}
