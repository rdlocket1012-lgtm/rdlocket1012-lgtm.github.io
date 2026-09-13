import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { getVoiceLetterUrl, formatDuration } from '@/lib/audio-letter';

/**
 * Plays back a stored voice letter. Fetches a signed URL on mount, renders a
 * play/pause control with a static waveform and a progress fill.
 */
export function VoiceLetterPlayer({ audioPath, duration }: { audioPath: string; duration: number | null }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    getVoiceLetterUrl(audioPath).then((u) => {
      if (!active) return;
      if (u) setUrl(u);
      else setLoadFailed(true);
    });
    return () => { active = false; };
  }, [audioPath]);

  const player = useAudioPlayer(url ? { uri: url } : null);
  const status = useAudioPlayerStatus(player);

  const playing = status?.playing ?? false;
  const total = status?.duration || duration || 0;
  const current = status?.currentTime || 0;
  const progress = total > 0 ? Math.min(1, current / total) : 0;

  function toggle() {
    if (!url) return;
    if (playing) {
      player.pause();
    } else {
      // Restart if we're at the end
      if (status?.didJustFinish || (total > 0 && current >= total - 0.1)) {
        player.seekTo(0);
      }
      player.play();
    }
  }

  // Static waveform bars (decorative — consistent per render)
  const bars = React.useMemo(() => Array.from({ length: 32 }, (_, i) => 0.3 + Math.abs(Math.sin(i * 1.3)) * 0.7), []);

  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 14,
      backgroundColor: tint(LK.blush, 0.5), borderRadius: 20, padding: 16,
      marginBottom: 24, ...theme.shadow.sm,
    }}>
      {/* Play / pause */}
      <ScalePressable
        onPress={toggle}
        disabled={!url}
        scaleTo={0.92}
        accessibilityLabel={playing ? 'Pause voice letter' : 'Play voice letter'}
        style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: LK.blush, alignItems: 'center', justifyContent: 'center' }}
      >
        {!url && !loadFailed
          ? <ActivityIndicator size="small" color={shade(LK.blush, 0.55)} />
          : <Icon name={playing ? 'pause' : 'play'} size={26} color={shade(LK.blush, 0.6)} />}
      </ScalePressable>

      {/* Waveform + progress */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 36, gap: 2 }}>
          {bars.map((h, i) => {
            const filled = i / bars.length <= progress;
            return (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: `${h * 100}%`,
                  borderRadius: 2,
                  backgroundColor: filled ? shade(LK.blush, 0.5) : 'rgba(58,46,34,0.18)',
                }}
              />
            );
          })}
        </View>
        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12, color: shade(LK.blush, 0.5), marginTop: 4 }}>
          {loadFailed ? 'Could not load audio' : `${formatDuration(current)} / ${formatDuration(total)}`}
        </Text>
      </View>
    </View>
  );
}
