import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { requestPermissions, scheduleOnThisDay } from '@/lib/notifications';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { IconChip } from '@/components/ui/icon-chip';
import { RoundIcon } from '@/components/ui/round-icon';
import { Avatar } from '@/components/ui/avatar';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { PaywallModal } from '@/components/paywall/PaywallModal';
import { restorePurchases } from '@/lib/revenuecat';
import { usePartner } from '@/hooks/usePartner';
import { shareInvite } from '@/lib/invite';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

export default function SettingsScreen() {
  const { profile, signOut, user } = useAuth();
  const { couple, isPremium, fetchCouple } = useCouple();
  const { partner, partnerJoined } = usePartner();
  const [sheet, setSheet] = useState<'paywall' | null>(null);
  const [notifOTD, setNotifOTD] = useState(true);
  const [notifLetters, setNotifLetters] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [nudgeHaptics, setNudgeHaptics] = useState(profile?.nudge_haptics !== false);

  // Load persisted preferences. Defaults stay `true` when nothing is stored yet.
  useEffect(() => {
    (async () => {
      const [otd, letters, stats] = await Promise.all([
        AsyncStorage.getItem('pref_notif_otd'),
        AsyncStorage.getItem('pref_notif_letters'),
        AsyncStorage.getItem('pref_analytics'),
      ]);
      if (otd != null) setNotifOTD(otd === '1');
      if (letters != null) setNotifLetters(letters === '1');
      if (stats != null) setAnalytics(stats === '1');
    })();
  }, []);

  async function toggleOTD(on: boolean) {
    setNotifOTD(on);
    await AsyncStorage.setItem('pref_notif_otd', on ? '1' : '0');
    try {
      if (on) {
        const granted = await requestPermissions();
        if (!granted) {
          setNotifOTD(false);
          await AsyncStorage.setItem('pref_notif_otd', '0');
          Alert.alert('Notifications off', 'Enable notifications for Locket in your device Settings to get On This Day reminders.');
          return;
        }
        await scheduleOnThisDay();
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    } catch {
      // Best-effort (e.g. Expo Go limitations) — the preference is still saved.
    }
  }

  async function toggleLetters(on: boolean) {
    setNotifLetters(on);
    await AsyncStorage.setItem('pref_notif_letters', on ? '1' : '0');
  }

  async function toggleAnalytics(on: boolean) {
    setAnalytics(on);
    await AsyncStorage.setItem('pref_analytics', on ? '1' : '0');
  }

  // Keep the local switch in sync if the profile loads/changes after mount.
  useEffect(() => {
    setNudgeHaptics(profile?.nudge_haptics !== false);
  }, [profile?.nudge_haptics]);

  async function toggleNudgeHaptics(on: boolean) {
    if (!profile?.id) return;
    setNudgeHaptics(on); // optimistic
    const { error } = await supabase.from('profiles').update({ nudge_haptics: on }).eq('id', profile.id);
    if (error) {
      setNudgeHaptics(!on);
      Alert.alert('Could not save', error.message);
      return;
    }
    useAuthStore.getState().setProfile({ ...useAuthStore.getState().profile!, nudge_haptics: on });
  }

  async function handleSignOut() {
    Alert.alert('Sign out?', "You'll need to sign back in to access your memories.", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); router.replace('/(auth)/sign-up'); } },
    ]);
  }

  async function handleDeleteAccount() {
    router.push('/settings/danger-zone');
  }

  function handleEnterCode() {
    Alert.prompt?.(
      'Enter invite code',
      'Paste the code or link your partner sent you.',
      (value?: string) => {
        if (!value) return;
        const token = value.includes('token=') ? value.split('token=')[1].trim() : value.trim();
        if (token) router.push(`/invite?token=${token}`);
      }
    );
  }

  async function handleDisconnect() {
    Alert.alert(
      'Disconnect from your partner?',
      'Your shared space will be separated. If you’re the subscriber, your Premium stays with you; otherwise it returns to the free tier. Your own memories are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            const startDate = couple?.start_date ?? new Date().toISOString().split('T')[0];
            const { error } = await supabase.rpc('disconnect_relationship', { p_start_date: startDate });
            if (error) { Alert.alert('Could not disconnect', error.message); return; }
            const uid = useAuthStore.getState().profile?.id;
            if (uid) await useAuthStore.getState().fetchProfile(uid);
            await fetchCouple();
            Alert.alert('Disconnected', 'You’re now in your own private space.');
          },
        },
      ]
    );
  }

  async function handleRestorePurchases() {
    try {
      const ok = await restorePurchases();
      if (ok) {
        await fetchCouple();
        Alert.alert('Purchases restored', 'Your Premium status has been updated.');
      } else {
        Alert.alert('Nothing to restore', 'No previous purchases were found.');
      }
    } catch (e: any) {
      Alert.alert('Restore unavailable', e?.message ?? 'Could not restore purchases.');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['top']}>
      <ScreenHeader eyebrow="You & the app" title="Settings" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 80 }}>
        {/* Profile card (§13.28) — tap to edit your profile */}
        <TouchableOpacity
          onPress={() => router.push('/profile/edit')}
          activeOpacity={0.9}
          style={{ backgroundColor: LK.vellum, borderRadius: theme.radii.md, borderCurve: 'continuous', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 10, ...theme.shadow.card }}
        >
          <Avatar initial={((profile?.display_name || 'Y').charAt(0) || 'Y').toUpperCase()} imageUrl={profile?.avatar_url} color={LK.coral} size={56} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 17, color: LK.espresso }}>
              {profile?.display_name ?? 'You'}
            </Text>
            {user?.email ? (
              <Text numberOfLines={1} style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.sepia, marginTop: 1 }}>{user.email}</Text>
            ) : null}
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: LK.coral, marginTop: 4 }}>Edit profile →</Text>
          </View>
        </TouchableOpacity>

        {/* Relationship banner */}
        <View style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.lg, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 4, ...theme.shadow.card }}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: LK.coral, alignItems: 'center', justifyContent: 'center', marginRight: -14, zIndex: 2, borderWidth: 2.5, borderColor: LK.ivory }}>
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 18, color: '#fff' }}>{((profile?.display_name || 'Y').charAt(0) || 'Y').toUpperCase()}</Text>
            </View>
            {partner?.avatar_url ? (
              <Image source={{ uri: partner.avatar_url }} style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2.5, borderColor: LK.ivory }} />
            ) : (
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: LK.sky, alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: LK.ivory }}>
                <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 18, color: '#fff' }}>
                  {((partner?.display_name || 'P').charAt(0) || 'P').toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 19, color: LK.espresso }}>{couple?.nickname ?? 'Your relationship'}</Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70 }}>
              {couple?.start_date ? `Together since ${new Date(couple.start_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}` : ''}
            </Text>
          </View>
          {isPremium
            ? <View style={{ backgroundColor: tint(LK.marigold, 0.7), borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12, color: shade(LK.marigold, 0.5) }}>Premium</Text>
              </View>
            : <TouchableOpacity onPress={() => setSheet('paywall')} style={{ backgroundColor: LK.marigold, borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 8 }}>
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: LK.espresso }}>Upgrade</Text>
              </TouchableOpacity>
          }
        </View>

        {!partnerJoined && (
          <TouchableOpacity
            onPress={() => shareInvite()}
            activeOpacity={0.9}
            style={{ marginTop: 8, backgroundColor: tint(LK.sky, 0.7), borderRadius: theme.radii.sm, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, ...theme.shadow.sm }}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: LK.sky, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="heart" size={19} color={shade(LK.sky, 0.5)} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15, color: LK.espresso }}>Invite your partner</Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70, marginTop: 1 }}>Send them a private link to join.</Text>
            </View>
            <Icon name="share" size={17} color={shade(LK.sky, 0.5)} />
          </TouchableOpacity>
        )}
        {!partnerJoined && (
          <TouchableOpacity onPress={handleEnterCode} style={{ alignSelf: 'center', paddingVertical: 12 }}>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13.5, color: shade(LK.sky, 0.5) }}>Have an invite code? Tap to join</Text>
          </TouchableOpacity>
        )}

        <SectionLabel>Subscription & Billing</SectionLabel>
        <SGroup>
          <SRow icon="sync" color={LK.sage} title="Restore purchases" onPress={handleRestorePurchases} />
          <SRow icon="crown" color={LK.marigold} title="What's included in Premium" chevron onPress={() => setSheet('paywall')} last />
        </SGroup>

        <SectionLabel>Notifications</SectionLabel>
        <SGroup>
          <SRow icon="sparkle" color={LK.warning} title="On This Day" toggle value={notifOTD} onToggle={toggleOTD} />
          <SRow icon="envelope" color={LK.blush} title="Letters from partner" toggle value={notifLetters} onToggle={toggleLetters} last />
        </SGroup>

        <SectionLabel>Nudges & buzzing</SectionLabel>
        <SGroup>
          <SRow
            icon="heart"
            color={LK.blush}
            title="Nudge vibration"
            sub={nudgeHaptics
              ? 'Hugs, kisses & bites buzz your phone'
              : "Nudges arrive silently — your partner sees they'll be quiet"}
            toggle
            value={nudgeHaptics}
            onToggle={toggleNudgeHaptics}
            last
          />
        </SGroup>

        <SectionLabel>Privacy & Data</SectionLabel>
        <SGroup>
          <SRow icon="shield" color={LK.sage} title="Analytics & crash reports" sub="Never shared with advertisers" toggle value={analytics} onToggle={toggleAnalytics} />
          <SRow icon="clockTab" color={LK.warning} title="Data retention" sub="30-day soft delete" chevron last onPress={() => Alert.alert('Data Retention', 'When you remove a milestone, letter or map pin, it\'s kept for 30 days before permanent deletion. The same applies if you delete your account.')} />
        </SGroup>

        <SectionLabel>Legal</SectionLabel>
        <SGroup>
          <SRow icon="shield" color={LK.dusk} title="Privacy Policy" chevron onPress={() => Linking.openURL('https://rdlocket1012-lgtm.github.io/Locket/privacy-policy.md')} />
          <SRow icon="info" color={LK.dusk} title="Terms of Service" chevron onPress={() => Linking.openURL('https://rdlocket1012-lgtm.github.io/Locket/terms-of-service.md')} />
          <SRow icon="envelope" color={LK.dusk} title="Contact us" chevron last onPress={() => Linking.openURL('mailto:hello@locket.app')} />
        </SGroup>

        <SectionLabel>Support</SectionLabel>
        <SGroup>
          <SRow icon="star" color={LK.marigold} title="Rate Locket" onPress={() => Alert.alert('Thank you!', 'We appreciate your support.')} />
          <SRow icon="chat" color={LK.success} title="Send feedback" chevron onPress={() => Linking.openURL('mailto:hello@locket.app')} />
          <SRow icon="help" color={LK.lilac} title="Help & FAQ" chevron last onPress={() => Alert.alert('Help', 'Contact us at hello@locket.app')} />
        </SGroup>

        <SectionLabel danger>Account</SectionLabel>
        <SGroup>
          {partnerJoined && (
            <SRow icon="door" color={LK.warning} title="Disconnect from partner" sub="Separate your shared space" chevron onPress={handleDisconnect} />
          )}
          <SRow icon="door" color={LK.dusk} title="Sign out" onPress={handleSignOut} />
          <SRow icon="trash" color={LK.danger} title="Delete my account" danger onPress={handleDeleteAccount} last />
        </SGroup>

        <View style={{ alignItems: 'center', paddingTop: 22 }}>
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 18, color: LK.ink70, letterSpacing: -0.5 }}>Locket</Text>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, color: LK.ink70, marginTop: 2 }}>Version 1.0 · Made with love</Text>
        </View>
      </ScrollView>

      {sheet === 'paywall' && <PaywallModal onClose={() => setSheet(null)} />}
    </SafeAreaView>
  );
}

function SectionLabel({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase', color: danger ? LK.danger : shade(LK.marigold, 0.5), paddingVertical: 8, paddingHorizontal: 8 }}>
      {children}
    </Text>
  );
}

function SGroup({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.sm, overflow: 'hidden', ...theme.shadow.sm, marginBottom: 4 }}>
      {children}
    </View>
  );
}

interface SRowProps {
  icon: string;
  color: string;
  title: string;
  sub?: string;
  chevron?: boolean;
  toggle?: boolean;
  value?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
  danger?: boolean;
  last?: boolean;
}

function SRow({ icon, color, title, sub, chevron, toggle, value, onToggle, onPress, danger, last }: SRowProps) {
  const titleColor = danger ? LK.danger : LK.espresso;
  return (
    <TouchableOpacity
      onPress={toggle ? undefined : onPress}
      disabled={toggle && !onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: last ? 0 : 1, borderBottomColor: LK.hairline, minHeight: 52 }}
    >
      <IconChip color={danger ? LK.danger : color} size={32}>
        <Icon name={icon} size={17} color={danger ? '#fff' : shade(color, 0.5)} />
      </IconChip>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 15.5, color: titleColor }}>{title}</Text>
        {sub && <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70, marginTop: 2, lineHeight: 18 }}>{sub}</Text>}
      </View>
      {toggle && <Switch value={value} onValueChange={onToggle} trackColor={{ true: LK.success, false: 'rgba(42,33,26,0.18)' }} />}
      {chevron && !toggle && <Icon name="chevR" size={16} color={LK.ink70} />}
    </TouchableOpacity>
  );
}
