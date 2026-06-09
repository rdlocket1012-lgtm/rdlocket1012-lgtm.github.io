import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView, Animated } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { IconChip } from '@/components/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { notifyPartner } from '@/lib/push';

export default function InviteScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [phase, setPhase] = useState<'loading' | 'ready' | 'joining' | 'error' | 'done'>('loading');
  const [error, setError] = useState('');
  const [coupleInfo, setCoupleInfo] = useState<{ nickname: string; start_date: string | null; welcome_message?: string | null } | null>(null);

  useEffect(() => {
    (async () => {
      if (!token) { setPhase('error'); setError('This invite link is missing its code.'); return; }
      try {
        // Ensure a session exists — but do NOT call bootstrap_couple here.
        // Creating a couple for the joiner before join_couple runs would leave
        // an orphan couple in the DB once join_couple moves them to the inviter's couple.
        let { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          const { data, error } = await supabase.auth.signInAnonymously();
          if (error) throw new Error(`Sign-in failed: ${error.message}`);
          session = data.session;
          if (session) useAuthStore.getState().setSession(session);
        }
        if (!session) throw new Error('Could not establish a session.');
        setPhase('ready');
      } catch (e: any) {
        setPhase('error');
        setError(e?.message ?? 'Could not start your session.');
      }
    })();
  }, [token]);

  async function handleJoin() {
    if (!token) return;
    setPhase('joining');
    const { error: rpcError } = await supabase.rpc('join_couple', { p_token: token });
    if (rpcError) {
      setPhase('error');
      setError(rpcError.message);
      return;
    }
    const uid = useAuthStore.getState().user?.id ?? useAuthStore.getState().profile?.id;
    if (uid) await useAuthStore.getState().fetchProfile(uid);

    // Fetch couple info to personalise the welcome screen
    const coupleId = useAuthStore.getState().profile?.couple_id;
    if (coupleId) {
      const { data } = await supabase
        .from('couples')
        .select('nickname, start_date, welcome_message')
        .eq('id', coupleId)
        .single();
      if (data) setCoupleInfo(data);
    }

    // Notify the creator — "She's here 💛"
    try {
      await notifyPartner('partner_joined', "She's here 💛", "Your partner just joined your Locket.");
    } catch { /* best-effort */ }

    // Mark onboarding complete so re-opening the app goes straight to tabs.
    await AsyncStorage.setItem('ai_consent_granted_at', new Date().toISOString());
    await AsyncStorage.setItem('onboarding_done', 'true');
    setPhase('done');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.cream }}>
      <View style={{ flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        {phase === 'loading' || phase === 'joining' ? (
          <>
            <ActivityIndicator color={LK.ink} size="large" />
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 15, color: LK.ink70 }}>
              {phase === 'joining' ? 'Linking your spaces…' : 'Getting things ready…'}
            </Text>
          </>
        ) : phase === 'done' ? (
          <WelcomeHero coupleInfo={coupleInfo} onEnter={() => router.replace('/(tabs)')} />
        ) : phase === 'error' ? (
          <>
            <IconChip color={LK.coral} size={84}><Icon name="alert" size={40} color={shade(LK.coral, 0.5)} /></IconChip>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 24, color: LK.ink, textAlign: 'center' }}>Couldn't join</Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 15, color: LK.ink70, textAlign: 'center', maxWidth: 290, lineHeight: 22 }}>{error}</Text>
            <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={{ backgroundColor: LK.ink, borderRadius: 9999, paddingHorizontal: 26, paddingVertical: 15, marginTop: 8 }}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: '#fff' }}>Go to Locket</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <IconChip color={LK.sky} size={92}><Icon name="heart" size={44} color={shade(LK.sky, 0.5)} /></IconChip>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 30, color: LK.ink, textAlign: 'center', letterSpacing: -1 }}>Join your partner</Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 15, color: LK.ink70, textAlign: 'center', maxWidth: 290, lineHeight: 22 }}>
              You've been invited to share a Locket space — your milestones, letters, map and Premium, together.
            </Text>
            <TouchableOpacity onPress={handleJoin} style={{ backgroundColor: LK.ink, borderRadius: 9999, paddingHorizontal: 32, paddingVertical: 16, marginTop: 10, ...theme.shadow.card }}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 17, color: '#fff' }}>Join now</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={{ paddingVertical: 8 }}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14, color: LK.ink70 }}>Not now</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const PERSONAL_MESSAGE =
  "Hey Daljeet, I built this thinking of us — a place to grow together, collect memories, and have fun along the way. I hope someday it helps other people feel a little closer too. Hope you like it. Give honest opinions haan.\n\nLove you. — Rendell";

function WelcomeHero({ coupleInfo, onEnter }: {
  coupleInfo: { nickname: string; start_date: string | null; welcome_message?: string | null } | null;
  onEnter: () => void;
}) {
  const dayCount = coupleInfo?.start_date
    ? Math.floor((Date.now() - new Date(coupleInfo.start_date).getTime()) / 86_400_000)
    : 0;

  // Staggered entrance animations
  const heartScale  = useRef(new Animated.Value(0.3)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY       = useRef(new Animated.Value(18)).current;
  const btnOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Heart bounces in
      Animated.parallel([
        Animated.spring(heartScale,   { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 160 }),
        Animated.timing(heartOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      ]),
      // 2. Text fades + slides up
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 340, useNativeDriver: true }),
        Animated.spring(textY, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 160 }),
      ]),
      // 3. Button appears
      Animated.timing(btnOpacity, { toValue: 1, duration: 280, delay: 80, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
      {/* Animated heart */}
      <Animated.View style={{ opacity: heartOpacity, transform: [{ scale: heartScale }], marginBottom: 28 }}>
        <View style={{ width: 110, height: 110, borderRadius: 55, backgroundColor: tint(LK.coral, 0.2), alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: tint(LK.coral, 0.35), alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="heart" size={40} color={LK.coral} />
          </View>
        </View>
      </Animated.View>

      {/* Text block */}
      <Animated.View style={{ opacity: textOpacity, transform: [{ translateY: textY }], alignItems: 'center', gap: 10 }}>
        {coupleInfo?.nickname && (
          <View style={{ backgroundColor: tint(LK.gold, 0.7), borderRadius: 9999, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 4 }}>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 13, letterSpacing: 0.5, color: shade(LK.gold, 0.5) }}>
              {coupleInfo.nickname}
            </Text>
          </View>
        )}

        <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 34, color: LK.ink, textAlign: 'center', letterSpacing: -1, lineHeight: 40 }}>
          You're in. 💛
        </Text>

        {dayCount > 0 && (
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 60, color: LK.ink, letterSpacing: -2, lineHeight: 64 }}>
            {dayCount.toLocaleString()}
          </Text>
        )}
        {dayCount > 0 && (
          <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 22, color: shade(LK.gold, 0.45) }}>
            days together
          </Text>
        )}

        <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 16, color: LK.ink70, textAlign: 'center', lineHeight: 26, marginTop: 8, maxWidth: 290 }}>
          {coupleInfo?.welcome_message ?? PERSONAL_MESSAGE}
        </Text>
      </Animated.View>

      {/* Enter button */}
      <Animated.View style={{ opacity: btnOpacity, marginTop: 40, width: '100%' }}>
        <TouchableOpacity
          onPress={onEnter}
          activeOpacity={0.88}
          style={{ backgroundColor: LK.ink, borderRadius: 9999, paddingVertical: 17, alignItems: 'center', ...theme.shadow.card }}
        >
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 17, color: '#fff' }}>
            Open your Locket
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
