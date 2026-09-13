/**
 * RevenueCat integration.
 *
 * `react-native-purchases` is a native module that is NOT available in Expo Go.
 * We load it lazily and fall back to a no-op so the app keeps running in Expo Go;
 * real purchases work once you run a dev/production build (eas build).
 *
 * Setup before submitting:
 *  1. Create products + an Offering in the RevenueCat dashboard with an
 *     entitlement called "premium" and packages of type MONTHLY / ANNUAL.
 *  2. Put your public SDK keys in .env.local:
 *       EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxx
 *       EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxx
 *  3. Create matching IAP products in App Store Connect.
 *  4. Add an introductory **free trial** to the annual (and/or monthly) product.
 *     Read live, never hardcoded: the paywall's CTA becomes "Start your N-day
 *     free trial" only when the store reports one for *this* user, so it can
 *     never promise a trial that doesn't exist or that the user has already used.
 *
 * `PlanId` still types 'lifetime' and `purchasePlan` still maps
 * PACKAGE_TYPE.LIFETIME, but there is **no lifetime tier by decision** — the
 * paywall offers monthly and annual only. Don't start offering one here without
 * that being a product call.
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

/** Maps our plan ids onto RevenueCat package types. */
function packageTypeFor(): Record<PlanId, string> {
  return {
    monthly: PACKAGE_TYPE?.MONTHLY ?? 'MONTHLY',
    annual: PACKAGE_TYPE?.ANNUAL ?? 'ANNUAL',
    lifetime: PACKAGE_TYPE?.LIFETIME ?? 'LIFETIME',
  };
}

/**
 * A free-trial / intro offer attached to a package — present only when one is
 * configured in App Store Connect (or Play Console) AND the user is eligible.
 *
 * The paywall must never *claim* a trial the store won't honour, so this is
 * read live alongside the price and the CTA copy follows it. No offer ⇒ null ⇒
 * the CTA falls back to "Start Premium".
 */
export type TrialOffer = {
  /** Length in days — for the "cancel before it ends" reassurance line. */
  days: number;
  /** Human phrase for a CTA: "7-day", "1-month". */
  label: string;
};

/** A plan's live price, exactly as the App Store will charge it. */
export type PlanPrice = {
  id: PlanId;
  /** Store-formatted, localised — e.g. "£3.49", "¥600", "$3.99". */
  priceString: string;
  /** Raw amount in `currencyCode` units, for per-month / savings maths. */
  price: number;
  currencyCode: string;
  /** Free trial on this package, when the store offers one. */
  trial?: TrialOffer;
};

const ISO_PERIOD = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?$/;

/** Turn a StoreKit period unit + count into days + a display phrase. */
function trialFromUnits(unit?: string, count?: number): TrialOffer | null {
  const n = Number(count);
  if (!unit || !Number.isFinite(n) || n <= 0) return null;
  switch (String(unit).toUpperCase()) {
    case 'DAY':   return { days: n, label: `${n}-day` };
    // A single week reads better as "7-day" — that's how every store phrases it.
    case 'WEEK':  return { days: n * 7, label: n === 1 ? '7-day' : `${n}-week` };
    case 'MONTH': return { days: n * 30, label: n === 1 ? '1-month' : `${n}-month` };
    case 'YEAR':  return { days: n * 365, label: n === 1 ? '1-year' : `${n}-year` };
    default:      return null;
  }
}

/** Parse an ISO 8601 duration ("P1W", "P3D") — Play Billing's period format. */
function trialFromIso(iso?: string): TrialOffer | null {
  const m = typeof iso === 'string' ? ISO_PERIOD.exec(iso) : null;
  if (!m) return null;
  const [, y, mo, w, d] = m;
  if (y) return trialFromUnits('YEAR', Number(y));
  if (mo) return trialFromUnits('MONTH', Number(mo));
  if (w) return trialFromUnits('WEEK', Number(w));
  if (d) return trialFromUnits('DAY', Number(d));
  return null;
}

/**
 * Read a free trial off a store product, across both platforms:
 *  - iOS/StoreKit exposes `introPrice`; a zero `price` means a free trial
 *    (a paid intro offer is a discount, not a trial, and must not be called one).
 *  - Android/Billing v5 puts the free phase on the default subscription option.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseTrial(product: any): TrialOffer | undefined {
  const intro = product?.introPrice;
  if (intro && Number(intro.price) === 0) {
    const t = trialFromUnits(intro.periodUnit, intro.periodNumberOfUnits) ?? trialFromIso(intro.period);
    if (t) return t;
  }
  const free = product?.defaultOption?.freePhase;
  if (free) {
    const t = trialFromIso(free?.billingPeriod?.iso8601 ?? free?.billingPeriod);
    if (t) return t;
  }
  return undefined;
}

/**
 * Read live, LOCALISED prices from the current RevenueCat offering.
 *
 * The paywall must never render a hardcoded price: the App Store charges in the
 * user's own storefront currency, so a hardcoded "$3.99" is simply wrong for
 * everyone outside the US — and Apple's required subscription disclosure has to
 * state the real amount (Guideline 3.1.2).
 *
 * Returns null when purchases are unavailable (Expo Go / missing key) or the
 * offering can't be loaded, so callers can render a "pricing unavailable" state
 * instead of inventing a number.
 */
export async function fetchPlanPrices(): Promise<Partial<Record<PlanId, PlanPrice>> | null> {
  if (!Purchases) return null;
  try {
    const offerings = await Purchases.getOfferings();
    const packages = offerings?.current?.availablePackages;
    if (!packages?.length) return null;

    const typeFor = packageTypeFor();
    const out: Partial<Record<PlanId, PlanPrice>> = {};
    for (const id of ['monthly', 'annual', 'lifetime'] as PlanId[]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const product = packages.find((p: any) => p.packageType === typeFor[id])?.product;
      if (!product?.priceString) continue;
      const price = typeof product.price === 'number' ? product.price : Number(product.price);
      out[id] = {
        id,
        priceString: product.priceString,
        price: Number.isFinite(price) ? price : 0,
        currencyCode: product.currencyCode ?? 'USD',
        // Lifetime is a one-off purchase — a "trial" on it would be nonsense
        // even if the store somehow reported one.
        trial: id === 'lifetime' ? undefined : parseTrial(product),
      };
    }
    return Object.keys(out).length ? out : null;
  } catch {
    return null;
  }
}

/**
 * Format a derived amount (e.g. an annual plan's per-month equivalent) in the
 * same currency the store quoted. Falls back to a plain "12.34 GBP" if the
 * runtime has no Intl currency data.
 */
export function formatPrice(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currencyCode}`;
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
  const typeFor = packageTypeFor();
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
