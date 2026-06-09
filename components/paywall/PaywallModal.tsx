import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Alert, Linking } from 'react-native';
import { LK, tint, shade, rgba, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { IconChip } from '@/components/ui';
import { purchasePlan, restorePurchases, purchasesAvailable } from '@/lib/revenuecat';
import { useCouple } from '@/hooks/useCouple';

const PLANS = [
  { id: 'monthly', title: 'Monthly', price: '$3.99', per: '/month', tag: null },
  { id: 'annual', title: 'Annual', price: '$29.99', per: '/year', tag: 'Save ~35%' },
] as const;

const ROWS = [
  ['Milestones', '30', 'Unlimited'],
  ['Map pins', '15', 'Unlimited'],
  ['Love letters', '5', 'Unlimited'],
  ['Sealed letters', '—', '✓'],
  ['Rich notes', '—', '✓'],
];

interface Props {
  onClose: () => void;
}

export function PaywallModal({ onClose }: Props) {
  const { fetchCouple } = useCouple();
  const [plan, setPlan] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handlePurchase() {
    setLoading(true);
    try {
      const ok = await purchasePlan(plan);
      if (ok) {
        await fetchCouple();
        setSuccess(true);
      }
    } catch (e: any) {
      // RevenueCat sets userCancelled on a cancelled flow — stay silent then.
      if (!e?.userCancelled) {
        Alert.alert('Purchase unavailable', e?.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    setRestoring(true);
    try {
      const ok = await restorePurchases();
      if (ok) {
        await fetchCouple();
        setSuccess(true);
      } else {
        Alert.alert('Nothing to restore', 'No previous purchases were found for this account.');
      }
    } catch (e: any) {
      Alert.alert('Restore unavailable', e?.message ?? 'Could not restore purchases.');
    } finally {
      setRestoring(false);
    }
  }

  if (success) {
    return (
      <Modal animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: tint(LK.gold, 0.55), alignItems: 'center', justifyContent: 'center', padding: 30 }}>
          <IconChip color={LK.gold} size={104}>
            <Icon name="crown" size={50} color={shade(LK.gold, 0.55)} />
          </IconChip>
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 32, color: LK.ink, marginTop: 22, letterSpacing: -1, textAlign: 'center' }}>
            You're Premium!
          </Text>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 15.5, color: LK.ink70, marginTop: 10, lineHeight: 24, maxWidth: 260, textAlign: 'center' }}>
            Every limit is gone. Your story has all the room it needs.
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={{ backgroundColor: LK.ink, borderRadius: 9999, paddingHorizontal: 28, paddingVertical: 16, marginTop: 26 }}
          >
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: '#fff' }}>Keep writing it</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal animationType="slide" transparent>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.4)' }} onPress={onClose} activeOpacity={1} />
      <View style={{ backgroundColor: LK.cream, borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '88%' }}>
        <View style={{ padding: '14px 0 6px' as any, paddingTop: 14, paddingBottom: 6, alignItems: 'center' }}>
          <View style={{ width: 38, height: 5, borderRadius: 9999, backgroundColor: 'rgba(42,33,26,0.15)' }} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
          <View style={{ alignItems: 'center', paddingBottom: 18 }}>
            <IconChip color={LK.gold} size={62} style={{ marginBottom: 14 }}>
              <Icon name="crown" size={30} color={shade(LK.gold, 0.55)} />
            </IconChip>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 27, color: LK.ink, lineHeight: 32, letterSpacing: -0.8, textAlign: 'center' }}>
              Your story is growing —{'\n'}upgrade to keep writing it.
            </Text>
          </View>

          {/* Comparison table */}
          <View style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.lg, padding: 6, marginBottom: 18, ...theme.shadow.sm }}>
            <View style={{ flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: LK.line }}>
              <View style={{ flex: 1.5 }} />
              <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 12, color: LK.ink70, textAlign: 'center' }}>Free</Text>
              <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 12, color: shade(LK.gold, 0.5), textAlign: 'center' }}>Premium</Text>
            </View>
            {ROWS.map((r, i) => (
              <View key={i} style={{ flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 10, borderBottomWidth: i < ROWS.length - 1 ? 1 : 0, borderBottomColor: LK.line, alignItems: 'center' }}>
                <Text style={{ flex: 1.5, fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 13.5, color: LK.ink }}>{r[0]}</Text>
                <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontSize: 13.5, color: LK.ink70, textAlign: 'center' }}>{r[1]}</Text>
                <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13.5, color: shade(LK.gold, 0.5), textAlign: 'center' }}>{r[2]}</Text>
              </View>
            ))}
          </View>

          {/* Plan selector */}
          <View style={{ gap: 10 }}>
            {PLANS.map((pl) => {
              const on = plan === pl.id;
              return (
                <TouchableOpacity
                  key={pl.id}
                  onPress={() => setPlan(pl.id)}
                  style={{
                    backgroundColor: on ? tint(LK.gold, 0.7) : LK.ivory,
                    borderRadius: 18, padding: 15,
                    flexDirection: 'row', alignItems: 'center', gap: 13,
                    borderWidth: on ? 2.5 : 0, borderColor: on ? LK.gold : 'transparent',
                    ...theme.shadow.sm,
                  }}
                >
                  <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2.5, borderColor: on ? shade(LK.gold, 0.5) : 'rgba(42,33,26,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                    {on && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: shade(LK.gold, 0.5) }} />}
                  </View>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 16, color: LK.ink }}>{pl.title}</Text>
                    {pl.tag && (
                      <View style={{ backgroundColor: rgba(LK.gold, 0.3), borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11, color: shade(LK.gold, 0.45) }}>{pl.tag}</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 19, color: LK.ink }}>{pl.price}</Text>
                    <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, color: LK.ink70 }}>{pl.per}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Shared-subscription reassurance */}
          <View style={{ backgroundColor: tint(LK.pink, 0.62), borderRadius: 16, padding: 14, marginTop: 16, flexDirection: 'row', gap: 11, alignItems: 'center' }}>
            <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: LK.pink, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="heart" size={19} color={shade(LK.pink, 0.5)} />
            </View>
            <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 12.5, color: shade(LK.pink, 0.6), lineHeight: 18 }}>
              One subscription covers you both. Upgrading instantly unlocks Premium for your partner’s account at no extra cost — billed as a couple.
            </Text>
          </View>

          {!purchasesAvailable && (
            <View style={{ backgroundColor: tint(LK.sky, 0.7), borderRadius: 14, padding: 12, marginTop: 12, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Icon name="info" size={16} color={shade(LK.sky, 0.5)} />
              <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontSize: 12.5, color: shade(LK.sky, 0.55), lineHeight: 18 }}>
                Purchases run through the App Store and activate in the published app build.
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handlePurchase}
            disabled={loading}
            style={{ backgroundColor: LK.gold, borderRadius: 9999, padding: 16, alignItems: 'center', marginTop: 18, ...theme.shadow.card }}
          >
            {loading ? (
              <ActivityIndicator color={LK.ink} />
            ) : (
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 17, color: LK.ink }}>Start Premium</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRestore}
            disabled={restoring}
            style={{ alignItems: 'center', paddingVertical: 14 }}
          >
            {restoring ? (
              <ActivityIndicator color={LK.ink70} size="small" />
            ) : (
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14, color: LK.ink70 }}>Restore Purchases</Text>
            )}
          </TouchableOpacity>

          <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: LK.ink70, textAlign: 'center', lineHeight: 18 }}>
            Cancel anytime. No hostile fine print, ever.
          </Text>

          {/* Apple-required subscription disclosure + EULA / Privacy links (Guideline 3.1.2) */}
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 10.5, color: LK.ink70, textAlign: 'center', lineHeight: 16, marginTop: 12 }}>
            Locket Premium is an auto-renewable subscription. Your subscription renews
            automatically — Monthly ($3.99) or Annual ($29.99) — unless cancelled at least 24 hours
            before the end of the current period. Payment is charged to your Apple ID account at
            purchase confirmation. Manage or cancel anytime in your App Store account settings.
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <TouchableOpacity onPress={() => Linking.openURL('https://rdlocket1012-lgtm.github.io/Locket/terms-of-service.md')}>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 11, fontWeight: '700', color: shade(LK.gold, 0.5) }}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 11, color: LK.ink70 }}>·</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://rdlocket1012-lgtm.github.io/Locket/privacy-policy.md')}>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 11, fontWeight: '700', color: shade(LK.gold, 0.5) }}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
