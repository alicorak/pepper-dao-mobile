import { Text, View } from 'react-native';

import {
  deriveVotingTrack,
  getVotingTrackColors,
  getVotingTrackLabel,
  type VotingTrack,
} from '@/lib/voting-tracks';

interface VotingTrackBadgeProps {
  startDate: string;
  endDate: string;
  track?: VotingTrack;
}

export function VotingTrackBadge(props: VotingTrackBadgeProps) {
  const track = props.track ?? deriveVotingTrack(props.startDate, props.endDate);
  const colors = getVotingTrackColors(track);

  return (
    <View
      className="rounded-none px-2 py-1"
      style={{ backgroundColor: colors.background }}
    >
      <Text
        className="text-[10px] font-bold uppercase tracking-wider"
        style={{ color: colors.text }}
      >
        {getVotingTrackLabel(track)}
      </Text>
    </View>
  );
}
