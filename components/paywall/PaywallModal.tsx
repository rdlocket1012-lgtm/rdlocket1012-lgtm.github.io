import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Modal, ActivityIndicator, Linking, Share } from 'react-native';
import { EaseView } from 'react-native-ease';
import { LK, tint, shade, rgba, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { IconChip } from '@/components/ui/icon-chip';
import { Skeleton } from '@/components/ui/Skeleton';
import { ScalePressable } from '@/components/ui/scale-pressable';
import {
  purchasePlan, restorePurchases, purchasesAvailable,
  fetchPlanPrices, formatPrice, type PlanPrice, type PlanId,
} from '@/lib/revenuecat';
import { FREE_LIMITS } from '@/constants/free-limits';
import { success as hapticSuccess } from '@/lib/haptics';
import { useCouple } from '@/hooks/useCouple';
import { toast } from '@/lib/feedback';

// Plan metadata only — prices are NEVER hardcoded. The App Store charges in the
// user's own storefront currency, so every amount on this screen comes from the
// live RevenueCat offering (see fetchPlanPrices).
//
// Two tiers by decision: monthly and annual, with a free trial on top. There is
// deliberately no lifetime tier — `PlanId` in lib/revenuecat.ts still types one
// because `purchasePlan` has always mapped PACKAGE_TYPE.LIFETIME, but nothing
// offers it and nothing should start to without that being a product decision.
const PLANS = [
  { id: 'monthly', title: 'Monthly', per: '/month' },
  { id: 'annual', title: 'Annual', per: '/year' },
] as const;

/**
 * The comparison table is framed around what the *free* tier runs out of, not
 * what it generously includes — a free column reading "30 milestones, 15 pins"
 * makes Premium look optional. Caps carry a "max" suffix and read as a ceiling;
 * `false` renders a Danger cross rather than an em-dash glyph.
 */
const ROWS: { label: string; free: string | false; premium: string | true }[] = [
  { label: 'Milestones',     free: `${FREE_LIMITS.MILESTONES} max`,        premium: 'Unlimited' },
  { label: 'Map pins',       free: `${FREE_LIMITS.MAP_PINS} max`,          premium: 'Unlimited' },
  { label: 'Love letters',   free: `${FREE_LIMITS.LETTERS} max`,           premium: 'Unlimited' },
  { label: 'Bucket list',    free: `${FREE_LIMITS.BUCKET_LIST_ITEMS} max`, premium: 'Unlimited' },
  { label: 'Sealed letters', free: false,                                  premium: true },
  { label: 'Rich notes',     free: false,                                  premium: true },
];

interface Props {
  onClose: () => void;
}

export function PaywallModal({ onClose }: Props) {
  const { fetchCouple } = useCouple();
  // Narrower than PlanId on purpose — there is no lifetime tier, and this makes
  // it a type error to start selecting one without revisiting PLANS.
  const [plan, setPlan] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Live, localised pricing ───────────────────────────────────────────────
  const [prices, setPrices] = useState<Partial<Record<PlanId, PlanPrice>> | null>(null);
  const [priceState, setPriceState] = useState<'loading' | 'ready' | 'unavailable'>(
    purchasesAvailable ? 'loading' : 'unavailable',
  );

  const loadPrices = useCallback(async () => {
    if (!purchasesAvailable) return;
    setPriceState('loading');
    const p = await fetchPlanPrices();
    if (p?.monthly || p?.annual) {
      setPrices(p);
      setPriceState('ready');
    } else {
      setPriceState('unavailable');
    }
  }, []);

  useEffect(() => { loadPrices(); }, [loadPrices]);

  const monthly = prices?.monthly;
  const annual = prices?.annual;

  // Exact savings, computed from the live pair — never an approximation.
  const savingsPct = monthly && annual && monthly.price > 0
    ? Math.round((1 - annual.price / (monthly.price * 12)) * 100)
    : null;

  // Annual reads as a bigger ask than monthly until it's shown per-month.
  const annualPerMonth = annual && annual.price > 0
    ? formatPrice(annual.price / 12, annual.currencyCode)
    : null;

  const canPurchase = priceState === 'ready';

  // While loading, both rows render as skeletons; once the offering lands, only
  // plans the store actually sells are offered.
  const visiblePlans = priceState === 'ready'
    ? PLANS.filter((p) => !!prices?.[p.id])
    : PLANS;

  // The offering may not contain the plan we defaulted to. Never leave a
  // selection pointing at a package that isn't for sale — purchasePlan would
  // silently fall back to availablePackages[0] and charge for something else.
  useEffect(() => {
    if (priceState !== 'ready') return;
    if (prices?.[plan]) return;
    const first = visiblePlans[0]?.id;
    if (first) setPlan(first);
  // visiblePlans is derived from prices/priceState
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceState, prices, plan]);

  // Free trial on the *selected* plan, straight from the store. Absent unless
  // an intro offer is configured AND this user is still eligible for it, so the
  // CTA can never promise a trial that won't materialise at checkout.
  const trial = prices?.[plan]?.trial;
  const selectedPrice = prices?.[plan];

  async function handlePurchase() {
    setLoading(true);
    try {
      const ok = await purchasePlan(plan);
      if (ok) {
        await fetchCouple();
        hapticSuccess();
        setSuccess(true);
      }
    } catch (e: any) {
      // RevenueCat sets userCancelled on a cancelled flow — stay silent then.
      if (!e?.userCancelled) {
        toast.error(e?.message ?? 'Something went wrong. Please try again.');
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
        hapticSuccess();
        setSuccess(true);
      } else {
        toast('No previous purchases were found for this account.');
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Couldn’t restore purchases.');
    } finally {
      setRestoring(false);
    }
  }

  /**
   * The subscription covers both accounts, but the partner only learns that
   * from `couple.store`'s realtime handler — which needs their app to be open
   * and subscribed at the moment the row flips. If it isn't, they find out by
   * accident. So the success state offers to tell them.
   */
  async function tellPartner() {
    try {
      await Share.share({
        message: 'I just unlocked Locket Premium — it covers us both 👑 Unlimited milestones, letters and pins, on your account too. 💛',
      });
    } catch { /* user dismissed the share sheet */ }
  }

  if (success) {
    return (
      <Modal animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: tint(LK.marigold, 0.55), alignItems: 'center', justifyContent: 'center', padding: 30 }}>
          <EaseView
            initialAnimate={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 260 }}
          >
            <IconChip color={LK.marigold} size={104}>
              <Icon name="crown" size={50} color={shade(LK.marigold, 0.55)} />
            </IconChip>
          </EaseView>
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 32, color: LK.espresso, marginTop: 22, letterSpacing: -1, textAlign: 'center' }}>
            You're Premium!
          </Text>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 15.5, color: LK.ink70, marginTop: 10, lineHeight: 24, maxWidth: 260, textAlign: 'center' }}>
            Every limit is gone — for both of you. Your story has all the room it needs.
          </Text>
          <ScalePressable
            onPress={tellPartner}
            style={{
              backgroundColor: LK.espresso, borderRadius: 9999,
              paddingHorizontal: 26, paddingVertical: 16, marginTop: 26,
              flexDirection: 'row', alignItems: 'center', gap: 9,
            }}
          >
            <Icon name="share" size={17} color="#fff" />
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: '#fff' }}>Tell your partner</Text>
          </ScalePressable>
          <ScalePressable
            onPress={onClose}
            haptic={false}
            style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 20, marginTop: 4 }}
          >
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15, color: shade(LK.marigold, 0.6) }}>Keep writing it</Text>
          </ScalePressable>
        </View>
      </Modal>
    );
  }

  return (
    <Modal animationType="slide" transparent>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.4)' }} onPress={onClose} accessibilityLabel="Close" />
      <View style={{ backgroundColor: LK.parchment, borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '88%' }}>
        <View style={{ padding: '14px 0 6px' as any, paddingTop: 14, paddingBottom: 6, alignItems: 'center' }}>
          <View style={{ width: 38, height: 5, borderRadius: 9999, backgroundColor: 'rgba(42,33,26,0.15)' }} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
          <View style={{ alignItems: 'center', paddingBottom: 18 }}>
            <IconChip color={LK.marigold} size={62} style={{ marginBottom: 14 }}>
              <Icon name="crown" size={30} color={shade(LK.marigold, 0.55)} />
            </IconChip>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 27, color: LK.espresso, lineHeight: 32, letterSpacing: -0.8, textAlign: 'center' }}>
              Your story is growing —{'\n'}upgrade to keep writing it.
            </Text>
          </View>

          {/* Comparison table — framed as where free runs out, not what it gives */}
          <Text style={{
            fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 11,
            letterSpacing: 1.4, textTransform: 'uppercase', color: LK.ink70,
            marginBottom: 8, marginLeft: 4,
          }}>
            Where free runs out
          </Text>
          <View style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.lg, borderCurve: 'continuous', padding: 6, marginBottom: 18, ...theme.shadow.sm }}>
            <View style={{ flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: LK.hairline }}>
              <View style={{ flex: 1.5 }} />
              <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 12, color: LK.ink70, textAlign: 'center' }}>Free</Text>
              <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 12, color: shade(LK.marigold, 0.5), textAlign: 'center' }}>Premium</Text>
            </View>
            {ROWS.map((r, i) => (
              <View key={r.label} style={{ flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 10, borderBottomWidth: i < ROWS.length - 1 ? 1 : 0, borderBottomColor: LK.hairline, alignItems: 'center' }}>
                <Text style={{ flex: 1.5, fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 13.5, color: LK.espresso }}>{r.label}</Text>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  {r.free === false ? (
                    <Icon name="x" size={16} color={LK.danger} strokeWidth={2.6} />
                  ) : (
                    <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.ink70 }}>{r.free}</Text>
                  )}
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  {r.premium === true ? (
                    <Icon name="check" size={17} color={LK.success} strokeWidth={2.8} />
                  ) : (
                    <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: shade(LK.marigold, 0.5) }}>{r.premium}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Plan selector */}
          <View style={{ gap: 10 }}>
            {visiblePlans.map((pl) => {
              const on = plan === pl.id;
              const live = prices?.[pl.id];
              // A trial outranks the savings badge — it's the stronger reason to
              // pick the row, and two pills on one line is noise.
              const tag = live?.trial
                ? `${live.trial.label} free`
                : pl.id === 'annual' && savingsPct != null && savingsPct > 0
                  ? `Save ${savingsPct}%`
                  : null;
              return (
                <ScalePressable key={pl.id} scaleTo={0.98} onPress={() => setPlan(pl.id)}>
                  <EaseView
                    animate={{
                      backgroundColor: on ? tint(LK.marigold, 0.7) : LK.ivory,
                      borderColor: on ? LK.marigold : 'rgba(0,0,0,0)',
                    }}
                    transition={{ default: { type: 'timing', duration: 180, easing: 'easeOut' } }}
                    style={{
                      borderRadius: 18, padding: 15,
                      flexDirection: 'row', alignItems: 'center', gap: 13,
                      borderWidth: 2.5,
                      boxShadow: '0 5px 14px rgba(42,33,26,0.06)',
                    }}
                  >
                    <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2.5, borderColor: on ? shade(LK.marigold, 0.5) : 'rgba(42,33,26,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                      {on && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: shade(LK.marigold, 0.5) }} />}
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 16, color: LK.espresso }}>{pl.title}</Text>
                      {tag && (
                        <View style={{ backgroundColor: rgba(LK.marigold, 0.3), borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 3 }}>
                          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11, color: shade(LK.marigold, 0.45) }}>{tag}</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ alignItems: 'flex-end', minWidth: 74 }}>
                      {priceState === 'loading' ? (
                        <>
                          <Skeleton width={62} height={19} radius={6} />
                          <Skeleton width={40} height={11} radius={5} style={{ marginTop: 5 }} />
                        </>
                      ) : (
                        <>
                          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 19, color: LK.espresso }}>
                            {live?.priceString ?? '—'}
                          </Text>
                          <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, color: LK.ink70 }}>
                            {pl.id === 'annual' && annualPerMonth ? `${annualPerMonth}/mo` : pl.per}
                          </Text>
                          {pl.id === 'annual' && annualPerMonth && savingsPct != null && savingsPct > 0 && live?.trial ? (
                            // The badge was taken by the trial, so the saving
                            // still needs saying somewhere on the row.
                            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11, color: shade(LK.marigold, 0.5), marginTop: 1 }}>
                              Save {savingsPct}%
                            </Text>
                          ) : null}
                        </>
                      )}
                    </View>
                  </EaseView>
                </ScalePressable>
              );
            })}
          </View>

          {/* Pricing couldn't be loaded — never guess an amount, offer a retry. */}
          {priceState === 'unavailable' && purchasesAvailable && (
            <View style={{ backgroundColor: tint(LK.warning, 0.72), borderRadius: 14, padding: 12, marginTop: 12, flexDirection: 'row', gap: 9, alignItems: 'center' }}>
              <Icon name="info" size={16} color={shade(LK.warning, 0.45)} />
              <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontSize: 12.5, color: shade(LK.warning, 0.55), lineHeight: 18 }}>
                Couldn’t load pricing just now — check your connection.
              </Text>
              <ScalePressable onPress={loadPrices} haptic={false} hitSlop={10} accessibilityLabel="Retry loading pricing">
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 12.5, color: shade(LK.warning, 0.55) }}>Retry</Text>
              </ScalePressable>
            </View>
          )}

          {/* Shared-subscription reassurance */}
          <View style={{ backgroundColor: tint(LK.blush, 0.62), borderRadius: 16, padding: 14, marginTop: 16, flexDirection: 'row', gap: 11, alignItems: 'center' }}>
            <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: LK.blush, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="heart" size={19} color={shade(LK.blush, 0.5)} />
            </View>
            <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 12.5, color: shade(LK.blush, 0.6), lineHeight: 18 }}>
              One plan covers you both. Upgrading instantly unlocks Premium for your partner’s account at no extra cost — billed as a couple.
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

          <ScalePressable
            onPress={handlePurchase}
            disabled={loading || !canPurchase}
            style={{
              backgroundColor: LK.marigold, borderRadius: 9999, padding: 16, alignItems: 'center', marginTop: 18,
              opacity: canPurchase ? 1 : 0.5,
              ...theme.shadow.card,
            }}
          >
            {loading ? (
              <ActivityIndicator color={LK.espresso} />
            ) : (
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 17, color: LK.espresso }}>
                {trial ? `Start your ${trial.label} free trial` : 'Start Premium'}
              </Text>
            )}
          </ScalePressable>

          {/* Trial reassurance. Deliberately does NOT promise "we'll remind you"
              — the app schedules no such reminder, and iOS caps pending local
              notifications at 64, so adding one is a separate decision. This
              says only what is true. */}
          {trial && selectedPrice && (
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 10, paddingHorizontal: 8 }}>
              <Icon name="lock" size={13} color={LK.ink70} />
              <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontSize: 11.5, color: LK.ink70, lineHeight: 17 }}>
                Free for {trial.label.replace('-', ' ')}, then {selectedPrice.priceString}
                {plan === 'annual' ? '/year' : '/month'}. Cancel any time
                before it ends and you won’t be charged a thing.
              </Text>
            </View>
          )}

          <ScalePressable
            onPress={handleRestore}
            disabled={restoring}
            haptic={false}
            accessibilityLabel="Restore purchases"
            style={{ alignItems: 'center', minHeight: 44, justifyContent: 'center' }}
          >
            {restoring ? (
              <ActivityIndicator color={LK.ink70} size="small" />
            ) : (
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14, color: LK.ink70 }}>Restore Purchases</Text>
            )}
          </ScalePressable>

          <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: LK.ink70, textAlign: 'center', lineHeight: 18 }}>
            Cancel anytime. No hostile fine print, ever.
          </Text>

          {/* Apple-required subscription disclosure + EULA / Privacy links (Guideline 3.1.2).
              The amounts must match what the store will actually charge, so they're
              interpolated from the live offering — never hardcoded. An introductory
              free trial has to be disclosed too: its length, and the price it
              converts to. */}
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 10.5, color: LK.ink70, textAlign: 'center', lineHeight: 16, marginTop: 12 }}>
            Locket Premium is an auto-renewable subscription. Your subscription renews
            automatically
            {monthly || annual
              ? ` — ${[
                  monthly && `Monthly (${monthly.priceString})`,
                  annual && `Annual (${annual.priceString})`,
                ].filter(Boolean).join(' or ')} — `
              : ' '}
            unless cancelled at least 24 hours
            before the end of the current period.
            {trial && selectedPrice
              ? ` Your ${trial.label.replace('-', ' ')} free trial converts to the ${
                  plan === 'annual' ? 'annual' : 'monthly'
                } plan at ${selectedPrice.priceString} unless cancelled at least 24 hours before it ends.`
              : ''}
            {' '}Payment is charged to your Apple ID account at
            purchase confirmation. Manage or cancel anytime in your App Store account settings.
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <ScalePressable onPress={() => Linking.openURL('https://rdlocket1012-lgtm.github.io/Locket/terms-of-service.md')} haptic={false} accessibilityRole="link" accessibilityLabel="Terms of Service" hitSlop={{ top: 14, bottom: 14, left: 6, right: 6 }}>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 11, fontWeight: '700', color: shade(LK.marigold, 0.5) }}>Terms of Service</Text>
            </ScalePressable>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 11, color: LK.ink70 }}>·</Text>
            <ScalePressable onPress={() => Linking.openURL('https://rdlocket1012-lgtm.github.io/Locket/privacy-policy.md')} haptic={false} accessibilityRole="link" accessibilityLabel="Privacy Policy" hitSlop={{ top: 14, bottom: 14, left: 6, right: 6 }}>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 11, fontWeight: '700', color: shade(LK.marigold, 0.5) }}>Privacy Policy</Text>
            </ScalePressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
