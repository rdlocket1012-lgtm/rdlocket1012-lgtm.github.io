import React from 'react';
import { View, Text } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { LK, theme } from '@/constants/theme';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  if (isOnline) return null;
  return (
    <View style={{
      backgroundColor: LK.ink,
      paddingHorizontal: 16,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    }}>
      <Icon name="wifiOff" size={16} color="#fff" />
      <Text style={{ color: '#fff', fontSize: 13, fontFamily: theme.fonts.body, fontWeight: '600', flex: 1 }}>
        You're offline. Showing your last saved memories.
      </Text>
    </View>
  );
}
