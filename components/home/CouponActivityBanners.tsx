import React from 'react';
import { View, Text, Alert } from 'react-native';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { FadeSlideIn } from '@/components/ui/FadeSlideIn';
import { iGifted, type Coupon } from '@/stores/coupons.store';
import { useCouponHomeBanners, REDEEMED_WINDOW_MS } from '@/hooks/useCouponHomeBanners';

const COLORS: Record<string, string> = {
  pink: LK.blush, coral: LK.coral, lilac: LK.lilac,
  gold: LK.marigold, mint: LK.success, sky: LK.sky, amber: LK.warning,
};
const couponColor = (k: string) => COLORS[k] ?? LK.blush;

/** "23h 41m left" · "12m left" · "less than a minute" */
function formatLeft(msLeft: number): string {
  if (msLeft <= 60_000) return 'less than a minute left';
  const totalMin = Math.floor(msLeft / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h >= 1) return `${h}h ${m}m left`;
  return `${m}m left`;
}

/**
 * Home-screen coupon activity — two banner types, stacked newest-first:
 *  1. Pending approval (gifter only): partner asked to redeem → Approve / Decline.
 *  2. Recently redeemed (both, ≤24h): live countdown; the redeemer can dismiss.
 *
 * Renders nothing when there is no activity. Standard coupons only.
 */
export function CouponActivityBanners({ partnerName }: { partnerName: string }) {
  const { pendingApprovals, recentlyRedeemed, now, dismiss, approve, decline } = useCouponHomeBanners();

  if (pendingApprovals.length === 0 && recentlyRedeemed.length === 0) return null;

  const pending = [...pendingApprovals].sort(
    (a, b) => new Date(b.redeem_requested_at ?? 0).getTime() - new Date(a.redeem_requested_at ?? 0).getTime(),
  );
  const redeemed = [...recentlyRedeemed].sort(
    (a, b) => new Date(b.redeemed_at ?? 0).getTime() - new Date(a.redeemed_at ?? 0).getTime(),
  );

  async function onApprove(c: Coupon) {
    try { await approve(c); } catch (e: any) { Alert.alert('Could not approve', e?.message ?? 'Try again.'); }
  }
  function onDecline(c: Coupon) {
    Alert.alert(
      `Decline "${c.title}"?`,
      'The coupon stays unused — your partner can ask again later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try { await decline(c); } catch (e: any) { Alert.alert('Could not decline', e?.message ?? 'Try again.'); }
          },
        },
      ],
    );
  }

  return (
    <View style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 12, gap: 10 }}>
      {pending.map((c) => (
        <FadeSlideIn key={`pending-${c.id}`} fromY={10}>
          <PendingApprovalCard c={c} partnerName={partnerName} onApprove={() => onApprove(c)} onDecline={() => onDecline(c)} />
        </FadeSlideIn>
      ))}
      {redeemed.map((c) => {
        const msLeft = REDEEMED_WINDOW_MS - (now - new Date(c.redeemed_at!).getTime());
        const canDismiss = !iGifted(c); // only the redeemer hides it early
        return (
          <FadeSlideIn key={`redeemed-${c.id}`} fromY={10}>
            <RedeemedCard
              c={c}
              partnerName={partnerName}
              msLeft={msLeft}
              onDismiss={canDismiss ? () => dismiss(c.id) : undefined}
            />
          </FadeSlideIn>
        );
      })}
    </View>
  );
}

// ── Pending approval (gifter) ─────────────────────────────────────────────────
function PendingApprovalCard({
  c, partnerName, onApprove, onDecline,
}: {
  c: Coupon;
  partnerName: string;
  onApprove: () => void;
  onDecline: () => void;
}) {
  const accent = LK.marigold;
  return (
    <View style={{
      backgroundColor: LK.vellum,
      borderRadius: 20,
      borderCurve: 'continuous',
      overflow: 'hidden',
      flexDirection: 'row',
      borderWidth: 2,
      borderColor: shade(accent, 0.15),
      ...theme.shadow.card,
    }}>
      <View style={{ width: 10, backgroundColor: tint(accent, 0.55) }} />
      <View style={{ flex: 1, padding: 15 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 11 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: tint(accent, 0.65), alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="gift" size={22} color={shade(accent, 0.5)} />
          </View>
          <View style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 10.5, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', color: shade(accent, 0.5) }}>
              Coupon request
            </Text>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 17, color: LK.espresso, lineHeight: 21, marginTop: 1 }}>
              {partnerName} wants to redeem
            </Text>
            <Text numberOfLines={1} style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.sepia, marginTop: 2 }}>
              “{c.title}”
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 9, marginTop: 12 }}>
          <ScalePressable
            onPress={onDecline}
            scaleTo={0.97}
            haptic={false}
            accessibilityLabel={`Decline ${c.title}`}
            containerStyle={{ flex: 1 }}
            style={{ backgroundColor: 'rgba(42,33,26,0.07)', borderRadius: 9999, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14, color: LK.sepia }}>Decline</Text>
          </ScalePressable>
          <ScalePressable
            onPress={onApprove}
            scaleTo={0.97}
            accessibilityLabel={`Approve ${c.title}`}
            containerStyle={{ flex: 1.6 }}
            style={{ backgroundColor: LK.espresso, borderRadius: 9999, minHeight: 44, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 7, ...theme.shadow.sm }}
          >
            <Icon name="check" size={15} color="#fff" />
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 14, letterSpacing: 0.3, color: '#fff' }}>Approve</Text>
          </ScalePressable>
        </View>
      </View>
    </View>
  );
}

// ── Recently redeemed (both) ──────────────────────────────────────────────────
function RedeemedCard({
  c, partnerName, msLeft, onDismiss,
}: {
  c: Coupon;
  partnerName: string;
  msLeft: number;
  onDismiss?: () => void;
}) {
  const col = couponColor(c.color);
  const redeemerIsMe = !iGifted(c);
  const title = redeemerIsMe ? 'You redeemed' : `${partnerName} redeemed`;

  return (
    <View style={{
      backgroundColor: LK.vellum,
      borderRadius: 20,
      borderCurve: 'continuous',
      overflow: 'hidden',
      flexDirection: 'row',
      borderWidth: 1.5,
      borderColor: 'rgba(42,33,26,0.13)',
      ...theme.shadow.card,
    }}>
      <View style={{ width: 10, backgroundColor: tint(col, 0.55) }} />
      <View style={{ flex: 1, padding: 15 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 11 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: tint(col, 0.65), alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name={c.icon} size={22} color={shade(col, 0.55)} />
          </View>
          <View style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 17, color: LK.espresso, lineHeight: 21 }}>
              {title}
            </Text>
            <Text numberOfLines={1} style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.sepia, marginTop: 2 }}>
              “{c.title}”
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 }}>
              <Icon name="clockTab" size={12} color={shade(col, 0.45)} />
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12, color: shade(col, 0.5), fontVariant: ['tabular-nums'] }}>
                {formatLeft(msLeft)}
              </Text>
            </View>
          </View>
          {onDismiss && (
            <ScalePressable
              onPress={onDismiss}
              scaleTo={0.85}
              haptic={false}
              accessibilityLabel="Dismiss"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              containerStyle={{ marginTop: -2, marginRight: -2 }}
              style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name="x" size={15} color="rgba(42,33,26,0.3)" />
            </ScalePressable>
          )}
        </View>
      </View>
    </View>
  );
}
