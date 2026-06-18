import React from 'react';
import { Tabs } from 'expo-router';
import { useUnseen } from '@/hooks/useUnseen';
import LocketTabBar from '@/components/ui/locket-tab-bar';

export default function TabsLayout() {
  // Keep unread counts live for the whole app (the tab bar reads them for badges).
  useUnseen();

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <LocketTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="timeline" />
      <Tabs.Screen name="fun" />
      <Tabs.Screen name="us" />
    </Tabs>
  );
}
