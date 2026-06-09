/**
 * RevenueCat integration.
 *
 * `react-native-purchases` is a native module that is NOT available in Expo Go.
 * We load it lazily and fall back to a no-op so the app keeps running in Expo Go;
 * real purchases work once you run a dev/production build (eas build).
 *
 * Setup before submitting:
 *  1. Create products + an Offering in the RevenueCat dashboard with an
 *     entitlement called "premium" and packages of type MONTHLY / ANNUAL / LIFETIME.
 *  2. Put your public SDK keys in .env.local:
 *       EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxx
 *       EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxx
 *  3. Create matching IAP products in App Store Connect.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

export const ENTITLEMENT_ID = 'premium';
export type PlanId = 'monthly' | 'annual' | 'lifetime';

// Expo Go cannot load native modules.
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Purchases: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let PACKAGE_TYPE: any = null;
let configured = false;

if (!isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('react-native-purchases');
    Purchases = mod.default ?? mod;
    PACKAGE_TYPE = mod.PACKAGE_TYPE;
  } catch {
    Purchases = null;
  }
}

/** True only in a real native build with the SDK present. */
export const purchasesAvailable = !!Purchases;

function apiKey(): string | undefined {
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
  }) as string | undefined;
}

/** Configure the SDK once. Safe to call when unavailable (no-op). */
export async function setupPurchases(appUserId?: string): Promise<void> {
  if (!Purchases) return;
  const key = apiKey();
  if (!key) {
    if (__DEV__) console.warn('[RevenueCat] Missing API key env var.');
    return;
  }
  if (!configured) {
    Purchases.configure({ apiKey: key, appUserID: appUserId });
    configured = true;
  } else if (appUserId) {
    try { await Purchases.logIn(appUserId); } catch { /* ignore */ }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function entitlementActive(info: any): boolean {
  return !!info?.entitlements?.active?.[ENTITLEMENT_ID];
}

/**
 * Push premium status to the SHARED couple record so both partners unlock.
 * Records the original payer so their status can survive a break-up.
 */
async function syncPremiumToCouple(tier?: PlanId): Promise<void> {
  const profile = useAuthStore.getState().profile;
  if (!profile?.couple_id) return;
  const patch: Record<string, unknown> = {
    subscription_status: 'active',
    original_paying_user_id: profile.id,
    subscribed_by: profile.id, // legacy column, kept in sync
  };
  if (tier) patch.subscription_tier = tier;
  await supabase.from('couples').update(patch).eq('id', profile.couple_id);
}

/** Returns whether the user currently has the premium entitlement. */
export async function isPremiumActive(): Promise<boolean> {
  if (!Purchases) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    return entitlementActive(info);
  } catch {
    return false;
  }
}

/** Purchase the selected plan. Returns true if premium is now active. */
export async function purchasePlan(planId: PlanId): Promise<boolean> {
  if (!Purchases) {
    throw new Error('In-app purchases are only available in the App Store build, not Expo Go.');
  }
  const offerings = await Purchases.getOfferings();
  const current = offerings?.current;
  if (!current || !current.availablePackages?.length) {
    throw new Error('No subscription offerings are available right now.');
  }
  const typeFor: Record<PlanId, string> = {
    monthly: PACKAGE_TYPE?.MONTHLY ?? 'MONTHLY',
    annual: PACKAGE_TYPE?.ANNUAL ?? 'ANNUAL',
    lifetime: PACKAGE_TYPE?.LIFETIME ?? 'LIFETIME',
  };
  const pkg =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    current.availablePackages.find((p: any) => p.packageType === typeFor[planId]) ??
    current.availablePackages[0];
  if (!pkg) throw new Error('That plan is unavailable.');

  const { customerInfo } = await Purchases.purchasePackage(pkg);
  const active = entitlementActive(customerInfo);
  if (active) await syncPremiumToCouple(planId);
  return active;
}

/** Restore prior purchases. Returns true if premium is now active. */
export async function restorePurchases(): Promise<boolean> {
  if (!Purchases) {
    throw new Error('Restoring purchases is only available in the App Store build.');
  }
  const info = await Purchases.restorePurchases();
  const active = entitlementActive(info);
  if (active) await syncPremiumToCouple();
  return active;
}
