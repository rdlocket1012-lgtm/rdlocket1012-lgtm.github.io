import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, Platform, ColorValue } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LK, theme, tint } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { useUnseen } from '@/hooks/useUnseen';

type TabIconProps = { name: string; label: string; focused: boolean; color: ColorValue; accent: string; badge?: number };

function TabIcon({ name, label, focused, accent, badge = 0 }: TabIconProps) {
  const color = focused ? accent : LK.ink70;
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', gap: 4, width: 84, paddingTop: 8 }}>
      <View
        style={{
          width: 40,
          height: 30,
          borderRadius: 15,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: focused ? tint(accent, 0.7) : 'transparent',
        }}
      >
        <Icon name={name} size={22} color={color} strokeWidth={focused ? 2.5 : 1.9} />
        {badge > 0 && (
          <View style={{
            position: 'absolute', top: -2, right: 4,
            minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 4,
            backgroundColor: LK.coral, alignItems: 'center', justifyContent: 'center',
            borderWidth: 1.5, borderColor: LK.ivory,
          }}>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 9.5, color: '#fff' }}>
              {badge > 9 ? '9+' : badge}
            </Text>
          </View>
        )}
      </View>
      <Text
        numberOfLines={1}
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: focused ? '800' : '600',
          fontSize: 11,
          color,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const hapticTab = {
  tabPress: () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { /* no-op */ }
  },
};

export default function TabsLayout() {
  const counts = useUnseen();
  const usBadge = counts.letters + counts.coupons;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: LK.ivory,
          borderTopColor: LK.line,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 4,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        listeners={hapticTab}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon name="homeTab" label="Home" focused={focused} color={color} accent={LK.coral} />,
        }}
      />
      <Tabs.Screen
        name="timeline"
        listeners={hapticTab}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon name="sparkle" label="Timeline" focused={focused} color={color} accent={LK.gold} badge={counts.milestones} />,
        }}
      />
      <Tabs.Screen
        name="map"
        listeners={hapticTab}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon name="mapPin" label="Map" focused={focused} color={color} accent={LK.lilac} />,
        }}
      />
      <Tabs.Screen
        name="more"
        listeners={hapticTab}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon name="heart" label="Us" focused={focused} color={color} accent={LK.pink} badge={usBadge} />,
        }}
      />
    </Tabs>
  );
}
