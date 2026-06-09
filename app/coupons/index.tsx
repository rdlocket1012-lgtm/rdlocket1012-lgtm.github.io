import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView,
  TextInput, Modal, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { IconChip } from '@/components/ui';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { NewTag } from '@/components/ui/NewTag';
import { useCoupons } from '@/hooks/useCoupons';
import { useCouple } from '@/hooks/useCouple';
import { useAuthStore } from '@/stores/auth.store';
import { useUnseenStore } from '@/stores/unseen.store';
import { notifyPartner } from '@/lib/push';
import { iGifted, type Coupon } from '@/stores/coupons.store';

const firstName = () => (useAuthStore.getState().profile?.display_name || 'Your partner').split(' ')[0];

const COLORS: Record<string, string> = {
  pink: LK.pink, coral: LK.coral, lilac: LK.lilac,
  gold: LK.gold, mint: LK.mint, sky: LK.sky, amber: LK.amber,
};
const couponColor = (k: string) => COLORS[k] ?? LK.pink;

const TEMPLATES = [
  { title: 'One home-cooked meal',         description: 'Your favourite, made with love.',    icon: 'fork',    color: 'coral' },
  { title: 'Control of the TV remote',     description: 'For one whole evening.',              icon: 'star',    color: 'lilac' },
  { title: 'A 20-minute back rub',         description: 'No strings attached.',               icon: 'heart',   color: 'pink'  },
  { title: 'Breakfast in bed',             description: 'Redeem on any lazy morning.',        icon: 'mug',     color: 'gold'  },
  { title: 'Get out of one argument free', description: 'Use it wisely 😄',                  icon: 'shield',  color: 'mint'  },
  { title: 'Pick the movie tonight',       description: 'No vetoes allowed.',                 icon: 'sparkle', color: 'sky'   },
];

export default function CouponsScreen() {
  const { coupons, addCoupon, redeemCoupon, deleteCoupon } = useCoupons();
  const { couple } = useCouple();
  const [sheet, setSheet] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [picked, setPicked] = useState<number | null>(null);

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

  function confirmRedeem(c: Coupon) {
    Alert.alert(
      `Redeem "${c.title}"?`,
      'Your partner will see this has been redeemed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem 💛',
          onPress: async () => {
            try {
              await redeemCoupon(c.id);
              notifyPartner('coupon_redeemed', 'Coupon redeemed 🎉', `${firstName()} just redeemed "${c.title}"`);
              try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch { /* no-op */ }
              Alert.alert('Redeemed! 🎉', `"${c.title}" is all yours!`);
            } catch (e: any) {
              Alert.alert('Could not redeem', e?.message ?? 'Try again.');
            }
          },
        },
      ]
    );
  }

  const hasAnything = coupons.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.cream }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <ScreenHeader
          eyebrow="Little favours"
          title="Love Coupons"
          onBack={() => router.back()}
          right={
            <TouchableOpacity
              onPress={openCreate}
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: LK.ink, alignItems: 'center', justifyContent: 'center', ...theme.shadow.sm }}
            >
              <Icon name="plus" size={22} color="#fff" />
            </TouchableOpacity>
          }
        />

        <View style={{ paddingHorizontal: 18, paddingTop: 8, gap: 10 }}>

          {/* ── Coupons gifted to me ───────────────────────────── */}
          <SectionLabel
            icon="gift"
            label="For you"
            color={LK.pink}
            sub="Coupons your partner has gifted you"
          />
          {forMe.length === 0 ? (
            <EmptySlot
              icon="gift"
              color={LK.pink}
              message="No coupons waiting for you yet — your partner hasn't gifted any."
            />
          ) : (
            forMe.map((c) => (
              <CouponCard
                key={c.id}
                c={c}
                mode="recipient"
                isNew={isNew(c)}
                onRedeem={() => confirmRedeem(c)}
              />
            ))
          )}

          {/* ── Coupons I gave ────────────────────────────────── */}
          <SectionLabel
            icon="envelope"
            label="Given by you"
            color={LK.sky}
            sub="Coupons you've gifted to your partner"
            style={{ marginTop: 14 }}
          />
          {iGave.length === 0 ? (
            <EmptySlot
              icon="envelope"
              color={LK.sky}
              message='Tap the + button to create a coupon and gift it to your partner.'
            />
          ) : (
            iGave.map((c) => (
              <CouponCard
                key={c.id}
                c={c}
                mode="gifter"
                onDelete={() => deleteCoupon(c.id)}
              />
            ))
          )}

          {/* ── Redeemed ─────────────────────────────────────── */}
          {redeemed.length > 0 && (
            <>
              <SectionLabel
                icon="check"
                label="Redeemed"
                color={LK.ink70}
                sub="Favours that have been cashed in"
                style={{ marginTop: 14 }}
              />
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

          {!hasAnything && (
            <View style={{ alignItems: 'center', paddingTop: 30, gap: 12 }}>
              <IconChip color={LK.amber} size={66}><Icon name="receipt" size={30} color={shade(LK.amber, 0.5)} /></IconChip>
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 23, color: LK.ink, textAlign: 'center' }}>
                Gift the first coupon
              </Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, color: LK.ink70, textAlign: 'center', maxWidth: 260, lineHeight: 21 }}>
                Create a little favour for your partner — a meal, a back rub, control of the remote.
              </Text>
              <TouchableOpacity
                onPress={openCreate}
                style={{ backgroundColor: LK.ink, borderRadius: 9999, paddingHorizontal: 24, paddingVertical: 14, marginTop: 6, flexDirection: 'row', gap: 8, alignItems: 'center' }}
              >
                <Icon name="plus" size={18} color="#fff" />
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: '#fff' }}>Create a coupon</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Create modal ─────────────────────────────────────── */}
      {sheet && (
        <Modal animationType="slide" transparent>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
            <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.4)' }} activeOpacity={1} onPress={() => setSheet(false)} />
            <View style={{ backgroundColor: LK.cream, borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '88%' }}>
              <View style={{ paddingTop: 14, alignItems: 'center' }}>
                <View style={{ width: 38, height: 5, borderRadius: 9999, backgroundColor: 'rgba(42,33,26,0.15)' }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 12 }}>
                <TouchableOpacity onPress={() => setSheet(false)}>
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15.5, color: LK.ink70 }}>Cancel</Text>
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 18, color: LK.ink }}>Gift a coupon</Text>
                  <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: LK.ink70 }}>Your partner will receive this</Text>
                </View>
                <TouchableOpacity
                  onPress={handleCreate}
                  disabled={picked == null && !title.trim()}
                  style={{
                    backgroundColor: (picked != null || title.trim()) ? LK.ink : 'rgba(42,33,26,0.15)',
                    borderRadius: 9999, paddingHorizontal: 18, paddingVertical: 10,
                  }}
                >
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14.5, color: (picked != null || title.trim()) ? '#fff' : LK.ink70 }}>
                    Gift
                  </Text>
                </TouchableOpacity>
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
                      <TouchableOpacity
                        key={i}
                        onPress={() => { setPicked(i); setTitle(''); }}
                        activeOpacity={0.85}
                        style={{
                          flexDirection: 'row', alignItems: 'center', gap: 12,
                          backgroundColor: on ? tint(col, 0.6) : LK.ivory,
                          borderRadius: 16, padding: 13,
                          borderWidth: on ? 2 : 0, borderColor: on ? col : 'transparent',
                          ...theme.shadow.sm,
                        }}
                      >
                        <IconChip color={col} size={42}><Icon name={t.icon} size={20} color={shade(col, 0.5)} /></IconChip>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 15.5, color: LK.ink }}>{t.title}</Text>
                          <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70, marginTop: 1 }}>{t.description}</Text>
                        </View>
                        {on && <Icon name="check" size={18} color={shade(col, 0.5)} />}
                      </TouchableOpacity>
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
                  style={{ backgroundColor: LK.ivory, borderRadius: 16, padding: 14, fontFamily: theme.fonts.body, fontSize: 16, color: LK.ink, marginBottom: 10, ...theme.shadow.sm }}
                />
                <TextInput
                  value={desc}
                  onChangeText={setDesc}
                  placeholder="Add a little detail (optional)"
                  placeholderTextColor={LK.ink70}
                  style={{ backgroundColor: LK.ivory, borderRadius: 16, padding: 14, fontFamily: theme.fonts.body, fontSize: 16, color: LK.ink, ...theme.shadow.sm }}
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

function SectionLabel({ icon, label, color, sub, style }: { icon: string; label: string; color: string; sub: string; style?: object }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 2, ...style }}>
      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: tint(color, 0.6), alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={14} color={shade(color, 0.45)} />
      </View>
      <View>
        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 13.5, color: LK.ink }}>{label}</Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: LK.ink70 }}>{sub}</Text>
      </View>
    </View>
  );
}

function EmptySlot({ icon, color, message }: { icon: string; color: string; message: string }) {
  return (
    <View style={{ backgroundColor: tint(color, 0.85), borderRadius: 18, padding: 18, alignItems: 'center', gap: 8 }}>
      <Icon name={icon} size={22} color={shade(color, 0.35)} />
      <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: shade(color, 0.5), textAlign: 'center', lineHeight: 19 }}>{message}</Text>
    </View>
  );
}

function CouponCard({
  c, mode, onRedeem, onDelete, isNew = false,
}: {
  c: Coupon;
  mode: 'recipient' | 'gifter' | 'redeemed';
  onRedeem?: () => void;
  onDelete?: () => void;
  isNew?: boolean;
}) {
  const col = couponColor(c.color);
  const isRedeemed = mode === 'redeemed';

  return (
    <View style={{
      backgroundColor: isRedeemed ? LK.ivory : tint(col, 0.78),
      borderRadius: theme.radii.lg, padding: 16,
      opacity: isRedeemed ? 0.7 : 1,
      ...theme.shadow.card,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
        <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: isRedeemed ? 'rgba(42,33,26,0.08)' : col, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={c.icon} size={24} color={isRedeemed ? LK.ink70 : shade(col, 0.55)} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 18, color: LK.ink, textDecorationLine: isRedeemed ? 'line-through' : 'none', flexShrink: 1 }}>
              {c.title}
            </Text>
            {isNew && <NewTag />}
          </View>
          {c.description ? (
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.ink70, marginTop: 2 }}>{c.description}</Text>
          ) : null}
          {isRedeemed && c.redeemed_at && (
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12, color: LK.ink70, marginTop: 4 }}>
              Redeemed {new Date(c.redeemed_at).toLocaleDateString()}
            </Text>
          )}
          {mode === 'gifter' && !isRedeemed && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 }}>
              <Icon name="lock" size={11} color={shade(col, 0.45)} />
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11.5, color: shade(col, 0.5) }}>
                Waiting for your partner to redeem
              </Text>
            </View>
          )}
        </View>
        {onDelete && (
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="trash" size={16} color={isRedeemed ? LK.ink70 : shade(col, 0.4)} />
          </TouchableOpacity>
        )}
      </View>

      {/* Only the recipient can redeem */}
      {mode === 'recipient' && onRedeem && (
        <TouchableOpacity
          onPress={onRedeem}
          activeOpacity={0.85}
          style={{ marginTop: 13, backgroundColor: LK.ink, borderRadius: 9999, paddingVertical: 13, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, ...theme.shadow.sm }}
        >
          <Icon name="gift" size={17} color="#fff" />
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 15, letterSpacing: 0.5, color: '#fff' }}>REDEEM</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
