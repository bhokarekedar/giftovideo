import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../core/theme';
import { Track } from '../../core/models/Project';
import { TrackItemView } from './TrackItemView';

interface TrackLaneProps {
  track: Track;
}

export function TrackLane({ track }: TrackLaneProps) {
  return (
    <View style={styles.container}>
      {track.items.map(item => (
        <TrackItemView key={item.id} trackId={track.id} item={item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    backgroundColor: '#2A2A35',
    borderRadius: theme.radius.sm,
    marginHorizontal: theme.spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
});
