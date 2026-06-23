import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { notifyPartner } from '@/lib/push';

export type CouponType = 'standard' | 'streak_restore';

export type Coupon = {
  id: string;
  couple_id: string;
  created_by: string | null;        // real profile UUID of the gifter
  created_by_person: 'me' | 'partner'; // legacy — kept for compat
  title: string;
  description: string | null;
  icon: string;
  color: string;
  type: CouponType;
  streak_restore_days: number | null;         // streak length at break time
  streak_restore_expires_at: string | null;   // 48 h gifting deadline
  redeem_requested_at: string | null;  // recipient asked to redeem; awaiting gifter approval
  redeemed_at: string | null;
  deleted_at: string | null;
  created_at: string;
};

/** True if the current user created (gifted) this coupon. */
export function iGifted(coupon: Coupon): boolean {
  const myId = useAuthStore.getState().profile?.id;
  if (coupon.created_by) return coupon.created_by === myId;
  // Legacy rows without created_by: fall back to the relative text field.
  return coupon.created_by_person === 'me';
}

type CouponsState = {
  coupons: Coupon[];
  loading: boolean;
  fetchCoupons: (coupleId: string) => Promise<void>;
  addCoupon: (data: { couple_id: string; title: string; description: string | null; icon: string; color: string }) => Promise<void>;
  /**
   * Gifts a streak-restore coupon. Unlike standard coupons this:
   * 1. Calls the `restore_couple_streak` RPC to insert override dates immediately.
   * 2. Inserts the coupon row as already redeemed (no recipient action needed).
   * 3. Notifies the partner.
   */
  addStreakRestoreCoupon: (params: {
    coupleId: string;
    missedDates: string[];   // YYYY-MM-DD dates to restore
    streakDaysLost: number;  // stored as keepsake
  }) => Promise<void>;
  requestRedeem: (id: string) => Promise<void>;   // recipient asks to redeem
  cancelRequest: (id: string) => Promise<void>;   // recipient withdraws the request
  approveRedeem: (id: string) => Promise<void>;   // gifter confirms → fully redeemed
  declineRequest: (id: string) => Promise<void>;  // gifter declines → back to unredeemed
  deleteCoupon: (id: string) => Promise<void>;
  subscribe: (coupleId: string) => () => void;
};

export const useCouponsStore = create<CouponsState>((set, get) => ({
  coupons: [],
  loading: false,

  fetchCoupons: async (coupleId) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('couple_id', coupleId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (!error) set({ coupons: (data as Coupon[]) ?? [] });
    } catch { /* network/auth error — keep cached coupons */ } finally {
      set({ loading: false });
    }
  },

  addCoupon: async ({ couple_id, title, description, icon, color }) => {
    const myId = useAuthStore.getState().profile?.id ?? null;
    const payload = {
      couple_id,
      title,
      description,
      icon,
      color,
      type: 'standard' as const,
      streak_restore_days: null,
      streak_restore_expires_at: null,
      created_by: myId,
      created_by_person: 'me' as const,
    };
    const optimistic: Coupon = {
      ...payload,
      id: `temp-${Date.now()}`,
      redeem_requested_at: null,
      redeemed_at: null,
      deleted_at: null,
      created_at: new Date().toISOString(),
    };
    set((s) => ({ coupons: [optimistic, ...s.coupons] }));
    const { data: inserted, error } = await supabase.from('coupons').insert(payload).select().single();
    if (error) {
      set((s) => ({ coupons: s.coupons.filter((c) => c.id !== optimistic.id) }));
      throw new Error(error.message);
    }
    set((s) => ({ coupons: s.coupons.map((c) => (c.id === optimistic.id ? (inserted as Coupon) : c)) }));
  },

  addStreakRestoreCoupon: async ({ coupleId, missedDates, streakDaysLost }) => {
    const myId = useAuthStore.getState().profile?.id ?? null;
    const now = new Date().toISOString();
    const tempId = `temp-${Date.now()}`;

    const optimistic: Coupon = {
      id: tempId,
      couple_id: coupleId,
      created_by: myId,
      created_by_person: 'me',
      title: 'Streak Rescue',
      description: `Saved ${streakDaysLost} missed day${streakDaysLost === 1 ? '' : 's'}`,
      icon: 'flame',
      color: 'coral',
      type: 'streak_restore',
      streak_restore_days: streakDaysLost,
      streak_restore_expires_at: null,
      redeem_requested_at: null,
      redeemed_at: now, // auto-consumed on creation
      deleted_at: null,
      created_at: now,
    };
    set((s) => ({ coupons: [optimistic, ...s.coupons] }));

    try {
      // 1. Insert the coupon row first (need its id for the RPC).
      const { data: inserted, error: insertErr } = await supabase
        .from('coupons')
        .insert({
          couple_id: coupleId,
          created_by: myId,
          created_by_person: 'me',
          title: 'Streak Rescue',
          description: `Saved ${streakDaysLost} missed day${streakDaysLost === 1 ? '' : 's'}`,
          icon: 'flame',
          color: 'coral',
          type: 'streak_restore',
          streak_restore_days: streakDaysLost,
          streak_restore_expires_at: null,
          redeemed_at: now,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;

      const couponId = (inserted as Coupon).id;

      // 2. Restore the streak — inserts override rows for each missed date.
      if (missedDates.length > 0) {
        await supabase.rpc('restore_couple_streak', {
          p_couple_id: coupleId,
          p_coupon_id: couponId,
          p_missed_dates: missedDates,
        });
      }

      // 3. Swap optimistic row with real one.
      set((s) => ({
        coupons: s.coupons.map((c) => (c.id === tempId ? (inserted as Coupon) : c)),
      }));

      // 4. Notify partner.
      void notifyPartner('coupon_streak_restore', '❤️‍🔥 Streak saved!', 'Your person rescued your streak.');
    } catch {
      // Roll back optimistic row — the streak override was not applied.
      set((s) => ({ coupons: s.coupons.filter((c) => c.id !== tempId) }));
      throw new Error('Failed to save streak restore coupon');
    }
  },

  requestRedeem: async (id) => {
    const at = new Date().toISOString();
    set((s) => ({ coupons: s.coupons.map((c) => (c.id === id ? { ...c, redeem_requested_at: at } : c)) }));
    const { error } = await supabase.from('coupons').update({ redeem_requested_at: at }).eq('id', id);
    if (error) {
      set((s) => ({ coupons: s.coupons.map((c) => (c.id === id ? { ...c, redeem_requested_at: null } : c)) }));
      throw new Error(error.message);
    }
  },

  cancelRequest: async (id) => {
    set((s) => ({ coupons: s.coupons.map((c) => (c.id === id ? { ...c, redeem_requested_at: null } : c)) }));
    const { error } = await supabase.from('coupons').update({ redeem_requested_at: null }).eq('id', id);
    if (error) throw new Error(error.message);
  },

  approveRedeem: async (id) => {
    const at = new Date().toISOString();
    set((s) => ({ coupons: s.coupons.map((c) => (c.id === id ? { ...c, redeemed_at: at, redeem_requested_at: null } : c)) }));
    const { error } = await supabase.from('coupons').update({ redeemed_at: at, redeem_requested_at: null }).eq('id', id);
    if (error) throw new Error(error.message);
  },

  declineRequest: async (id) => {
    set((s) => ({ coupons: s.coupons.map((c) => (c.id === id ? { ...c, redeem_requested_at: null } : c)) }));
    const { error } = await supabase.from('coupons').update({ redeem_requested_at: null }).eq('id', id);
    if (error) throw new Error(error.message);
  },

  deleteCoupon: async (id) => {
    set((s) => ({ coupons: s.coupons.filter((c) => c.id !== id) }));
    await supabase.from('coupons').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  },

  subscribe: (coupleId) => {
    const channel = supabase
      .channel(`coupons:${coupleId}:${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coupons', filter: `couple_id=eq.${coupleId}` }, () => {
        get().fetchCoupons(coupleId);
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  },
}));
