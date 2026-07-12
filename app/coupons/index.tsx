import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, Pressable,
  TextInput, Modal, Alert, KeyboardAvoidingView,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInUp, ReduceMotion } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { IconChip } from '@/components/ui/icon-chip';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { NewTag } from '@/components/ui/NewTag';
import { useCoupons } from '@/hooks/useCoupons';
import { useCouple } from '@/hooks/useCouple';
import { usePartner } from '@/hooks/usePartner';
import { useAuthStore } from '@/stores/auth.store';
import { useUnseenStore } from '@/stores/unseen.store';
import { useStreakRestore } from '@/hooks/useStreakRestore';
import { notifyPartner } from '@/lib/push';
import { iGifted, useCouponsStore, type Coupon } from '@/stores/coupons.store';

const firstName = () => (useAuthStore.getState().profile?.display_name || 'Your partner').split(' ')[0];

// §13.22 empty state — kawaii gift-box sticker (§7) instead of a line-icon chip.
const EMPTY_COUPON_ILLUS = require('../../assets/illustrations/milestones/custom.png');

const COLORS: Record<string, string> = {
  pink: LK.blush, coral: LK.coral, lilac: LK.lilac,
  gold: LK.marigold, mint: LK.success, sky: LK.sky, amber: LK.warning,
};
const couponColor = (k: string) => COLORS[k] ?? LK.blush;

// First-6-only entrance stagger (§10.3) — matches the timeline/letters card feel.
// Honours Reduce Motion via ReduceMotion.System.
const stagger = (i: number) =>
  i < 6 ? FadeInUp.duration(300).delay(i * 40).reduceMotion(ReduceMotion.System) : undefined;

const TEMPLATES = [
  { title: 'One home-cooked meal',         description: 'Your favourite, made with love.',    icon: 'fork',    color: 'coral' },
  { title: 'Control of the TV remote',     description: 'For one whole evening.',              icon: 'star',    color: 'lilac' },
  { title: 'A 20-minute back rub',         description: 'No strings attached.',               icon: 'heart',   color: 'pink'  },
  { title: 'Breakfast in bed',             description: 'Redeem on any lazy morning.',        icon: 'mug',     color: 'gold'  },
  { title: 'Get out of one argument free', description: 'Use it wisely 😄',                  icon: 'shield',  color: 'mint'  },
  { title: 'Pick the movie tonight',       description: 'No vetoes allowed.',                 icon: 'sparkle', color: 'sky'   },
];

export default function CouponsScreen() {
  const { coupons, loading, addCoupon, requestRedeem, cancelRequest, approveRedeem, declineRequest, deleteCoupon } = useCoupons();
  const { couple } = useCouple();
  const { partner } = usePartner();
  const partnerName = (partner?.display_name || 'your partner').split(' ')[0];
  const [activeTab, setActiveTab] = useState<'mine' | 'theirs'>('mine');
  const [sheet, setSheet] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [picked, setPicked] = useState<number | null>(null);
  const [restoring, setRestoring] = useState(false);

  const streakRestore = useStreakRestore();
  const addStreakRestoreCoupon = useCouponsStore((s) => s.addStreakRestoreCoupon);

  // Split: coupons gifted TO me (partner created) vs coupons I GAVE (I created)
  const forMe     = coupons.filter((c) => !iGifted(c) && !c.redeemed_at);
  const iGave     = coupons.filter((c) =>  iGifted(c) && !c.redeemed_at);
  const redeemed  = coupons.filter((c) =>  c.redeemed_at);

  // Snapshot last-seen on open so New tags persist while viewing, then clear badges.
  const seenBaseline = useRef<string | null>(useUnseenStore.getState().seenAt.coupons);
  useEffect(() => { useUnseenStore.getState().markSeen('coupons'); }, []);
  const isNew = (c: Coupon) =>
    !seenBaseline.current || new Date(c.created_at).getTime() > new Date(seenBaseline.current).getTime();

  function openCreate() { setPicked(null); setTitle(''); setDesc(''); setSheet(true); }

  async function handleCreate() {
    const coupleId = couple?.id ?? useAuthStore.getState().profile?.couple_id;
    if (!coupleId) { Alert.alert('Setting up', 'Your shared space is still loading.'); return; }
    const t = picked != null
      ? TEMPLATES[picked]
      : { title: title.trim(), description: desc.trim() || null, icon: 'gift', color: 'pink' };
    if (!t.title) return;
    try {
      await addCoupon({ couple_id: coupleId, title: t.title, description: t.description ?? null, icon: t.icon, color: t.color });
      notifyPartner('coupon_gift', 'A new coupon for you 🎁', `${firstName()} gifted you "${t.title}"`);
      setSheet(false);
    } catch (e: any) {
      Alert.alert('Could not create', e?.message ?? 'Try again.');
    }
  }

  async function handleStreakRestore() {
    const coupleId = couple?.id ?? useAuthStore.getState().profile?.couple_id;
    if (!coupleId || !streakRestore.canRestore) return;
    Alert.alert(
      'Save your streak?',
      `This will rescue the ${streakRestore.missedDates.length} missed day${streakRestore.missedDates.length === 1 ? '' : 's'} and let your partner know you saved it.`,
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Save it',
          onPress: async () => {
            setRestoring(true);
            try {
              await addStreakRestoreCoupon({
                coupleId,
                missedDates: streakRestore.missedDates,
                streakDaysLost: streakRestore.streakBeforeBreak,
              });
              try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch { /* no-op */ }
            } catch (e: any) {
              Alert.alert('Could not save', e?.message ?? 'Try again.');
            } finally {
              setRestoring(false);
            }
          },
        },
      ]
    );
  }

  // Step 1 (recipient): ask to redeem — does NOT consume the coupon.
  function confirmRequest(c: Coupon) {
    Alert.alert(
      `Redeem "${c.title}"?`,
      `${firstName()} will get a request to approve this. It's only used once they say yes.`,
      [
        { text: 'Not yet', style: 'cancel' },
        {
          text: 'Send request 💛',
          onPress: async () => {
            try {
              await requestRedeem(c.id);
              notifyPartner('coupon_redeem_request', 'Coupon request 🎟️', `${firstName()} wants to redeem "${c.title}"`);
              try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch { /* no-op */ }
            } catch (e: any) {
              Alert.alert('Could not send', e?.message ?? 'Try again.');
            }
          },
        },
      ]
    );
  }

  async function handleCancelRequest(c: Coupon) {
    try { await cancelRequest(c.id); } catch (e: any) { Alert.alert('Could not cancel', e?.message ?? 'Try again.'); }
  }

  // Step 2 (gifter): approve the partner's request → coupon is consumed.
  function confirmApprove(c: Coupon) {
    Alert.alert(
      `Approve "${c.title}"?`,
      `This marks the coupon as redeemed and lets ${firstName()} know you're on it.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve 🎉',
          onPress: async () => {
            try {
              await approveRedeem(c.id);
              notifyPartner('coupon_redeemed', 'Coupon approved 🎉', `${firstName()} approved "${c.title}" — enjoy!`);
              try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch { /* no-op */ }
            } catch (e: any) {
              Alert.alert('Could not approve', e?.message ?? 'Try again.');
            }
          },
        },
      ]
    );
  }

  function confirmDecline(c: Coupon) {
    Alert.alert(
      `Decline "${c.title}"?`,
      'The coupon stays unused — your partner can ask again later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              await declineRequest(c.id);
              notifyPartner('coupon_declined', 'Not right now 💛', `${firstName()} can't redeem "${c.title}" just yet`);
            } catch (e: any) {
              Alert.alert('Could not decline', e?.message ?? 'Try again.');
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['top']}>
        <ScreenHeader eyebrow="Little favours" title="Love Coupons" onBack={() => router.back()} />
        <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={{ height: 100, backgroundColor: LK.ivory, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(42,33,26,0.08)', opacity: 1 - i * 0.15, boxShadow: '0 2px 8px rgba(42,33,26,0.07)' } as any} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  const hasAnything = coupons.length > 0;

  const tabList = activeTab === 'mine' ? forMe : iGave;
  const tabMode = activeTab === 'mine' ? 'recipient' : 'gifter';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['top']}>
      <ScreenHeader
        eyebrow="Little favours"
        title="Love Coupons"
        onBack={() => router.back()}
        right={
          <ScalePressable
            onPress={openCreate}
            accessibilityLabel="Gift a coupon"
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: LK.espresso, alignItems: 'center', justifyContent: 'center', ...theme.shadow.sm }}
          >
            <Icon name="plus" size={22} color="#fff" />
          </ScalePressable>
        }
      />

      {/* ── Streak rescue banner (only when streak is broken & within 48 h) ─── */}
      {streakRestore.canRestore && (
        <ScalePressable
          onPress={handleStreakRestore}
          disabled={restoring}
          scaleTo={0.98}
          accessibilityLabel="Save your streak"
          containerStyle={{ marginHorizontal: 20, marginBottom: 14 }}
          style={{
            backgroundColor: tint(LK.coral, 0.85),
            borderRadius: 18,
            borderCurve: 'continuous',
            borderWidth: 1.5,
            borderColor: shade(LK.coral, 0.12),
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 13,
            ...theme.shadow.sm,
          } as any}
        >
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: LK.coral, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Image source="sf:flame.fill" style={{ width: 22, height: 22 }} tintColor="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 16, color: LK.espresso, lineHeight: 20 }}>
              Save your streak
            </Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: shade(LK.coral, 0.55), marginTop: 2 }}>
              {streakRestore.hoursLeft}h left · tap to gift a streak rescue
            </Text>
          </View>
          <Icon name="chevR" size={18} color={shade(LK.coral, 0.45)} />
        </ScalePressable>
      )}

      {/* Segmented tabs */}
      <View style={{ flexDirection: 'row', marginHorizontal: 20, marginBottom: 14, backgroundColor: 'rgba(42,33,26,0.06)', borderRadius: 9999, padding: 4 }}>
        {(['mine', 'theirs'] as const).map((tab) => {
          const label = tab === 'mine' ? 'Mine to use' : 'Theirs to use';
          const count = tab === 'mine' ? forMe.length : iGave.length;
          const on = activeTab === tab;
          return (
            <ScalePressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              scaleTo={0.97}
              accessibilityLabel={label}
              containerStyle={{ flex: 1 }}
              style={{ backgroundColor: on ? LK.vellum : 'transparent', borderRadius: 9999, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, ...( on ? theme.shadow.sm : {}) }}
            >
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13.5, color: on ? LK.espresso : LK.sepia }}>{label}</Text>
              {count > 0 && (
                <View style={{ backgroundColor: on ? tint(LK.coral, 0.65) : 'rgba(42,33,26,0.10)', borderRadius: 9999, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 }}>
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11, color: on ? shade(LK.coral, 0.5) : LK.sepia }}>{count}</Text>
                </View>
              )}
            </ScalePressable>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={{ paddingHorizontal: 18, gap: 10 }}>

          {/* ── Active tab list ─────────────────────────────── */}
          {tabList.length === 0 ? (
            !hasAnything ? (
              <View style={{ alignItems: 'center', paddingTop: 30, gap: 12 }}>
                <Image
                  source={EMPTY_COUPON_ILLUS}
                  style={{ width: 120, height: 120 }}
                  contentFit="contain"
                  accessible={false}
                />
                <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 23, color: LK.espresso, textAlign: 'center' }}>
                  Gift the first coupon
                </Text>
                <Text style={{ fontFamily: theme.fonts.hand, fontSize: 18, color: LK.sepia, textAlign: 'center', maxWidth: 280, lineHeight: 24 }}>
                  a little favour, wrapped up just for them
                </Text>
                <ScalePressable
                  scaleTo={0.97}
                  onPress={openCreate}
                  accessibilityLabel="Create a coupon"
                  style={{ backgroundColor: LK.coral, borderRadius: 9999, paddingHorizontal: 24, paddingVertical: 14, marginTop: 6, flexDirection: 'row', gap: 8, alignItems: 'center', ...theme.shadow.sm }}
                >
                  <Icon name="plus" size={18} color="#fff" />
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: '#fff' }}>Create a coupon</Text>
                </ScalePressable>
              </View>
            ) : (
              <View style={{ backgroundColor: tint(activeTab === 'mine' ? LK.blush : LK.sky, 0.5), borderRadius: 18, padding: 20, alignItems: 'center', gap: 8 }}>
                <Icon name={activeTab === 'mine' ? 'gift' : 'envelope'} size={24} color={shade(activeTab === 'mine' ? LK.blush : LK.sky, 0.45)} />
                <Text style={{ fontFamily: theme.fonts.body, fontSize: 13.5, color: shade(activeTab === 'mine' ? LK.blush : LK.sky, 0.5), textAlign: 'center', lineHeight: 20 }}>
                  {activeTab === 'mine' ? `Nothing gifted to you yet — hint hint` : `Tap + to create a coupon for ${partnerName}`}
                </Text>
              </View>
            )
          ) : (
            tabList.map((c, i) => (
              <Animated.View key={c.id} entering={stagger(i)}>
                <CouponCard
                  c={c}
                  mode={tabMode}
                  isNew={isNew(c)}
                  partnerName={partnerName}
                  onRequest={() => confirmRequest(c)}
                  onCancelRequest={() => handleCancelRequest(c)}
                  onApprove={() => confirmApprove(c)}
                  onDecline={() => confirmDecline(c)}
                  onDelete={() => deleteCoupon(c.id)}
                />
              </Animated.View>
            ))
          )}

          {/* ── Redeemed ─────────────────────────────────────── */}
          {redeemed.length > 0 && (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: LK.hairline }} />
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11.5, color: LK.sepia, textTransform: 'uppercase', letterSpacing: 0.8 }}>Redeemed</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: LK.hairline }} />
              </View>
              {redeemed.map((c) => (
                <CouponCard
                  key={c.id}
                  c={c}
                  mode="redeemed"
                  onDelete={() => deleteCoupon(c.id)}
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* ── Create modal ─────────────────────────────────────── */}
      {sheet && (
        <Modal animationType="slide" transparent>
          <KeyboardAvoidingView behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
            <Pressable style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.4)' }} onPress={() => setSheet(false)} accessibilityLabel="Close" />
            <View style={{ backgroundColor: LK.parchment, borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '88%' }}>
              <View style={{ paddingTop: 14, alignItems: 'center' }}>
                <View style={{ width: 38, height: 5, borderRadius: 9999, backgroundColor: 'rgba(42,33,26,0.15)' }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 12 }}>
                <ScalePressable
                  onPress={() => setSheet(false)}
                  haptic={false}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                  style={{ minHeight: 44, justifyContent: 'center', paddingRight: 8 }}
                >
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15.5, color: LK.ink70 }}>Cancel</Text>
                </ScalePressable>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 18, color: LK.espresso }}>Gift a coupon</Text>
                  <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: LK.ink70 }}>Your partner will receive this</Text>
                </View>
                <ScalePressable
                  onPress={handleCreate}
                  disabled={picked == null && !title.trim()}
                  accessibilityLabel="Gift this coupon"
                  style={{
                    backgroundColor: (picked != null || title.trim()) ? LK.espresso : 'rgba(42,33,26,0.15)',
                    borderRadius: 9999, paddingHorizontal: 18, minHeight: 44, justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14.5, color: (picked != null || title.trim()) ? '#fff' : LK.ink70 }}>
                    Gift
                  </Text>
                </ScalePressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 40 }}>
                <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', color: LK.ink70, marginBottom: 10 }}>
                  Pick a template
                </Text>
                <View style={{ gap: 9 }}>
                  {TEMPLATES.map((t, i) => {
                    const on = picked === i;
                    const col = couponColor(t.color);
                    return (
                      <ScalePressable
                        key={i}
                        onPress={() => { setPicked(i); setTitle(''); }}
                        scaleTo={0.98}
                        accessibilityLabel={t.title}
                        style={{
                          flexDirection: 'row', alignItems: 'center', gap: 12,
                          backgroundColor: on ? tint(col, 0.6) : LK.ivory,
                          borderRadius: 16, borderCurve: 'continuous', padding: 13,
                          borderWidth: on ? 2 : 0, borderColor: on ? col : 'transparent',
                          ...theme.shadow.sm,
                        }}
                      >
                        <IconChip color={col} size={42}><Icon name={t.icon} size={20} color={shade(col, 0.5)} /></IconChip>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 15.5, color: LK.espresso }}>{t.title}</Text>
                          <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70, marginTop: 1 }}>{t.description}</Text>
                        </View>
                        {on && <Icon name="check" size={18} color={shade(col, 0.5)} />}
                      </ScalePressable>
                    );
                  })}
                </View>

                <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', color: LK.ink70, marginTop: 18, marginBottom: 10 }}>
                  Or write your own
                </Text>
                <TextInput
                  value={title}
                  onChangeText={(t) => { setTitle(t); setPicked(null); }}
                  placeholder="e.g. One spontaneous adventure"
                  placeholderTextColor={LK.ink70}
                  style={{ backgroundColor: LK.ivory, borderRadius: 16, padding: 14, fontFamily: theme.fonts.body, fontSize: 16, color: LK.espresso, marginBottom: 10, ...theme.shadow.sm }}
                />
                <TextInput
                  value={desc}
                  onChangeText={setDesc}
                  placeholder="Add a little detail (optional)"
                  placeholderTextColor={LK.ink70}
                  style={{ backgroundColor: LK.ivory, borderRadius: 16, padding: 14, fontFamily: theme.fonts.body, fontSize: 16, color: LK.espresso, ...theme.shadow.sm }}
                />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CouponCard({
  c, mode, partnerName = 'your partner', onRequest, onCancelRequest, onApprove, onDecline, onDelete, isNew = false,
}: {
  c: Coupon;
  mode: 'recipient' | 'gifter' | 'redeemed';
  partnerName?: string;
  onRequest?: () => void;
  onCancelRequest?: () => void;
  onApprove?: () => void;
  onDecline?: () => void;
  onDelete?: () => void;
  isNew?: boolean;
}) {
  // Streak restore coupons get special gold treatment — auto-consumed, keepsake only.
  if (c.type === 'streak_restore') {
    return (
      <View style={{
        backgroundColor: LK.vellum,
        borderRadius: 20,
        borderCurve: 'continuous',
        overflow: 'hidden',
        flexDirection: 'row',
        opacity: 0.78,
        borderWidth: 1.5,
        borderColor: shade(LK.gold, 0.25),
        ...theme.shadow.sm,
      }}>
        <View style={{ width: 10, backgroundColor: tint(LK.gold, 0.55) }} />
        <View style={{ flex: 1, padding: 15 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: tint(LK.gold, 0.65), alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Image source="sf:flame.fill" style={{ width: 22, height: 22 }} tintColor={shade(LK.gold, 0.5)} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 16, color: LK.espresso, lineHeight: 20 }}>
                {c.title}
              </Text>
              {c.description ? (
                <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, color: LK.sepia, marginTop: 1 }}>{c.description}</Text>
              ) : null}
            </View>
            <View style={{ backgroundColor: tint(LK.gold, 0.65), borderRadius: 9999, paddingHorizontal: 9, paddingVertical: 4 }}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 10.5, color: shade(LK.gold, 0.5) }}>
                Streak Saved ✦
              </Text>
            </View>
          </View>
          {c.redeemed_at && (
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11.5, color: LK.sepia, marginTop: 8 }}>
              Rescued on {new Date(c.redeemed_at).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
    );
  }

  const col = couponColor(c.color);
  const isRedeemed = mode === 'redeemed';
  const isPending = !isRedeemed && !!c.redeem_requested_at;

  const badgeLabel = isRedeemed ? 'Redeemed' : isPending ? 'Pending' : 'Unused';
  const badgeBg = isRedeemed ? tint(LK.sepia, 0.82) : isPending ? tint(LK.marigold, 0.65) : tint(LK.sage, 0.65);
  const badgeColor = isRedeemed ? LK.sepia : isPending ? shade(LK.marigold, 0.45) : shade(LK.sage, 0.55);

  return (
    <View style={{
      backgroundColor: LK.vellum,
      borderRadius: 20,
      borderCurve: 'continuous',
      overflow: 'hidden',
      flexDirection: 'row',
      opacity: isRedeemed ? 0.65 : 1,
      borderWidth: isPending && mode === 'gifter' ? 2 : 1.5,
      borderColor: isPending && mode === 'gifter' ? col : 'rgba(42,33,26,0.13)',
      ...theme.shadow.card,
    }}>
      {/* Left perforation strip */}
      <View style={{ width: 10, backgroundColor: isRedeemed ? 'rgba(42,33,26,0.06)' : tint(col, 0.55) }} />

      {/* Content */}
      <View style={{ flex: 1, padding: 15 }}>
        {/* Top row: icon + title + badge */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 11 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isRedeemed ? 'rgba(42,33,26,0.06)' : tint(col, 0.65), alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name={c.icon} size={22} color={isRedeemed ? LK.sepia : shade(col, 0.55)} />
          </View>
          <View style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 17, color: LK.espresso, textDecorationLine: isRedeemed ? 'line-through' : 'none', flexShrink: 1, lineHeight: 21 }}>
                {c.title}
              </Text>
              {isNew && <NewTag />}
            </View>
            {c.description ? (
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.sepia, marginTop: 2 }}>{c.description}</Text>
            ) : null}
          </View>
          {/* State badge */}
          <View style={{ backgroundColor: badgeBg, borderRadius: 9999, paddingHorizontal: 9, paddingVertical: 4, flexShrink: 0, marginTop: 1 }}>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 10.5, color: badgeColor }}>{badgeLabel}</Text>
          </View>
        </View>

        {/* Status lines */}
        {isRedeemed && c.redeemed_at && (
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11.5, color: LK.sepia, marginTop: 8 }}>
            Redeemed {new Date(c.redeemed_at).toLocaleDateString()}
          </Text>
        )}
        {mode === 'recipient' && isPending && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 }}>
            <Icon name="clockTab" size={11} color={shade(col, 0.45)} />
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11.5, color: shade(col, 0.5) }}>
              Waiting for {partnerName} to approve
            </Text>
          </View>
        )}
        {mode === 'gifter' && isPending && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 }}>
            <Icon name="gift" size={11} color={shade(col, 0.45)} />
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 11.5, color: shade(col, 0.5) }}>
              {partnerName} wants to redeem this
            </Text>
          </View>
        )}
        {mode === 'gifter' && !isPending && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 }}>
            <Icon name="lock" size={11} color={shade(col, 0.45)} />
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11.5, color: shade(col, 0.5) }}>
              Waiting for {partnerName} to redeem
            </Text>
          </View>
        )}

        {/* Action buttons */}
        {mode === 'recipient' && !isPending && onRequest && (
          <ScalePressable
            scaleTo={0.97}
            onPress={onRequest}
            accessibilityLabel="Redeem this coupon"
            style={{ marginTop: 12, backgroundColor: LK.espresso, borderRadius: 9999, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, ...theme.shadow.sm }}
          >
            <Icon name="gift" size={16} color="#fff" />
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 14, letterSpacing: 0.4, color: '#fff' }}>Redeem this coupon</Text>
          </ScalePressable>
        )}
        {mode === 'recipient' && isPending && onCancelRequest && (
          <ScalePressable
            onPress={onCancelRequest}
            scaleTo={0.97}
            haptic={false}
            accessibilityLabel="Cancel request"
            containerStyle={{ marginTop: 12 }}
            style={{ backgroundColor: 'rgba(42,33,26,0.07)', borderRadius: 9999, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14, color: LK.sepia }}>Cancel request</Text>
          </ScalePressable>
        )}
        {mode === 'gifter' && isPending && (
          <View style={{ flexDirection: 'row', gap: 9, marginTop: 12 }}>
            <ScalePressable
              onPress={onDecline}
              scaleTo={0.97}
              haptic={false}
              accessibilityLabel="Decline request"
              containerStyle={{ flex: 1 }}
              style={{ backgroundColor: 'rgba(42,33,26,0.07)', borderRadius: 9999, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14, color: LK.sepia }}>Decline</Text>
            </ScalePressable>
            <ScalePressable
              onPress={onApprove}
              scaleTo={0.97}
              accessibilityLabel="Approve request"
              containerStyle={{ flex: 1.6 }}
              style={{ backgroundColor: LK.espresso, borderRadius: 9999, minHeight: 44, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 7, ...theme.shadow.sm }}
            >
              <Icon name="check" size={15} color="#fff" />
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 14, letterSpacing: 0.3, color: '#fff' }}>Approve</Text>
            </ScalePressable>
          </View>
        )}
        {/* Trash — hidden while a request is in flight */}
        {onDelete && !isPending && !isRedeemed && (
          <ScalePressable
            onPress={onDelete}
            scaleTo={0.88}
            haptic={false}
            accessibilityLabel="Delete coupon"
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            containerStyle={{ position: 'absolute', top: 15, right: 50 }}
          >
            <Icon name="trash" size={15} color="rgba(42,33,26,0.25)" />
          </ScalePressable>
        )}
      </View>
    </View>
  );
}
